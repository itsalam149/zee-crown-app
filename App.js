// App.js
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Toast from 'react-native-toast-message';

import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import CategoryNavigator from './navigation/CategoryNavigator';
import AuthContext from './auth/AuthContext';

export default function App() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, category, setCategory }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            {user ? (
              category ? <AppNavigator /> : <CategoryNavigator />
            ) : (
              <AuthNavigator />
            )}
          </NavigationContainer>
        </GestureHandlerRootView>
        <Toast />
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}