import {
  UpgradeEvent
} from "@/utils/notificationEngine";
import * as Notifications from "expo-notifications";

async function hasPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}


export function getBuilderEvents(account: any): UpgradeEvent[] {
  if (!account?.builders) return [];

  return account.builders
    .filter((b: any) => b.state === "BUSY" && b.finishTimestamp)
    .map((b: any) => ({
      id: `builder-${account.tag}-${b.builderId}`,

      playerTag: account.tag,
      accountName: account.name,
      accountColor: account.color ?? "#ffffff",

      type: "BUILDER",
      entityId: String(b.builderId),

      finishTimestamp: Number(b.finishTimestamp),
    }));
}

// export async function scheduleBuilderNotification(
//   id: string,
//   buildingName: string,
//   endTime: number
// ) {
//   if (!getNotificationsEnabled()) return;

//   if (!(await hasPermission())) return;

//   await scheduleTimedNotification({
//     type: NotificationType.BUILDER,
//     id,
//     title: "Builder Free ⚒️",
//     body: `${buildingName} is complete. Assign next upgrade.`,
//     endTime,
//   });
// }


// export async function cancelBuilderNotification(id: string) {
//   await cancelTimedNotification(NotificationType.BUILDER, id);
// }

// export async function rescheduleAllBuilderNotifications() {
//    const profile  = getPlayerProfile();
//   const tag = profile.playerTag!; 
//   const active = await getActiveUpgrades(tag);

//   for (const upgrade of active) {
//     await scheduleBuilderNotification(
//       upgrade.id,
//       upgrade.entity,
//       upgrade.endTime
//     );
//   }
// }
