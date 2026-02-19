import { getActiveBuilderUpgrades } from "@/storage/builderUpgrades";
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

export async function scheduleBuilderNotification(
  id: string,
  buildingName: string,
  endTime: number
) {
  if (!getNotificationsEnabled()) return;

  if (!(await hasPermission())) return;

  await scheduleTimedNotification({
    type: NotificationType.BUILDER,
    id,
    title: "Builder Free ⚒️",
    body: `${buildingName} is complete. Assign next upgrade.`,
    endTime,
  });
}

export async function cancelBuilderNotification(id: string) {
  await cancelTimedNotification(NotificationType.BUILDER, id);
}

export async function rescheduleAllBuilderNotifications() {
  const active = getActiveBuilderUpgrades();

  for (const upgrade of active) {
    await scheduleBuilderNotification(
      upgrade.id,
      upgrade.name,
      upgrade.endTime
    );
  }
}
