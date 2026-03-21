import { initDatabase } from "@/db/initDatabase";
import { RemoteConfigProvider } from "@/provider/remoteConfigProvider";
import { isOnboardingComplete } from "@/storage/appConfig";
import { useAccountStore } from "@/stores/accountStore";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { initWidgetManager } from "@/utils/widget/widgetManager";
import * as Notifications from "expo-notifications";
import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const loadActiveAccount = useAccountStore((s) => s.loadActiveAccount);

  useEffect(() => {
    loadActiveAccount();
    initWidgetManager();
  }, []);

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      startSmartWidgetScheduler();
    };
    init();
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

  const pathname = usePathname();
  const complete = isOnboardingComplete();

  const isOnboardingRoute = pathname === "/onboarding";

  if (!complete && !isOnboardingRoute) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <RemoteConfigProvider>
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
    </RemoteConfigProvider>
  );
}
