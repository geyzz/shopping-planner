import FormField from '@/components/molecules/form_field';
import AuthCard from '@/components/organisms/auth_card';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

const isValidEmail = (val) => {
  const trimmed = (val ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (value) => {
    setEmail(value);
    if (emailError) setEmailError('');
    if (passwordError) setPasswordError('');
  };

  const handleEmailBlur = () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (passwordError) setPasswordError('');
  };

  const handleLogin = async () => {
    let hasError = false;
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError('Please enter your email');
      hasError = true;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Please enter your password');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    setLoading(false);

    if (error) {
      console.warn('Login error:', error);
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('email not confirmed') || error.code === 'email_not_confirmed') {
        setEmailError('Email is not verified yet.');
        Alert.alert(
          'Email Not Verified',
          'Your account email has not been confirmed yet. Please check your inbox (and spam folder) or tap below to receive a new confirmation link.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Resend Email',
              onPress: async () => {
                const { error: resendErr } = await supabase.auth.resend({
                  type: 'signup',
                  email: trimmedEmail,
                  options: {
                    emailRedirectTo: 'planed://auth/verified',
                  },
                });
                if (resendErr) {
                  Alert.alert('Resend Failed', resendErr.message);
                } else {
                  Alert.alert('Sent', `Confirmation email resent to ${trimmedEmail}.`);
                }
              },
            },
          ]
        );
      } else if (msg.includes('invalid login credentials') || error.code === 'invalid_credentials') {
        setPasswordError('Incorrect email or password. Please try again.');
      } else {
        setPasswordError(error.message || 'Unable to log in. Please try again.');
      }
      return;
    }

    if (data?.session) {
      router.replace('/screens/home');
    }
  };

  return (
    <AuthCard
      title="Log In"
      submitLabel="Log In"
      loadingLabel="Logging in..."
      loading={loading}
      onSubmit={handleLogin}
      footerText="Don't have an account?"
      linkLabel="Sign Up"
      linkHref="/auth/signup"
    >
      <FormField
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={handleEmailChange}
        onBlur={handleEmailBlur}
        autoCapitalize="none"
        keyboardType="email-address"
        error={emailError}
      />
      <FormField
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
        error={passwordError}
      />
    </AuthCard>
  );
}