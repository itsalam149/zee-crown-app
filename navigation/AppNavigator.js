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

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    // Ensure NO spaces/chars here
    <Stack.Navigator
      initialRouteName={'TabNavigator'}
      screenOptions={{ headerShown: false, orientation: 'portrait' }}>
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="MyOrders" component={OrdersScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="MyAddresses" component={AddressesScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="EditAddress" component={EditAddressScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      {/* Ensure NO spaces/chars here */}
    </Stack.Navigator> // <--- NO space/newline before this
  );
};

export default AppNavigator;