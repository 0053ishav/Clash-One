import { getNotificationsEnabled } from "@/storage/notificationConfig";
import { useAccountStore } from "@/stores/accountStore";
import { usePremiumStore } from "@/stores/premiumStore";
import { posthog } from "@/utils/analytics/posthog";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Localization from "expo-localization";
import * as Notifications from "expo-notifications";
import { Dimensions, PixelRatio, Platform } from "react-native";
import Purchases from "react-native-purchases";

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
  const isPremium = usePremiumStore.getState().isPremium;

  let revenueCatInfo = `
RevenueCat:
Unavailable
`;

try {
  const configured = Purchases.isConfigured();

  const customerInfo = await configured
    ? await Purchases.getCustomerInfo()
    : null;

  const offerings = await configured
    ? await Purchases.getOfferings()
    : null;

  const activeEntitlements = customerInfo
    ? Object.keys(customerInfo.entitlements.active)
    : [];

  const activeSubscriptions = customerInfo
    ? customerInfo.activeSubscriptions
    : [];

  revenueCatInfo = `
------------------------
RevenueCat
------------------------

Configured: ${await configured ? "Yes" : "No"}

RC User ID:
${customerInfo?.originalAppUserId ?? "Unknown"}

Chief Entitlement:
${customerInfo?.entitlements.active["chief"] ? "Active" : "Inactive"}

Active Entitlements:
${activeEntitlements.length > 0
      ? activeEntitlements.join(", ")
      : "None"}

Active Subscriptions:
${activeSubscriptions.length > 0
      ? activeSubscriptions.join(", ")
      : "None"}

Original Purchase Date:
${customerInfo?.originalPurchaseDate ?? "Never"}

First Seen:
${customerInfo?.firstSeen ?? "Unknown"}

Latest Expiration:
${customerInfo?.latestExpirationDate ?? "N/A"}

Management URL:
${customerInfo?.managementURL ?? "N/A"}

Current Offering:
${offerings?.current?.identifier ?? "None"}

Available Packages:
${offerings?.current?.availablePackages
      ?.map((p) => p.identifier)
      .join(", ") || "None"}

`;
} catch (e: any) {
  revenueCatInfo = `
------------------------
RevenueCat
------------------------

Error:
${e?.message ?? "Unknown"}
`;
}

  return `
------------------------
Clash One Debug Info
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
      ? state.activeTag : "None"
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

Has Premium: ${isPremium}
PostHog ID: ${posthogId}

${revenueCatInfo}

Timestamp: ${new Date().toISOString()}
`;
}