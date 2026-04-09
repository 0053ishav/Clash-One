import GoblinEventBanner from "@/components/GoblinEventBanner";
import ProfileDropdownSheet from "@/components/ProfileSheet/ProfileDropdownSheet";
import { getEntityTypeByDataId } from "@/data/entityMap";
import { useRemoteConfig } from "@/provider/remoteConfigProvider";
import {
  deleteBuilderUpgrade,
  getActiveBuilderUpgrades,
} from "@/services/builderService";
import { cancelBuilderNotification } from "@/services/notifications/builderNotificationService";
import { setOnboardingIncomplete } from "@/storage/appConfig";
import {
  setGoblinBannerDismissedUntil,
  shouldShowGoblinBanner,
} from "@/storage/goblinStorage";
import { useAccountStore } from "@/stores/accountStore";
import { useCraftedStore } from "@/stores/craftedEventStore";
import { BuilderUpgrade, BuilderWidgetData } from "@/types/upgrade";
import { getBuilderStatus } from "@/utils/builderStatus";
import { calculateProgress } from "@/utils/calculateProgress";
import { useCraftedResolver } from "@/utils/craftedResolver";
import { formatBuildingName } from "@/utils/formatBuildingName";
import { formatCountdown } from "@/utils/formatCountdown";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import {
  canUseGoblinBuilder,
  getCurrentWorkForHireEventEnd,
  isWorkForHireActive,
} from "@/utils/goblin";
import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { emitWidgetUpdate } from "@/utils/widget/widgetEvents";
import { getBuilderWidgetData } from "@/widget/getBuilderWidgetData";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  LayoutAnimation,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeUpgrades, setActiveUpgrades] = useState<BuilderUpgrade[]>([]);
  const [selectedUpgrade, setSelectedUpgrade] = useState<BuilderUpgrade | null>(
    null,
  );
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);

  const [profileSheetVisible, setProfileSheetVisible] = useState(false);

  const { getCraftedName, getModuleName } = useCraftedResolver();

  useCraftedStore((s) => s.defenses);

  const [data, setData] = useState<BuilderWidgetData>({
    title: "Builders",
    subtitle: "All builders free",
    progress: 0,
    showProgress: false,
  });

  const loadAccounts = useAccountStore((s) => s.loadAccounts);
  const activeTag = useAccountStore((s) => s.activeTag);
  const profile = useAccountStore((s) => s.profile);
  const isLoadingProfile = useAccountStore((s) => s.isLoadingProfile);
  const loadLastSync = useAccountStore((s) => s.loadLastSync);
  const lastJsonSyncMap = useAccountStore((s) => s.lastJsonSyncMap);
  const lastSync = activeTag ? lastJsonSyncMap[activeTag] : null;

  const accounts = useAccountStore.getState().accounts;

  const account = accounts.find((a) => a.tag === activeTag);

  const color = account?.color ?? "#fbbf24";
  const builderCount = account?.builderCount ?? 0;

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
      loadLastSync();
    }, []),
  );

  const refreshUpgrades = useCallback(async () => {
    if (!activeTag) return;
    setActiveUpgrades(await getActiveBuilderUpgrades(activeTag));
  }, [activeTag]);

  useEffect(() => {
    if (activeTag) refreshUpgrades();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setActiveUpgrades((prev) => {
        const finished = prev.find((u) => u.endTime <= now);

        if (finished) {
          setCompletedId((current) => current ?? finished.id);
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!completedId) return;

    const timeout = setTimeout(async () => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          300,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity,
        ),
      );

      setActiveUpgrades((prev) => prev.filter((u) => u.id !== completedId));

      deleteBuilderUpgrade(completedId);

      emitWidgetUpdate();

      startSmartWidgetScheduler();

      setCompletedId(null);
    }, 800);

    return () => clearTimeout(timeout);
  }, [completedId]);

  useEffect(() => {
    (async () => {
      try {
        const widgetData = await getBuilderWidgetData();
        setData(widgetData);
      } catch {
        setData({
          title: "Builders",
          subtitle: "Preview unavailable",
          progress: 0,
          showProgress: false,
        });
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUpgrades();
    }, [refreshUpgrades]),
  );

  useEffect(() => {
    const interval = setInterval(refreshUpgrades, 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshUpgrades]);

  const { config } = useRemoteConfig();

  if (isLoadingProfile) {
    return (
      <View style={[styles.container, styles.loadingOverlay]}>
        <View style={styles.loadingContent}>
          <View style={styles.imageWrapper}>
            <Image
              source={require("@/assets/images/builder/builder-idle.png")}
              style={styles.builderImage}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
          <Text style={styles.loadingTitle}>Switching Account</Text>
          <Text style={styles.loadingMessage}>Loading your profile...</Text>
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>
        </View>
      </View>
    );
  }
  if (!profile) {
    return (
      <View style={[styles.container, styles.loadingOverlay]}>
        <View style={styles.loadingContent}>
          <View style={styles.imageWrapper}>
            <Image
              source={require("@/assets/images/builder/builder-idle.png")}
              style={styles.builderImage}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
          <Text style={styles.loadingTitle}>Loading Account</Text>
          <Text style={styles.loadingMessage}>Loading your profile...</Text>
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>
        </View>
      </View>
    );
  }

  const isGoblinActive = config.goblinBuilderEnabled && isWorkForHireActive();

  const eventEndsAt = getCurrentWorkForHireEventEnd();

  const showBanner = !!eventEndsAt && shouldShowGoblinBanner(eventEndsAt);

  const isStale = lastSync && Date.now() - lastSync > 1000 * 60 * 60 * 12;

  const status = getBuilderStatus({
    normalBuilderCount: builderCount,
    goblinBuilderUnlocked: isGoblinActive,
    activeUpgrades,
  });

  const sortedUpgrades = [...activeUpgrades].sort((a, b) => {
    const slotA = a.builderSlot === "G" ? 999 : a.builderSlot;
    const slotB = b.builderSlot === "G" ? 999 : b.builderSlot;
    return slotA - slotB;
  });

  const nextUpgrade =
    sortedUpgrades.length > 0
      ? sortedUpgrades.reduce((prev, curr) =>
          prev.endTime < curr.endTime ? prev : curr,
        )
      : null;

  const remainingMs = nextUpgrade
    ? Math.max(nextUpgrade.endTime - Date.now(), 0)
    : 0;

  let nextBuilderLabel: string | undefined;

  if (nextUpgrade) {
    nextBuilderLabel =
      nextUpgrade?.builderSlot === "G"
        ? "Goblin"
        : `B${nextUpgrade.builderSlot + 1}`;
  }
  const handleRowLongPress = (upgrade: BuilderUpgrade) => {
    setSelectedUpgrade(upgrade);
    setActionModalVisible(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    refreshUpgrades();

    emitWidgetUpdate();

    startSmartWidgetScheduler();

    setRefreshing(false);
  };

  let statusIcon = require("@/assets/images/builder/builder-idle.png");

  if (!status.allFree && nextUpgrade?.dataId) {
    const type = getEntityTypeByDataId(
      nextUpgrade.dataId,
      nextUpgrade.isCrafted,
    );

    if (type) {
      statusIcon = getIconByEntityType(
        nextUpgrade.dataId,
        type,
        undefined,
        nextUpgrade.isCrafted,
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#fbbf24"
            />
          }
        >
          {showBanner && eventEndsAt && (
            <GoblinEventBanner
              eventEndsAt={eventEndsAt}
              onDismiss={() => {
                setGoblinBannerDismissedUntil(eventEndsAt);
              }}
            />
          )}
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <View>
              <Text style={styles.headerTitle}>Builder Status</Text>

              <Pressable
                style={styles.profileDropdown}
                onPress={() => setProfileSheetVisible(true)}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.profileTopRow}>
                    <Text style={styles.profileName}>
                      {profile.playerTag
                        ? profile.playerName
                        : "No Profile Synced"}
                    </Text>

                    {/* Current League Icon */}
                    {profile.leagueTierIconUrl && (
                      <Image
                        source={{ uri: profile.leagueTierIconUrl }}
                        style={styles.leagueIcon}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                      />
                    )}
                  </View>

                  {/* Secondary Line */}
                  {profile.playerTag && (
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={styles.leagueIcon}>
                        <Image
                          source={getIconByEntityType(
                            profile.townHallLevel,
                            "townhall",
                          )}
                          style={styles.leagueIcon}
                          contentFit="contain"
                          cachePolicy="memory-disk"
                        />
                      </View>
                      <Text style={styles.profileSub}>
                        TH{profile.townHallLevel}
                        {typeof profile.trophies === "number"
                          ? ` • ${profile.trophies} 🏆`
                          : ""}
                      </Text>

                      {/* EXP Level */}
                      {typeof profile.expLevel === "number" && (
                        <Text style={styles.profileSub}>
                          Lv {profile.expLevel}
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                <Ionicons name="chevron-down" size={16} color="#94a3b8" />
              </Pressable>
            </View>
            <View style={styles.sync}>
              <Pressable onPress={() => router.push("/upload-json")}>
                <Ionicons
                  name="sync-sharp"
                  size={22}
                  color={isStale ? "#fbbf24" : "#fff"}
                />
              </Pressable>
              {lastSync && (
                <Text style={styles.syncText}>
                  Synced {formatTimeAgo(lastSync)} ago
                </Text>
              )}
            </View>
          </View>

          {/* Premium Status Card */}
          <View style={styles.statusCardContainer}>
            <View style={styles.statusCard}>
              <View style={styles.statusCardContent}>
                <View style={styles.statusIconContainer}>
                  <Image
                    source={statusIcon}
                    style={styles.statusCardIcon}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                </View>

                <View style={styles.statusInfo}>
                  <Text style={styles.statusCardLabel}>
                    {status.allFree
                      ? "🚨 Builder Idle"
                      : `⏳ Next Upgrade: ${nextBuilderLabel}`}
                  </Text>

                  <Text style={styles.statusCardTime}>
                    {status.allFree
                      ? "Ready to build"
                      : formatCountdown(remainingMs)}
                  </Text>
                  <View style={styles.builderIndicators}>
                    {/* Normal Builders */}
                    {Array.from({ length: builderCount }).map((_, i) => {
                      const isBusy = activeUpgrades.some(
                        (u) => u.builderSlot === i,
                      );

                      return (
                        <View
                          key={`normal-${i}`}
                          style={[
                            styles.builderDot,
                            isBusy
                              ? styles.builderDotBusy
                              : styles.builderDotFree,
                          ]}
                        />
                      );
                    })}

                    {/* Goblin Slot */}
                    {isGoblinActive &&
                      (() => {
                        const goblinBusy = activeUpgrades.some(
                          (u) => u.builderSlot === "G",
                        );

                        const goblinCanBeUsed = canUseGoblinBuilder(
                          profile,
                          activeUpgrades,
                        );
                        return (
                          <View
                            style={[
                              styles.builderDot,
                              goblinBusy
                                ? styles.goblinDotBusy
                                : goblinCanBeUsed
                                  ? styles.goblinDotFree
                                  : styles.goblinDotInactive,
                            ]}
                          />
                        );
                      })()}
                  </View>
                </View>
              </View>
            </View>
          </View>
          {/* Add Upgrade Button */}
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={() => router.push("/add-upgrade")}
          >
            <Ionicons name="add-circle" size={24} color="#0f172a" />
            <Text style={styles.addButtonText}>Add Upgrade</Text>
          </Pressable>
          {/* Active Upgrades Section */}
          {sortedUpgrades.length > 0 && (
            <View style={styles.upgradesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Upgrades</Text>
                <View style={styles.upgradeBadge}>
                  <Text style={styles.upgradeBadgeText}>
                    {sortedUpgrades.length}
                  </Text>
                </View>
              </View>

              {sortedUpgrades.map((u, index) => {
                const remainingMs = Math.max(u.endTime - Date.now(), 0);
                const totalMs = u.endTime - u.startTime;
                const progress = calculateProgress(u.startTime, u.endTime);
                const isGoblin = u.builderSlot === "G";
                const builderLabel = isGoblin
                  ? "G"
                  : `B${(u.builderSlot as number) + 1}`;
                const isCompleted = completedId === u.id;
                const entityType = u.dataId
                  ? getEntityTypeByDataId(u.dataId, u.isCrafted)
                  : undefined;
                return (
                  <Pressable
                    key={u.id}
                    style={[
                      styles.upgradeCard,
                      isCompleted && styles.upgradeCardCompleted,
                      isGoblin && styles.goblinUpgradeCard,
                    ]}
                    onLongPress={() => handleRowLongPress(u)}
                  >
                    <View
                      style={[
                        styles.upgradeContent,
                        isCompleted && styles.upgradeContentCompleted,
                      ]}
                    >
                      {/* Builder Number Badge */}
                      <View
                        style={[
                          styles.builderBadge,
                          isGoblin && styles.goblinBadge,
                        ]}
                      >
                        <Text style={styles.builderBadgeText}>
                          {builderLabel}
                        </Text>
                      </View>

                      {/* Main Content */}
                      <View style={styles.upgradeMain}>
                        {/* Left Section - Building Icon & Name */}
                        <View style={styles.upgradeLeft}>
                          <View style={styles.iconContainer}>
                            <Image
                              source={
                                u.dataId && entityType
                                  ? getIconByEntityType(
                                      u.dataId,
                                      entityType,
                                      undefined,
                                      u.isCrafted,
                                    )
                                  : require("@/assets/images/builder/builder-working.png")
                              }
                              style={styles.upgradeIcon}
                              contentFit="contain"
                              cachePolicy="memory-disk"
                            />
                          </View>

                          <View style={styles.upgradeNameSection}>
                            <Text style={styles.upgradeName}>
                              {u.isCrafted
                                ? `${getCraftedName(u.dataId) ?? "Crafted"}${
                                    getModuleName(u.dataId, u.moduleId)
                                      ? ` (${getModuleName(u.dataId, u.moduleId)})`
                                      : ""
                                  }`
                                : formatBuildingName(u.entity)}
                            </Text>

                            {/* Levels Badge */}
                            {u.currentLevel !== undefined &&
                              u.nextLevel !== undefined && (
                                <View style={styles.levelsBadge}>
                                  <Text style={styles.levelsText}>
                                    Lv {u.currentLevel} → Lv {u.nextLevel}
                                  </Text>
                                </View>
                              )}
                          </View>
                        </View>

                        {/* Right Section - Time Display */}
                        <View style={styles.upgradeRight}>
                          <Text style={styles.remainingTime}>
                            {formatCountdown(remainingMs)}
                          </Text>
                          <Text style={styles.totalTimeText}>
                            of {formatCountdown(totalMs)}
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${progress * 100}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </Pressable>
                );
              })}

              <View style={styles.refreshHint}>
                <Ionicons name="arrow-down" size={16} color="#64748b" />
                <Text style={styles.refreshHintText}>Pull down to refresh</Text>
              </View>
            </View>
          )}
          {/* Empty State */}
          {sortedUpgrades.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconWrapper}>
                <Image
                  source={require("@/assets/images/builder/builder-idle.png")}
                  style={styles.emptyIcon}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </View>
              <Text style={styles.emptyTitle}>No Active Upgrades</Text>
              <Text style={styles.emptySubtitle}>
                Start your first upgrade to begin tracking
              </Text>

              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push("/add-upgrade")}
              >
                <Text style={styles.emptyButtonText}>Get Started</Text>
              </Pressable>
            </View>
          )}
          {__DEV__ && sortedUpgrades.length > 0 && (
            <Pressable
              style={styles.devButton}
              onPress={() => {
                const first = sortedUpgrades[0];
                setCompletedId(first.id);
                setTimeout(() => setCompletedId(null), 8000);
              }}
            >
              <Text style={styles.devButtonText}>Test Completion</Text>
            </Pressable>
          )}
          {/* {__DEV__ && data && (
            <WidgetPreview
              renderWidget={() => (
                <BuilderStatusWidget
                  title={data.title}
                  subtitle={data.subtitle}
                  progress={data.progress}
                  showProgress={data.showProgress}
                  levelText={data.levelText}
                  builderCountText={data.builderCountText}
                  nextUpgradeText={data.nextUpgradeText}
                  dataId={data.dataId}
                  type={data.type}
                  color={color}
                  accountInitials={data.accountInitials}
                />
              )}
              width={260}
              height={150}
            />
          )} */}
          {__DEV__ && (
            <Pressable
              style={styles.resetButton}
              onPress={() => {
                setOnboardingIncomplete();
                router.replace("/onboarding");
              }}
            >
              <Text style={styles.resetButtonText}>Reset Onboarding</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
      {/* Action Modal */}
      <Modal transparent visible={actionModalVisible} animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setActionModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>{selectedUpgrade?.entity}</Text>

            <View style={styles.modalDivider} />

            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.modalButtonPressed,
              ]}
              onPress={() => {
                setActionModalVisible(false);
                router.push({
                  pathname: "/add-upgrade",
                  params: { editId: selectedUpgrade?.id },
                });
              }}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(251, 191, 36, 0.15)" },
                ]}
              >
                <Ionicons name="pencil" size={18} color="#fbbf24" />
              </View>
              <Text style={styles.modalButtonText}>Edit Upgrade</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.modalButtonPressed,
              ]}
              onPress={async () => {
                if (!selectedUpgrade) return;

                await cancelBuilderNotification(selectedUpgrade.id);
                deleteBuilderUpgrade(selectedUpgrade.id);
                emitWidgetUpdate();

                startSmartWidgetScheduler();
                refreshUpgrades();
                setActionModalVisible(false);
              }}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(248, 113, 113, 0.15)" },
                ]}
              >
                <Ionicons name="trash" size={18} color="#ef4444" />
              </View>

              <Text style={[styles.modalButtonText, styles.modalButtonDelete]}>
                Delete Upgrade
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modalCancel,
                pressed && styles.modalCancelPressed,
              ]}
              onPress={() => setActionModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Profile Dropdown Sheet */}
      <ProfileDropdownSheet
        visible={profileSheetVisible}
        onClose={() => {
          console.log("OPENING PROFILE SHEET");
          setProfileSheetVisible(false);
        }}
        onOpenProfile={() => {
          setProfileSheetVisible(false);
          router.push("/profile");
        }}
        onSync={() => {
          setProfileSheetVisible(false);
          router.push("/upload-json");
        }}
        onSetting={() => {
          setProfileSheetVisible(false);
          router.push("/(tabs)/settings");
        }}
      />

      {/* Floating Action Button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push("/add-upgrade")}
      >
        <View style={styles.fabContent}>
          <Ionicons name="add" size={32} color="#0f172a" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  contentWrapper: {
    flex: 1,
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

  glowBg: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(251, 191, 36, 0.08)",
    top: -30,
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

  spinnerContainer: {
    marginVertical: 12,
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

  loadingMessage: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  },

  scrollContent: {
    paddingTop: 0,
    paddingBottom: 140,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 32,
    paddingHorizontal: 20,
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
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

  profileDropdown: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  profileText: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
  },

  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginRight: 6,
  },

  profileSub: {
    fontSize: 13,
    color: "#94a3b8",
  },

  leagueIcon: {
    width: 18,
    height: 18,
  },

  sync: {
    flexDirection: "column",
    alignItems: "flex-end",
  },

  syncText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginTop: 4,
  },

  statusCardContainer: {
    marginHorizontal: 16,
    marginTop: -16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  statusCard: {
    backgroundColor: "#fbbf24",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },

  statusCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  statusCardIcon: {
    width: 48,
    height: 48,
  },

  statusInfo: {
    flex: 1,
    gap: 8,
  },

  statusCardLabel: {
    fontSize: 12,
    color: "rgba(15, 23, 42, 0.7)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statusCardTime: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },

  builderIndicators: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },

  builderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  builderDotFree: {
    backgroundColor: "#22c55e",
  },

  builderDotBusy: {
    backgroundColor: "#475569",
  },

  addButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#fbbf24",
    gap: 10,
    shadowColor: "#fbbf24",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  addButtonPressed: {
    opacity: 0.85,
  },

  addButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  upgradesSection: {
    paddingHorizontal: 16,
    gap: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  upgradeBadge: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  upgradeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },

  upgradeCard: {
    borderRadius: 16,
    overflow: "visible",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  upgradeCardCompleted: {
    shadowColor: "#22c55e",
    shadowOpacity: 0.3,
  },

  upgradeContent: {
    backgroundColor: "#1e293b",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
  },

  upgradeContentCompleted: {
    backgroundColor: "#22c55e",
  },

  upgradeMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    position: "relative",
  },

  goblinDotFree: {
    backgroundColor: "#22c55e",
  },

  goblinDotBusy: {
    backgroundColor: "#16793a",
  },

  goblinDotInactive: {
    backgroundColor: "rgba(66, 247, 126, 0.25)",
  },

  goblinUpgradeCard: {
    borderWidth: 1.5,
    borderColor: "#22c55e",
    shadowColor: "#16a34a",
    shadowOpacity: 0.4,
  },

  goblinBadge: {
    backgroundColor: "#22c55e",
  },

  builderBadge: {
    position: "absolute",
    top: -8,
    right: 0,
    backgroundColor: "#fbbf24",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },

  builderBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },

  upgradeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  upgradeIcon: {
    width: 32,
    height: 32,
  },

  upgradeNameSection: {
    gap: 6,
    flex: 1,
  },

  upgradeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  levelsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(14, 165, 233, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  levelsText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0ea5e9",
  },

  upgradeRight: {
    alignItems: "flex-end",
    gap: 4,
  },

  remainingTime: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fbbf24",
  },

  totalTimeText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },

  progressTrack: {
    height: 4,
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#fbbf24",
    borderRadius: 2,
  },

  refreshHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },

  refreshHintText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },

  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 16,
  },

  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  emptyIcon: {
    width: 60,
    height: 60,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f1f5f9",
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fbbf24",
  },

  emptyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },

  devButton: {
    alignSelf: "center",
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#0ea5e9",
  },

  devButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  resetButton: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  resetButtonText: {
    color: "#64748b",
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
    gap: 16,
  },

  modalHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    backgroundColor: "#475569",
    borderRadius: 2,
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f1f5f9",
    marginBottom: 8,
  },

  modalDivider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 8,
  },

  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },

  modalButtonPressed: {
    opacity: 0.8,
  },

  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fbbf24",
    flex: 1,
  },

  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  modalButtonDelete: {
    color: "#ef4444",
  },

  modalCancel: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#334155",
  },

  modalCancelPressed: {
    opacity: 0.8,
  },

  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#cbd5e1",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: "#fbbf24",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  fabPressed: {
    transform: [{ scale: 0.9 }],
  },

  fabContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fbbf24",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});
