import Checkbox from '@/components/atoms/checkbox';
import FormField from '@/components/molecules/form_field';
import AuthCard from '@/components/organisms/auth_card';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

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
    const trimmedEmail = email.trim();

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
      setTermsError('You must agree to the terms and policies');
      hasError = true;
    } else {
      setTermsError('');
    }

    if (hasError) return;

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
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('email') || msg.includes('user already') || msg.includes('registered')) {
        setEmailError(error.message);
      } else if (msg.includes('password')) {
        setPasswordError(error.message);
      } else {
        setPasswordError(error.message);
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
        submitSpacing={20}
        compact
      >
        <FormField
          compact
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
          compact
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
          compact
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
          compact
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
          compact
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

        <Pressable
          style={styles.checkboxRow}
          onPress={() => {
            setAgreedToTerms((prev) => !prev);
            if (termsError) setTermsError('');
          }}
        >
          <Checkbox
            checked={agreedToTerms}
            onToggle={() => {
              setAgreedToTerms((prev) => !prev);
              if (termsError) setTermsError('');
            }}
          />
          <Text style={styles.checkboxLabel}>Agree to terms and policies</Text>
        </Pressable>
        {termsError ? <Text style={styles.termsErrorText}>{termsError}</Text> : null}
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
    termsErrorText: {
      ...typography.small,
      color: colors.error,
      marginTop: 4,
    },
  });