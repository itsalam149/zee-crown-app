// App.js
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Platform, StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
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
import colors from './config/colors'; // Assuming colors config exists

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
  const [session, setSession] = useState(null);
  const [category, setCategory] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true); // Loading state

  // --- Authentication State Listener ---
  useEffect(() => {
    setIsLoadingSession(true); // Start loading
    // Check initial session state
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.error("Error getting initial session:", error);
      } else {
        console.log("Initial Session Check:", initialSession ? `Session found (User: ${initialSession.user.id})` : 'No session');
        setSession(initialSession); // Set initial session state
        if (!initialSession) {
          setCategory(null);
        }
      }
      setIsLoadingSession(false); // Mark loading as complete regardless of outcome
    }).catch(error => {
      console.error("Catch Error getting initial session:", error);
      setSession(null);
      setCategory(null);
      setIsLoadingSession(false);
    });

    // Subscribe to future auth state changes
    const { data } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log("Auth Event:", _event, "Session:", currentSession ? `Exists (User: ${currentSession.user.id}, Email Confirmed: ${currentSession.user.email_confirmed_at})` : 'Null');

        // Explicit check for immediate session after signup (indicates misconfiguration)
        if (_event === 'SIGNED_IN' && currentSession && !currentSession.user.email_confirmed_at) {
          const createdAt = new Date(currentSession.user.created_at).getTime();
          const now = Date.now();
          // If signed in within ~5 seconds of creation without confirmation, log warning
          if ((now - createdAt) < 5000) {
            console.warn("User received session immediately after signup without email confirmation - **PLEASE VERIFY SUPABASE 'Confirm email' SETTING IS OFF**");
            // Optional: Force sign out if this behavior is unwanted
            // console.log("Forcing sign out due to immediate unconfirmed session...");
            // await supabase.auth.signOut();
            // setSession(null); // Manually clear session state
            // return; // Stop processing this event if forcing sign out
          }
        }

        // Only update session state if it has actually changed
        // Prevents some unnecessary re-renders on background token refreshes
        if (JSON.stringify(session) !== JSON.stringify(currentSession)) {
          console.log("Session state updated.");
          setSession(currentSession);
        } else {
          console.log("Session state unchanged.");
        }


        const sessionUser = currentSession?.user ?? null;

        // Reset category on significant auth events or session loss
        if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'PASSWORD_RECOVERY'].includes(_event) || !currentSession) {
          // Reset category if user logs out, or logs in (forcing re-selection)
          if (_event !== 'TOKEN_REFRESHED') { // Avoid resetting just for token refresh
            console.log("Resetting category due to auth event:", _event);
            setCategory(null);
          }
        }

        // Register/Update push token only when user is newly signed in
        if (_event === 'SIGNED_IN' && sessionUser) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // Delay for profile creation
          const token = await registerForPushNotificationsAsync();
          if (token && sessionUser.id) {
            console.log("Attempting to save push token for user:", sessionUser.id);
            const { error } = await supabase
              .from('profiles')
              .upsert({ id: sessionUser.id, expo_push_token: token }, { onConflict: 'id' });
            if (error) {
              console.error('Error saving push token:', error);
            } else {
              console.log('Push token save attempt finished.');
            }
          }
        }
      }
    );

    const subscription = data?.subscription;

    // Cleanup
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        console.log("Unsubscribing auth listener.");
        subscription.unsubscribe();
      } else {
        console.warn('Could not unsubscribe auth listener.');
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // --- Notification Listeners ---
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

  // --- Render ---
  const contextUser = session?.user ?? null; // Derive user for context

  // Show loading indicator while checking initial session
  if (isLoadingSession) {
    console.log("App loading: Checking initial session...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary || '#0000ff'} />
      </View>
    );
  }

  console.log("App rendering:", session ? "Authenticated Flow" : "Auth Flow");

  return (
    <AuthContext.Provider value={{ user: contextUser, setUser: () => { }, category, setCategory }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            {/* Base navigation on session existence */}
            {session ? ( // If session exists...
              category ? <AppNavigator /> : <CategoryNavigator />
            ) : ( // If no session...
              <AuthNavigator />
            )}
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
    backgroundColor: colors.white || '#ffffff', // Use default if colors not loaded
  }
});