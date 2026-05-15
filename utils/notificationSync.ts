import { getAccounts } from "@/services/accountService";
import { getNotificationsEnabled } from "@/storage/notificationConfig";
import { scheduleAllNotifications } from "@/utils/notificationEngine";

let isRunning = false;

export async function resyncNotifications() {
  try {
    if (!getNotificationsEnabled()) return;

    // prevent spam calls (very important)
    if (isRunning) return;
    isRunning = true;

    const accounts = await getAccounts();

    await scheduleAllNotifications(accounts);
  } catch (e) {
    console.warn("Notification resync failed:", e);
  } finally {
    isRunning = false;
  }
}