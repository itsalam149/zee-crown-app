// screens/ProfileScreen.js
import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useAuth from 'auth/useAuth';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { normalizeY } from 'utils/normalize';
import { supabase } from '../lib/supabase';

function ProfileScreen(props) {
  const [key, setKey] = useState(0);
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Refetches profile data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchProfile();
      }
      setKey((prevKey) => prevKey + 1);
    }, [user])
  );

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase();
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const Row = ({ icon, title, iconColor, index, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <Animated.View
          style={styles.row}
          entering={FadeInDown.delay(index * 80)
            .duration(800)
            .damping(12)
            .springify()}
          key={`${key}-${index}`}>
          <View
            style={{ backgroundColor: iconColor, padding: spacingY._10, borderRadius: radius._12 }}>
            {icon}
          </View>
          <Typo size={16} style={{ fontWeight: '500', flex: 1 }}>
            {title}
          </Typo>
          <Octicons name="chevron-right" size={24} color="black" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenComponent style={styles.container}>
      {/* Camera Icon Removed */}
      <View style={{ height: 24 }} />

      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          <Typo size={40} style={styles.avatarText}>
            {getInitials(profile?.full_name)}
          </Typo>
        </View>

        <View style={{ gap: spacingY._7, marginTop: spacingY._5, alignItems: 'center' }}>
          <Typo size={22} style={styles.name}>
            {profile?.full_name || 'Zee Crown User'}
          </Typo>
          <Typo size={16} style={{ color: colors.gray, fontWeight: '500' }}>
            {user?.email}
          </Typo>
        </View>
      </View>
      <View style={{ flex: 1, gap: 15 }}>
        <View style={styles.bottomContainer}>
          <Row
            title={'Edit profile'}
            iconColor={'#fbdbe6'}
            icon={<Ionicons name="person" size={24} color={'#eb4b8b'} />}
            index={0}
            onPress={() => navigation.navigate('EditProfile', { currentName: profile?.full_name })}
          />
          <Row
            title={'My Orders'}
            iconColor={'#dedffd'}
            icon={<Ionicons name="receipt-outline" size={24} color={'#5d5be5'} />}
            index={1}
            onPress={() => navigation.navigate('MyOrders')}
          />
          <Row
            title={'My Addresses'}
            iconColor={'#ffe3ce'}
            icon={<Ionicons name="location-outline" size={24} color={'#f97113'} />}
            index={2}
            onPress={() => navigation.navigate('MyAddresses')}
          />
          <Row
            title={'Invite a friend'}
            iconColor={'#F5E8E4'}
            icon={<Ionicons name="person-add-outline" size={24} color={'#860A35'} />}
            index={3}
          />
        </View>
        <View style={[styles.bottomContainer, { marginBottom: '30%' }]}>
          <Row
            title={'Help'}
            iconColor={'#d1d1d1'}
            icon={<Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.black} />}
            index={4}
          />
          <Row
            title={'Log out'}
            iconColor={'#d1d1d1'}
            icon={<MaterialCommunityIcons name="logout" size={24} color={colors.black} />}
            index={5}
            onPress={handleSignOut}
          />
        </View>
      </View>
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
  },
  topRow: {
    marginBottom: normalizeY(25),
    alignItems: 'center',
    gap: spacingX._10,
    marginTop: '2%',
  },
  avatarContainer: {
    height: normalizeY(110),
    width: normalizeY(110),
    borderRadius: normalizeY(60),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: normalizeY(3),
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  avatarText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  name: {
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
    paddingVertical: spacingY._10,
    paddingRight: spacingX._5,
  },
  bottomContainer: {
    backgroundColor: colors.white,
    borderRadius: spacingY._20,
    shadowColor: colors.black,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    padding: spacingY._15,
  },
});

export default ProfileScreen;