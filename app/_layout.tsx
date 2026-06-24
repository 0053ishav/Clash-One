import { ConfirmModal } from "@/components/ConfirmModal";
import { initDatabase } from "@/db/initDatabase";
import { useInAppUpdates } from "@/hooks/useInAppUpdate";
import { RemoteConfigProvider } from "@/provider/remoteConfigProvider";
import { hydrateEntities } from "@/services/cdnEntities/hydrateEntities";
import { ensureCraftedLoaded } from "@/services/craftedService";
import { syncPremiumStatus } from "@/services/revenueCat/premium";
import { initRevenueCat } from "@/services/revenueCat/revenueCat";
import { isOnboardingComplete } from "@/storage/appConfig";
import { syncEntities } from "@/storage/syncEntities";
import { useAccountStore } from "@/stores/accountStore";
import { setSessionSource, track } from "@/utils/analytics/analytics";
import { log } from "@/utils/logger";
import { configureNotifications } from "@/utils/notificationEngine";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { emitWidgetUpdate } from "@/utils/widget/widgetEvents";
import { initWidgetManager } from "@/utils/widget/widgetManager";
import * as Sentry from "@sentry/react-native";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Redirect, Stack, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

Sentry.init({
  dsn: "https://d2e012e1209309eb649f09114ae454a6@o4511557895258112.ingest.us.sentry.io/4511557898272768",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function RootLayout() {
  const loadActiveAccount = useAccountStore((s) => s.loadActiveAccount);
  const [bootState, setBootState] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const pathname = usePathname();
  const complete = isOnboardingComplete();

  const isOnboardingRoute = pathname === "/onboarding";

  const router = useRouter();
  const loadAccounts = useAccountStore((s) => s.loadAccounts);
  const loadLastSync = useAccountStore((s) => s.loadLastSync);

  const runBootstrap = useCallback(async () => {
    try {
      await initDatabase();
      await initRevenueCat();
      await syncPremiumStatus();
      await loadAccounts();
      loadLastSync();
      await loadActiveAccount();
      await ensureCraftedLoaded();
      await configureNotifications();

      await syncEntities();
      await hydrateEntities();
      initWidgetManager();
      startSmartWidgetScheduler();
      emitWidgetUpdate();
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowList: true,
        }),
      });

      setBootState("ready");
    } catch (e) {
      console.error("Bootstrap Failed: ", e);
      Sentry.captureException(e);

      track("bootstrap_failed", {
        error: e instanceof Error ? e.message : "unknown",
      });
      setBootState("error");
    }
  }, []);

  useEffect(() => {
    if (complete) {
      runBootstrap();
    } else {
      setBootState("ready");
    }
  }, [complete]);

  const {
    updateModalVisible,
    setUpdateModalVisible,
    storeVersion,
    startUpdate,
  } = useInAppUpdates(bootState === "ready");

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(
      (notification) => {
        log("📬 RECEIVED", {
          id: notification.request.identifier,
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
        });
      },
    );

    return () => received.remove();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        log("👆 OPENED", {
          id: response.notification.request.identifier,
          title: response.notification.request.content.title,
          data: response.notification.request.content.data,
        });
        setSessionSource("notification");

        track("notification_open", {
          type: data?.type,
        });
      },
    );

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (!url) return;

      const { hostname, queryParams } = Linking.parse(url);

      if (queryParams?.source === "widget") {
        setSessionSource("widget");
        track("widget_open", { target: hostname });
      } else {
        setSessionSource("app");
      }

      if (hostname === "add-account") {
        router.push("/add-account");
      }
      if (hostname === "pro") {
        router.push("/pro");
      }
    };

    const sub = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => {
      sub.remove();
    };
  }, []);

  if (!complete && !isOnboardingRoute) {
    return <Redirect href="/onboarding" />;
  }

  if (bootState === "loading") {
    return (
      <View style={[styles.container, styles.loadingOverlay]}>
        <View style={styles.loadingContent}>
          <View style={styles.imageWrapper}>
            <Image
              source={require("@/assets/images/builder/builder-idle.png")}
              style={styles.builderImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.loadingTitle}>Preparing Village</Text>

          <Text style={styles.loadingMessage}>
            Syncing builders and timers...
          </Text>

          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (bootState === "error") {
    return (
      <View style={[styles.container, styles.loadingOverlay]}>
        <View style={styles.loadingContent}>
          <View style={styles.imageWrapper}>
            <Image
              source={require("@/assets/images/builder/builder-working.png")}
              style={styles.builderImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.loadingTitle}>Village Not Ready</Text>

          <Text style={styles.loadingMessage}>
            Something broke while syncing your data
          </Text>

          <Pressable
            onPress={() => {
              setBootState("loading");
              runBootstrap();
            }}
            style={{
              marginTop: 20,
              backgroundColor: "#fbbf24",
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: "#0f172a",
                fontWeight: "700",
              }}
            >
              Retry
            </Text>
          </Pressable>
        </View>
      </View>
    );
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
        {/* <Stack.Screen name="add-upgrade" options={{ headerShown: false }} /> */}
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
      <ConfirmModal
        visible={updateModalVisible}
        title="New Version Available"
        message={`A newer version of Clash One is available.

Version: ${storeVersion ?? "Latest"}

• Bug fixes
• Performance improvements
• New features

Update now for the best experience.`}
        confirmText="Update"
        cancelText="Later"
        onConfirm={async () => {
          track("update_accepted");

          setUpdateModalVisible(false);

          await startUpdate();
        }}
        onCancel={() => {
          track("update_dismissed");

          setUpdateModalVisible(false);
        }}
      />
    </RemoteConfigProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  loadingOverlay: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  imageWrapper: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    zIndex: 1,
  },

  builderImage: {
    width: 100,
    height: 100,
  },

  loadingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fbbf24",
    letterSpacing: 0.5,
  },

  loadingMessage: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  },

  dotsContainer: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 16,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(148, 163, 184, 0.4)",
  },

  dotActive: {
    backgroundColor: "#fbbf24",
    width: 20,
  },
});
