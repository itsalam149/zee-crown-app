// screens/HomeScreen.js
import React, { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Keyboard, ActivityIndicator, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pill, Droplet, Dumbbell, SprayCan, LayoutGrid } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

import CategoryItem from '../components/CategoryItem';
import ProductCard from '../components/ProductCard';
import ScreenComponent from '../components/ScreenComponent';
import SearchBar from '../components/SearchBar';
import Typo from '../components/Typo';
import colors from '../config/colors';
import { radius, spacingX, spacingY } from '../config/spacing';
import FilterModal from '../model/FilterModal';
import AuthContext from '../auth/AuthContext';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import UploadPrescriptionCard from '../components/UploadPrescriptionCard';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = width * 0.45;
const PAGE_SIZE = 10;

const categories = [
  { name: 'All', icon: LayoutGrid, color: '#1976D2', gradient: ['#E0E0E0', '#F5F5F5'] },
  { name: 'medicine', icon: Pill, color: '#2E7D32', gradient: ['#C8E6C9', '#E8F5E9'] },
  { name: 'cosmetics', icon: Droplet, color: '#1565C0', gradient: ['#BBDEFB', '#E3F2FD'] },
  { name: 'food', icon: Dumbbell, color: '#C62828', gradient: ['#FFCDD2', '#FFEBEE'] },
  { name: 'perfumes', icon: SprayCan, color: '#FFB300', gradient: ['#FFE082', '#FFF8E1'] },
];

