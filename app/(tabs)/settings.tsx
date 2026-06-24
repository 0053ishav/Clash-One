import { ConfirmModal } from "@/components/ConfirmModal";
import { getDB } from "@/db/database";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import {
  updateAccountColor,
  updateBuilderCount,
} from "@/services/accountService";
import { getAccountState } from "@/services/accountStateService";
import { resetLastJsonSync } from "@/storage/jsonSyncStorage";
import {
  clearFeatureVote,
  getFeatureVote,
  setFeatureVote,
} from "@/storage/notesStorage";
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "@/storage/notificationConfig";
import {
  savePlayerProfile,
  updateLocalBuilderCount,
} from "@/storage/playerProfile";
import { useAccountStore } from "@/stores/accountStore";
import { FeatureId, Vote } from "@/types/vote";
import { track } from "@/utils/analytics/analytics";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { resolveEntityIcon } from "@/utils/icons/resolveEntityIcon";
import { resyncNotifications } from "@/utils/notificationSync";
import * as Application from "expo-application";

import { ChiefCard } from "@/components/ChiefCard";
import { SupportModal } from "@/components/SupportModal";
import { XPBadge } from "@/components/XPBadge";
import { requestNotificationPermissions } from "@/services/notifications/notificationPermissions";
import { restorePurchases } from "@/services/revenueCat/purchase";
import { buildSupportInfo } from "@/services/supportDebugInfo";
import { usePremiumStore } from "@/stores/premiumStore";
import {
  startSmartWidgetScheduler,
  stopSmartWidgetScheduler,
} from "@/utils/scheduleWidgetRefresh";
import { emitWidgetUpdate } from "@/utils/widget/widgetEvents";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACCOUNT_COLORS = [
  "#fbbf24", // amber
  "#60a5fa", // blue
  "#34d399", // green
  "#f472b6", // pink
  "#a78bfa", // purple
  "#fb923c", // orange
  "#22d3ee", // cyan
  "#f87171", // red
];

