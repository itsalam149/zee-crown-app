// components/SearchBar.js
import React from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';
import { radius, spacingX, spacingY } from 'config/spacing';
import { Feather, Octicons } from '@expo/vector-icons';
import colors from 'config/colors';

function SearchBar({ onPress, value, onChangeText }) {
  return (
    <View style={styles.searchbar}>
      <Feather name="search" size={24} color="black" />
      <TextInput
        placeholder="Search..."
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={onPress}>
        <Octicons name="filter" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lighterGray,
    marginHorizontal: spacingY._20,
    padding: spacingY._10,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._20,
    gap: spacingX._10,
    marginVertical: spacingY._5,
  },
  input: {
    flex: 1,
    borderRightWidth: 1.2,
    paddingRight: spacingX._10,
  },
});

export default SearchBar;