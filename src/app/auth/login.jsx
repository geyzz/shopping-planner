import FormField from '@/components/molecules/form_field';
import AuthCard from '@/components/organisms/auth_card';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        onChangeText={validateEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={emailError}
      />
      <FormField
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
    </AuthCard>
  );
}