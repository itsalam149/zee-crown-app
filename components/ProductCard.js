// components/ProductCard.js
import { useNavigation } from '@react-navigation/native';
import Color from 'color';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Typo from './Typo';

const { width, height } = Dimensions.get('screen');

function ProductCard({ item, themeColor }) {
  const navigation = useNavigation();

  const isAllCategory = !themeColor || themeColor === colors.primary;
  const isCosmeticsCategory = item.category === 'Cosmetics';

  let cardBackgroundColor;
  if (isCosmeticsCategory) {
    cardBackgroundColor = '#87CEEB';
  } else if (isAllCategory) {
    cardBackgroundColor = colors.white;
  } else {
    cardBackgroundColor = Color(themeColor).mix(Color('white'), 0.85).hex();
  }

  const textColor = colors.black;

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
        <View style={styles.priceContainer}>
          <Typo size={14} style={[styles.price, { color: textColor }]}>
            ₹{item.price}
          </Typo>
          {item.mrp && item.mrp > item.price && (
            <Typo size={12} style={styles.mrp}>
              ₹{item.mrp}
            </Typo>
          )}
        </View>
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacingY._5,
    gap: spacingX._10,
  },
  price: {
    fontWeight: 'bold',
  },
  mrp: {
    color: colors.gray,
    textDecorationLine: 'line-through',
  },
});

export default ProductCard;