import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import CategoryNavigator from './navigation/CategoryNavigator';
import AuthContext from './auth/AuthContext';

export default function App() {
  const [user, setUser] = useState(null); // null = not logged in
  const [category, setCategory] = useState(null); // store selected category

  return (
    <AuthContext.Provider value={{ user, setUser, category, setCategory }}>
      <SafeAreaProvider>
        {/* Status bar styling */}
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />

        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <NavigationContainer>
              {user ? (
                category ? <AppNavigator /> : <CategoryNavigator />
              ) : (
                <AuthNavigator />
              )}
            </NavigationContainer>
          </SafeAreaView>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}
