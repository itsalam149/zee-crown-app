// App.js
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { supabase } from './lib/supabase'; // Ensure this path is correct
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import CategoryNavigator from './navigation/CategoryNavigator';
import AuthContext from './auth/AuthContext'; // Ensure this path is correct

// --- Notification Handler ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// --- Function to Register for Push Notifications ---
async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (e) {
      console.log('Could not set notification channel:', e);
    }
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Permission not granted for push notifications!');
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.error('Project ID not found. Make sure it is set in your app.config.js');
    return;
  }

  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo Push Token:', token);
  } catch (e) {
    console.error("Couldn't get push token:", e);
  }

  return token;
}

// --- Main App Component ---
export default function App() {
  // *** FIX: Store the whole session object, not just the user ***
  const [session, setSession] = useState(null);
  const [category, setCategory] = useState(null); // Keep category state

  // --- Authentication State Listener ---
  useEffect(() => {
    // Check initial session state when the app first loads
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      // *** FIX: Set the session state ***
      setSession(initialSession);
      // Ensure category is null if no session
      if (!initialSession) {
        setCategory(null);
      }
    }).catch(error => {
      console.error("Error getting initial session:", error);
      setSession(null); // Ensure session is null on error
      setCategory(null);
    });

    // Subscribe to future authentication state changes
    const { data } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        // *** FIX: Set the session state ***
        setSession(currentSession);
        const sessionUser = currentSession?.user ?? null; // Get user from session

        // Reset category on significant auth events
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED' || !currentSession) {
          setCategory(null);
        }

        // Register/Update push token only when fully signed in
        if (_event === 'SIGNED_IN' && sessionUser) {
          const token = await registerForPushNotificationsAsync();
          if (token && sessionUser.id) {
            const { error } = await supabase
              .from('profiles')
              .upsert({ id: sessionUser.id, expo_push_token: token }, { onConflict: 'id' });
            if (error) {
              console.error('Error saving push token:', error);
            }
          }
        }
      }
    );

    const subscription = data?.subscription;

    // Cleanup function
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      } else {
        console.warn('Could not unsubscribe auth listener.');
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Notification Listeners (No change needed here) ---
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification Received:', notification.request.content.title);
      Toast.show({
        type: 'info',
        text1: notification.request.content.title || 'New Notification',
        text2: notification.request.content.body || '',
        visibilityTime: 4000,
      });
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification Tapped:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // --- Render the App ---
  // *** FIX: Derive user from session for context ***
  const contextUser = session?.user ?? null;

  return (
    // Pass derived user to context
    <AuthContext.Provider value={{ user: contextUser, setUser: () => { }, category, setCategory }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            {/* *** FIX: Base navigation on session existence, not user *** */}
            {session ? ( // If session exists (user is fully authenticated)...
              category ? ( // ...and a category is selected...
                <AppNavigator /> // ...show the main app navigator.
              ) : ( // ...but no category is selected...
                <CategoryNavigator /> // ...show the category selection navigator.
              )
            ) : ( // If no session (user is logged out or pending verification)...
              <AuthNavigator /> // ...show the authentication navigator.
            )}
          </NavigationContainer>
        </GestureHandlerRootView>
        <Toast />
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}