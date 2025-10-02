// components/CartCard.js
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import colors from 'config/colors';
import { View, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import Typo from './Typo';
import { normalizeX, normalizeY } from 'utils/normalize';
import { radius, spacingY } from 'config/spacing';

const { width } = Dimensions.get('screen');

function CartCard({ item, onIncrement, onDecrement, onRemove }) {
  const imgSize = width * 0.18; // Made image smaller
  const product = item.products;

  return (
    <View style={styles.container}>
      <View style={styles.imgContainer}>
        <Image
          source={{ uri: product.image_url }}
          resizeMode="contain"
          style={{ width: imgSize, height: imgSize }}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={styles.row}>
          <Typo size={16} style={{ fontWeight: '600', flex: 1 }} numberOfLines={1}>
            {product.name}
          </Typo>
          <TouchableOpacity onPress={onRemove}>
            <MaterialIcons name="delete-outline" size={normalizeY(22)} color={colors.gray} />
          </TouchableOpacity>
        </View>
        <Typo style={styles.catText}>{product.category}</Typo>
        <View style={styles.row}>
          <Typo size={16} style={{ fontWeight: 'bold' }}>₹{product.price}</Typo>
          <View style={styles.countContainer}>
            <TouchableOpacity onPress={onDecrement} style={styles.countButton}>
              <Typo style={{ fontWeight: 'bold', fontSize: 18 }}>-</Typo>
            </TouchableOpacity>
            <Typo style={{ fontWeight: 'bold', fontSize: 16 }}>{item.quantity}</Typo>
            <TouchableOpacity onPress={onIncrement} style={styles.countButton}>
              <Typo style={{ fontWeight: 'bold', fontSize: 18 }}>+</Typo>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: normalizeY(15),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    padding: normalizeY(12),
    borderRadius: radius._15,
    gap: normalizeX(12),
  },
  imgContainer: {
    padding: spacingY._5,
    backgroundColor: colors.lighterGray,
    borderRadius: radius._10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catText: {
    color: colors.lightGray,
    fontWeight: '500',
    fontSize: 12,
  },
  countContainer: {
    backgroundColor: colors.lighterGray,
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: normalizeY(4),
    borderRadius: radius._20,
  },
  countButton: {
    paddingHorizontal: normalizeX(12),
  }
});

export default CartCard;