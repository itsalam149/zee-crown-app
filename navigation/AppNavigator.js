// navigation/AppNavigator.js
import React from 'react';
import TabNavigator from './TabNavigator';
import { createStackNavigator } from '@react-navigation/stack';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AddressesScreen from '../screens/AddressesScreen';
import EditAddressScreen from '../screens/EditAddressScreen';

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
      {/* This line has been corrected */}
      <Stack.Screen name="MyOrders" component={OrdersScreen} />
      <Stack.Screen name="MyAddresses" component={AddressesScreen} />
      <Stack.Screen name="EditAddress" component={EditAddressScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;