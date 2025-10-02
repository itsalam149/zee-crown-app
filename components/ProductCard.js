// components/ProductCard.js
import { useNavigation } from '@react-navigation/native';
import Color from 'color';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Typo from './Typo';

const { width, height } = Dimensions.get('screen');

function ProductCard({ item, themeColor }) { // Ensure item.category is available
  const navigation = useNavigation();

  // --- STYLE LOGIC ---
  const isAllCategory = !themeColor || themeColor === colors.primary;
  const isCosmeticsCategory = item.category === 'Cosmetics'; // Check for Cosmetics category

  let cardBackgroundColor;
  if (isCosmeticsCategory) {
    cardBackgroundColor = '#87CEEB'; // Sky blue for Cosmetics
  } else if (isAllCategory) {
    cardBackgroundColor = colors.white;
  } else {
    cardBackgroundColor = Color(themeColor).mix(Color('white'), 0.85).hex();
  }

  // Set the text color to always be black.
  const textColor = colors.black;

  // Common shadow styles that will be applied to all cards.
  const shadowStyle = {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  };
  // --- END STYLE LOGIC ---

  return (
    <TouchableOpacity
      style={[styles.containerBase, { backgroundColor: cardBackgroundColor }, shadowStyle]}
      onPress={() => navigation.navigate('ItemDetails', { item: item, themeColor: themeColor })}>
      <View style={styles.imgContainer}>
        <Image source={{ uri: item.image_url }} style={styles.img} />
      </View>

      <View style={styles.detailsContainer}>
        <Typo size={14} style={[styles.name, { color: textColor }]} numberOfLines={2}>
          {item.name}
        </Typo>
        <Typo size={14} style={[styles.price, { color: textColor }]}>
          ₹{item.price}
        </Typo>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerBase: {
    width: width / 2 - spacingX._30,
    borderRadius: radius._15,
    overflow: 'hidden',
  },
  imgContainer: {
    height: height * 0.15,
    width: '100%',
    backgroundColor: colors.lighterGray,
    borderTopLeftRadius: radius._15,
    borderTopRightRadius: radius._15,
    overflow: 'hidden',
  },
  img: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: spacingX._10,
  },
  name: {
    fontWeight: '600',
    minHeight: 36,
  },
  price: {
    fontWeight: 'bold',
    marginTop: spacingY._5,
  },
});

export default ProductCard; 