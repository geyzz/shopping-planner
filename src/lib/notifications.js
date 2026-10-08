import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const STORAGE_KEY = 'notifications_enabled';
export const REMINDER_CHANNEL_ID = 'plan_ed_reminders_v2';

const activeForegroundTimers = new Map();

// notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
  }),
});

export async function initNotifications() {
  if (Platform.OS === 'android') {
    // setup android channel
    await Notifications.deleteNotificationChannelAsync('default').catch(() => {});
    await Notifications.deleteNotificationChannelAsync('reminders').catch(() => {});

    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Shopping Reminders & Alerts',
      description: 'Popup reminder banners for your shopping lists',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#D4AF37',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    }).catch(() => {});
  }

  await requestNotificationPermission().catch(() => {});
}

export async function getNotificationsEnabled() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  return saved === null ? true : saved === 'true';
}

export async function setNotificationsEnabled(value) {
  await AsyncStorage.setItem(STORAGE_KEY, String(value));
}

export async function requestNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync().catch(() => null);
  if (
    settings &&
    (settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL)
  ) {
    return true;
  }
  const result = await Notifications.requestPermissionsAsync().catch(() => null);
  return result?.status === 'granted';
}

export function computeFireDate(reminderDate, reminderTiming = 'on') {
  if (!reminderDate) return null;
  const d = new Date(reminderDate);
  if (isNaN(d.getTime())) return null;

  if (reminderTiming === 'before') {
    d.setDate(d.getDate() - 1);
  } else if (reminderTiming === 'after') {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

export async function scheduleReminderNotification({
  listId,
  title,
  reminderType,
  reminderDate,
  reminderTiming = 'on',
  previousNotificationId,
}) {
  if (previousNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(previousNotificationId).catch(() => {});
  }

  const listIdKey = listId ? String(listId) : title;
  if (activeForegroundTimers.has(listIdKey)) {
    clearTimeout(activeForegroundTimers.get(listIdKey));
    activeForegroundTimers.delete(listIdKey);
  }

  const enabled = await getNotificationsEnabled();
  if (!enabled || !reminderDate) return null;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted by device');
    return null;
  }

  const fireDate = computeFireDate(reminderDate, reminderTiming);
  if (!fireDate || fireDate.getTime() <= Date.now()) return null;

  const diffSeconds = Math.max(1, Math.round((fireDate.getTime() - Date.now()) / 1000));

  const typeLabel = reminderType
    ? reminderType.charAt(0).toUpperCase() + reminderType.slice(1)
    : 'List';

  const timingSuffix =
    reminderTiming === 'before'
      ? ' (1 day before)'
      : reminderTiming === 'after'
      ? ' (follow-up)'
      : '';

  const notificationContent = {
    title: `🔔 ${typeLabel} Reminder${timingSuffix}`,
    body: `Don't forget: ${title}`,
    data: { listId: listId ? String(listId) : '' },
    sound: true,
    priority: 'max',
    interruptionLevel: 'timeSensitive',
    vibrate: [0, 500, 250, 500],
    channelId: REMINDER_CHANNEL_ID,
    color: '#D4AF37',
    autoDismiss: true,
  };

  // schedule reminder
  const id = await Notifications.scheduleNotificationAsync({
    content: notificationContent,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: diffSeconds,
      channelId: REMINDER_CHANNEL_ID,
    },
  }).catch((e) => {
    console.warn('scheduleNotificationAsync error:', e);
    return null;
  });

  if (diffSeconds > 0 && diffSeconds <= 86400) {
    const timer = setTimeout(async () => {
      try {
        await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: null,
        });
      } catch (err) {
        console.warn('Foreground timer notification error:', err);
      }
    }, diffSeconds * 1000);

    activeForegroundTimers.set(listIdKey, timer);
  }

  return id;
}

export async function cancelReminderNotification(notificationId, listId) {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
  }
  const key = listId ? String(listId) : null;
  if (key && activeForegroundTimers.has(key)) {
    clearTimeout(activeForegroundTimers.get(key));
    activeForegroundTimers.delete(key);
  }
}

export async function syncAllReminders(enabled, lists = []) {
  for (const timer of activeForegroundTimers.values()) {
    clearTimeout(timer);
  }
  activeForegroundTimers.clear();

  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
  if (!enabled) return;

  for (const list of lists) {
    if (list?.details?.reminderDate) {
      await scheduleReminderNotification({
        listId: list.id,
        title: list.title,
        reminderType: list.details.reminderType,
        reminderDate: list.details.reminderDate,
        reminderTiming: list.details.reminderTiming,
      }).catch(() => {});
    }
  }
}