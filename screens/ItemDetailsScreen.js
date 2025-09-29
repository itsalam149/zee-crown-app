import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { border } from '@shopify/restyle';
import AppButton from 'components/AppButton';
import ItemImageSlider from 'components/ItemImageSlider';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import React, { useState } from 'react';
import { View, StyleSheet, Platform, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { normalizeX, normalizeY } from 'utils/normalize';
const { height } = Dimensions.get('screen');

function ItemDetailsScreen({ route, navigation }) {
  const iconSize = 18;
  const item = route.params;
  const [selectedColor, setSelectedColor] = useState(colors.dot1);
  const [selected, setSelected] = useState('Description');
  const allColors = [colors.dot1, colors.dot2, colors.dot3, colors.dot4, colors.gray];
  return (
    <View style={styles.container}>
      <ItemImageSlider images={Array(5).fill(item.url)} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBg} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios-new" size={iconSize} color="black" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <View style={styles.iconBg}>
          <AntDesign name="sharealt" size={iconSize} color="black" />
        </View>
        <View style={styles.iconBg}>
          <AntDesign name="hearto" size={iconSize} color="black" />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: '30%' }}>
          <Typo size={24} style={{ fontWeight: '600' }}>
            {item.name}
          </Typo>
          <Typo size={20} style={styles.price}>
            {item.price}
          </Typo>
          <Typo size={16} style={styles.seller}>
            Seller: Syed Noman
          </Typo>
          <View style={styles.ratingRow}>
            <View style={styles.ratingView}>
              <AntDesign name="star" size={12} color={colors.white} />
              <Typo size={12} style={{ color: colors.white }}>
                4.8
              </Typo>
            </View>
            <Typo style={{ color: colors.gray }}> (320 Review)</Typo>
          </View>
          <Typo size={18} style={styles.colorTxt}>
            Color
          </Typo>
          <View style={{ flexDirection: 'row', gap: spacingX._5 }}>
            {allColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.border,
                  { borderColor: selectedColor === color ? colors.black : colors.white },
                ]}
                onPress={() => setSelectedColor(color)}>
                <View style={[styles.dot, { backgroundColor: color }]} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.detailsSelector}>
            {['Description', 'Specs', 'Reviews'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.selectorButton,
                  selected === option && styles.selectedButton,
                ]}
                onPress={() => setSelected(option)}>
                <Typo
                  size={14}
                  style={[
                    styles.selectorText,
                    selected === option && styles.selectedText,
                  ]}>
                  {option}
                </Typo>
              </TouchableOpacity>
            ))}
          </View>
          {selected == 'Description' ? (
            <Typo style={{ color: colors.gray }}>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
              has been the industry's standard dummy text ever since the 1500s, when an unknown
              printer took a galley of type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into electronic typesetting,
              remaining essentially unchanged. It was popularised in the 1960s with the release of
              Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </Typo>
          ) : (
            <Typo style={{ color: colors.gray }}>
              The art of communication has evolved over centuries, yet the essence of conveying
              ideas remains timeless. Throughout history, language has served as a vessel for
              knowledge, culture, and expression. From the ancient scrolls of the scholars to the
              printed manuscripts of the Renaissance, the written word has been a cornerstone of
              human civilization. In the modern era, despite the advent of digital media, the
              fundamental principles of writing have endured. Whether through the pages of a
              well-worn book or the pixels on a screen, the power of words
            </Typo>
          )}
        </ScrollView>
        <View style={styles.buttonContainer}>
          <View style={styles.countView}>
            <Typo size={20} style={styles.count}>
              -
            </Typo>
            <Typo size={20} style={styles.count}>
              1
            </Typo>
            <Typo size={20} style={styles.count}>
              +
            </Typo>
          </View>
          <AppButton
            style={{ width: '60%', marginTop: 0 }}
            onPress={() => navigation.navigate('Cart')}
            label={'Add to Cart'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1,
    marginTop: Platform.OS == 'ios' ? height * 0.06 : spacingY._10,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    paddingHorizontal: spacingX._20,
    gap: spacingX._10,
  },
  iconBg: {
    backgroundColor: colors.white,
    padding: spacingY._10,
    borderRadius: radius._20,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: -spacingY._20,
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    padding: spacingY._15,
    paddingBottom: 0,
  },
  price: {
    fontWeight: '600',
    marginTop: spacingY._5,
  },
  seller: {
    fontWeight: '600',
    textAlign: 'right',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingView: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._3,
    borderRadius: radius._12,
    padding: normalizeY(3),
    paddingHorizontal: normalizeX(5),
  },
  colorTxt: {
    fontWeight: '600',
    marginTop: spacingY._15,
    marginBottom: spacingY._10,
  },
  border: {
    borderWidth: 2,
    borderRadius: spacingY._20,
    padding: normalizeY(3),
  },
  dot: {
    height: normalizeY(27),
    width: normalizeY(27),
    borderRadius: radius._15,
  },
  buttonContainer: {
    backgroundColor: colors.black,
    position: 'absolute',
    bottom: spacingY._20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingY._10,
    width: '100%',
    alignSelf: 'center',
    borderRadius: normalizeY(40),
    justifyContent: 'space-between',
  },
  countView: {
    width: '32%',
    borderWidth: 1,
    borderColor: colors.white,
    flexDirection: 'row',
    height: normalizeY(40),
    borderRadius: radius._20,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginStart: spacingX._5,
  },
  count: {
    color: colors.white,
    fontWeight: '600',
  },
  detailsSelector: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray || '#F5F5F5',
    borderRadius: radius._25 || 25,
    padding: normalizeY(4),
    marginTop: spacingY._15,
    marginBottom: spacingY._10,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: normalizeY(8),
    paddingHorizontal: normalizeX(12),
    borderRadius: radius._20 || 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: colors.primary || colors.black,
  },
  selectorText: {
    color: colors.gray || '#666',
    fontWeight: '500',
  },
  selectedText: {
    color: colors.white,
    fontWeight: '600',
  },
});
export default ItemDetailsScreen;