import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = 'notifications_enabled';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function getNotificationsEnabled() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  return saved === null ? true : saved === 'true';
}

export async function setNotificationsEnabled(value) {
  await AsyncStorage.setItem(STORAGE_KEY, String(value));
}

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Cancels any previously scheduled notification for this list, then schedules
// a new one if the reminder date/time is in the future and notifications are on.
// Returns the new notification id (or null if nothing was scheduled).
export async function scheduleReminderNotification({
  listId,
  title,
  reminderType,
  reminderDate,
  previousNotificationId,
}) {
  if (previousNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(previousNotificationId).catch(() => {});
  }

  const enabled = await getNotificationsEnabled();
  if (!enabled || !reminderDate) return null;

  const fireDate = new Date(reminderDate);
  if (fireDate.getTime() <= Date.now()) return null;

  const typeLabel = reminderType
    ? reminderType.charAt(0).toUpperCase() + reminderType.slice(1)
    : 'List';

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${typeLabel} reminder`,
      body: `Don't forget: ${title}`,
      data: { listId },
    },
    trigger: fireDate,
  });

  return id;
}

export async function cancelReminderNotification(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}