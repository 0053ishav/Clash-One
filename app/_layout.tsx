import {
  __enableGoblinForTesting,
  initRemoteConfig,
} from "@/services/remoteConfig/remoteConfigService";
import { isOnboardingComplete } from "@/storage/appConfig";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import * as Notifications from "expo-notifications";
import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    initRemoteConfig();
    startSmartWidgetScheduler();
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowList: false,
      }),
    });
  }, []);

  useEffect(() => {
    if (__DEV__) {
      __enableGoblinForTesting();
    }
  }, []);

  const pathname = usePathname();
  const complete = isOnboardingComplete();

  const isOnboardingRoute = pathname === "/onboarding";

  if (!complete && !isOnboardingRoute) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="upload-json" options={{ headerShown: false }} />
      <Stack.Screen name="add-upgrade" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}
