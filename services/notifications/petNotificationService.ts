import { getNotificationsEnabled } from "@/storage/notificationConfig";
import {
  cancelTimedNotification,
  NotificationType,
  scheduleTimedNotification,
} from "@/utils/notificationEngine";

import * as Notifications from "expo-notifications";

async function hasPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

export async function scheduleLabNotification(
  id: string,
  petName: string,
  endTime: number
) {
    if (!getNotificationsEnabled()) return;
    
    if (!(await hasPermission())) return;

  await scheduleTimedNotification({
    type: NotificationType.PET,
    id,
    title: "Pet Training Done 🐾",
    body: `${petName} level up complete.`,
    endTime,
  });
}

export async function cancelLabNotification(id: string) {
  await cancelTimedNotification(NotificationType.PET, id);
}
