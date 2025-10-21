// navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen'; // Adjusted path assuming screens is at root
import CartScreen from '../screens/CartScreen'; // Adjusted path
import ProfileScreen from '../screens/ProfileScreen'; // Adjusted path
import NewBottomTab from '../components/NewBottomTab'; // Adjusted path assuming components is at root

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <NewBottomTab {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator> // <--- Absolutely NO space or newline before this tag
  );
};

export default TabNavigator;