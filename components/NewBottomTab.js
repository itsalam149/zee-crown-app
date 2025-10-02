// components/NewBottomTab.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import colors from '../config/colors'; // Corrected path
import { normalizeY } from '../utils/normalize';
import Animated, { useAnimatedStyle, withSpring, withTiming, interpolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const NewBottomTab = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
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
          iconName = 'person-outline'; // Using Ionicons for consistency here
        }

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Haptic feedback
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
          const translateY = withSpring(isFocused ? -20 : 0, {
            damping: 15,
            stiffness: 120,
          });
          const scale = withSpring(isFocused ? 1.2 : 1, {
            damping: 15,
            stiffness: 120,
          });
          return {
            transform: [{ translateY }, { scale }],
            backgroundColor: withTiming(isFocused ? colors.primary : 'transparent', { duration: 200 }),
            shadowColor: withTiming(isFocused ? colors.primary : '#000', { duration: 200 }),
            shadowOpacity: withTiming(isFocused ? 0.4 : 0.1, { duration: 200 }),
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
    bottom: Platform.OS === 'ios' ? 35 : 25, // Adjust for iOS notch area
    left: 20,
    right: 20,
    height: 75, // Slightly taller for better aesthetics
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Subtle translucency
    borderRadius: 38, // More curved edges
    elevation: 12, // More pronounced lift
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, // Stronger shadow for depth
    shadowOpacity: 0.25,
    shadowRadius: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth, // Thin border
    borderColor: 'rgba(0, 0, 0, 0.08)', // Soft border color
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
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 8,
  },
  label: {
    fontSize: normalizeY(11),
    fontWeight: '600',
    position: 'absolute',
    bottom: 10,
    // Color handled by animated style, but default for non-focused
    color: colors.gray,
  },
});

export default NewBottomTab;