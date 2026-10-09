import Checkbox from '@/components/atoms/checkbox';
import FormField from '@/components/molecules/form_field';
import AuthCard from '@/components/organisms/auth_card';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const isValidEmail = (val) => {
  const trimmed = (val ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

export default function SignupPage() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [loading, setLoading] = useState(false);

  const { height } = useWindowDimensions();
  const backTop = height * 0.07;
  const backSpace = backTop + 24 + 8;

  const handleEmailBlur = () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordBlur = () => {
    if (!password) return;
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (!confirmPassword) return;
    if (password && confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSignup = async () => {
    let hasError = false;

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedFirst) {
      setFirstNameError('First name is required');
      hasError = true;
    } else {
      setFirstNameError('');
    }

    if (!trimmedLast) {
      setLastNameError('Last name is required');
      hasError = true;
    } else {
      setLastNameError('');
    }

    if (!trimmedEmail) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    if (!agreedToTerms) {
      setTermsError('You must agree to the terms and policies to create an account');
      hasError = true;
    } else {
      setTermsError('');
    }

    if (hasError) {
      if (!agreedToTerms && !trimmedFirst && !trimmedLast && !trimmedEmail && !password) {
        // all empty, normal inline error
      } else if (!agreedToTerms && trimmedFirst && trimmedLast && trimmedEmail && password && confirmPassword) {
        Alert.alert(
          'Terms and Policies',
          'Please agree to the terms and policies before proceeding with sign up.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { first_name: trimmedFirst, last_name: trimmedLast },
        emailRedirectTo: 'planed://auth/verified',
      },
    });
    setLoading(false);

    if (error) {
      console.warn('Supabase signUp error:', error);
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('user already') || msg.includes('registered')) {
        setEmailError('An account with this email already exists. Please sign in.');
      } else if (msg.includes('confirmation email') || msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
        setEmailError(error.message);
        Alert.alert(
          'Email Delivery Issue',
          `${error.message}\n\nPlease check your Supabase Auth Logs or SMTP settings in Supabase Dashboard.`,
          [{ text: 'OK' }]
        );
      } else if (msg.includes('email') || msg.includes('invalid')) {
        setEmailError(error.message);
      } else if (msg.includes('password')) {
        setPasswordError(error.message);
      } else {
        Alert.alert('Sign Up Error', error.message || 'An unexpected error occurred. Please try again.');
      }
      return;
    }

    if (data?.session) {
      router.replace('/screens/home');
    } else {
      Alert.alert(
        'Check Your Email',
        `A verification link has been sent to ${trimmedEmail}. Please check your email and click the confirmation link to activate your account.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.wrapper, { paddingTop: backSpace, backgroundColor: colors.background }]}>
      <Pressable
        style={[styles.backButton, { top: backTop }]}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={24} color={colors.navy} />
      </Pressable>

      <AuthCard
        title="Sign Up"
        submitLabel="Sign Up"
        loadingLabel="Signing up..."
        loading={loading}
        onSubmit={handleSignup}
        submitSpacing={spacing.lg}
        footerText="Already have an account?"
        linkLabel="Log In"
        linkHref="/auth/login"
      >
        <FormField
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={(v) => {
            setFirstName(v);
            if (firstNameError) setFirstNameError('');
          }}
          error={firstNameError}
        />
        <FormField
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={(v) => {
            setLastName(v);
            if (lastNameError) setLastNameError('');
          }}
          error={lastNameError}
        />
        <FormField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (emailError) setEmailError('');
          }}
          onBlur={handleEmailBlur}
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailError}
        />
        <FormField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (passwordError) setPasswordError('');
          }}
          onBlur={handlePasswordBlur}
          secureTextEntry
          error={passwordError}
        />
        <FormField
          label="Re-enter Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            if (confirmPasswordError) setConfirmPasswordError('');
          }}
          onBlur={handleConfirmPasswordBlur}
          secureTextEntry
          error={confirmPasswordError}
        />

        <View style={styles.checkboxContainer}>
          <Pressable
            style={styles.checkboxRow}
            onPress={() => {
              setAgreedToTerms((prev) => {
                const next = !prev;
                if (next) setTermsError('');
                return next;
              });
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
          >
            <View pointerEvents="none">
              <Checkbox checked={agreedToTerms} />
            </View>
            <Text style={[styles.checkboxLabel, termsError ? styles.checkboxLabelError : null]}>
              I agree to the{' '}
              <Text
                style={styles.termsLink}
                onPress={() => setTermsModalVisible(true)}
              >
                Terms & Policies
              </Text>
            </Text>
          </Pressable>
          <Pressable
            hitSlop={10}
            onPress={() => setTermsModalVisible(true)}
            style={styles.infoButton}
          >
            <Feather name="info" size={18} color={colors.gold || colors.navy} />
          </Pressable>
        </View>
        {termsError ? <Text style={styles.termsErrorText}>{termsError}</Text> : null}
      </AuthCard>

      <Modal
        visible={termsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Feather name="file-text" size={20} color={colors.gold || colors.navy} />
                <Text style={styles.modalTitle}>Terms & Policies</Text>
              </View>
              <Pressable
                hitSlop={12}
                onPress={() => setTermsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalSectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.modalSectionText}>
                Welcome to Plan_.ed. By creating an account, you agree to these Terms and Policies. Plan_.ed is designed to help you organize shopping checklists, estimate expenses, explore mall directories, and schedule errand reminders.
              </Text>

              <Text style={styles.modalSectionTitle}>2. Account & Data Security</Text>
              <Text style={styles.modalSectionText}>
                Your account is secured via Supabase Authentication and protected with PostgreSQL Row-Level Security (RLS). You are responsible for safeguarding your login credentials. Your lists, stores, and errands remain private to your account.
              </Text>

              <Text style={styles.modalSectionTitle}>3. Privacy & Personal Information</Text>
              <Text style={styles.modalSectionText}>
                We collect your name, email, shopping items, and scheduled errand dates strictly to deliver application features. We respect your privacy and never sell, trade, or share your personal data with third-party advertisers.
              </Text>

              <Text style={styles.modalSectionTitle}>4. Local Storage & Offline Usage</Text>
              <Text style={styles.modalSectionText}>
                Plan_.ed caches your checklists locally on your device for fast access even without an active internet connection. Changes sync with cloud storage automatically once network connectivity is available.
              </Text>

              <Text style={styles.modalSectionTitle}>5. Notifications & Alarms</Text>
              <Text style={styles.modalSectionText}>
                Plan_.ed requests notification permissions strictly to trigger scheduled shopping alarms and errand reminders on your device. You can configure or disable reminder alerts at any time.
              </Text>

              <Text style={styles.modalSectionTitle}>6. Updates & Inquiries</Text>
              <Text style={styles.modalSectionText}>
                We may periodically update these terms to improve security and feature offerings. Continued use of Plan_.ed indicates your acceptance of any updates.
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalAcceptButton}
                onPress={() => {
                  setAgreedToTerms(true);
                  setTermsError('');
                  setTermsModalVisible(false);
                }}
              >
                <Text style={styles.modalAcceptButtonText}>I Agree & Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    backButton: {
      position: 'absolute',
      left: spacing.md,
      zIndex: 1,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingVertical: 4,
    },
    checkboxLabel: {
      ...typography.small,
      color: colors.text,
      flex: 1,
      marginLeft: spacing.sm,
    },
    checkboxLabelError: {
      color: colors.error,
    },
    termsLink: {
      color: colors.gold || colors.navy,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    infoButton: {
      padding: 6,
      marginLeft: 4,
    },
    termsErrorText: {
      ...typography.small,
      color: colors.error,
      marginTop: 4,
      marginLeft: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    },
    modalCard: {
      width: '100%',
      maxHeight: '82%',
      backgroundColor: colors.background || colors.white,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border || '#E2E8F0',
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || '#E2E8F0',
    },
    modalHeaderTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    modalTitle: {
      ...typography.h3,
      color: colors.text,
      fontWeight: '700',
      fontSize: 18,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalScroll: {
      maxHeight: 360,
    },
    modalScrollContent: {
      padding: spacing.md,
    },
    modalSectionTitle: {
      ...typography.body,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.sm,
      marginBottom: 4,
    },
    modalSectionText: {
      ...typography.small,
      color: colors.textSecondary || '#64748B',
      lineHeight: 20,
      marginBottom: spacing.xs,
    },
    modalFooter: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border || '#E2E8F0',
    },
    modalAcceptButton: {
      backgroundColor: colors.navy,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalAcceptButtonText: {
      ...typography.body,
      color: colors.white,
      fontWeight: '700',
    },
  });