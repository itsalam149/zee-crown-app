// components/NewBottomTab.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import colors from '../config/colors'; // Corrected path
import { normalizeY } from '../utils/normalize';
import Animated, { useAnimatedStyle, withSpring, withTiming, interpolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const BOTTOM_MARGIN_ABOVE_SAFE_AREA = 15;

const NewBottomTab = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: insets.bottom + BOTTOM_MARGIN_ABOVE_SAFE_AREA }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        let IconComponent = Ionicons;
        let iconName;

        if (route.name === 'Home') {
          iconName = 'home';
          IconComponent = AntDesign;
        } else if (route.name === 'Cart') {
          iconName = 'shopping-cart';
          IconComponent = Feather;
        } else if (route.name === 'Profile') {
          iconName = 'person-outline';
        }

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const animatedIconContainerStyle = useAnimatedStyle(() => {
          const translateY = withTiming(isFocused ? -20 : 0, {
            duration: 250,
          });
          const scale = withTiming(isFocused ? 1.2 : 1, {
            duration: 250,
          });
          return {
            transform: [{ translateY }, { scale }],
            backgroundColor: withTiming(isFocused ? colors.primary : 'transparent', { duration: 200 }),
            // --- SHADOWS REMOVED ---
          };
        });

        const animatedLabelStyle = useAnimatedStyle(() => {
          return {
            opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
            transform: [{ translateY: withTiming(isFocused ? 10 : 20, { duration: 200 }) }],
          };
        });

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Animated.View style={[styles.iconContainer, animatedIconContainerStyle]}>
              <IconComponent name={iconName} size={24} color={isFocused ? colors.white : colors.gray} />
            </Animated.View>
            <Animated.Text style={[styles.label, animatedLabelStyle, { color: colors.black }]}>
              {label}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    left: 20,
    right: 20,
    height: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 38,
    // --- SHADOWS REMOVED ---
    // elevation: 12,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.25,
    // shadowRadius: 15,
    // --- END SHADOWS REMOVED ---
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    // --- SHADOWS REMOVED ---
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 4,
    // elevation: 8,
    // --- END SHADOWS REMOVED ---
  },
  label: {
    fontSize: normalizeY(11),
    fontWeight: '600',
    position: 'absolute',
    bottom: 10,
    color: colors.gray,
  },
});

export default NewBottomTab;