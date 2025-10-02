// screens/NotificationsScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { supabase } from '../lib/supabase'; // Import the Supabase client
import colors from '../config/colors';
import ScreenComponent from 'components/ScreenComponent';
import { radius, spacingX, spacingY } from 'config/spacing';
import { AntDesign } from '@expo/vector-icons';
import Typo from 'components/Typo';
import { normalizeY } from 'utils/normalize';
import Header from 'components/Header';

function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const SPACING = spacingY._20;
  const CARD_HEIGHT = normalizeY(55);
  const ITEM_SIZE = CARD_HEIGHT + SPACING * 3;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    // Fetch notifications, ordered by the newest first
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data);
    }
    setLoading(false);
  };

  // Show a loading indicator while fetching data
  if (loading) {
    return (
      <ScreenComponent style={styles.container}>
        <Header label={'Notifications'} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Typo>Loading notifications...</Typo>
        </View>
      </ScreenComponent>
    );
  }

  return (
    <ScreenComponent style={styles.container}>
      <Header label={'Notifications'} />
      <Animated.FlatList
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        showsVerticalScrollIndicator={false}
        data={notifications} // Use data from state
        contentContainerStyle={{
          padding: SPACING,
        }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          const inputRange = [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 2)];
          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [1, 1, 1, 0],
          });
          const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [1, 1, 1, 0],
          });

          const isRead = item.is_read; // Use is_read from your database
          return (
            <Animated.View
              style={[
                styles.notiView,
                {
                  backgroundColor: isRead ? colors.light : colors.grayBG,
                  marginBottom: SPACING,
                  padding: SPACING,
                  transform: [{ scale }],
                  opacity,
                },
                isRead && {
                  borderColor: colors.primary,
                },
              ]}>
              <View style={{ height: CARD_HEIGHT }} />
              <View
                style={{ flex: 1, justifyContent: 'space-between', marginVertical: -spacingY._10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacingX._10 }}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isRead ? colors.primary : colors.lightGray,
                      },
                    ]}
                  />
                  <Typo size={15} style={{ fontWeight: '600' }}>
                    {item.title}
                  </Typo>
                </View>

                <Typo numberOfLines={2} style={{ color: colors.gray }}>
                  {item.message}
                </Typo>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: spacingX._5,
                  }}>
                  {/* Corrected icon name from 'clockcircle' to 'clockcircleo' */}
                  <AntDesign name="clockcircleo" size={14} color={colors.primary} />
                  <Typo style={styles.dateTxt}>{new Date(item.created_at).toLocaleDateString()}</Typo>
                </View>
              </View>
            </Animated.View>
          );
        }}
      />
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  notiView: {
    flexDirection: 'row',
    borderRadius: radius._15,
    borderColor: colors.lightGray,
    borderWidth: 0.5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
  },
  dateTxt: {
    opacity: 0.8,
    color: colors.primary,
    alignSelf: 'flex-end',
    fontWeight: '500',
    fontSize: normalizeY(13),
  },
  dot: {
    height: normalizeY(10),
    width: normalizeY(10),
    borderRadius: radius._10,
  },
});

export default NotificationsScreen;