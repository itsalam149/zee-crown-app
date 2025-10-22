// App.js
import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { Platform, StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { supabase } from './lib/supabase'; //
import AppNavigator from './navigation/AppNavigator'; //
import AuthNavigator from './navigation/AuthNavigator'; //
import CategoryNavigator from './navigation/CategoryNavigator'; //
import AuthContext from './auth/AuthContext'; //
import colors from './config/colors'; //
import { OtpType } from './screens/VerifyOtpScreen'; //

// --- Notification Handler (Keep as is) ---
Notifications.setNotificationHandler({ //
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// --- Function to Register for Push Notifications (Keep as is) ---
async function registerForPushNotificationsAsync() { //
  // ... (rest of the function remains the same)
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
      console.log('[Push Notification] Could not set channel:', e);
    }
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('[Push Notification] Permission not granted!');
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId; //
  if (!projectId) {
    console.error('[Push Notification] Project ID not found in app.config.js'); //
    return;
  }

  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('[Push Notification] Expo Push Token:', token);
  } catch (e) {
    console.error("[Push Notification] Couldn't get push token:", e);
  }

  return token;
}


// --- Main App Component ---
export default function App() {
  // Combine session and confirmation status into one state object
  const [authState, setAuthState] = useState({
    session: null,
    isConfirmed: false,
    isLoading: true,
  });
  const [category, setCategory] = useState(null);
  const navigationRef = useNavigationContainerRef();

  // --- Authentication State Listener ---
  useEffect(() => {
    console.log("[Auth] Setting up listener and checking initial session...");
    setAuthState(prev => ({ ...prev, isLoading: true }));

    // Check initial state first
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => { //
      let confirmed = false;
      if (!error && initialSession) {
        confirmed = !!initialSession.user?.email_confirmed_at;
        console.log(`[Auth] Initial Session Check: Session found (User: ${initialSession.user.id}, Confirmed: ${confirmed})`);
      } else if (error) {
        console.error("[Auth] Error getting initial session:", error);
      } else {
        console.log("[Auth] Initial Session Check: No session found.");
      }
      // Update state based on initial check
      setAuthState({ session: initialSession, isConfirmed: confirmed, isLoading: false });
      if (!initialSession || !confirmed) {
        setCategory(null);
      }
      console.log("[Auth] Initial session check complete.");

    }).catch(error => {
      console.error("[Auth] Catch Error during initial getSession:", error);
      setAuthState({ session: null, isConfirmed: false, isLoading: false });
      setCategory(null);
      console.log("[Auth] Initial session check complete (catch).");
    });

    // --- Auth State Change Listener ---
    const { data: authListener } = supabase.auth.onAuthStateChange( //
      async (_event, currentSession) => {
        const confirmed = !!currentSession?.user?.email_confirmed_at;
        const userId = currentSession?.user?.id;
        console.log(`[Auth] State Change Event: ${_event}`, "| Session:", currentSession ? `Exists (User: ${userId}, Confirmed: ${confirmed})` : 'Null');

        // *** Update Auth State Object ***
        setAuthState(prev => {
          // Prevent unnecessary updates if session object is identical (e.g., token refresh)
          if (JSON.stringify(prev.session) === JSON.stringify(currentSession) && prev.isConfirmed === confirmed) {
            console.log("[Auth] State Change: No actual change detected, skipping update.");
            return prev;
          }
          console.log("[Auth] State Change: Updating auth state.");
          return { session: currentSession, isConfirmed: confirmed, isLoading: false };
        });

        const sessionUser = currentSession?.user ?? null;

        // --- Category Reset Logic ---
        if (_event === 'SIGNED_OUT' || !currentSession || !confirmed) {
          if (category !== null && _event !== 'TOKEN_REFRESHED' && _event !== 'USER_UPDATED') {
            console.log("[Auth] Resetting category due to sign-out or unconfirmed email.");
            setCategory(null); //
          }
        }

        // --- Push Token Registration ---
        if (_event === 'SIGNED_IN' && sessionUser && confirmed) { // Check confirmation again
          console.log("[Push Notification] User signed in and confirmed, attempting to register token...");
          const token = await registerForPushNotificationsAsync(); //
          if (token && sessionUser.id) {
            console.log("[Push Notification] Saving token for user:", sessionUser.id);
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({ id: sessionUser.id, expo_push_token: token }, { onConflict: 'id' }); //
            if (profileError) {
              console.error('[Push Notification] Error saving push token:', profileError);
            } else {
              console.log('[Push Notification] Push token save attempt finished.');
            }
          } else {
            console.log("[Push Notification] No token obtained or user ID missing.");
          }
        }
      }
    );

    // Cleanup
    return () => {
      if (authListener?.subscription) {
        console.log("[Auth] Unsubscribing auth listener.");
        authListener.subscription.unsubscribe(); //
      } else {
        console.warn('[Auth] Could not unsubscribe auth listener.');
      }
    };
  }, []); // Run listener setup only once

  // --- Notification Listeners (Keep as is) ---
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => { //
      console.log('[Notification] Received:', notification.request.content.title);
      Toast.show({ //
        type: 'info',
        text1: notification.request.content.title || 'New Notification',
        text2: notification.request.content.body || '',
        visibilityTime: 4000,
      });
    });
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => { //
      console.log('[Notification] Tapped:', response);
      // Example navigation:
      // const screen = response.notification.request.content.data?.screen;
      // if (screen && navigationRef.current?.isReady()) {
      //     navigationRef.current.navigate(screen);
      // }
    });
    return () => {
      notificationListener.remove(); //
      responseListener.remove(); //
    };
  }, []);


  // --- Render Logic ---
  const contextUser = authState.session?.user ?? null;
  // *** Use the combined authState for rendering decision ***
  const showAuthenticatedFlow = authState.session && authState.isConfirmed;

  // Show loading indicator ONLY during the initial check
  if (authState.isLoading) {
    console.log("[Render] App loading: Initial session check...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary || '#0000ff'} />
      </View>
    );
  }

  console.log(`[Render] Rendering App -> Authenticated Flow: ${showAuthenticatedFlow}, Category: ${category}`);

  return (
    // AuthContext provides user, category state
    <AuthContext.Provider value={{ user: contextUser, setUser: () => { }, category, setCategory }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer ref={navigationRef}>
            {showAuthenticatedFlow ? (
              category ? <AppNavigator /> : <CategoryNavigator /> //
            ) : (
              <AuthNavigator /> //
            )}
          </NavigationContainer>
        </GestureHandlerRootView>
        <Toast />
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white || '#ffffff', //
  }
});