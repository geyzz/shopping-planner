import FormField from '@/components/molecules/form_field';
import Header from '@/components/organisms/header';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing, typography } from '@/theme/theme';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/settings');
    }
  };

  const handleResetPassword = async () => {
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      setSaving(false);
      Alert.alert('Not signed in', 'Please log in again.');
      return;
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });

    if (reauthError) {
      setSaving(false);
      setError('Current password is incorrect');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    Alert.alert('Success', 'Your password has been updated.');
    handleBack();
  };

  return (
    <>
      <Header title="Change Password" onBack={handleBack} />

      <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Reset Your Password</Text>

        <FormField
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <FormField
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <FormField
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={error}
        />

        <Pressable style={styles.resetButton} onPress={handleResetPassword} disabled={saving}>
          <Text style={styles.resetButtonText}>
            {saving ? 'Resetting...' : 'Reset Password'}
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl ?? spacing.lg * 2,
    },
    heading: {
      ...typography.heading,
      fontSize: 18,
      color: colors.navy,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    resetButton: {
      backgroundColor: colors.navy,
      borderRadius: 8,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    resetButtonText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 16,
    },
  });