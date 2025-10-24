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

import { supabase } from './lib/supabase';
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import CategoryNavigator from './navigation/CategoryNavigator';
import AuthContext from './auth/AuthContext';
import colors from './config/colors';

// --- Notification Handler (Keep as is) ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// --- Function to Register for Push Notifications (Keep as is) ---
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

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.error('[Push Notification] Project ID not found in app.config.js');
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
  const [authState, setAuthState] = useState({
    session: null,        // Stores the Supabase session object
    isAuthenticated: false, // True only if session exists AND email is confirmed
    isLoading: true,      // True during initial session check
    isPasswordRecovery: false, // NEW: Flag to track if in recovery flow
  });
  const [category, setCategory] = useState(null);
  const navigationRef = useNavigationContainerRef();

  // --- Authentication State Listener ---
  useEffect(() => {
    console.log("[Auth] Setting up listener and checking initial session...");
    setAuthState(prev => ({ ...prev, isLoading: true }));

    // --- Check Initial Session ---
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      let confirmed = false;
      let authenticated = false;
      if (!error && initialSession) {
        confirmed = !!initialSession.user?.email_confirmed_at;
        authenticated = confirmed; // Only authenticated if confirmed
        console.log(`[Auth] Initial Session Check: Session found (User: ${initialSession.user.id}, Confirmed: ${confirmed}, Authenticated: ${authenticated})`);
      } else if (error) {
        console.error("[Auth] Error getting initial session:", error);
      } else {
        console.log("[Auth] Initial Session Check: No session found.");
      }

      setAuthState({ session: initialSession, isAuthenticated: authenticated, isLoading: false, isPasswordRecovery: false });

      if (!authenticated) {
        setCategory(null); // Reset category if not authenticated
      }
      console.log("[Auth] Initial session check complete.");

    }).catch(error => {
      console.error("[Auth] Catch Error during initial getSession:", error);
      setAuthState({ session: null, isAuthenticated: false, isLoading: false, isPasswordRecovery: false });
      setCategory(null);
      console.log("[Auth] Initial session check complete (catch).");
    });

    // --- Auth State Change Listener ---
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        const userId = currentSession?.user?.id;
        const confirmed = !!currentSession?.user?.email_confirmed_at;
        // Authenticated = has session AND email is confirmed
        const authenticated = !!(currentSession && confirmed);
        // ** NEW: Check if this is the temporary recovery session **
        const isRecovery = _event === 'PASSWORD_RECOVERY';

        console.log(`[Auth] State Change Event: ${_event}`, `| Session: ${currentSession ? `Exists (User: ${userId}, Confirmed: ${confirmed})` : 'Null'}`, `| Authenticated: ${authenticated}`, `| Is Recovery: ${isRecovery}`);

        // --- Handle specific events ---
        if (isRecovery) {
          // This event fires after `verifyOtp` with type 'recovery' is successful.
          // Keep the session but mark as NOT authenticated for App navigation.
          // Set the recovery flag. Navigation happens in VerifyOtpScreen.
          console.log("[Auth] State Change: PASSWORD_RECOVERY event. Keeping session temporarily, flagging recovery state.");
          setAuthState(prev => ({
            ...prev,
            session: currentSession,
            isAuthenticated: false, // Don't allow main app access yet
            isLoading: false,
            isPasswordRecovery: true // Set recovery flag
          }));
          return; // Prevent further state changes below for this event
        }

        if (_event === 'SIGNED_IN' && !confirmed) {
          console.log("[Auth] State Change: SIGNED_IN but email not confirmed. isAuthenticated remains false.");
          // State will be updated below, isAuthenticated will be false.
        }

        if (_event === 'USER_UPDATED' && authState.isPasswordRecovery) {
          // This might happen after the password is successfully set in SetNewPasswordScreen.
          // We need to transition out of the recovery state.
          console.log("[Auth] State Change: USER_UPDATED during recovery. Likely password set. Resetting recovery flag.");
          // The state update below will handle setting isAuthenticated if the user is now confirmed.
          // The crucial part is resetting isPasswordRecovery.
        }


        // Update state unless it's identical OR if we just handled PASSWORD_RECOVERY above
        setAuthState(prev => {
          // Reset recovery flag if the event is not PASSWORD_RECOVERY anymore
          const shouldResetRecovery = prev.isPasswordRecovery && !_event.includes('RECOVERY'); // Reset if event changes
          const newIsPasswordRecovery = shouldResetRecovery ? false : prev.isPasswordRecovery;

          if (JSON.stringify(prev.session) === JSON.stringify(currentSession)
            && prev.isAuthenticated === authenticated
            && prev.isPasswordRecovery === newIsPasswordRecovery) // Also check recovery flag
          {
            console.log("[Auth] State Change: No significant change detected, skipping update.");
            return { ...prev, isLoading: false }; // Ensure loading is off
          }
          console.log("[Auth] State Change: Updating auth state.");
          return {
            session: currentSession,
            isAuthenticated: authenticated,
            isLoading: false,
            isPasswordRecovery: newIsPasswordRecovery // Update recovery flag status
          };
        });

        // --- Category Reset Logic ---
        // Reset category if not authenticated OR if signing out
        if ((!authenticated || _event === 'SIGNED_OUT') && category !== null && _event !== 'TOKEN_REFRESHED' && _event !== 'USER_UPDATED') {
          console.log("[Auth] Resetting category due to unauthenticated state or sign out.");
          setCategory(null);
        }

        // --- Push Token Registration ---
        // Only register if fully authenticated (SIGNED_IN and confirmed)
        if (_event === 'SIGNED_IN' && authenticated) { // Check authenticated flag
          const sessionUser = currentSession.user;
          console.log("[Push Notification] User authenticated, attempting to register token...");
          const token = await registerForPushNotificationsAsync();
          if (token && sessionUser.id) {
            console.log("[Push Notification] Saving token for user:", sessionUser.id);
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({ id: sessionUser.id, expo_push_token: token }, { onConflict: 'id' });
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
        authListener.subscription.unsubscribe();
      } else {
        console.warn('[Auth] Could not unsubscribe auth listener.');
      }
    };
  }, []); // Run listener setup only once


  // --- Notification Listeners (Keep as is) ---
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notification] Received:', notification.request.content.title);
      Toast.show({
        type: 'info',
        text1: notification.request.content.title || 'New Notification',
        text2: notification.request.content.body || '',
        visibilityTime: 4000,
      });
    });
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Notification] Tapped:', response);
    });
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);


  // --- Render Logic ---
  const contextUser = authState.session?.user ?? null;
  // *** Use the dedicated isAuthenticated flag AND check isPasswordRecovery ***
  const showAuthenticatedFlow = authState.isAuthenticated && !authState.isPasswordRecovery;

  // Show loading indicator ONLY during the initial check
  if (authState.isLoading) {
    console.log("[Render] App loading: Initial session check...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary || '#0000ff'} />
      </View>
    );
  }

  console.log(`[Render] Rendering App -> Show Authenticated Flow: ${showAuthenticatedFlow}, Is Loading: ${authState.isLoading}, Is Recovery: ${authState.isPasswordRecovery}, Category: ${category}`);

  return (
    <AuthContext.Provider value={{ user: contextUser, setUser: () => { }, category, setCategory }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer ref={navigationRef}>
            {showAuthenticatedFlow ? (
              category ? <AppNavigator /> : <CategoryNavigator />
            ) : (
              // AuthNavigator handles Start, Signin, Register, ForgotPassword, VerifyOtp, SetNewPassword
              <AuthNavigator />
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
    backgroundColor: colors.white || '#ffffff',
  }
});