async function insertTestUpgrade({
  tag,
  type,
  delayMs,
}: {
  tag: string;
  type: "BUILDER" | "LAB" | "PET";
  delayMs: number;
}) {
  const db = await getDB();
  const now = Date.now();

  const entityType =
    type === "BUILDER" ? "BUILDING" : type === "LAB" ? "LAB" : "PET";

  await db.runAsync(
    `INSERT INTO upgrades (
      id,
      account_player_tag,
      data_id,
      entity,
      type,
      upgrade_type,
      builder_slot,
      builder_type,
      lab_slot,
      start_time,
      duration_minutes,
      finish_timestamp,
      is_completed,
      source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Math.random().toString(),
      tag,
      999,
      "Test Upgrade",

      entityType, // ✅ FIXED
      type, // upgradeType

      type === "BUILDER" ? "99" : null,
      type === "BUILDER" ? "NORMAL" : null,

      type === "LAB" ? "NORMAL" : null, // ✅ CRITICAL

      now,
      Math.ceil(delayMs / 60000),
      now + delayMs,
      0,
      "DEV",
    ],
  );
  return db.getAllSync(
    `SELECT * FROM upgrades WHERE account_player_tag = ? ORDER BY start_time DESC LIMIT 1`,
    [tag],
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  const accounts = useAccountStore((s) => s.accounts);
  const loadAccounts = useAccountStore((s) => s.loadAccounts);
  const switchAccount = useAccountStore((s) => s.switchAccount);
  const removeAccount = useAccountStore((s) => s.removeAccount);
  const setProfile = useAccountStore((s) => s.setProfile);
  const widgetPrefs = useAccountStore((s) => s.widgetPrefs);
  const setWidgetAccount = useAccountStore((s) => s.setWidgetAccount);
  const activeTag = useAccountStore((s) => s.activeTag);

  const { profile } = usePlayerProfile();
  const activeAccount = accounts.find((a) => a.tag === activeTag);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const dbBuilderCount = activeAccount?.builderCount ?? 1;

  const [localBuilderCount, setLocalBuilderCount] =
    useState<number>(dbBuilderCount);

  const [localNotificationsEnabled, setLocalNotificationsEnabled] =
    useState(false);
  const [showResetAccountModal, setShowResetAccountModal] = useState(false);
  const [showClearUpgradesModal, setShowClearUpgradesModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<
    (typeof accounts)[0] | null
  >(null);
  const [editColorFor, setEditColorFor] = useState<(typeof accounts)[0] | null>(
    null,
  );
  const [showBuilderErrorModal, setShowBuilderErrorModal] = useState(false);
  const [requiredBuilders, setRequiredBuilders] = useState(0);
  const loadLastSync = useAccountStore((s) => s.loadLastSync);
  const lastJsonSyncMap = useAccountStore((s) => s.lastJsonSyncMap);
  const lastSync = activeTag ? lastJsonSyncMap[activeTag] : null;

  const widgetTag = widgetPrefs.selectedAccountTag ?? activeTag;
  const [votes, setVotes] = useState<Record<string, Vote | null>>({});

  const [showSupport, setShowSupport] = useState(false);

  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    track("screen_view", { screen: "settings" });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const initial: Record<string, Vote | null> = {};

      ["progress", "upgrade_planner", "ai", "war_analytics"].forEach((id) => {
        initial[id] = getFeatureVote(id);
      });

      setVotes(initial);
    }, []),
  );

  useEffect(() => {
    loadAccounts();
    loadLastSync();
  }, [loadAccounts, loadLastSync]);

  useEffect(() => {
    const acc = accounts.find((a) => a.tag === activeTag);
    if (!acc) return;

    setLocalBuilderCount(acc.builderCount);
  }, [accounts, activeTag]);

  useEffect(() => {
    setLocalNotificationsEnabled(getNotificationsEnabled());
  }, []);

  const handleBuilderSelect = async (count: number) => {
    if (!activeTag || !activeAccount) return;

    const current = activeAccount.builderCount;

    const busyBuilders = (await getAccountState(activeTag)).builders.length;

    if (count < busyBuilders) {
      setRequiredBuilders(busyBuilders);
      setShowBuilderErrorModal(true);
      return;
    }

    setLocalBuilderCount(count);

    if (count !== current) {
      await updateBuilderCount(activeTag, count);
      updateLocalBuilderCount(activeTag, count);
      track("builder_count_changed", {
        value: count,
        previous: current,
      });
      await loadAccounts();
      emitWidgetUpdate();
    }

    stopSmartWidgetScheduler();
  };

  const handleVote = (id: FeatureId, newVote: Vote) => {
    // Toggle off
    const currentVote = votes[id];

    if (currentVote === newVote) {
      clearFeatureVote(id);
      setVotes((prev) => ({ ...prev, [id]: null }));

      track("feature_vote_removed", {
        feature: id,
        previous: currentVote,
        screen: "settings",
        townhall: profile?.townHallLevel ?? 0,
      });

      return;
    }

    // Set vote
    setFeatureVote(id, newVote);
    setVotes((prev) => ({ ...prev, [id]: newVote }));

    track("feature_vote_set", {
      feature: id,
      vote: newVote,
      previous: currentVote ?? "none",
      screen: "settings",
      townhall: profile?.townHallLevel ?? 0,
      builder_count: activeAccount?.builderCount ?? 0,
    });
  };

  const openSupport = async () => {
    const info = await buildSupportInfo();

    setDebugInfo(info);

    setShowSupport(true);
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: "#0f172a",
      }}
    >
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View> */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage accounts, widgets, notifications, and preferences.
        </Text>
      </View>

      {/* <View style={styles.container}> */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ChiefCard />
        {/* SECTION: Active Village */}
        <Text style={styles.sectionTitle}>Active Village</Text>

        <View style={styles.card}>
          {profile?.playerTag ? (
            <>
              <View style={styles.activeAccountHeader}>
                {/* Color dot */}
                {(() => {
                  const acc = accounts.find((a) => a.tag === profile.playerTag);
                  return (
                    <View
                      style={[
                        styles.activeAccountDot,
                        { backgroundColor: acc?.color ?? "#fbbf24" },
                      ]}
                    />
                  );
                })()}
                <View style={styles.activeAccountInfo}>
                  <Text style={styles.activeAccountName}>
                    {profile.playerName}
                  </Text>
                  <View style={styles.activeAccountMetaRow}>
                    <Text style={styles.activeAccountMeta}>
                      {profile.playerTag}
                    </Text>

                    {typeof profile.trophies === "number" && (
                      <View style={styles.trophyRow}>
                        <Image
                          source={require("@/assets/images/clash/trophy.png")}
                          style={styles.trophyIcon}
                          contentFit="contain"
                        />
                        <Text style={styles.activeAccountMeta}>
                          {profile.trophies}
                        </Text>
                      </View>
                    )}

                    {profile.expLevel && <XPBadge level={profile.expLevel} />}
                  </View>
                </View>
                {isPremium && (
                  <View
                    style={{
                      backgroundColor: "#fbbf24",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color: "#0f172a",
                      }}
                    >
                      Chief
                    </Text>
                  </View>
                )}
                {profile.leagueTierIconUrl && (
                  <Image
                    source={{ uri: profile.leagueTierIconUrl }}
                    style={styles.leagueIcon}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                )}

                {profile.townHallLevel && (
                  <Image
                    source={{
                      uri: resolveEntityIcon(1000001, {
                        context: {
                          hallLevel: profile.townHallLevel,
                        },
                      }),
                    }}
                    style={styles.thIcon}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                )}
              </View>

              <View style={styles.activeAccountStats}>
                <View style={styles.statChip}>
                  <Text style={styles.statChipLabel}>Town Hall</Text>
                  <Text style={styles.statChipValue}>
                    {profile.townHallLevel}
                  </Text>
                </View>
                <View style={styles.statChip}>
                  <Text style={styles.statChipLabel}>Builders</Text>
                  <Text style={styles.statChipValue}>
                    {activeAccount?.builderCount}
                  </Text>
                </View>
                <View style={styles.statChip}>
                  <Text style={styles.statChipLabel}>Last Sync</Text>
                  <Text style={styles.statChipValue}>
                    {lastSync ? formatTimeAgo(lastSync) : "Never"}
                  </Text>
                </View>
              </View>

              <View style={styles.activeAccountActions}>
                <Pressable
                  style={styles.actionChip}
                  onPress={async () => {
                    await Clipboard.setStringAsync(profile.playerTag!);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  <Ionicons
                    name={copied ? "checkmark" : "copy-outline"}
                    size={14}
                    color={copied ? "#22c55e" : "#94a3b8"}
                  />
                  <Text
                    style={[
                      styles.actionChipText,
                      copied && { color: "#22c55e" },
                    ]}
                  >
                    {copied ? "Copied" : "Copy Tag"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.actionChip}
                  onPress={() => {
                    track("navigation", {
                      from: "setting",
                      to: "upload-json",
                      trigger: "sync",
                    });
                    router.push("/upload-json");
                  }}
                >
                  <Ionicons name="sync-outline" size={14} color="#94a3b8" />
                  <Text style={styles.actionChipText}>Sync JSON</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionChip, styles.actionChipDanger]}
                  onPress={() => setShowResetAccountModal(true)}
                >
                  <Ionicons name="refresh-outline" size={14} color="#ef4444" />
                  <Text style={[styles.actionChipText, { color: "#ef4444" }]}>
                    Reset
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.noAccountRow}>
              <Ionicons name="person-outline" size={20} color="#475569" />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>No Village Connected</Text>
                <Text style={styles.helperText}>
                  Import village JSON to get started
                </Text>
              </View>
              <Pressable
                style={styles.connectButton}
                onPress={() => router.push("/upload-json")}
              >
                <Text style={styles.connectButtonText}>Connect</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* SECTION: All Villages */}
        <Text style={styles.sectionTitle}>All Villages</Text>

        <View style={styles.card}>
          {accounts.length === 0 && (
            <Text style={styles.emptyAccountsText}>No villages added yet</Text>
          )}

          {accounts.map((acc, index) => {
            const isActive = acc.tag === profile?.playerTag;
            const isWidgetAccount = widgetTag === acc.tag;

            return (
              <View key={acc.tag}>
                <Pressable
                  style={({ pressed }) => [
                    styles.accountRow,
                    isActive && styles.accountRowActive,
                    pressed && !isActive && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    if (!isActive) {
                      track("account_switched", {
                        from_index: accounts.findIndex(
                          (a) => a.tag === activeTag,
                        ),
                        to_index: accounts.findIndex((a) => a.tag === acc.tag),
                      });

                      switchAccount(acc.tag);
                    }
                  }}
                  onLongPress={() => setAccountToDelete(acc)}
                >
                  {/* Avatar */}
                  <Pressable
                    style={styles.avatarWrapper}
                    onPress={() => setEditColorFor(acc)}
                  >
                    <View
                      style={[
                        styles.accountAvatar,
                        { borderColor: acc.color },
                        isActive && { backgroundColor: acc.color + "22" },
                      ]}
                    >
                      <Text
                        style={[styles.accountAvatarText, { color: acc.color }]}
                      >
                        {acc.name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.editBadge}>
                      <Ionicons name="pencil" size={8} color="#0f172a" />
                    </View>
                  </Pressable>

                  {/* Info */}
                  <View style={styles.accountInfo}>
                    <View style={styles.accountNameRow}>
                      <Text style={styles.accountRowName}>{acc.name}</Text>
                      {isActive && (
                        <View
                          style={[
                            styles.activePill,
                            {
                              borderColor: acc.color,
                              backgroundColor: acc.color + "22",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.activePillText,
                              { color: acc.color },
                            ]}
                          >
                            ACTIVE
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.accountMeta}>
                      TH{acc.townhall} • {acc.tag}
                    </Text>
                  </View>

                  {/* Right: widget pin + delete */}
                  <View style={styles.accountActions}>
                    <Pressable
                      style={[
                        styles.widgetPinButton,
                        isWidgetAccount && styles.widgetPinButtonActive,
                      ]}
                      onPress={async () => {
                        track("widget_account_selected", {
                          total_accounts: accounts.length,
                          is_switching: acc.tag !== widgetTag,
                          account_position: accounts.findIndex(
                            (a) => a.tag === acc.tag,
                          ),
                        });

                        setWidgetAccount(acc.tag);
                        emitWidgetUpdate();
                      }}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="phone-portrait-outline"
                        size={14}
                        color={isWidgetAccount ? "#0f172a" : "#475569"}
                      />
                    </Pressable>

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => setAccountToDelete(acc)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#475569"
                      />
                    </Pressable>
                  </View>
                </Pressable>

                {index < accounts.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </View>
            );
          })}

          {/* Add Account */}
          <Pressable
            style={({ pressed }) => [
              styles.addAccountButton,
              { marginTop: accounts.length > 0 ? 12 : 0 },
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => {
              track("navigation", {
                from: "settings",
                to: "add-account",
                trigger: "add_account_button",
              });
              router.push("/add-account");
            }}
          >
            <View style={styles.addAccountIcon}>
              <Ionicons name="add" size={18} color="#fbbf24" />
            </View>
            <Text style={styles.addAccountText}>Add Village</Text>
            <Ionicons name="chevron-forward" size={16} color="#fbbf24" />
          </Pressable>
        </View>

        {/* Widget Account hint */}
        <Text style={styles.widgetHint}>
          <Ionicons name="phone-portrait-outline" size={11} color="#475569" />
          Tap the widget icon on any village to pin it to your home screen
          widget
        </Text>

        {/* SECTION: Builder Config */}
        <Text style={styles.sectionTitle}>Builder Settings</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Number of Builders</Text>
          <Text style={styles.helperText}>
            Set total builders for this account
          </Text>
          <View style={styles.builderRow}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <Pressable
                key={num}
                onPress={() => handleBuilderSelect(num)}
                style={[
                  styles.builderButton,
                  localBuilderCount === num && styles.builderButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.builderButtonText,
                    localBuilderCount === num && styles.builderButtonTextActive,
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
              value={localNotificationsEnabled}
              onValueChange={async (value) => {
                track("notifications_toggled", {
                  enabled: value,
                  source: "settings",
                });

                if (value) {
                  const granted = await requestNotificationPermissions();
                  if (!granted) {
                    setNotificationsEnabled(false);
                    setLocalNotificationsEnabled(false);
                    Alert.alert(
                      "Notifications Disabled",
                      "Please allow notifications in system settings.",
                    );
                    return;
                  }

                  setNotificationsEnabled(true);
                  setLocalNotificationsEnabled(true);

                  await resyncNotifications();
                } else {
                  setNotificationsEnabled(false);
                  setLocalNotificationsEnabled(false);
                  await Notifications.cancelAllScheduledNotificationsAsync();
                }
              }}
              trackColor={{ false: "#334155", true: "#fbbf24" }}
              thumbColor={localNotificationsEnabled ? "#0f172a" : "#cbd5e1"}
            />
          </View>
        </View>

        {/* SECTION: Notification Testing (DEV) */}
        {__DEV__ && (
          <>
            <Text style={styles.sectionTitle}>Dev - Notification Test</Text>
            <View style={styles.card}>
              <Pressable
                style={styles.testButton}
                onPress={async () => {
                  if (!activeTag) return;

                  const result = await insertTestUpgrade({
                    tag: activeTag,
                    type: "BUILDER",
                    delayMs: 5000,
                  });
                  console.log("resultbuilder: ", result);

                  await resyncNotifications();
                }}
              >
                <Ionicons name="hammer" size={18} color="#fff" />
                <Text style={styles.testButtonText}>Test Builder (5s)</Text>
              </Pressable>
              <Pressable
                style={[styles.testButton, styles.testButtonLab]}
                onPress={async () => {
                  if (!activeTag) return;

                  const result = await insertTestUpgrade({
                    tag: activeTag,
                    type: "LAB",
                    delayMs: 8000,
                  });
                  console.log("resultlab: ", result);

                  await resyncNotifications();
                }}
              >
                <Ionicons name="flask" size={18} color="#fff" />
                <Text style={styles.testButtonText}>Test Lab (8s)</Text>
              </Pressable>
              <Pressable
                style={[styles.testButton, styles.testButtonPet]}
                onPress={async () => {
                  if (!activeTag) return;

                  const result = await insertTestUpgrade({
                    tag: activeTag,
                    type: "PET",
                    delayMs: 12000,
                  });
                  console.log("resultpet: ", result);

                  await resyncNotifications();
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
            onPress={() => {
              track("navigation", {
                from: "settings_empty",
                to: "upload-json",
                trigger: "connect_button",
              });
              router.push("/upload-json");
            }}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Sync Village Data</Text>
              <Text style={styles.helperText}>
                Keep builder, lab, and pet progress up to date
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

        {/* SECTION: Roadmap */}
        <Text style={styles.sectionTitle}>Roadmap</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>🚀 Help Shape Clash One</Text>
          <Text style={styles.helperText}>Vote on upcoming features</Text>
          {[
            {
              id: "progress",
              label: "📊 Base Progress Tracking",
              desc: "See village completion and upgrade status",
            },
            {
              id: "war_analytics",
              label: "📅 War Analytics",
              desc: "Track clan performance and attack efficiency",
            },
            {
              id: "upgrade_planner",
              label: "📝 Upgrade Planner",
              desc: "Plan upgrades and resources smarter",
            },
            {
              id: "ai",
              label: "🧠 Smart Suggestions",
              desc: "Suggested upgrades based on your progress",
            },
          ].map((item) => {
            const vote = votes[item.id];
            return (
              <View key={item.id} style={styles.roadmapItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roadmapTitle}>{item.label}</Text>
                  <Text style={styles.roadmapDesc}>{item.desc}</Text>
                </View>

                <View style={styles.roadmapActions}>
                  {/* LIKE */}
                  <Pressable
                    onPress={() => handleVote(item.id as FeatureId, "like")}
                  >
                    <Ionicons
                      name="thumbs-up"
                      size={16}
                      color={vote === "like" ? "#22c55e" : "#64748b"}
                    />
                  </Pressable>

                  {/* DISLIKE */}
                  <Pressable
                    onPress={() => handleVote(item.id as FeatureId, "dislike")}
                  >
                    <Ionicons
                      name="thumbs-down"
                      size={16}
                      color={vote === "dislike" ? "#ef4444" : "#64748b"}
                    />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Support</Text>

        <View style={styles.card}>
          <Pressable style={styles.settingRow} onPress={openSupport}>
            <View style={styles.settingContent}>
              {/* <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="#fbbf24"
              /> */}
              <Text style={styles.settingLabel}>Help & Feedback</Text>
              <Text style={styles.helperText}>
                Questions? Issues? Feature requests? Contact us and view debug
                info
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fbbf24" />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Chief</Text>

        <View style={styles.card}>
          <Pressable
            style={styles.settingRow}
            onPress={async () => {
              const restored = await restorePurchases();

              if (restored) {
                usePremiumStore.getState().setPremium(true);

                Alert.alert("Restored", "Chief access restored successfully.");
              } else {
                Alert.alert(
                  "No Purchase Found",
                  "No previous Chief purchase was found.",
                );
              }
            }}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Restore Purchases</Text>

              <Text style={styles.helperText}>
                Restore a previous Chief purchase on this device.
              </Text>
            </View>

            <Ionicons name="refresh-outline" size={20} color="#fbbf24" />
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

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Clash One</Text>
          <Text style={styles.aboutVersion}>
            v{Application.nativeApplicationVersion}
          </Text>
          <Text style={styles.aboutSubtitle}>
            Unofficial companion app for Clash of Clans.
          </Text>
          <Text style={styles.aboutSubtitle}>
            Not affiliated with, endorsed, or sponsored by Supercell.
          </Text>
          <Pressable
            onPress={() =>
              Linking.openURL("https://supercell.com/en/fan-content-policy/")
            }
          >
            <Text
              style={{
                color: "#fbbf24",
                marginTop: 8,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              View Supercell Fan Content Policy
              <Ionicons name="open-outline" size={20} color="#fbbf24" />
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Color Picker Modal */}
      {editColorFor && (
        <View style={styles.colorPickerOverlay}>
          <Pressable
            style={styles.colorPickerBackdrop}
            onPress={() => setEditColorFor(null)}
          />
          <View style={styles.colorPickerSheet}>
            <View style={styles.colorPickerHandle} />
            <Text style={styles.colorPickerTitle}>
              Pick color for {editColorFor.name}
            </Text>
            <View style={styles.colorGrid}>
              {ACCOUNT_COLORS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    editColorFor.color === color && styles.colorSwatchActive,
                  ]}
                  onPress={async () => {
                    track("account_color_changed", {
                      account: editColorFor.tag,
                    });
                    await updateAccountColor(editColorFor.tag, color);

                    setEditColorFor(null);
                    await loadAccounts();

                    emitWidgetUpdate();
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      <SupportModal
        visible={showSupport}
        onClose={() => setShowSupport(false)}
        debugInfo={debugInfo}
      />

      {/* Reset Account Modal */}
      <ConfirmModal
        visible={showResetAccountModal}
        title="Reset Account?"
        message="This will remove your saved player tag and all tracked upgrades."
        confirmText="Reset"
        destructive
        onCancel={() => setShowResetAccountModal(false)}
        onConfirm={async () => {
          // await cancelAllNotifications();
          if (profile) {
            const resetProfile = {
              ...profile,
              playerTag: undefined,
              playerApiConnected: false,
              lastSyncedAt: undefined,
            };
            if (!activeTag) return;
            savePlayerProfile(activeTag, resetProfile);
            setProfile(activeTag, resetProfile);
          }
          if (profile?.playerTag) {
            resetLastJsonSync(profile.playerTag);
          }
          setShowResetAccountModal(false);
          emitWidgetUpdate();
          startSmartWidgetScheduler();
        }}
      />

      {/* Clear Upgrades Modal */}
      <ConfirmModal
        visible={showClearUpgradesModal}
        title="Clear All Upgrades?"
        message="This will remove all tracked upgrades but keep your village."
        confirmText="Clear"
        destructive
        onCancel={() => setShowClearUpgradesModal(false)}
        onConfirm={async () => {
          await resyncNotifications();
          setShowClearUpgradesModal(false);
          emitWidgetUpdate();
          startSmartWidgetScheduler();
        }}
      />

      {/* Delete Account Modal */}
      <ConfirmModal
        visible={!!accountToDelete}
        title={`Remove ${accountToDelete?.name}?`}
        message="This village will be removed. Your upgrade data for this village will also be deleted."
        confirmText="Remove"
        destructive
        onCancel={() => setAccountToDelete(null)}
        onConfirm={async () => {
          if (!accountToDelete) return;
          await removeAccount(accountToDelete.tag);
          track("account_removed", {
            total_accounts_before: accounts.length - 1,
          });
          await resyncNotifications();
          setAccountToDelete(null);
          await loadAccounts();
          emitWidgetUpdate();
        }}
      />
      <ConfirmModal
        visible={showBuilderErrorModal}
        title="Cannot Reduce Builders"
        message={`You currently have ${requiredBuilders} active upgrades running.

Reduce builders only after some upgrades complete.`}
        confirmText="Got it"
        onCancel={() => setShowBuilderErrorModal(false)}
        onConfirm={() => setShowBuilderErrorModal(false)}
      />
      {/* </View> */}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },

  headerTitle: {
    color: "#fbbf24",
    fontSize: 30,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: "#94a3b8",
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
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
    marginBottom: 4,
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

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    gap: 12,
  },

  settingLeft: {},

  settingTitle: {},

  settingContent: {
    flex: 1,
    gap: 4,
  },

  settingLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  helperText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    marginBottom: 4,
  },

  // Active Account card
  activeAccountHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  activeAccountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  activeAccountInfo: {
    flex: 1,
  },

  activeAccountName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  activeAccountMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  activeAccountMeta: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  trophyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  trophyIcon: {
    width: 14,
    height: 14,
  },

  leagueIcon: {
    width: 24,
    height: 24,
  },

  thIcon: {
    width: 28,
    height: 28,
  },

  activeAccountStats: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  statChip: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 2,
  },

  statChipLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statChipValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  activeAccountActions: {
    flexDirection: "row",
    gap: 8,
  },

  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
  },

  actionChipDanger: {
    borderColor: "#ef444430",
    backgroundColor: "rgba(239,68,68,0.07)",
  },

  actionChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },

  noAccountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  connectButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(251,191,36,0.12)",
    borderWidth: 1,
    borderColor: "#fbbf24",
  },

  connectButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fbbf24",
  },

  emptyAccountsText: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    paddingVertical: 8,
    marginBottom: 12,
  },

  // Account rows
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    gap: 12,
  },

  accountRowActive: {
    backgroundColor: "#0f172a",
  },

  avatarWrapper: {
    position: "relative",
    width: 44,
    height: 44,
  },

  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fbbf24",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#1e293b",
  },

  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },

  accountAvatarText: {
    fontSize: 13,
    fontWeight: "700",
  },

  accountInfo: {
    flex: 1,
    gap: 4,
  },

  accountNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  accountRowName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  accountMeta: {
    fontSize: 12,
    color: "#64748b",
  },

  activePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },

  activePillText: {
    fontSize: 10,
    fontWeight: "700",
  },

  accountActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  widgetPinButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },

  widgetPinButtonActive: {
    backgroundColor: "#fbbf24",
    borderColor: "#fbbf24",
  },

  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },

  rowDivider: {
    height: 1,
    backgroundColor: "#0f172a",
    marginHorizontal: 4,
  },

  addAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#fbbf24",
    borderStyle: "dashed",
    backgroundColor: "rgba(251, 191, 36, 0.05)",
  },

  addAccountIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  addAccountText: {
    flex: 1,
    color: "#fbbf24",
    fontWeight: "700",
    fontSize: 14,
  },

  widgetHint: {
    fontSize: 11,
    color: "#475569",
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 16,
  },

  // Builder selector
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

  roadmapItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },

  roadmapTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  roadmapDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  roadmapActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
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

  // Color picker
  colorPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 100,
  },

  colorPickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  colorPickerSheet: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },

  colorPickerHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    backgroundColor: "#475569",
    borderRadius: 2,
    marginBottom: 20,
  },

  colorPickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: 20,
  },

  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  colorSwatchActive: {
    borderWidth: 3,
    borderColor: "#fff",
  },

  profileLeagueIcon: {
    width: 28,
    height: 28,
  },

  accountDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
