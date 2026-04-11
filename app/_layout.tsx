import { initDatabase } from "@/db/initDatabase";
import { RemoteConfigProvider } from "@/provider/remoteConfigProvider";
import { ensureCraftedLoaded } from "@/services/craftedService";
import { isOnboardingComplete } from "@/storage/appConfig";
import { useAccountStore } from "@/stores/accountStore";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { emitWidgetUpdate } from "@/utils/widget/widgetEvents";
import { initWidgetManager } from "@/utils/widget/widgetManager";
import * as Notifications from "expo-notifications";
import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function RootLayout() {
  const loadActiveAccount = useAccountStore((s) => s.loadActiveAccount);
  const [bootState, setBootState] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const runBootstrap = async () => {
    try {
      await initDatabase();
      await loadActiveAccount();
      await ensureCraftedLoaded();

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
      setBootState("error");
    }
  };

  useEffect(() => {
    runBootstrap();
  }, []);

  const pathname = usePathname();
  const complete = isOnboardingComplete();

  const isOnboardingRoute = pathname === "/onboarding";

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
