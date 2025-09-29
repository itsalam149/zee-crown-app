// screens/HomeScreen.js
import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Entypo, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '../lib/supabase'; // Import the Supabase client

// ... (keep the rest of your imports)
import CategoryItem from 'components/CategoryItem';
import ImageSlideShow from 'components/ImageSlideShow';
import ProductCard from 'components/ProductCard';
import ScreenComponent from 'components/ScreenComponent';
import SearchBar from 'components/SearchBar';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import FilterModal from 'model/FilterModal';
import { categories } from 'utils/data';
import { normalizeX, normalizeY } from 'utils/normalize';

function HomeScreen({ navigation }) {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selected, setSelected] = useState('All');
  const [products, setProducts] = useState([]); // State to hold products
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [key, setKey] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleFilter = async (category) => {
    setSelected(category);
    setLoading(true);
    let query = supabase.from('products').select('*');
    if (category !== 'All') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error filtering products:', error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  // ... (rest of your component remains the same)

  return (
    <ScreenComponent style={styles.container}>
      {/* ... (your existing JSX for header, search bar, etc.) */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacingY._60 }}
        showsVerticalScrollIndicator={false}
      >
        <ImageSlideShow />

        <FlatList
          data={categories}
        // ... (rest of your FlatList props)
        />

        <View style={styles.headingContainer}>
          <Typo size={18} style={{ fontWeight: '600' }}>
            Special For You
          </Typo>
          <Typo style={{ color: colors.gray }}>See all</Typo>
        </View>

        {loading ? (
          <Typo style={{ textAlign: 'center', marginTop: 20 }}>Loading products...</Typo>
        ) : (
          <FlatList
            scrollEnabled={false}
            numColumns={2}
            data={products}
            keyExtractor={(item) => item.id.toString()}
            // ... (rest of your FlatList props)
            renderItem={({ item, index }) => {
              return (
                <Animated.View
                  key={`${key}-${index}`}
                  entering={FadeInDown.delay(index * 100)
                    .duration(600)
                    .damping(13)
                    .springify()}>
                  <ProductCard item={item} />
                </Animated.View>
              );
            }}
          />
        )}
      </ScrollView>
      <FilterModal visible={filterModalVisible} setVisible={setFilterModalVisible} />
    </ScreenComponent>
  );
}
// ... (your existing styles)
const styles = StyleSheet.create({
  container: {
    paddingBottom: spacingY._20,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: spacingX._20,
    padding: spacingY._5,
    justifyContent: 'space-between',
  },
  iconBg: {
    backgroundColor: colors.lighterGray,
    padding: spacingY._7,
    borderRadius: radius._20,
  },
  catContainer: {
    paddingHorizontal: spacingX._10,
    marginTop: spacingY._10,
  },
  catImg: {
    height: normalizeY(50),
    width: normalizeY(50),
    borderRadius: radius._30,
    backgroundColor: colors.lighterGray,
    borderWidth: normalizeY(2),
    marginBottom: spacingY._5,
  },
  catName: {
    textAlign: 'center',
    fontWeight: '500',
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacingY._20,
    marginHorizontal: spacingX._15,
  },
});


export default HomeScreen;