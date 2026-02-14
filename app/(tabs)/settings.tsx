import { ConfirmModal } from "@/components/ConfirmModal";
import { rescheduleAllBuilderNotifications } from "@/services/builderNotificationService";
import { getBuilderCount, setBuilderCount } from "@/storage/builderConfig";
import { clearAllBuilderUpgrades } from "@/storage/builderUpgrades";
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "@/storage/notificationConfig";
import {
  NotificationType,
  cancelAllNotifications,
  configureNotifications,
  scheduleTimedNotification
} from "@/utils/notificationEngine";
import { renderBuilderWidget } from "@/utils/renderBuilderWidget";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

export default function SettingsScreen() {
  const router = useRouter();
  const [builderCount, setLocalBuilderCount] = useState<number>(1);
  const [showClearModal, setShowClearModal] = useState(false);
  const [notificationsEnabled, setLocalNotificationsEnabled] = useState(false);

  useEffect(() => {
    setLocalBuilderCount(getBuilderCount());
    setLocalNotificationsEnabled(getNotificationsEnabled());
  }, []);

  const handleBuilderSelect = (count: number) => {
    setLocalBuilderCount(count);
    setBuilderCount(count);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#eef2f7" }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION: Notification Testing */}
        <Text style={styles.sectionTitle}>DEV – NOTIFICATION TEST</Text>

        <View style={styles.card}>
          <Pressable
            style={styles.primaryButton}
            onPress={async () => {
              const endTime = Date.now() + 5000;

              await scheduleTimedNotification({
                type: NotificationType.BUILDER,
                id: "test-builder",
                title: "Builder Ready ⚒️",
                body: "Test Builder notification.",
                endTime,
              });
            }}
          >
            <Text style={styles.primaryButtonText}>Test Builder (5s)</Text>
          </Pressable>

          <View style={{ height: 10 }} />

          <Pressable
            style={styles.primaryButton}
            onPress={async () => {
              const endTime = Date.now() + 8000;

              await scheduleTimedNotification({
                type: NotificationType.LAB,
                id: "test-lab",
                title: "Research Complete 🧪",
                body: "Test Lab notification.",
                endTime,
              });
            }}
          >
            <Text style={styles.primaryButtonText}>Test Lab (8s)</Text>
          </Pressable>

          <View style={{ height: 10 }} />

          <Pressable
            style={styles.primaryButton}
            onPress={async () => {
              const endTime = Date.now() + 12000;

              await scheduleTimedNotification({
                type: NotificationType.PET,
                id: "test-pet",
                title: "Pet Training Done 🐾",
                body: "Test Pet notification.",
                endTime,
              });
            }}
          >
            <Text style={styles.primaryButtonText}>Test Pet (12s)</Text>
          </Pressable>

          <View style={{ height: 16 }} />

          <Pressable
            style={styles.dangerButton}
            onPress={async () => {
              await Notifications.cancelAllScheduledNotificationsAsync();
            }}
          >
            <Text style={styles.dangerText}>Cancel All Scheduled</Text>
          </Pressable>
        </View>

        {/* SECTION: Builder Config */}
        <Text style={styles.sectionTitle}>BUILDER SETTINGS</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Number of Builders</Text>

          <View style={styles.builderRow}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <Pressable
                key={num}
                onPress={() => handleBuilderSelect(num)}
                style={[
                  styles.builderButton,
                  builderCount === num && styles.builderButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.builderButtonText,
                    builderCount === num && styles.builderButtonTextActive,
                  ]}
                >
                  {num}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

        {/* SECTION: Notification Toggle */}
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingRowText}>Upgrade Alerts</Text>
              <Text style={styles.helperText}>
                Get notified when upgrades complete.
              </Text>
            </View>

            <Switch
              value={notificationsEnabled}
              onValueChange={async (value) => {
                if (value) {
                  const { status } =
                    await Notifications.requestPermissionsAsync();

                  if (status === "granted") {
                    await configureNotifications();
                    setNotificationsEnabled(true);
                    setLocalNotificationsEnabled(true);
                    await rescheduleAllBuilderNotifications();
                  }
                } else {
                  setNotificationsEnabled(false);
                  setLocalNotificationsEnabled(false);
                  await cancelAllNotifications();
                }
              }}
              trackColor={{ false: "#d1d5db", true: "#ffd33d" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* SECTION: JSON */}
        <Text style={styles.sectionTitle}>PLAYER DATA</Text>

        <View style={styles.card}>
          <Pressable
            style={styles.settingRow}
            onPress={() => router.push("/upload-json")}
          >
            <Text style={styles.settingRowText}>Import Player JSON</Text>
            <Ionicons name="chevron-forward" size={18} color="#9aa0a6" />
          </Pressable>

          <Text style={styles.helperText}>
            Optional. Used for semi-automatic tracking.
          </Text>
        </View>

        {/* SECTION: Danger */}
        <Text style={styles.sectionTitle}>DATA</Text>

        <View style={styles.card}>
          <Pressable
            style={styles.dangerButton}
            onPress={() => setShowClearModal(true)}
          >
            <Text style={styles.dangerText}>Clear All Tracked Upgrades</Text>
          </Pressable>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.version}>Clash Widget v1.0</Text>
        </View>

        <ConfirmModal
          visible={showClearModal}
          title="Clear all data?"
          message="This will permanently remove all tracked upgrades."
          confirmText="Clear"
          destructive
          onCancel={() => setShowClearModal(false)}
          onConfirm={async () => {
            await clearAllBuilderUpgrades();
            await cancelAllNotifications();

            setShowClearModal(false);
            await requestWidgetUpdate({
              widgetName: "BuilderStatusWidget",
              renderWidget: renderBuilderWidget,
            });
            startSmartWidgetScheduler();
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 10,
    marginTop: 28,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1f2328",
  },

  builderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  builderButton: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },

  builderButtonActive: {
    backgroundColor: "#ffd33d",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  builderButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },

  builderButtonTextActive: {
    color: "#000",
  },

  primaryButton: {
    backgroundColor: "#ffd33d",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },

  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },

  dangerButton: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#fff1f2",
    alignItems: "center",
  },

  dangerText: {
    color: "#b91c1c",
    fontWeight: "700",
  },

  footer: {
    marginTop: 40,
    alignItems: "center",
    marginBottom: 50,
  },

  version: {
    fontSize: 12,
    color: "#9aa0a6",
    letterSpacing: 0.5,
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  settingRowText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2328",
  },
});
