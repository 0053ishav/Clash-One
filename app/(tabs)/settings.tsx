import { ConfirmModal } from "@/components/ConfirmModal";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { rescheduleAllBuilderNotifications } from "@/services/notifications/builderNotificationService";
import { clearAllBuilderUpgrades } from "@/storage/builderUpgrades";
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "@/storage/notificationConfig";
import {
  NotificationType,
  cancelAllNotifications,
  configureNotifications,
  scheduleTimedNotification,
} from "@/utils/notificationEngine";
import { renderBuilderWidget } from "@/utils/renderBuilderWidget";
import {
  startSmartWidgetScheduler,
  stopSmartWidgetScheduler,
} from "@/utils/scheduleWidgetRefresh";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [builderCount, setLocalBuilderCount] = useState<number>(1);
  const [showClearModal, setShowClearModal] = useState(false);
  const [notificationsEnabled, setLocalNotificationsEnabled] = useState(false);
  const { profile, updateProfile } = usePlayerProfile();

  // Initial animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    setLocalBuilderCount(profile.normalBuilderCount);
    setLocalNotificationsEnabled(getNotificationsEnabled());
  }, [profile]);

  const handleBuilderSelect = async (count: number) => {
    setLocalBuilderCount(count);
    updateProfile({ normalBuilderCount: count });

    await requestWidgetUpdate({
      widgetName: "BuilderStatusWidget",
      renderWidget: renderBuilderWidget,
    });

    stopSmartWidgetScheduler();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your experience</Text>
          </Animated.View>

          {/* SECTION: Builder Config */}
          <Text style={styles.sectionTitle}>Builder Settings</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Number of Builders</Text>
            <Text style={styles.helperText}>
              Set how many builders you have available
            </Text>

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

          {/* SECTION: Notifications */}
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Upgrade Alerts</Text>
                <Text style={styles.helperText}>
                  Get notified when upgrades complete
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
                    Linking.openSettings();
                    setNotificationsEnabled(false);
                    setLocalNotificationsEnabled(false);
                    await cancelAllNotifications();
                  }
                }}
                trackColor={{ false: "#334155", true: "#fbbf24" }}
                thumbColor={notificationsEnabled ? "#0f172a" : "#cbd5e1"}
              />
            </View>
          </View>

          {/* SECTION: Notification Testing (DEV) */}
          {__DEV__ && (
            <>
              <Text style={styles.sectionTitle}>Dev – Notification Test</Text>

              <View style={styles.card}>
                <Pressable
                  style={styles.testButton}
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
                  <Ionicons name="hammer" size={18} color="#fff" />
                  <Text style={styles.testButtonText}>Test Builder (5s)</Text>
                </Pressable>

                <Pressable
                  style={[styles.testButton, styles.testButtonLab]}
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
                  <Ionicons name="flask" size={18} color="#fff" />
                  <Text style={styles.testButtonText}>Test Lab (8s)</Text>
                </Pressable>

                <Pressable
                  style={[styles.testButton, styles.testButtonPet]}
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
                  <Ionicons name="paw" size={18} color="#fff" />
                  <Text style={styles.testButtonText}>Test Pet (12s)</Text>
                </Pressable>

                <Pressable
                  style={styles.dangerButton}
                  onPress={async () => {
                    await Notifications.cancelAllScheduledNotificationsAsync();
                  }}
                >
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                  <Text style={styles.dangerText}>Cancel All Scheduled</Text>
                </Pressable>
              </View>
            </>
          )}

          {/* SECTION: Player Data */}
          <Text style={styles.sectionTitle}>Player Data</Text>

          <View style={styles.card}>
            <Pressable
              style={styles.settingRow}
              onPress={() => router.push("/upload-json")}
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Import Player JSON</Text>
                <Text style={styles.helperText}>
                  Optional. For semi-automatic tracking
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fbbf24" />
            </Pressable>
          </View>

          {/* SECTION: Danger Zone */}
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <View style={styles.card}>
            <Pressable
              style={styles.dangerButton}
              onPress={() => setShowClearModal(true)}
            >
              <Ionicons name="trash" size={18} color="#ef4444" />
              <Text style={styles.dangerText}>Clear All Tracked Upgrades</Text>
            </Pressable>
          </View>

          {/* SECTION: Legal */}
          <Text style={styles.sectionTitle}>Legal</Text>

          <View style={styles.card}>
            <Pressable
              style={styles.settingRow}
              onPress={() => router.push("/privacy")}
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <Text style={styles.helperText}>
                  Learn how we protect your data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fbbf24" />
            </Pressable>
          </View>

          {/* About Section */}
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>Clash Widget</Text>
            <Text style={styles.aboutVersion}>v1.0</Text>
            <Text style={styles.aboutSubtitle}>
              Track your builder upgrades efficiently
            </Text>
          </View>
        </ScrollView>

        {/* Confirmation Modal */}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  scrollContent: {
    paddingTop: 0,
    paddingBottom: 80,
  },

  header: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fbbf24",
    letterSpacing: -0.5,
    marginBottom: 6,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 12,
    marginTop: 24,
    marginHorizontal: 20,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  cardLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: 8,
  },

  helperText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    marginBottom: 12,
  },

  builderRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 12,
  },

  builderButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#334155",
  },

  builderButtonActive: {
    backgroundColor: "#fbbf24",
    borderColor: "#fbbf24",
    shadowColor: "#fbbf24",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  builderButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748b",
  },

  builderButtonTextActive: {
    color: "#0f172a",
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    gap: 12,
  },

  settingContent: {
    flex: 1,
    gap: 4,
  },

  settingLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    marginBottom: 10,
  },

  testButtonLab: {
    backgroundColor: "#8b5cf6",
  },

  testButtonPet: {
    backgroundColor: "#ec4899",
  },

  testButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1.5,
    borderColor: "#ef4444",
  },

  dangerText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 14,
  },

  aboutSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
    paddingHorizontal: 20,
    gap: 8,
  },

  aboutTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fbbf24",
  },

  aboutVersion: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },

  aboutSubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },
});
