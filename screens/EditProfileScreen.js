// screens/EditProfileScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import ScreenComponent from '../components/ScreenComponent';
import Header from '../components/Header';
import AppButton from '../components/AppButton';
import Typo from '../components/Typo';
import { supabase } from '../lib/supabase';
import useAuth from '../auth/useAuth';
import colors from '../config/colors';
import { spacingY, radius } from '../config/spacing';
import Toast from 'react-native-toast-message';

function EditProfileScreen({ route, navigation }) {
    const { user } = useAuth();
    const { currentName } = route.params;
    const [fullName, setFullName] = useState(currentName);
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        if (!fullName.trim()) {
            Toast.show({ type: 'error', text1: 'Name cannot be empty.' });
            return;
        }
        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id);

        setLoading(false);

        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not update your profile.' });
        } else {
            Toast.show({ type: 'success', text1: 'Profile Updated!' });
            navigation.goBack();
        }
    };

    return (
        <ScreenComponent style={styles.container}>
            <Header label="Edit Profile" />
            <View style={styles.form}>
                <Typo style={styles.label}>Full Name</Typo>
                <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                />
                <AppButton
                    label={loading ? 'Saving...' : 'Save Changes'}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                />
            </View>
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
    },
    form: {
        padding: spacingY._20,
    },
    label: {
        marginBottom: spacingY._10,
        fontWeight: '600',
        fontSize: 16,
    },
    input: {
        backgroundColor: colors.lighterGray,
        padding: spacingY._15,
        borderRadius: radius._10,
        fontSize: 16,
        marginBottom: spacingY._20,
    },
});

export default EditProfileScreen;