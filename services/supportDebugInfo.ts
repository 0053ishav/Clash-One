import { getNotificationsEnabled } from "@/storage/notificationConfig";
import { useAccountStore } from "@/stores/accountStore";
import { posthog } from "@/utils/analytics/posthog";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Localization from "expo-localization";
import { Platform } from "react-native";

export async function buildSupportInfo() {
      const state = useAccountStore.getState();

  const notificationsEnabled =
    getNotificationsEnabled?.() ?? false;

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

Platform: ${Platform.OS}
OS Version: ${Device.osVersion ?? "Unknown"}

Device Brand: ${Device.brand ?? "Unknown"}
Device Model: ${Device.modelName ?? "Unknown"}

Timezone: ${Localization.getCalendars()?.[0]?.timeZone ?? "Unknown"}

Accounts Count: ${Object.keys(state.profilesByTag ?? {}).length}
Active Account: ${
    state.activeTag 
    ? state.activeTag.slice(0, 6) : "None"
}


Player Name: ${activeProfile?.playerName ?? "Unknown"}
Town Hall: ${activeProfile?.townHallLevel ?? "Unknown"}

Notifications Enabled: ${
    notificationsEnabled ? "Yes" : "No"
  }

Last JSON Sync: ${
   state.activeTag && state.lastJsonSyncMap?.[state.activeTag]
    ? new Date(state.lastJsonSyncMap[state.activeTag]).toLocaleString()
    : "Never"
}

PostHog ID: ${posthogId}

Timestamp: ${new Date().toISOString()}
`;
}