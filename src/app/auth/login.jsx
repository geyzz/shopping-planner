import { supabase } from '@/lib/supabase';
import { borderRadius, colors, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      setEmailError('Email and password are required');
      return;
    }
    if (emailError) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setEmailError(error.message);
      return;
    }

    router.replace('/screens/home');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.box}>
        <Text style={styles.title}>Log In</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={validateEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.navy} />
          </Pressable>
        </View>

        <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
        </Pressable>

        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/auth/signup" style={styles.signupLink}>
          Sign Up
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  box: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.heading,
    color: colors.navy,
    textAlign: 'center',
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm / 2,
    marginTop: spacing.md,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md - 4,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginTop: 4,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md - 4,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: spacing.md - 4,
    fontSize: 16,
    color: colors.text,
  },
  toggleText: {
    color: colors.navy,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    color: colors.navy,
    ...typography.label,
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    marginTop: spacing.lg,
    color: colors.textSecondary,
  },
  signupLink: {
    textAlign: 'center',
    color: colors.navy,
    fontWeight: '700',
    marginTop: 4,
  },
});