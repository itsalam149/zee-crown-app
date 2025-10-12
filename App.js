// App.js
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react'; // Fixed the import statement
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
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  // Get the project ID from your app.config.js
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.error('Project ID not found. Make sure it is set in your app.config.js');
    return;
  }

  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e) {
    console.error("Couldn't get push token", e);
  }

  return token;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          setCategory(null);

          // --- Get the push token and save it to the user's profile ---
          const token = await registerForPushNotificationsAsync();
          if (token && sessionUser.id) {
            const { error } = await supabase
              .from('profiles')
              .update({ expo_push_token: token })
              .eq('id', sessionUser.id);
            if (error) {
              console.error("Error saving push token:", error);
            }
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- useEffect for Notification Listeners ---
  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received: ', notification.request.content.title);
      // You can show a custom in-app toast or banner here
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Tapped!', response);
      // You can add logic here to navigate to a specific screen
    });

    return () => {
      Notifications.removeNotificationSubscription(receivedListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, category, setCategory }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
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