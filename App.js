// App.js
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './lib/supabase';
import Toast from 'react-native-toast-message';

// --- Imports for Notifications ---
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import CategoryNavigator from './navigation/CategoryNavigator';
import AuthContext from './auth/AuthContext';

// --- Notification Handler ---
// This must be here for notifications to show up while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // You can set this to true if you want sound
    shouldSetBadge: false,
  }),
});

// --- Function to Register for Push Notifications ---
async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    // Ensure the channel exists before setting it.
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (e) {
      console.log("Could not set notification channel:", e);
    }
  }

  // --- Permission Handling ---
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Permission not granted for push notifications!');
    // Optionally, show an alert to the user here
    // Alert.alert('Permission Required', 'Push notifications are disabled. Please enable them in settings.');
    return; // Exit if permission is denied
  }
  // --- End Permission Handling ---


  // Get the project ID from your app.config.js
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.error('Project ID not found. Make sure it is set in your app.config.js');
    return;
  }

  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log("Expo Push Token:", token); // Log the token for debugging
  } catch (e) {
    console.error("Couldn't get push token:", e);
  }

  return token;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState(null); // Assuming you still use category selection

  // --- Authentication State Listener ---
  useEffect(() => {
    // Check initial session state when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      // *** FIX: Corrected typo 'seeion' to 'session' ***
      if (!session?.user) {
        setCategory(null); // Ensure category is null if no user
      }
    });

    // Listen for subsequent auth state changes (login, logout, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser); // Update user state based on the event

        // Reset category if user logs in, logs out, or profile is updated
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
          setCategory(null);
        }

        // Register for push notifications and update profile only when user signs in
        if (_event === 'SIGNED_IN' && sessionUser) {
          const token = await registerForPushNotificationsAsync();
          if (token && sessionUser.id) {
            // Use upsert to create/update the profile with the token
            const { error } = await supabase
              .from('profiles')
              .upsert({ id: sessionUser.id, expo_push_token: token }, { onConflict: 'id' }); // Update token on login
            if (error) {
              console.error("Error saving push token:", error);
            }
          }
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // --- Notification Listeners (FIXED) ---
  useEffect(() => {
    // Listener for received notifications (app in foreground)
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received: ', notification.request.content.title);
      // Optional: Show an in-app message using Toast
      Toast.show({
        type: 'info',
        text1: notification.request.content.title || 'New Notification',
        text2: notification.request.content.body || '',
        visibilityTime: 4000
      })
    });

    // Listener for user interaction with notifications (tapping)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Tapped!', response);
      // Add logic here to navigate based on notification data if needed
      // e.g., const screen = response.notification.request.content.data?.screen;
      // if (screen) { navigationRef.navigate(screen); }
    });

    // Cleanup function using .remove() on the subscription objects
    return () => {
      notificationListener.remove(); // <-- Correct way to remove listener
      responseListener.remove();    // <-- Correct way to remove listener
    };
  }, []); // Empty dependency array ensures this runs once

  return (
    // AuthContext provides user, setUser, category, setCategory to the app
    <AuthContext.Provider value={{ user, setUser, category, setCategory }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content" // Or "light-content" depending on your header
          backgroundColor="transparent"
          translucent={true}
        />
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* NavigationContainer wraps the navigators */}
          <NavigationContainer>
            {/* Conditional rendering based on authentication state */}
            {user ? (
              // If user is logged in, show Category or App navigator
              category ? <AppNavigator /> : <CategoryNavigator />
            ) : (
              // If no user, show the Authentication flow navigator
              <AuthNavigator />
            )}
          </NavigationContainer>
        </GestureHandlerRootView>
        {/* Toast component needs to be rendered at the top level */}
        <Toast />
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}