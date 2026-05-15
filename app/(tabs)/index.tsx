import GoblinEventBanner from "@/components/GoblinEventBanner";
import { LabSection } from "@/components/home/LabSection";
import { PetSection } from "@/components/home/PetSection";
import ProfileDropdownSheet from "@/components/ProfileSheet/ProfileDropdownSheet";
import { getEntityTypeByDataId } from "@/data/entityMap";
import { useRemoteConfig } from "@/provider/remoteConfigProvider";
import { getAccountState } from "@/services/accountStateService";
import { deleteUpgrade } from "@/services/upgradeService";
import { setOnboardingIncomplete } from "@/storage/appConfig";
import {
  setGoblinBannerDismissedUntil,
  shouldShowGoblinBanner,
} from "@/storage/goblinStorage";
import {
  clearFeatureVote,
  getFeatureVote,
  setFeatureVote,
} from "@/storage/notesStorage";
import { useAccountStore } from "@/stores/accountStore";
import { useCraftedStore } from "@/stores/craftedEventStore";
import { usePremiumStore } from "@/stores/premiumStore";
import { BuilderWidgetData, Upgrade } from "@/types/upgrade";
import { FeatureId, Vote } from "@/types/vote";
import { setSessionSource, track } from "@/utils/analytics/analytics";
import { getBuilderStatus } from "@/utils/builderStatus";
import { calculateProgress } from "@/utils/calculateProgress";
import { useCraftedResolver } from "@/utils/craftedResolver";
import { formatBuildingName } from "@/utils/formatBuildingName";
import { formatCountdown } from "@/utils/formatCountdown";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { getVillageStatus } from "@/utils/getVillageStatus";
import {
  canUseGoblinBuilder,
  getCurrentWorkForHireEventEnd,
  isWorkForHireActive,
} from "@/utils/goblin";
import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";
import { resyncNotifications } from "@/utils/notificationSync";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { emitWidgetUpdate } from "@/utils/widget/widgetEvents";
import { getBuilderWidgetData } from "@/widget/getBuilderWidgetData";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const isPro = usePremiumStore.getState().isPro;
  type AccountState = Awaited<ReturnType<typeof getAccountState>>;
  const [accountState, setAccountState] = useState<AccountState | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<Upgrade | null>(null);
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

  const builderCount = account?.builderCount ?? 0;
  const townHall = account?.townhall ?? 1;
  const [vote, setVoteState] = useState<Vote | null>(null);
  const refreshState = useCallback(async () => {
    if (!activeTag) return;
    const state = await getAccountState(activeTag);
    setAccountState(state);
  }, [activeTag]);

  useEffect(() => {
    if (activeTag) refreshState();
  }, [activeTag]);

  useFocusEffect(
    useCallback(() => {
      setVoteState(getFeatureVote("notes"));
    }, []),
  );

  const builders = useMemo(() => accountState?.builders ?? [], [accountState]);

  const pet = useMemo(() => accountState?.pet ?? null, [accountState]);
  const lab = accountState?.lab;

  useEffect(() => {
    track("screen_view", { screen: "home" });
  }, []);

  const busySlots = useMemo(() => {
    const map = new Set<number>();

    for (const u of builders) {
      if (typeof u.builderSlot === "number") {
        map.add(u.builderSlot);
      }
    }

    return map;
  }, [builders]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
      loadLastSync();
    }, []),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      const finished = builders.find((u) => u.endTime <= now);

      if (finished) {
        setCompletedId((current) => current ?? finished.id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [builders]);

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

      deleteUpgrade(completedId);
      await refreshState();
      emitWidgetUpdate();
      startSmartWidgetScheduler();
      await resyncNotifications();
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
      refreshState();
    }, [refreshState]),
  );

  useEffect(() => {
    const interval = setInterval(refreshState, 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshState]);

  const { config } = useRemoteConfig();

  const handleVote = (featureId: FeatureId, newVote: Vote) => {
    const currentVote = vote;

    if (currentVote === newVote) {
      clearFeatureVote(featureId);
      setVoteState(null);

      track("feature_vote_removed", {
        feature: featureId,
        previous: currentVote,
        screen: "home",
        townhall: profile?.townHallLevel ?? 0,
      });
      return;
    }

    setFeatureVote(featureId, newVote);
    setVoteState(newVote);

    track("feature_vote_set", {
      feature: featureId,
      vote: newVote,
      previous: currentVote ?? "none",
      screen: "home",
      townhall: profile?.townHallLevel ?? 0,
      builder_count: builderCount ?? 0,
      has_idle_builders: villageStatus?.freeBuilders > 0,
    });
  };

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
    activeUpgrades: builders,
  });

  const sortedUpgrades = [...builders].sort((a, b) => {
    const slotA =
      a.builderSlot === "G"
        ? 999
        : typeof a.builderSlot === "number"
          ? a.builderSlot
          : 999;

    const slotB =
      b.builderSlot === "G"
        ? 999
        : typeof b.builderSlot === "number"
          ? b.builderSlot
          : 999;

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
    if (nextUpgrade.builderSlot === "G") {
      nextBuilderLabel = "Goblin";
    } else if (typeof nextUpgrade.builderSlot === "number") {
      nextBuilderLabel = `B${nextUpgrade.builderSlot + 1}`;
    } else {
      nextBuilderLabel = "Builder";
    }
  }
  const handleRowLongPress = (upgrade: Upgrade) => {
    setSelectedUpgrade(upgrade);
    setActionModalVisible(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    await refreshState();

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
        nextUpgrade.subType,
        nextUpgrade.isCrafted,
        { townHallLevel: profile.townHallLevel },
      );
    }
  }

  const villageStatus = getVillageStatus({
    townHall,
    builders,
    builderCount,
    pet: townHall >= 14 ? pet : null,
    labNormal: lab?.normal,
    labGoblin: lab?.goblin,
  });

  let insightParts: string[] = [];

  if (villageStatus.freeBuilders > 0) {
    insightParts.push(`🚨 ${villageStatus.freeBuilders} builder idle`);
  }

  if (villageStatus.labIdle) {
    insightParts.push("🧪 Lab idle");
  }

  if (townHall >= 14 && villageStatus.petIdle) {
    insightParts.push("🐾 Pet idle");
  }

  const insight =
    insightParts.length > 0 ? insightParts.join(" • ") : "All systems running";
  const isUrgent = villageStatus.freeBuilders > 0;
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
                    {isPro && (
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
                          PRO
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Secondary Line */}
                  {profile.playerTag && (
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={styles.leagueIcon}>
                        <Image
                          source={getIconByEntityType(
                            1000001,
                            "building",
                            "TOWNHALL",
                            false,
                            { townHallLevel: profile.townHallLevel },
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
              <Pressable
                onPress={() => {
                  setSessionSource("app");
                  track("navigation", {
                    from: "home",
                    to: "upload-json",
                    trigger: "sync",
                  });
                  router.push("/upload-json");
                }}
              >
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
                  <Text
                    style={[
                      styles.statusInsight,
                      isUrgent && { color: "#ef4444", fontWeight: "600" },
                    ]}
                  >
                    {insight}
                  </Text>
                  <Text style={styles.statusCardTime}>
                    {status.allFree
                      ? "Ready to build"
                      : formatCountdown(remainingMs)}
                  </Text>
                  <View style={styles.builderIndicators}>
                    {/* Normal Builders */}
                    {Array.from({ length: builderCount }).map((_, i) => {
                      const isBusy = busySlots.has(i);

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
                        const goblinBusy = builders.some(
                          (u) => u.builderSlot === "G",
                        );

                        const goblinCanBeUsed = canUseGoblinBuilder(
                          profile,
                          builders,
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
            onPress={() => {
              setSessionSource("app");
              track("navigation", {
                from: "home",
                to: "add-upgrade",
                trigger: "add_upgrade_button",
              });
              router.push("/add-upgrade");
            }}
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
                const builderLabel =
                  u.builderSlot === "G"
                    ? "G"
                    : typeof u.builderSlot === "number"
                      ? `B${u.builderSlot + 1}`
                      : "?";
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
                          {isGoblin && (
                            <Image
                              source={require("@/assets/images/clash/goblin-builder.png")}
                              style={{ width: 15, height: 15, marginLeft: 2 }}
                            />
                          )}
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
                                      u.subType,
                                      u.isCrafted,
                                      {
                                        townHallLevel: profile.townHallLevel,
                                      },
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
                onPress={() => {
                  setSessionSource("app");
                  router.push("/upload-json");
                }}
              >
                <Text style={styles.emptyButtonText}>Get Started</Text>
              </Pressable>
            </View>
          )}

          <LabSection
            labNormal={lab?.normal}
            labGoblin={lab?.goblin}
            onAddPress={() => {
              setSessionSource("app");
              router.push("/add-upgrade?type=lab");
            }}
            onLongPress={handleRowLongPress}
          />

          {townHall >= 14 && (
            <PetSection
              pet={pet}
              townHall={townHall}
              onAddPress={() => {
                setSessionSource("app");
                router.push("/add-upgrade?type=pet");
              }}
              onLongPress={handleRowLongPress}
            />
          )}

          {/* 🔥 Notes (Coming Soon) */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>📝 Strategy Notes</Text>
              <Text style={styles.comingSoonBadge}>Coming Soon</Text>
            </View>

            <Text style={styles.notesSubtitle}>
              Plan upgrades, avoid idle builders, and optimize your entire
              village strategy
            </Text>

            <View style={styles.notesPreview}>
              <Text style={styles.notesPreviewText}>
                • Upgrade Inferno Tower after TH14 unlock
              </Text>

              {villageStatus.freeBuilders > 0 && (
                <Text style={styles.notesPreviewText}>
                  • You have {villageStatus.freeBuilders} idle builder — assign
                  now
                </Text>
              )}

              {villageStatus.labIdle && (
                <Text style={styles.notesPreviewText}>
                  • Lab is idle — start research
                </Text>
              )}
              <Text style={styles.notesPreviewText}>
                • Save Dark Elixir for Royal Champion
              </Text>
              <Text style={styles.notesPreviewText}>
                • Keep 1 builder free for walls
              </Text>
            </View>

            {/* Feedback */}
            <View style={styles.notesFeedbackRow}>
              <Text style={styles.feedbackText}>Want this feature?</Text>

              <View style={styles.feedbackButtons}>
                <Pressable
                  style={[
                    styles.feedbackButton,
                    vote === "like" && styles.feedbackButtonActive,
                  ]}
                  onPress={() => handleVote("notes", "like")}
                >
                  <Ionicons
                    name="thumbs-up"
                    size={16}
                    color={vote === "like" ? "#22c55e" : "#64748b"}
                  />
                </Pressable>

                <Pressable
                  style={[
                    styles.feedbackButton,
                    vote === "dislike" && styles.feedbackButtonActive,
                  ]}
                  onPress={() => handleVote("notes", "dislike")}
                >
                  <Ionicons
                    name="thumbs-down"
                    size={16}
                    color={vote === "dislike" ? "#ef4444" : "#64748b"}
                  />
                </Pressable>
              </View>
            </View>

            {vote && (
              <Text style={{ color: "#22c55e", fontSize: 11 }}>
                Thanks for your feedback
              </Text>
            )}
            {vote === "like" && (
              <Text style={{ color: "#fbbf24", fontSize: 11 }}>
                🚀 We&apos;ll prioritize this for you
              </Text>
            )}
          </View>

          <View style={styles.refreshHint}>
            <Ionicons name="arrow-down" size={16} color="#64748b" />
            <Text style={styles.refreshHintText}>Pull down to refresh</Text>
          </View>

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
                  params: {
                    editId: selectedUpgrade?.id,
                    type: selectedUpgrade?.upgradeType?.toLowerCase(),
                  },
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

                // await cancelBuilderNotification(selectedUpgrade.id);
                await deleteUpgrade(selectedUpgrade.id);
                emitWidgetUpdate();
                await resyncNotifications();
                startSmartWidgetScheduler();
                await refreshState();
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
          setProfileSheetVisible(false);
        }}
        onOpenProfile={() => {
          setProfileSheetVisible(false);
          track("navigation", {
            from: "dropdown",
            to: "profile",
          });
          router.push("/profile");
        }}
        onSync={() => {
          setProfileSheetVisible(false);
          track("navigation", {
            from: "dropdown",
            to: "upload-json",
          });
          router.push("/upload-json");
        }}
        onSetting={() => {
          setProfileSheetVisible(false);
          track("navigation", {
            from: "dropdown",
            to: "settings",
          });
          router.push("/(tabs)/settings");
        }}
      />

      {/* Floating Action Button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => {
          track("navigation", {
            from: "home",
            to: "add-upgrade",
            trigger: "fab",
          });
          router.push("/add-upgrade");
        }}
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

  statusInsight: {
    fontSize: 13,
    color: "94a3b8",
    fontWeight: "400",
    marginTop: 2,
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
    backgroundColor: "#ef4444",
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
    backgroundColor: "#ef4444",
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
  notesCard: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },

  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  notesTitle: {
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: "600",
  },

  comingSoonBadge: {
    color: "#94a3b8",
    fontSize: 11,
  },

  notesSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 18,
  },

  notesPreview: {
    marginBottom: 12,
  },

  notesPreviewText: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },

  notesFeedbackRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  feedbackText: {
    color: "#94a3b8",
    fontSize: 12,
  },

  feedbackButtons: {
    flexDirection: "row",
    gap: 12,
  },

  feedbackButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(148,163,184,0.08)",
  },

  feedbackButtonActive: {
    backgroundColor: "rgba(148,163,184,0.2)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.3)",
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
