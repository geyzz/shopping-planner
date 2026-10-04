import Checkbox from '@/components/atoms/checkbox';
import FormField from '@/components/molecules/form_field';
import AuthCard from '@/components/organisms/auth_card';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

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
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const { height } = useWindowDimensions();
  const backTop = height * 0.07;
  const backSpace = backTop + 24 + 8;

  const validateEmail = (value) => {
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.length === 0) {
      setEmailError('');
    } else if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setEmailError('All fields are required');
      return;
    }
    if (emailError) return;
    if (password !== confirmPassword) {
      setEmailError('Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      setEmailError('You must agree to the terms and policies');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });
    setLoading(false);

    if (error) {
      setEmailError(error.message);
      return;
    }

    router.replace('/auth/login');
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
        submitSpacing={20}
        compact
      >
        <FormField
          compact
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <FormField
          compact
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={setLastName}
        />
        <FormField
          compact
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={validateEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailError}
        />
        <FormField
          compact
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <FormField
          compact
          label="Re-enter Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Pressable style={styles.checkboxRow} onPress={() => setAgreedToTerms(!agreedToTerms)}>
          <Checkbox checked={agreedToTerms} onToggle={() => setAgreedToTerms(!agreedToTerms)} />
          <Text style={styles.checkboxLabel}>Agree to terms and policies</Text>
        </Pressable>
      </AuthCard>
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
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
    },
    checkboxLabel: {
      ...typography.small,
      color: colors.text,
      flex: 1,
      marginLeft: spacing.sm,
    },
  });