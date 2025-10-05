// screens/NotificationsScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { supabase } from '../lib/supabase';
import colors from '../config/colors';
import ScreenComponent from 'components/ScreenComponent';
import { radius, spacingX, spacingY } from 'config/spacing';
import { AntDesign } from '@expo/vector-icons';
import Typo from 'components/Typo';
import { normalizeY } from 'utils/normalize';
import Header from 'components/Header';

function NotificationsScreen() {
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
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <ScreenComponent style={styles.container}>
        <Header label="Notifications" />
        <View style={styles.centerContent}>
          <Typo>Loading notifications...</Typo>
        </View>
      </ScreenComponent>
    );
  }

  if (!loading && notifications.length === 0) {
    return (
      <ScreenComponent style={styles.container}>
        <Header label="Notifications" />
        <View style={styles.centerContent}>
          <Typo size={18} style={{ fontWeight: '600' }}>
            No Notifications
          </Typo>
          <Typo style={{ color: colors.gray, marginTop: spacingY._10 }}>
            You're all caught up 🎉
          </Typo>
        </View>
      </ScreenComponent>
    );
  }

  return (
    <ScreenComponent style={styles.container}>
      <Header label="Notifications" />
      <Animated.FlatList
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16} // ✅ ensure smooth scroll updates
        showsVerticalScrollIndicator={false}
        data={notifications}
        contentContainerStyle={{ padding: SPACING }}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
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

          const isRead = item.is_read ?? false;

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
                  borderColor: isRead ? colors.lightGray : colors.primary,
                },
              ]}
            >
              <View style={{ height: CARD_HEIGHT }} />
              <View
                style={{
                  flex: 1,
                  justifyContent: 'space-between',
                  marginVertical: -spacingY._10,
                }}
              >
                {/* Title Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isRead
                          ? colors.lightGray
                          : colors.primary,
                      },
                    ]}
                  />
                  <Typo
                    size={15}
                    style={{ fontWeight: '600', marginLeft: spacingX._10 }}
                  >
                    {item.title}
                  </Typo>
                </View>

                {/* Message */}
                <Typo numberOfLines={2} style={{ color: colors.gray }}>
                  {item.message}
                </Typo>

                {/* Date */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                >
                  <AntDesign name="clockcircle" size={14} color={colors.primary} />
                  <Typo style={[styles.dateTxt, { marginLeft: spacingX._5 }]}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Typo>
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
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notiView: {
    flexDirection: 'row',
    borderRadius: radius._15,
    borderWidth: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
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
