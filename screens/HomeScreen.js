import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pill, Droplet, Dumbbell, SprayCan, LayoutGrid } from 'lucide-react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
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
import BannerSlider from '../components/BannerSlider';

const categories = [
  { name: 'All', icon: LayoutGrid, color: '#1976D2', gradient: ['#E0E0E0', '#F5F5F5'] },
  { name: 'medicine', icon: Pill, color: '#2E7D32', gradient: ['#C8E6C9', '#E8F5E9'] },
  { name: 'cosmetics', icon: Droplet, color: '#1565C0', gradient: ['#BBDEFB', '#E3F2FD'] },
  { name: 'food', icon: Dumbbell, color: '#C62828', gradient: ['#FFCDD2', '#FFEBEE'] },
  { name: 'perfumes', icon: SprayCan, color: '#FFB300', gradient: ['#FFE082', '#FFF8E1'] },
];

const PAGE_SIZE = 10;

function HomeScreen({ navigation }) {
  const { category: initialCategory } = useContext(AuthContext);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [key, setKey] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [theme, setTheme] = useState(
    categories.find(c => c.name === (initialCategory || 'All')) || categories[0]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(null);

  const bannerAnimation = useSharedValue(1);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      bannerAnimation.value = withTiming(0, { duration: 200 });
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      bannerAnimation.value = withTiming(1, { duration: 200 });
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const animatedBannerContainerStyle = useAnimatedStyle(() => {
    const height = interpolate(bannerAnimation.value, [0, 1], [0, 220]);
    const opacity = bannerAnimation.value;
    return {
      height,
      opacity,
      overflow: 'hidden',
    };
  });

  const fetchProducts = useCallback(async (isInitial = false) => {
    // Prevent multiple simultaneous requests
    if (!isInitial && (loadingMore || !hasMore)) {
      return;
    }

    if (isInitial) {
      setLoading(true);
      setPage(0);
      setProducts([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = isInitial ? 0 : page;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase.from('products').select('*', { count: 'exact' }).range(from, to);

      if (searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery.trim()}%`);
      }
      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }
      if (sortBy) {
        query = query.order('price', { ascending: sortBy === 'asc' });
      } else {
        query = query.order('id', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        setHasMore(false);
      } else {
        const newProducts = data || [];
        const updatedProducts = isInitial ? newProducts : [...products, ...newProducts];
        setProducts(updatedProducts);

        setHasMore(newProducts.length === PAGE_SIZE && updatedProducts.length < count);

        if (!isInitial) {
          setPage(currentPage + 1);
        } else {
          setPage(1);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedCategory, sortBy, page, products, loadingMore, hasMore]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMore(true);
      fetchProducts(true);
      setKey(prevKey => prevKey + 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleCategoryFilter = useCallback((categoryItem) => {
    if (selectedCategory === categoryItem.name) return;
    setSelectedCategory(categoryItem.name);
    setTheme(categoryItem);
  }, [selectedCategory]);

  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchProducts(false);
    }
  }, [loading, loadingMore, hasMore, fetchProducts]);

  const renderProductItem = useCallback(({ item, index }) => {
    if (item.id === 'upload_prescription') {
      return (
        <Animated.View
          key={`${key}-prescription`}
          entering={FadeInDown.delay(0).duration(400).damping(15).springify()}>
          <UploadPrescriptionCard />
        </Animated.View>
      );
    }

    const itemsOffset = (selectedCategory === 'All' || selectedCategory === 'medicine') ? 1 : 0;
    const delay = Math.min((index + itemsOffset) * 50, 500);

    return (
      <Animated.View
        key={`${key}-${item.id}`}
        entering={FadeInDown.delay(delay).duration(400).damping(15).springify()}>
        <ProductCard item={item} themeColor={theme.color} />
      </Animated.View>
    );
  }, [key, selectedCategory, theme.color]);

  const dataWithPrescriptionCard = useMemo(() => {
    return (selectedCategory === 'All' || selectedCategory === 'medicine') && products.length > 0
      ? [{ id: 'upload_prescription' }, ...products]
      : products;
  }, [selectedCategory, products]);

  const renderListHeader = useMemo(() => (
    <>
      <Animated.View style={animatedBannerContainerStyle}>
        <BannerSlider />
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
            keyValue={key}
            themeColor={theme.color}
          />
        )}
      />

      <View style={styles.headingContainer}>
        <Typo size={20} style={{ fontWeight: '700' }}>
          {selectedCategory === 'All' ? 'All Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
        </Typo>
        <Typo style={{ color: colors.gray, fontSize: 14 }}>
          {loading ? 'Loading...' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
        </Typo>
      </View>
    </>
  ), [animatedBannerContainerStyle, selectedCategory, loading, products.length, theme.color, key, handleCategoryFilter]);

  const renderListFooter = useMemo(() => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={theme.color} />
        <Typo style={{ color: colors.gray, marginTop: 10, fontSize: 14 }}>Loading more products...</Typo>
      </View>
    );
  }, [loadingMore, theme.color]);

  const renderListEmpty = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.skeletonContainer}>
          {[...Array(6)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={colors.gray} style={{ opacity: 0.3 }} />
        <Typo size={18} style={{ color: colors.gray, marginTop: 16, fontWeight: '600' }}>No products found</Typo>
        <Typo size={14} style={{ color: colors.gray, marginTop: 8, opacity: 0.7 }}>Try adjusting your filters or search</Typo>
      </View>
    );
  }, [loading]);

  return (
    <ScreenComponent style={{ backgroundColor: 'transparent' }}>
      <LinearGradient
        colors={theme.gradient}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={styles.searchWithFilter}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="filter-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={dataWithPrescriptionCard}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderListEmpty}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={products.length > 0 ? styles.columnWrapper : null}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={6}
      />

      <FilterModal
        visible={filterModalVisible}
        setVisible={setFilterModalVisible}
        onApplySort={setSortBy}
      />
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._5,
    backgroundColor: 'transparent',
    zIndex: 10,
    gap: spacingX._10,
  },
  searchWithFilter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: spacingY._10,
    borderRadius: radius._20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: spacingY._12,
    borderRadius: radius._20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  catContainer: {
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._15,
    gap: spacingX._12,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacingY._15,
    marginBottom: spacingY._10,
    marginHorizontal: spacingX._20,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: spacingX._15,
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._15,
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingX._15,
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._10,
  },
  footerLoader: {
    paddingVertical: spacingY._30,
    paddingBottom: spacingY._40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: spacingY._60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacingX._40,
  },
});

export default HomeScreen;