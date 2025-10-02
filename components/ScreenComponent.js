// components/ScreenComponent.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from 'config/colors';

export default function ScreenComponent({ style, children }) {
  // This hook gets the safe area padding for the top and bottom of the screen
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top, // Use the top inset
        paddingBottom: insets.bottom, // Use the bottom inset
        backgroundColor: colors.grayBG
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});