function HomeScreen({ navigation }) {
  const { category: initialCategory } = useContext(AuthContext);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [theme, setTheme] = useState(categories.find(c => c.name === (initialCategory || 'All')) || categories[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(null);

  // Smooth transition states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState([]);

  const headerAnimation = useSharedValue(1);
  const bannerRef = useRef(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  // refs for debounce and abort control
  const searchControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  // Fetch banners based on selected category
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        let query = supabase.from('banners').select('*').eq('is_active', true);

        // Filter by category, but always include 'All'
        if (selectedCategory !== 'All') {
          query = query.in('category', [selectedCategory, 'All']);
        }

        const { data, error } = await query.order('id', { ascending: true });

        if (error) throw error;
        setBanners(data || []);
      } catch (err) {
        console.error('Error fetching banners:', err.message);
      }
    };
    fetchBanners();
  }, [selectedCategory]);


  // Auto-loop banners
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      const nextIndex = (bannerIndex + 1) % banners.length;
      setBannerIndex(nextIndex);
      bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerIndex, banners]);

  // Animate header on keyboard show/hide
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      headerAnimation.value = withTiming(0, { duration: 300 });
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      headerAnimation.value = withTiming(1, { duration: 300 });
    });
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const animatedBannerStyle = useAnimatedStyle(() => {
    const height = interpolate(headerAnimation.value, [0, 1], [0, BANNER_HEIGHT]);
    const opacity = headerAnimation.value;
    return { height, opacity, overflow: 'hidden' };
  });

  // 🚀 OPTIMIZED: Smooth transition with debounced search
  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(() => {
      if (searchControllerRef.current) searchControllerRef.current.abort();
      const controller = new AbortController();
      searchControllerRef.current = controller;

      const fetchProducts = async () => {
        // Start transition immediately for instant feedback
        setIsTransitioning(true);

        // Delay loading state to prevent flicker on fast responses
        const loadingTimeout = setTimeout(() => {
          setLoading(true);
        }, 100);

        try {
          let query = supabase.from('products').select('*', { count: 'exact' }).range(0, PAGE_SIZE - 1);
          if (searchQuery.trim()) query = query.ilike('name', `%${searchQuery.trim()}%`);
          if (selectedCategory !== 'All') query = query.eq('category', selectedCategory);
          if (sortBy) query = query.order('price', { ascending: sortBy === 'asc' });
          else query = query.order('id', { ascending: false });

          const { data, error, count } = await query;

          clearTimeout(loadingTimeout);

          if (error && error.name !== 'AbortError') throw error;
          if (controller.signal.aborted) return;

          // Smooth transition: wait a bit before updating to allow fade out
          transitionTimeoutRef.current = setTimeout(() => {
            setProducts(data || []);
            setDisplayedProducts(data || []);
            setHasMore((data || []).length < (count || 0));
            setPage(1);
            setIsTransitioning(false);
            setLoading(false);
          }, 150);

        } catch (err) {
          clearTimeout(loadingTimeout);
          if (err.name === 'AbortError') return;
          console.error('❌ Fetch error:', err.message);
          setIsTransitioning(false);
          setLoading(false);
        }
      };

      fetchProducts();
    }, 300); // Reduced debounce for snappier feel

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (searchControllerRef.current) searchControllerRef.current.abort();
    };
  }, [searchQuery, selectedCategory, sortBy]);

  const handleLoadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || isTransitioning) return;
    setLoadingMore(true);
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let query = supabase.from('products').select('*', { count: 'exact' }).range(from, to);
      if (searchQuery.trim()) query = query.ilike('name', `%${searchQuery.trim()}%`);
      if (selectedCategory !== 'All') query = query.eq('category', selectedCategory);
      if (sortBy) query = query.order('price', { ascending: sortBy === 'asc' });
      else query = query.order('id', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      const newProducts = data || [];
      if (newProducts.length > 0) {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const filtered = newProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...filtered];
        });
        setDisplayedProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const filtered = newProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...filtered];
        });
        setPage(prev => prev + 1);
        setHasMore(products.length + newProducts.length < (count || 0));
      } else setHasMore(false);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, isTransitioning, page, searchQuery, selectedCategory, sortBy, products.length]);

  const handleCategoryFilter = useCallback((categoryItem) => {
    if (selectedCategory === categoryItem.name) return;
    setSearchQuery('');
    Keyboard.dismiss();
    setSelectedCategory(categoryItem.name);
    setTheme(categoryItem);
  }, [selectedCategory]);

  // 🚀 OPTIMIZED: Simplified render with conditional animation
  const renderProductItem = useCallback(({ item, index }) => {
    if (item.id === 'upload_prescription') {
      return (
        <Animated.View entering={!isTransitioning ? FadeIn.duration(300) : undefined}>
          <UploadPrescriptionCard />
        </Animated.View>
      );
    }
    return (
      <Animated.View entering={!isTransitioning ? FadeIn.duration(300).delay(Math.min(index * 30, 300)) : undefined}>
        <ProductCard item={item} themeColor={theme.color} />
      </Animated.View>
    );
  }, [theme.color, isTransitioning]);

  const dataWithPrescriptionCard = useMemo(() => {
    const productsToShow = isTransitioning ? [] : displayedProducts;
    if ((selectedCategory === 'All' || selectedCategory === 'medicine') && productsToShow.length > 0) {
      return [{ id: 'upload_prescription' }, ...productsToShow];
    }
    return productsToShow;
  }, [selectedCategory, displayedProducts, isTransitioning]);

  const ListHeader = useMemo(() => (
    <>
      <Animated.View style={[animatedBannerStyle]}>
        <FlatList
          ref={bannerRef}
          data={banners}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.image_url }}
              style={{ width, height: BANNER_HEIGHT, borderRadius: radius._15 }}
              resizeMode="cover"
            />
          )}
        />
      </Animated.View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catContainer}
        keyExtractor={(item) => item.name}
        renderItem={({ item, index }) => (
          <CategoryItem
            item={item}
            onPress={handleCategoryFilter}
            isSelected={selectedCategory === item.name}
            index={index}
            themeColor={theme.color}
          />
        )}
      />

      <View style={styles.headingContainer}>
        <Typo size={20} style={{ fontWeight: '700' }}>
          {selectedCategory === 'All' ? 'All Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
        </Typo>
      </View>
    </>
  ), [animatedBannerStyle, selectedCategory, theme.color, handleCategoryFilter, banners]);

  const ListFooter = useMemo(() => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={theme.color} />
        <Typo style={{ color: colors.gray, marginTop: 10, fontSize: 14 }}>Loading more...</Typo>
      </View>
    );
  }, [loadingMore, theme.color]);

  const ListEmpty = useMemo(() => {
    if (loading || isTransitioning) {
      return (
        <View style={styles.skeletonContainer}>
          {[...Array(6)].map((_, index) => <ProductCardSkeleton key={`skeleton-${index}`} />)}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={colors.gray} style={{ opacity: 0.3 }} />
        <Typo size={18} style={{ color: colors.gray, marginTop: 16, fontWeight: '600' }}>No products found</Typo>
        <Typo size={14} style={{ color: colors.gray, marginTop: 8, opacity: 0.7 }}>Try adjusting your search or filters</Typo>
      </View>
    );
  }, [loading, isTransitioning]);

  return (
    <ScreenComponent style={{ backgroundColor: 'transparent' }}>
      <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Image
          size='large'
          source={require('../assets/icon.png')}
          style={styles.headerLogo}
        />
        <SearchBar
          style={styles.searchBar}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
          // --- MODIFICATION START ---
          placeholderTextColor="#333" // Sets the placeholder text color to dark gray
        // --- MODIFICATION END ---
        />
        <TouchableOpacity style={styles.iconButton} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter-outline" size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={dataWithPrescriptionCard}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[styles.listContent, { paddingTop: 10 }]}
        columnWrapperStyle={dataWithPrescriptionCard.length > 0 ? styles.columnWrapper : null}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />

      <FilterModal visible={filterModalVisible} setVisible={setFilterModalVisible} onApplySort={setSortBy} />
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacingX._20, paddingTop: spacingY._10, paddingBottom: spacingY._5, backgroundColor: 'transparent', zIndex: 10, gap: spacingX._10 },
  headerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  searchBar: {
    flex: 1,
    backgroundColor: colors.white, // This keeps the background white
    borderRadius: radius._20,
    height: 44, // Align height with filter button
    elevation: 2, // Add shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  iconButton: { backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: spacingY._10, borderRadius: radius._20, justifyContent: 'center', alignItems: 'center', width: 44, height: 44, elevation: 3 },
  notificationButton: { backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: spacingY._12, borderRadius: radius._20, justifyContent: 'center', alignItems: 'center', width: 48, height: 48, elevation: 3 },
  catContainer: { paddingHorizontal: spacingX._15, paddingVertical: spacingY._15, gap: spacingX._12 },
  headingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacingY._10, marginBottom: spacingY._10, marginHorizontal: spacingX._20 },
  listContent: { paddingBottom: 100 },
  columnWrapper: { gap: spacingX._15, paddingHorizontal: spacingX._20, marginBottom: spacingY._15 },
  skeletonContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacingX._15, paddingHorizontal: spacingX._20, paddingTop: spacingY._10 },
  footerLoader: { paddingVertical: spacingY._30, paddingBottom: spacingY._40, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { paddingVertical: spacingY._60, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacingX._40 },
});

export default HomeScreen;