// App.js
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Platform, StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { supabase } from './lib/supabase';
import AuthNavigator from './navigation/AuthNavigator';
import CategoryNavigator from './navigation/CategoryNavigator';
import AuthContext from './auth/AuthContext';
import colors from './config/colors';

// --- Notification Handler ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// --- Register Push Notifications ---
async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return;

  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch {
    return;
  }

  return token;
}

// --- Main App ---
export default function App() {
  const [authState, setAuthState] = useState({
    session: null,
    isAuthenticated: false,
    isLoading: true,
    isPasswordRecovery: false,
  });

  const [categoryContextValue, setCategoryContextValue] = useState(null);
  const navigationRef = useNavigationContainerRef();

  // --- Auth State Listener ---
  useEffect(() => {
    const initializeSession = async () => {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        const confirmed = !!initialSession?.user?.email_confirmed_at;
        const authenticated = !!(initialSession && confirmed);

        setAuthState({
          session: initialSession,
          isAuthenticated: authenticated,
          isLoading: false,
          isPasswordRecovery: false,
        });

        if (!authenticated) setCategoryContextValue(null);
      } catch {
        setAuthState({
          session: null,
          isAuthenticated: false,
          isLoading: false,
          isPasswordRecovery: false,
        });
        setCategoryContextValue(null);
      }
    };

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      const confirmed = !!currentSession?.user?.email_confirmed_at;
      const authenticated = !!(currentSession && confirmed);
      const isRecovery = event === 'PASSWORD_RECOVERY';

      setAuthState(prev => ({
        ...prev,
        session: currentSession,
        isAuthenticated: authenticated && !isRecovery,
        isPasswordRecovery: isRecovery,
        isLoading: false,
      }));

      if ((!authenticated || event === 'SIGNED_OUT') && categoryContextValue !== null) {
        setCategoryContextValue(null);
      }

      if (event === 'SIGNED_IN' && authenticated) {
        const token = await registerForPushNotificationsAsync();
        if (token && currentSession?.user?.id) {
          await supabase
            .from('profiles')
            .upsert({ id: currentSession.user.id, expo_push_token: token }, { onConflict: 'id' });
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, [categoryContextValue]);

  // --- Notifications ---
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      Toast.show({
        type: 'info',
        text1: notification.request.content.title || 'New Notification',
        text2: notification.request.content.body || '',
        visibilityTime: 4000,
      });
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(() => { });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // --- Render ---
  if (authState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary || '#0000ff'} />
      </View>
    );
  }

  const contextUser = authState.session?.user ?? null;
  const showAuthenticatedFlow = authState.isAuthenticated && !authState.isPasswordRecovery;

  return (
    <AuthContext.Provider
      value={{
        user: contextUser,
        setUser: () => { },
        category: categoryContextValue,
        setCategory: setCategoryContextValue,
      }}
    >
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer ref={navigationRef}>
            {showAuthenticatedFlow ? <CategoryNavigator /> : <AuthNavigator />}
          </NavigationContainer>
        </GestureHandlerRootView>
        <Toast />
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white || '#ffffff',
  },
});
