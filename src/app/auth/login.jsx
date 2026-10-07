import FormField from '@/components/molecules/form_field';
import AuthCard from '@/components/organisms/auth_card';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';

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
    const trimmedEmail = email.trim();

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
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    setLoading(false);

    if (error) {
      setPasswordError('Email or password may be incorrect');
      return;
    }

    router.replace('/screens/home');
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