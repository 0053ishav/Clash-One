import { configureNotifications } from "@/utils/notificationEngine";
import * as Notifications from "expo-notifications";

type PermissionResult = "granted" | "denied" | "blocked";

 export const ensureNotificationPermission = async (): Promise<PermissionResult> => {
    const settings = await Notifications.getPermissionsAsync();

    if (settings.granted) {
      return "granted";
    }

    if (settings.canAskAgain) {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === "granted") {
        await configureNotifications();
        return "granted";
      }

      return "denied";
    }
    return "blocked";
  };