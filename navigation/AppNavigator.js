// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AddressesScreen from '../screens/AddressesScreen';
import EditAddressScreen from '../screens/EditAddressScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import HelpScreen from '../screens/HelpScreen';

// --- FIX 1: Import the new screen ---
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={'TabNavigator'}
      screenOptions={{ headerShown: false, orientation: 'portrait' }}>

      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyOrders" component={OrdersScreen} />
      <Stack.Screen name="MyAddresses" component={AddressesScreen} />
      <Stack.Screen name="EditAddress" component={EditAddressScreen} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />

      {/* --- FIX 2: Add the new screen to the stack --- */}
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />

    </Stack.Navigator>
  );
};

export default AppNavigator;