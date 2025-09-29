import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CategoryScreen from '../screens/CategoryScreen';
import AppNavigator from './AppNavigator';

const Stack = createStackNavigator();

export default function CategoryNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Category" component={CategoryScreen} />
            <Stack.Screen name="AppNavigator" component={AppNavigator} />
        </Stack.Navigator>
    );
}
