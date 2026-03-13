import { ConfirmModal } from "@/components/ConfirmModal";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { rescheduleAllBuilderNotifications } from "@/services/notifications/builderNotificationService";
import { clearAllBuilderUpgrades } from "@/storage/builderUpgrades";
import { getLastJsonSync, resetLastJsonSync } from "@/storage/jsonSyncStorage";
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "@/storage/notificationConfig";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";
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
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [builderCount, setLocalBuilderCount] = useState<number>(1);
  const [notificationsEnabled, setLocalNotificationsEnabled] = useState(false);
  const { profile, updateProfile } = usePlayerProfile();

  const [showResetAccountModal, setShowResetAccountModal] = useState(false);
  const [showClearUpgradesModal, setShowClearUpgradesModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const lastSync = getLastJsonSync();

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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </View>

        {/* SECTION: Account */}
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.card}>
          {/* ===== Identity Summary ===== */}
          {profile.playerTag ? (
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{profile.playerName}</Text>
                <Text style={styles.helperText}>
                  {profile.playerTag}
                  {profile.expLevel ? ` • Lv ${profile.expLevel}` : ""}
                </Text>
              </View>
              {profile.leagueTierIconUrl && (
                <Image
                  source={{ uri: profile.leagueTierIconUrl }}
                  style={styles.profileLeagueIcon}
                  resizeMode="contain"
                />
              )}
            </View>
          ) : (
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>No Account Connected</Text>
                <Text style={styles.helperText}>
                  Import village JSON to sync your account
                </Text>
              </View>
            </View>
          )}

          {/* ===== Copy Player Tag ===== */}
          {profile.playerTag && (
            <Pressable
              style={styles.settingRow}
              onPress={async () => {
                await Clipboard.setStringAsync(profile.playerTag!);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Copy Player Tag</Text>
                <Text style={styles.helperText}>Tap to copy</Text>
              </View>

              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={18}
                color={copied ? "#22c55e" : "#94a3b8"}
              />
            </Pressable>
          )}

          {/* ===== Town Hall & Builders ===== */}
          {profile.playerTag && (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Town Hall</Text>

                  <Text style={styles.helperText}>
                    TH {profile.townHallLevel}
                  </Text>
                </View>

                <Image
                  source={getIconByEntityType(
                    profile.townHallLevel,
                    "townhall",
                  )}
                  style={styles.thIcon}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Builders</Text>
                  <Text style={styles.helperText}>
                    {profile.normalBuilderCount} available
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* ===== Last Sync ===== */}
          {profile.playerTag && (
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Last Synced</Text>
                <Text style={styles.helperText}>
                  {lastSync ? `${formatTimeAgo(lastSync)} ago` : "Never"}
                </Text>
              </View>
            </View>
          )}

          {/* ===== Reset Account ===== */}
          {profile.playerTag && (
            <Pressable
              style={[styles.dangerButton, { marginTop: 16 }]}
              onPress={() => setShowResetAccountModal(true)}
            >
              <Ionicons name="refresh-outline" size={18} color="#ef4444" />
              <Text style={styles.dangerText}>Reset Account</Text>
            </Pressable>
          )}

          {/* ===== Add / Change Account ===== */}
          {profile.playerTag && (
            <Pressable
              style={[styles.addAccountButton, { marginTop: 12 }]}
              onPress={() => router.push("/upload-json")}
            >
              <Ionicons name="add-circle-outline" size={18} color="#fbbf24" />
              <Text style={styles.addAccountText}>
                {profile.playerTag ? "Change Account" : "Add Account"}
              </Text>
            </Pressable>
          )}
        </View>

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
            onPress={() => setShowClearUpgradesModal(true)}
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
            Unofficial companion app for Clash of Clans.
          </Text>
          <Text style={styles.aboutSubtitle}>
            Not affiliated with, endorsed, or sponsored by Supercell.
          </Text>
        </View>
      </ScrollView>

      {/* Reset Account Modal */}
      <ConfirmModal
        visible={showResetAccountModal}
        title="Reset Account?"
        message="This will remove your saved player tag and all tracked upgrades."
        confirmText="Reset"
        destructive
        onCancel={() => setShowResetAccountModal(false)}
        onConfirm={async () => {
          await clearAllBuilderUpgrades();
          await cancelAllNotifications();

          updateProfile({
            playerTag: undefined,
          });

          resetLastJsonSync();

          setShowResetAccountModal(false);

          await requestWidgetUpdate({
            widgetName: "BuilderStatusWidget",
            renderWidget: renderBuilderWidget,
          });

          startSmartWidgetScheduler();
        }}
      />
      {/* Clear Upgrades Only Modal */}
      <ConfirmModal
        visible={showClearUpgradesModal}
        title="Clear All Upgrades?"
        message="This will remove all tracked upgrades but keep your account."
        confirmText="Clear"
        destructive
        onCancel={() => setShowClearUpgradesModal(false)}
        onConfirm={async () => {
          await clearAllBuilderUpgrades();
          await cancelAllNotifications();

          setShowClearUpgradesModal(false);

          await requestWidgetUpdate({
            widgetName: "BuilderStatusWidget",
            renderWidget: renderBuilderWidget,
          });

          startSmartWidgetScheduler();
        }}
      />
    </View>
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

  addAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderWidth: 1.5,
    borderColor: "#fbbf24",
  },

  addAccountText: {
    color: "#fbbf24",
    fontWeight: "700",
    fontSize: 14,
  },

  profileLeagueIcon: {
    width: 28,
    height: 28,
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

  thIcon: {
    width: 28,
    height: 28,
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
