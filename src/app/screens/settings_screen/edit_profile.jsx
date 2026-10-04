import Avatar from '@/components/atoms/avatar';
import FormField from '@/components/molecules/form_field';
import Header from '@/components/organisms/header';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function EditProfilePage() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.user_metadata) {
        setFirstName(session.user.user_metadata.first_name ?? '');
        setLastName(session.user.user_metadata.last_name ?? '');
        setAvatarUri(session.user.user_metadata.avatar_url ?? null);
      }
    };

    fetchUser();
  }, []);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to change your picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/settings');
    }
  };

  const handleSave = async () => {
    setSaving(true);

    let avatarUrl = avatarUri;

    // Only upload when it's a freshly picked local file
    if (avatarUri && !avatarUri.startsWith('http')) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const path = `${user.id}/avatar.jpg`;

      const response = await fetch(avatarUri);
      const buffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, buffer, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) {
        setSaving(false);
        Alert.alert('Upload failed', uploadError.message);
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      },
    });

    setSaving(false);

    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }

    handleBack();
  };

  return (
    <>
      <Header title="Edit Profile" onBack={handleBack} />

      <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.avatarWrapper} onPress={handlePickImage}>
          <Avatar image={avatarUri} size={96} />
          <View style={styles.editIconWrapper}>
            <Feather name="edit-2" size={14} color={colors.white} />
          </View>
        </Pressable>

        <FormField label="First Name" value={firstName} onChangeText={setFirstName} />
        <FormField label="Last Name" value={lastName} onChangeText={setLastName} />

        <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
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
    avatarWrapper: {
      alignSelf: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    editIconWrapper: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.navy,
      borderWidth: 2,
      borderColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: colors.gold,
      borderRadius: 8,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    saveButtonText: {
      color: colors.onGold,
      fontWeight: '700',
      fontSize: 16,
    },
  });