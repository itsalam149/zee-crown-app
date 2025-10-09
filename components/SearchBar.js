// components/SearchBar.js
import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { radius, spacingX, spacingY } from 'config/spacing';
import { Feather } from '@expo/vector-icons';
import colors from 'config/colors';

function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.searchbar}>
      <Feather name="search" size={24} color="black" />
      <TextInput
        placeholder={placeholder}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lighterGray,
    flex: 1, // Allow search bar to take up available space
    padding: spacingY._10,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._20,
    gap: spacingX._10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});

export default SearchBar;