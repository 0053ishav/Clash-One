import { getNotificationsEnabled } from "@/storage/notificationConfig";
import { useAccountStore } from "@/stores/accountStore";
import { posthog } from "@/utils/analytics/posthog";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Localization from "expo-localization";
import * as Notifications from "expo-notifications";
import { Dimensions, PixelRatio, Platform } from "react-native";

export async function buildSupportInfo() {
  const state = useAccountStore.getState();
const { width, height } = Dimensions.get("window");
const fontScale = PixelRatio.getFontScale();
const density = PixelRatio.get();
  const notificationsEnabled =
    getNotificationsEnabled?.() ?? false;

  const notificationPermissions =
    await Notifications.getPermissionsAsync();

  const activeProfile =
    state.activeTag
      ? state.profilesByTag?.[state.activeTag]
      : null;

  const posthogId = posthog.getDistinctId();

  return `
------------------------
Clash Widget Debug Info
------------------------

App Version: ${Application.nativeApplicationVersion ?? "Unknown"}
Build Number: ${Application.nativeBuildVersion ?? "Unknown"}
Android Package:
${Application.applicationId ?? "Unknown"}

Platform: ${Platform.OS}
Android API Level:
${Platform.OS === "android" ? Device.platformApiLevel : "N/A"}
OS Version: ${Device.osVersion ?? "Unknown"}

Manufacturer: ${Device.manufacturer ?? "Unknown"}
Device Brand: ${Device.brand ?? "Unknown"}
Device Model: ${Device.modelName ?? "Unknown"}
Device Type: ${Device.deviceType ?? "Unknown"}
Design Name: ${Device.designName ?? "Unknown"}
Is Physical Device: ${Device.isDevice ? "Yes" : "No"}

Installation Time:
${Application.getInstallationTimeAsync
      ? (await Application.getInstallationTimeAsync()).toLocaleString()
      : "Unknown"
    }
    
    
Timezone: ${Localization.getCalendars()?.[0]?.timeZone ?? "Unknown"}
Language:
    ${Localization.getLocales()?.[0]?.languageTag ?? "Unknown"}

Screen Width: ${width}
Screen Height: ${height}
Font Scale: ${fontScale}
Pixel Density: ${density}
Active Profile Exists:
${activeProfile ? "Yes" : "No"}
Active Account: ${state.activeTag
      ? state.activeTag.slice(0, 6) : "None"
    }

Accounts Count: ${Object.keys(state.profilesByTag ?? {}).length}
Profile Tags:
${Object.keys(state.profilesByTag ?? {}).join(", ")}


Player Name: ${activeProfile?.playerName ?? "Unknown"}
Town Hall: ${activeProfile?.townHallLevel ?? "Unknown"}

Notifications MMKV Enabled: ${notificationsEnabled ? "Yes" : "No"
    }

  Notification Permission:
${notificationPermissions.granted ? "Granted" : "Denied"}


Last JSON Sync: 
${state.activeTag && state.lastJsonSyncMap?.[state.activeTag]
      ? new Date(state.lastJsonSyncMap[state.activeTag]).toLocaleString()
      : "Never"
    }

Last Sync Age:
${state.activeTag && state.lastJsonSyncMap?.[state.activeTag]
      ? Math.floor(
        (Date.now() -
          state.lastJsonSyncMap[state.activeTag]) /
        60000
      ) + " mins ago"
      : "Never"
    }

PostHog ID: ${posthogId}

Timestamp: ${new Date().toISOString()}
`;
}