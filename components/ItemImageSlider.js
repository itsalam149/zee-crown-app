// components/ItemImageSlider.js
import React from 'react';
import { View, Dimensions, StyleSheet, Image } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

function ItemImageSlider({ images }) {
  // Since there's only one image, we take the first one.
  const imageUrl = Array.isArray(images) ? images[0] : images;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: screenWidth, // Make the container a square
    width: screenWidth,
    backgroundColor: '#f5f5f5', // A light grey background for the image container
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // This crops the image to fill the square, focusing on the middle
  },
});

export default ItemImageSlider;