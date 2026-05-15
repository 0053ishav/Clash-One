// import { getNotificationsEnabled } from "@/storage/notificationConfig";
// import {
//   cancelTimedNotification,
//   NotificationType,
//   scheduleTimedNotification,
// } from "@/utils/notificationEngine";
// import * as Notifications from "expo-notifications";

// async function hasPermission() {
//   const { status } = await Notifications.getPermissionsAsync();
//   return status === "granted";
// }

// export async function scheduleLabNotification(
//   id: string,
//   labName: string,
//   endTime: number
// ) {
//   if (!getNotificationsEnabled()) return;

//   if (!(await hasPermission())) return;

//   await scheduleTimedNotification({
//     type: NotificationType.LAB,
//     id,
//     title: "Research Complete 🧪",
//     body: `${labName} research finished.`,
//     endTime,
//   });
// }

// export async function cancelLabNotification(id: string) {
//   await cancelTimedNotification(NotificationType.LAB, id);
// }


import {
  UpgradeEvent
} from "@/utils/notificationEngine";

export function getLabEvents(account: any): UpgradeEvent[] {
  const lab = account?.lab;

  if (!lab || lab.state !== "RESEARCHING" || !lab.finishTimestamp) {
    return [];
  }

  return [
    {
      id: `lab-${account.tag}`,

      playerTag: account.tag,
      accountName: account.name,
      accountColor: account.color ?? "#ffffff",

      type: "LAB",
      entityId: "lab",

      finishTimestamp: Number(lab.finishTimestamp),
    },
  ];
}