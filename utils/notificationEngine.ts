import { getNotificationsEnabled } from "@/storage/notificationConfig";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export enum NotificationType {
  BUILDER = "builder",
  LAB = "lab",
  PET = "pet",
}

function buildIdentifier(type: NotificationType, id: string) {
  return `${type}-${id}`;
}

export async function configureNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("builder", {
      name: "Builder Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 300, 200, 300],
      lightColor: "#ffd33d",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("lab", {
      name: "Laboratory Alerts",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: "#38bdf8",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("pet", {
      name: "Pet Alerts",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150, 150, 150],
      lightColor: "#f472b6",
      sound: "default",
    });
  }
}

export async function scheduleTimedNotification(params: {
  type: NotificationType;
  id: string;
  title: string;
  body: string;
  endTime: number;
}) {
  if (!getNotificationsEnabled()) return;

  const seconds = Math.max(
    Math.floor((params.endTime - Date.now()) / 1000),
    1
  );

  await Notifications.scheduleNotificationAsync({
    identifier: buildIdentifier(params.type, params.id),
    content: {
      title: params.title,
      body: params.body,
      sound: "default",
      ...(Platform.OS === 'android' && {
        channelId: params.type,
      }),
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },

  });
}

export async function cancelTimedNotification(
  type: NotificationType,
  id: string
) {
  await Notifications.cancelScheduledNotificationAsync(
    buildIdentifier(type, id)
  );
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
