// navigation/CategoryNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CategoryScreen from '../screens/CategoryScreen';
import AppNavigator from './AppNavigator';

const Stack = createStackNavigator();

export default function CategoryNavigator() {
    return (
        // Ensure NO spaces/chars here
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Ensure NO spaces/chars here */}
            <Stack.Screen name="Category" component={CategoryScreen} />
            {/* Ensure NO spaces/chars here */}
            <Stack.Screen name="AppNavigator" component={AppNavigator} />
            {/* Ensure NO spaces/chars here */}
        </Stack.Navigator> // <--- NO space/newline before this
    );
}