// components/CategoryItem.js
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Typo from './Typo';
import { normalizeX, normalizeY } from 'utils/normalize';
import { radius, spacingY } from 'config/spacing';
import colors from 'config/colors';

const CategoryItem = ({ item, isSelected, onPress, index, keyValue, themeColor }) => {
  const Icon = item.icon;

  return (
    <Animated.View
      key={`${keyValue}-${index}`}
      style={styles.catCircle}
      entering={FadeInRight.delay(index * 100)
        .duration(1000)
        .damping(12)
        .springify()}>
      <TouchableOpacity
        style={{ width: '100%', alignItems: 'center' }}
        onPress={() => onPress(item)}>
        <View
          style={[
            styles.imgContainer,
            {
              backgroundColor: isSelected ? themeColor : colors.lighterGray, // Filled background
            },
          ]}>
          <Icon color={isSelected ? colors.white : colors.black} size={24} />
        </View>

        <Typo
          size={12}
          style={[styles.catName, { color: isSelected ? themeColor : colors.black }]}>
          {item.name}
        </Typo>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  catCircle: {
    width: normalizeX(70),
    alignItems: 'center',
  },
  imgContainer: {
    borderRadius: radius._30,
    height: normalizeY(52),
    width: normalizeY(52),
    marginBottom: spacingY._5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2, // Keep a subtle border
    borderColor: 'rgba(0,0,0,0.05)', // Very light border
  },
  catName: {
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CategoryItem;