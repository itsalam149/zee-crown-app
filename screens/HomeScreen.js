// screens/HomeScreen.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { Pill, Beaker, Utensils, SprayCan, LayoutGrid } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
import ProductCardSkeleton from '../components/ProductCardSkeleton'; // Import the skeleton loader

const categories = [
  { name: 'All', icon: LayoutGrid, color: colors.primary, gradient: ['#f5f5f5', '#ffffff'] },
  { name: 'medicine', icon: Pill, color: 'green', gradient: ['#E8F5E9', '#FFFFFF'] },
  { name: 'cosmetics', icon: Beaker, color: 'blue', gradient: ['#E3F2FD', '#FFFFFF'] },
  { name: 'food', icon: Utensils, color: 'red', gradient: ['#FFEBEE', '#FFFFFF'] },
  { name: 'perfumes', icon: SprayCan, color: 'goldenrod', gradient: ['#FFF8E1', '#FFFFFF'] },
];

function HomeScreen({ navigation }) {
  const { category: initialCategory } = useContext(AuthContext);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [theme, setTheme] = useState(
    categories.find(c => c.name === (initialCategory || 'All')) || categories[0]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }
    if (selectedCategory !== 'All') {
      query = query.eq('category', selectedCategory);
    }
    if (sortBy) {
      query = query.order('price', { ascending: sortBy === 'asc' });
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryFilter = (categoryItem) => {
    setSelectedCategory(categoryItem.name);
    setTheme(categoryItem);
  };

  return (
    <ScreenComponent style={{ backgroundColor: 'transparent' }}>
      <LinearGradient
        colors={theme.gradient}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <View style={styles.iconBg}>
          <Entypo name="grid" size={24} color="black" />
        </View>
        <TouchableOpacity
          style={styles.iconBg}
          onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onPress={() => setFilterModalVisible(true)}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catContainer}
          keyExtractor={(item) => item.name}
          renderItem={({ item, index }) => {
            const isSelected = selectedCategory === item.name;
            return (
              <CategoryItem
                item={item}
                onPress={handleCategoryFilter}
                isSelected={isSelected}
                index={index}
                keyValue={key}
                themeColor={theme.color}
              />
            );
          }}
        />

        <View style={styles.headingContainer}>
          <Typo size={18} style={{ fontWeight: '600' }}>
            All Products
          </Typo>
          <Typo style={{ color: colors.gray }}>
            {loading ? 'Loading...' : `${products.length} items`}
          </Typo>
        </View>

        {/* --- SKELETON LOADER IMPLEMENTATION --- */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            {[...Array(6)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            numColumns={2}
            data={products}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.flatListContent}
            columnWrapperStyle={{ gap: spacingX._20 }}
            renderItem={({ item, index }) => (
              <Animated.View
                key={`${key}-${index}`}
                entering={FadeInDown.delay(index * 100).duration(600).damping(13).springify()}>
                <ProductCard item={item} themeColor={theme.color} />
              </Animated.View>
            )}
          />
        )}
        {/* ------------------------------------ */}
      </ScrollView>
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
    paddingHorizontal: spacingX._20,
    padding: spacingY._5,
    justifyContent: 'space-between',
    backgroundColor: 'transparent'
  },
  iconBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: spacingY._7,
    borderRadius: radius._20
  },
  catContainer: {
    paddingHorizontal: spacingX._10,
    marginTop: spacingY._10
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacingY._20,
    marginHorizontal: spacingX._15,
    backgroundColor: 'transparent'
  },
  flatListContent: {
    gap: spacingX._20,
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    gap: spacingX._20,
  },
});

export default HomeScreen;