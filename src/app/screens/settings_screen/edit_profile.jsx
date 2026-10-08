import Avatar from '@/components/atoms/avatar';
import FormField from '@/components/molecules/form_field';
import Header from '@/components/organisms/header';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [savedAvatar, setSavedAvatar] = useState(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      // load profile
      const cachedAvatar = await AsyncStorage.getItem('user_avatar_uri');
      if (cachedAvatar) {
        setSavedAvatar(cachedAvatar);
        setAvatarUri(cachedAvatar);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.user_metadata) {
        const meta = session.user.user_metadata;
        setFirstName(meta.first_name ?? '');
        setLastName(meta.last_name ?? '');
        const url = meta.avatar_url ?? null;
        if (url) {
          setSavedAvatar(url);
          setAvatarUri(url);
        }
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
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      setAvatarBase64(asset.base64 ?? null);
      setAvatarChanged(true);
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

    let finalAvatarUrl = savedAvatar;

    if (avatarChanged && avatarUri) {
      // upload avatar
      try {
        if (avatarBase64) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user?.id) {
            const path = `${user.id}/avatar.jpg`;
            const binary = atob(avatarBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

            const { error: uploadErr } = await supabase.storage
              .from('avatars')
              .upload(path, bytes.buffer, { contentType: 'image/jpeg', upsert: true });

            if (!uploadErr) {
              const { data } = supabase.storage.from('avatars').getPublicUrl(path);
              finalAvatarUrl = `${data.publicUrl}?t=${Date.now()}`;
            } else {
              finalAvatarUrl = `data:image/jpeg;base64,${avatarBase64}`;
            }
          }
        } else {
          finalAvatarUrl = avatarUri;
        }
      } catch (e) {
        console.log('Avatar upload fallback triggered:', e?.message);
        finalAvatarUrl = avatarBase64 ? `data:image/jpeg;base64,${avatarBase64}` : avatarUri;
      }

      // save avatar
      if (finalAvatarUrl) {
        await AsyncStorage.setItem('user_avatar_uri', finalAvatarUrl).catch(() => {});
      }
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        avatar_url: finalAvatarUrl,
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