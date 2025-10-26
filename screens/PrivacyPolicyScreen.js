// screens/PrivacyPolicyScreen.js
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from 'config/colors';
import { spacingX, spacingY } from 'config/spacing';

export default function PrivacyPolicyScreen() {
    const navigation = useNavigation();

    // --- You should update this date whenever you make changes ---
    const lastUpdatedDate = "October 26, 2025";

    return (
        <ScreenComponent style={styles.container}>
            {/* Header */}
            <TouchableOpacity style={styles.header} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={colors.black} />
                <Typo size={20} style={styles.headerTitle}>Privacy Policy</Typo>
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Typo style={[styles.paragraph, { marginBottom: spacingY._15, fontStyle: 'italic' }]}>
                    Last Updated: {lastUpdatedDate}
                </Typo>

                <Typo size={18} style={styles.heading}>1. Introduction</Typo>
                <Typo style={styles.paragraph}>
                    Welcome to <Typo style={{ fontWeight: '700' }}>Zee Crown</Typo> ("we", "us", "our"). We are committed to protecting the privacy of our users ("you", "your"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the "App") to purchase medicines, food items (such as butter, jam), cosmetics, and perfumes. Please read this policy carefully. By using the App, you agree to the terms of this Privacy Policy.
                </Typo>

                <Typo size={18} style={styles.heading}>2. Information We Collect</Typo>
                <Typo style={styles.paragraph}>
                    We collect personal information that you provide to us directly when you register an account, place an order, or communicate with us. The types of information we may collect include:
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Account Information:</Typo> Your full name, email address, mobile phone number, and password.
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Order Information:</Typo> Details about the products you purchase, order history, and delivery addresses.
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Payment Information:</Typo> While we facilitate payments through Razorpay or Cash on Delivery, we do not directly store your full credit card numbers or sensitive payment details. Payment processing is handled by third-party providers (e.g., Razorpay).
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Prescription Information (for Medicines):</Typo> If you order prescription medication, you may choose to provide us with a copy of your prescription via WhatsApp. This information is handled with extra care as outlined below.
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Communication:</Typo> Information you provide when you contact customer support or communicate with us in any other way.
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Device Information:</Typo> We may collect your Expo Push Token to send you notifications related to your orders or (with your consent) promotional updates.
                </Typo>

                <Typo size={18} style={styles.heading}>3. How We Use Your Information</Typo>
                <Typo style={styles.paragraph}>
                    We use the information we collect for various purposes, including to:
                    {"\n"}• Create and manage your account.
                    {"\n"}• Process your orders, including payment processing and delivery arrangement.
                    {"\n"}• Verify prescriptions for medicine orders as required by law or regulation.
                    {"\n"}• Communicate with you about your orders, account, or customer service inquiries.
                    {"\n"}• Send you order updates and delivery notifications via push notifications or SMS/Email.
                    {"\n"}• Improve our App, products, and services based on usage patterns and feedback.
                    {"\n"}• Send you promotional communications (e.g., offers, newsletters) if you have opted-in to receive them. You can opt-out at any time.
                    {"\n"}• Prevent fraudulent transactions and ensure the security of our App.
                    {"\n"}• Comply with legal obligations.
                </Typo>

                <Typo size={18} style={styles.heading}>4. Data Storage and Security</Typo>
                <Typo style={styles.paragraph}>
                    Your personal information is primarily stored using Supabase, our backend service provider. We implement reasonable administrative, technical, and physical security measures to protect your personal information from unauthorized access, use, alteration, or destruction. Payment transactions are processed securely through Razorpay's compliant gateway. Prescription images sent via WhatsApp are used solely for verification purposes related to the specific order and are not integrated into our primary database or stored long-term within the App's backend, though they may remain in our WhatsApp chat history subject to WhatsApp's policies unless deleted.
                </Typo>

                <Typo size={18} style={styles.heading}>5. Information Sharing and Disclosure</Typo>
                <Typo style={styles.paragraph}>
                    We do not sell, trade, or rent your personal information to third parties for their marketing purposes. We may share your information only in the following circumstances:
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Service Providers:</Typo> With third-party vendors and service providers who perform services on our behalf, such as payment processing (Razorpay), delivery logistics, data analysis, email delivery, hosting services, and customer service. These providers only have access to the information necessary to perform their functions and are obligated to protect your data.
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Legal Requirements:</Typo> If required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Business Transfers:</Typo> In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>With Your Consent:</Typo> We may share your information for other purposes with your explicit consent.
                </Typo>

                <Typo size={18} style={styles.heading}>6. Your Rights and Choices</Typo>
                <Typo style={styles.paragraph}>
                    Depending on your location, you may have certain rights regarding your personal information:
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Access:</Typo> You can review and update your account information directly within the App's profile section. You may also request access to other personal data we hold about you.
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Correction:</Typo> You can correct inaccuracies in your personal information through your account settings or by contacting us.
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Deletion:</Typo> You may request the deletion of your account and personal data, subject to certain legal exceptions (e.g., retaining data for order history or legal compliance).
                    {"\n"}• <Typo style={{ fontWeight: '600' }}>Opt-Out:</Typo> You can opt-out of receiving promotional emails or push notifications by adjusting your notification settings within the App or contacting us. You will still receive essential communications regarding your orders and account.
                    {"\n"}To exercise these rights, please contact us using the details provided below.
                </Typo>

                <Typo size={18} style={styles.heading}>7. Children’s Privacy</Typo>
                <Typo style={styles.paragraph}>
                    Our App is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to remove that information.
                </Typo>

                <Typo size={18} style={styles.heading}>8. Updates to This Policy</Typo>
                <Typo style={styles.paragraph}>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the App and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </Typo>

                <Typo size={18} style={styles.heading}>9. Contact Us</Typo>
                <Typo style={styles.paragraph}>
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
                    {"\n"}Email: support@zeecrown.com
                    {"\n"}Phone: +91 9999050773
                    {/* Add a more specific address if possible */}
                    {"\n"}Address: Delhi, India
                </Typo>

            </ScrollView>
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.lightGray,
    },
    headerTitle: {
        fontWeight: '600',
        marginLeft: spacingX._15,
    },
    scrollContent: {
        padding: spacingX._20,
        paddingBottom: 50, // Ensure enough space at the bottom
    },
    heading: {
        fontWeight: '700',
        marginTop: spacingY._15,
        marginBottom: spacingY._10,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 22,
        color: colors.gray,
    },
});
