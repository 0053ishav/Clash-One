import GoblinEventBanner from "@/components/GoblinEventBanner";
import { LabSection } from "@/components/home/LabSection";
import { PetSection } from "@/components/home/PetSection";
import ProfileDropdownSheet from "@/components/ProfileSheet/ProfileDropdownSheet";
import { SupportModal } from "@/components/SupportModal";
import { XPBadge } from "@/components/XPBadge";
import { ENV } from "@/config/env";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { useRemoteConfig } from "@/provider/remoteConfigProvider";
import { getAccountState } from "@/services/accountStateService";
import { buildSupportInfo } from "@/services/supportDebugInfo";
import { deleteUpgrade } from "@/services/upgradeService";
import { setOnboardingIncomplete } from "@/storage/appConfig";
import {
  setGoblinBannerDismissedUntil,
  shouldShowGoblinBanner,
} from "@/storage/goblinStorage";
import { useAccountStore } from "@/stores/accountStore";
import { usePremiumStore } from "@/stores/premiumStore";
import { Village } from "@/types/entity";
import { Upgrade } from "@/types/upgrade";
import { setSessionSource, track } from "@/utils/analytics/analytics";
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
import {
  FALLBACK_ICON,
  resolveEntityIcon,
} from "@/utils/icons/resolveEntityIcon";
import { resyncNotifications } from "@/utils/notificationSync";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { getBuilderBaseBuilderStatus } from "@/utils/status/builderBase/getBuilderBaseBuilderStatus";
import { getBuilderBaseVillageStatus } from "@/utils/status/builderBase/getBuilderBaseVillageStatus";
import { getBuilderStatus } from "@/utils/status/home/builderStatus";
import { getVillageStatus } from "@/utils/status/home/getVillageStatus";
import { emitWidgetUpdate } from "@/utils/widget/widgetEvents";
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
  useWindowDimensions,
} from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

export default function HomeScreen() {
  const router = useRouter();
  const isPremium = usePremiumStore((s) => s.isPremium);
  type AccountState = Awaited<ReturnType<typeof getAccountState>>;
  const [accountState, setAccountState] = useState<AccountState | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<Upgrade | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [profileSheetVisible, setProfileSheetVisible] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<Village>("home");
  const translateX = useSharedValue(0);
  const { getCraftedName, getModuleName } = useCraftedResolver();

  const activeTag = useAccountStore((s) => s.activeTag);
  const { profile } = usePlayerProfile();
  const isLoadingProfile = useAccountStore((s) => s.isLoadingProfile);
  const lastJsonSyncMap = useAccountStore((s) => s.lastJsonSyncMap);
  const lastSync = activeTag ? lastJsonSyncMap[activeTag] : null;
  const accounts = useAccountStore((s) => s.accounts);
  const activeAccount = accounts.find((a) => a.tag === activeTag);

  const builderCount = activeAccount?.builderCount ?? 1;
  const townHall = profile?.townHallLevel ?? 1;

  const builderBaseBuilders = accountState?.builders.builderBase ?? [];

  const builderBaseBuilderCount = activeAccount?.builderBaseBuilderCount ?? 2;

  const [showSupport, setShowSupport] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const refreshState = useCallback(async () => {
    if (!activeTag) return;
    const state = await getAccountState(activeTag);
    setAccountState(state);
  }, [activeTag]);

  const { width } = useWindowDimensions();

  useEffect(() => {
    if (activeTag) refreshState();
  }, [activeTag, refreshState]);

  const builders = useMemo(
    () =>
      selectedVillage === "home"
        ? (accountState?.builders.home ?? [])
        : (accountState?.builders.builderBase ?? []),
    [accountState, selectedVillage],
  );

  const lab = useMemo(
    () =>
      selectedVillage === "home"
        ? accountState?.lab.home
        : accountState?.lab.builderBase,
    [accountState, selectedVillage],
  );

  const pet = useMemo(
    () => (selectedVillage === "home" ? (accountState?.pet ?? null) : null),
    [accountState, selectedVillage],
  );

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
      await performSync();
      setCompletedId(null);
    }, 800);
    return () => clearTimeout(timeout);
  }, [completedId, refreshState]);

  useFocusEffect(
    useCallback(() => {
      refreshState();
    }, [refreshState]),
  );

  useEffect(() => {
    const interval = setInterval(refreshState, 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshState]);

  const TAB_WIDTH = (width - 4 * 2) / 2;

  useEffect(() => {
    translateX.value = withTiming(selectedVillage === "home" ? 0 : TAB_WIDTH, {
      duration: 0,
    });
  });

  const performSync = useCallback(async () => {
    await refreshState();
    emitWidgetUpdate();
    startSmartWidgetScheduler();
    await resyncNotifications();
  }, [refreshState]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      await performSync();
    } finally {
      setRefreshing(false);
    }
  }, [performSync, refreshing]);

  const { config } = useRemoteConfig();

  const changeVillage = (village: "home" | "builderBase") => {
    if (village === selectedVillage) return;
    setSelectedVillage(village);
    translateX.value = withTiming(village === "home" ? 0 : TAB_WIDTH, {
      duration: 220,
    });
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-25, 25])
    .failOffsetY([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -70 && selectedVillage === "home") {
        scheduleOnRN(changeVillage, "builderBase");
      }
      if (e.translationX > 70 && selectedVillage === "builderBase") {
        scheduleOnRN(changeVillage, "home");
      }
    });

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
          <Text style={styles.loadingTitle}>Switching Village</Text>
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
          <Text style={styles.loadingTitle}>No Village Connected</Text>
          <Pressable
            onPress={() => router.replace("/add-account")}
            style={styles.connectButton}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isGoblinActive = config.goblinBuilderEnabled && isWorkForHireActive();
  const eventEndsAt = getCurrentWorkForHireEventEnd();
  const showBanner = !!eventEndsAt && shouldShowGoblinBanner(eventEndsAt);
  const isStale = lastSync && Date.now() - lastSync > 1000 * 60 * 60 * 12;

  const status = getBuilderStatus({
    village: "home",
    normalBuilderCount: builderCount,
    goblinBuilderUnlocked: isGoblinActive,
    activeUpgrades: builders,
  });

  const builderBaseStatus = getBuilderBaseBuilderStatus({
    builderCount: builderBaseBuilderCount,
    activeUpgrades: accountState?.builders.builderBase ?? [],
  });

  const builderBaseVillageStatus = getBuilderBaseVillageStatus({
    builders: accountState?.builders.builderBase ?? [],
    builderCount: builderBaseBuilderCount,
    lab: accountState?.lab.builderBase.normal,
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

  const builderBaseSortedUpgrades = [...builderBaseBuilders].sort((a, b) => {
    const slotA = typeof a.builderSlot === "number" ? a.builderSlot : 999;

    const slotB = typeof b.builderSlot === "number" ? b.builderSlot : 999;

    return slotA - slotB;
  });

  const nextUpgrade =
    sortedUpgrades.length > 0
      ? sortedUpgrades.reduce((prev, curr) =>
          prev.endTime < curr.endTime ? prev : curr,
        )
      : null;

  const builderBaseNextUpgrade =
    builderBaseSortedUpgrades.length > 0
      ? builderBaseSortedUpgrades.reduce((prev, curr) =>
          prev.endTime < curr.endTime ? prev : curr,
        )
      : null;

  const remainingMs = nextUpgrade
    ? Math.max(nextUpgrade.endTime - Date.now(), 0)
    : 0;

  const builderBaseRemainingMs = builderBaseNextUpgrade
    ? Math.max(builderBaseNextUpgrade.endTime - Date.now(), 0)
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

  let builderBaseNextBuilderLabel: string | undefined;

  if (builderBaseNextUpgrade) {
    if (typeof builderBaseNextUpgrade.builderSlot === "number") {
      builderBaseNextBuilderLabel = `B${builderBaseNextUpgrade.builderSlot + 1}`;
    } else {
      builderBaseNextBuilderLabel = "Builder";
    }
  }
  const handleRowLongPress = (upgrade: Upgrade) => {
    setSelectedUpgrade(upgrade);
    setActionModalVisible(true);
  };

  let statusIcon = require("@/assets/images/builder/builder-idle.png");
  if (!status.allFree && nextUpgrade?.dataId) {
    statusIcon = resolveEntityIcon(nextUpgrade.dataId, {
      isCrafted: nextUpgrade.isCrafted,
      context: { hallLevel: profile.townHallLevel },
    });
  }

  let builderBaseStatusIcon = require("@/assets/images/builder/builder-idle.png");

  if (!builderBaseStatus.allFree && builderBaseNextUpgrade?.dataId) {
    builderBaseStatusIcon = resolveEntityIcon(builderBaseNextUpgrade.dataId, {
      isCrafted: builderBaseNextUpgrade.isCrafted,
      context: {
        hallLevel: profile.builderHallLevel,
      },
    });
  }

  const villageStatus = getVillageStatus({
    townHall,
    builders,
    builderCount,
    pet: townHall >= 14 ? pet : null,
    labNormal: lab?.normal,
    labGoblin: lab?.goblin,
    goblinAvailable: lab?.goblinAvailable,
  });

  let insightParts: string[] = [];

  if (selectedVillage === "home") {
    if (villageStatus.freeBuilders > 0) {
      insightParts.push(`🚨 ${villageStatus.freeBuilders} builder idle`);
    }

    if (villageStatus.goblinBuilderIdle) {
      insightParts.push("⚒️ Goblin Builder idle");
    }

    if (villageStatus.labIdle) {
      insightParts.push("🧪 Lab idle");
    }

    if (villageStatus.goblinLabIdle) {
      insightParts.push("🧪 Goblin Lab idle");
    }

    if (townHall >= 14 && villageStatus.petIdle) {
      insightParts.push("🐾 Pet idle");
    }
  } else {
    if (builderBaseVillageStatus.freeBuilders > 0) {
      insightParts.push(
        `🚨 ${builderBaseVillageStatus.freeBuilders}/3 builders idle`,
      );
    }

    if (builderBaseVillageStatus.labIdle) {
      insightParts.push("🧪 Star Laboratory idle");
    }
  }

  const insight =
    insightParts.length > 0
      ? insightParts.join(" • ")
      : selectedVillage === "home"
        ? "All systems running"
        : "All Builder Base systems running";

  const isUrgent =
    selectedVillage === "home"
      ? villageStatus.freeBuilders > 0
      : builderBaseVillageStatus.freeBuilders > 0 ||
        builderBaseVillageStatus.labIdle;

  const currentStatus = selectedVillage === "home" ? status : builderBaseStatus;

  const currentNextUpgrade =
    selectedVillage === "home" ? nextUpgrade : builderBaseNextUpgrade;

  const currentRemainingMs =
    selectedVillage === "home" ? remainingMs : builderBaseRemainingMs;

  const currentNextBuilderLabel =
    selectedVillage === "home" ? nextBuilderLabel : builderBaseNextBuilderLabel;

  const currentStatusIcon =
    selectedVillage === "home" ? statusIcon : builderBaseStatusIcon;

  const currentBuilderCount =
    selectedVillage === "home" ? builderCount : builderBaseBuilderCount;

  const openSupport = async () => {
    const info = await buildSupportInfo();
    setDebugInfo(info);
    setShowSupport(true);
  };

  // Derive initials from player name for avatar
  const playerInitials = activeAccount?.name
    ? activeAccount?.name.slice(0, 2).toUpperCase()
    : "??";

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "#0f172a" }}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Home</Text>
          <View style={styles.syncBlock}>
            <View style={styles.actionRow}>
              <Pressable onPress={openSupport} hitSlop={8}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={21}
                  color="#94a3b8"
                />
              </Pressable>
              <Pressable
                hitSlop={8}
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
                  size={21}
                  color={isStale ? "#fbbf24" : "#fff"}
                />
              </Pressable>
            </View>
            {lastSync && (
              <Text style={styles.syncText}>
                Synced {formatTimeAgo(lastSync)} ago
              </Text>
            )}
          </View>
        </View>

        {/* Profile row */}
        <Pressable
          style={styles.profileRow}
          onPress={() => setProfileSheetVisible(true)}
        >
          {/* Avatar circle */}
          <View style={[styles.avatar, { borderColor: activeAccount?.color }]}>
            <Text style={[styles.avatarText, { color: activeAccount?.color }]}>
              {playerInitials}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName} numberOfLines={1}>
                {profile.playerTag ? profile.playerName : "No Profile Synced"}
              </Text>
              {profile.leagueTierIconUrl && (
                <Image
                  source={{ uri: profile.leagueTierIconUrl }}
                  style={styles.leagueIcon}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              )}
              {isPremium && (
                <View style={styles.chiefBadge}>
                  <Text style={styles.chiefBadgeText}>Chief</Text>
                </View>
              )}
            </View>

            {profile.playerTag && (
              <View style={styles.profileMeta}>
                {typeof profile.expLevel === "number" && (
                  <XPBadge level={profile.expLevel} />
                )}
                <Image
                  source={{
                    uri: resolveEntityIcon(1000001, {
                      context: { hallLevel: profile.townHallLevel },
                    }),
                  }}
                  style={styles.hallIcon}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
                {typeof profile.trophies === "number" && (
                  <View style={styles.trophyRow}>
                    <Image
                      source={{
                        uri: `${ENV.CDN_BASE}/entities/other/trophy.png`,
                      }}
                      style={styles.trophyIcon}
                      contentFit="contain"
                    />
                    <Text style={styles.profileSub}>{profile.trophies}</Text>
                  </View>
                )}
                <View style={styles.metaDot} />
                <Image
                  source={{
                    uri: resolveEntityIcon(1000034, {
                      context: { hallLevel: profile.builderHallLevel },
                    }),
                  }}
                  style={styles.hallIcon}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
                {typeof profile.builderBaseTrophies === "number" && (
                  <View style={styles.trophyRow}>
                    <Image
                      source={{
                        uri: `${ENV.CDN_BASE}/entities/other/trophy.png`,
                      }}
                      style={styles.trophyIcon}
                      contentFit="contain"
                    />
                    <Text style={styles.profileSub}>
                      {profile.builderBaseTrophies}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={styles.chevronButton}>
            <Ionicons name="chevron-down" size={14} color="#94a3b8" />
          </View>
        </Pressable>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fbbf24"
            colors={["#fbbf24"]}
            progressBackgroundColor="#1e293b"
          />
        }
      >
        {/* ── Status Card ── */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardTop}>
            <View style={styles.statusIconBox}>
              <Image
                source={currentStatusIcon}
                style={styles.statusCardIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>
            <View style={styles.statusBody}>
              <Text style={styles.statusEyebrow}>
                {currentStatus.allFree
                  ? "All builders free"
                  : `Next free · ${currentNextBuilderLabel}`}
              </Text>
              <Text style={styles.statusCountdown}>
                {currentStatus.allFree
                  ? "Start an upgrade"
                  : formatCountdown(currentRemainingMs)}
              </Text>
              {!currentStatus.allFree && currentNextUpgrade && (
                <Text style={styles.statusSub} numberOfLines={1}>
                  {currentNextUpgrade.entity
                    ? formatBuildingName(currentNextUpgrade.entity)
                    : "Upgrade"}
                  finishing first
                </Text>
              )}
            </View>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusBottom}>
            <Text
              style={[styles.insightText, isUrgent && styles.insightUrgent]}
              numberOfLines={1}
            >
              {insight}
            </Text>
            <View style={styles.builderDots}>
              {Array.from({ length: currentBuilderCount }).map((_, i) => {
                const isBusy = (
                  selectedVillage === "home"
                    ? busySlots
                    : new Set(
                        builderBaseBuilders
                          .filter((u) => typeof u.builderSlot === "number")
                          .map((u) => u.builderSlot as number),
                      )
                ).has(i);
                return (
                  <View
                    key={`normal-${i}`}
                    style={[
                      styles.builderDot,
                      isBusy ? styles.builderDotBusy : styles.builderDotFree,
                    ]}
                  />
                );
              })}
              {selectedVillage === "home" &&
                isGoblinActive &&
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

        {showBanner && eventEndsAt && (
          <GoblinEventBanner
            eventEndsAt={eventEndsAt}
            onDismiss={() => setGoblinBannerDismissedUntil(eventEndsAt)}
          />
        )}

        {/* Village tabs */}
        <View style={styles.villageTabs}>
          <Animated.View
            style={[
              styles.villageIndicator,
              { width: TAB_WIDTH },
              indicatorStyle,
            ]}
          />
          <Pressable
            onPress={() => changeVillage("home")}
            style={styles.villageTab}
          >
            <Image
              source={{
                uri: resolveEntityIcon(1000001, {
                  context: { hallLevel: profile.townHallLevel },
                }),
              }}
              style={[
                styles.villageIcon,
                selectedVillage !== "home" && styles.villageIconInactive,
              ]}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
            <Text
              style={[
                styles.villageTabLabel,
                selectedVillage === "home" && styles.villageTabLabelActive,
              ]}
            >
              Home
            </Text>
            <View
              style={[
                styles.villageHallBadge,
                selectedVillage === "home" && styles.villageHallBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.villageHallBadgeText,
                  selectedVillage === "home" &&
                    styles.villageHallBadgeTextActive,
                ]}
              >
                TH{profile.townHallLevel}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => changeVillage("builderBase")}
            style={styles.villageTab}
          >
            <Image
              source={{
                uri: resolveEntityIcon(1000034, {
                  context: { hallLevel: profile.builderHallLevel },
                }),
              }}
              style={[
                styles.villageIcon,
                selectedVillage !== "builderBase" && styles.villageIconInactive,
              ]}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
            <Text
              style={[
                styles.villageTabLabel,
                selectedVillage === "builderBase" &&
                  styles.villageTabLabelActive,
              ]}
            >
              Builder
            </Text>
            <View
              style={[
                styles.villageHallBadge,
                selectedVillage === "builderBase" &&
                  styles.villageHallBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.villageHallBadgeText,
                  selectedVillage === "builderBase" &&
                    styles.villageHallBadgeTextActive,
                ]}
              >
                BH{profile.builderHallLevel}
              </Text>
            </View>
          </Pressable>
        </View>

        <GestureDetector gesture={swipeGesture}>
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(120)}
            key={selectedVillage}
          >
            {/* Active Upgrades */}
            {sortedUpgrades.length > 0 && (
              <View style={styles.upgradesSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>Active upgrades</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {sortedUpgrades.length}
                    </Text>
                  </View>
                </View>

                {sortedUpgrades.map((u) => {
                  const uRemainingMs = Math.max(u.endTime - Date.now(), 0);
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
                        {/* Builder chip */}
                        <View
                          style={[
                            styles.builderBadge,
                            isGoblin && styles.goblinBadge,
                          ]}
                        >
                          <Text style={styles.builderBadgeText}>
                            {builderLabel}
                          </Text>
                          {isGoblin && (
                            <Image
                              source={require("@/assets/images/clash/goblin-builder.png")}
                              style={styles.goblinBadgeIcon}
                              contentFit="contain"
                            />
                          )}
                        </View>

                        {/* Main row */}
                        <View style={styles.upgradeMain}>
                          <View style={styles.upgradeLeft}>
                            <View style={styles.iconContainer}>
                              <Image
                                source={{
                                  uri: u.dataId
                                    ? resolveEntityIcon(u.dataId, {
                                        subType: u.subType,
                                        isCrafted: u.isCrafted,
                                        context: {
                                          hallLevel: profile.townHallLevel,
                                        },
                                      })
                                    : FALLBACK_ICON,
                                }}
                                style={styles.upgradeIcon}
                                contentFit="contain"
                                cachePolicy="memory-disk"
                              />
                            </View>

                            <View style={styles.upgradeNameSection}>
                              <Text
                                style={styles.upgradeName}
                                numberOfLines={1}
                              >
                                {u.isCrafted
                                  ? `${getCraftedName(u.dataId) ?? "Crafted"}${
                                      getModuleName(u.dataId, u.moduleId)
                                        ? ` (${getModuleName(u.dataId, u.moduleId)})`
                                        : ""
                                    }`
                                  : formatBuildingName(u.entity)}
                              </Text>

                              <View style={{ flexDirection: "row", gap: 4 }}>
                                {u.currentLevel !== undefined &&
                                  u.nextLevel !== undefined && (
                                    <View style={styles.levelsBadge}>
                                      <Text style={styles.levelsText}>
                                        Lv {u.currentLevel} → Lv {u.nextLevel}
                                      </Text>
                                    </View>
                                  )}
                                {u.hasHelper && (
                                  <View style={styles.helperRow}>
                                    <Image
                                      source={{
                                        uri: resolveEntityIcon(93000000),
                                      }}
                                      style={styles.helperIcon}
                                      contentFit="contain"
                                      cachePolicy="memory-disk"
                                    />
                                    {!!u.helperAppliedSeconds && (
                                      <Text style={styles.helperSaved}>
                                        -
                                        {formatCountdown(
                                          u.helperAppliedSeconds * 1000,
                                        )}
                                      </Text>
                                    )}
                                    {u.recurrentHelper && (
                                      <View style={styles.recurrentBadge}>
                                        <Ionicons
                                          name="repeat"
                                          size={10}
                                          color="#fbbf24"
                                        />
                                      </View>
                                    )}
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>

                          <View style={styles.upgradeRight}>
                            <Text style={styles.remainingTime}>
                              {formatCountdown(uRemainingMs)}
                            </Text>
                            <Text style={styles.totalTimeText}>
                              of {formatCountdown(totalMs)}
                            </Text>
                          </View>
                        </View>

                        {/* Progress bar */}
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${progress * 100}%` },
                              isGoblin && styles.progressBarGoblin,
                            ]}
                          />
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Empty state */}
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
              village={selectedVillage}
              labNormal={lab?.normal}
              labGoblin={lab?.goblin}
              onLongPress={handleRowLongPress}
            />

            {selectedVillage === "home" && townHall >= 14 && (
              <PetSection
                pet={pet}
                townHall={townHall}
                onLongPress={handleRowLongPress}
              />
            )}
          </Animated.View>
        </GestureDetector>

        <View style={styles.refreshHint}>
          <Ionicons name="arrow-down" size={14} color="#475569" />
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
      {/* Action Modal */}
      <Modal
        transparent
        visible={actionModalVisible}
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}
      >
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
              onPress={async () => {
                if (!selectedUpgrade) return;
                await deleteUpgrade(selectedUpgrade.id);
                await performSync();
                setActionModalVisible(false);
              }}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(248,113,113,0.15)" },
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
      <SupportModal
        visible={showSupport}
        onClose={() => setShowSupport(false)}
        debugInfo={debugInfo}
      />
      <ProfileDropdownSheet
        visible={profileSheetVisible}
        onClose={() => setProfileSheetVisible(false)}
        onOpenProfile={() => {
          setProfileSheetVisible(false);
          track("navigation", { from: "dropdown", to: "profile" });
          router.push("/profile");
        }}
        onSync={() => {
          setProfileSheetVisible(false);
          track("navigation", { from: "dropdown", to: "upload-json" });
          router.push("/upload-json");
        }}
        onSetting={() => {
          setProfileSheetVisible(false);
          track("navigation", { from: "dropdown", to: "settings" });
          router.push("/(tabs)/settings");
        }}
      />
    </SafeAreaView>
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
    backgroundColor: "rgba(148,163,184,0.4)",
  },

  connectButton: {
    height: 52,
    backgroundColor: "#fbbf24",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  connectButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  scrollContent: {
    paddingTop: 0,
    paddingBottom: 140,
  },

  // ── Header ──
  header: {
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#fbbf24",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },

  syncBlock: {
    alignItems: "flex-end",
    gap: 3,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  syncText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "500",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    alignSelf: "flex-start",
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1e3a5f",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  profileInfo: {
    minWidth: 0,
  },

  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  profileName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f1f5f9",
    flexShrink: 1,
  },

  chevronButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },

  leagueIcon: {
    width: 16,
    height: 16,
  },

  chiefBadge: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },

  chiefBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0f172a",
  },

  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },

  hallIcon: {
    width: 16,
    height: 16,
  },

  trophyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  trophyIcon: {
    width: 9,
    height: 9,
  },

  profileSub: {
    fontSize: 10,
    color: "#64748b",
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#334155",
  },

  // ── Status Card ──
  statusCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 14,
    backgroundColor: "#1e293b",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#263244",
    overflow: "hidden",
  },

  statusCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },

  statusIconBox: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  statusCardIcon: {
    width: 36,
    height: 36,
  },

  statusBody: {
    flex: 1,
    gap: 2,
  },

  statusEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  statusCountdown: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fbbf24",
    lineHeight: 26,
  },

  statusSub: {
    fontSize: 11,
    color: "#64748b",
  },

  statusDivider: {
    height: 1,
    backgroundColor: "#263244",
    marginHorizontal: 14,
  },

  statusBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  insightText: {
    fontSize: 11,
    color: "#64748b",
    flex: 1,
    marginRight: 8,
  },

  insightUrgent: {
    color: "#ef4444",
    fontWeight: "600",
  },

  builderDots: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
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

  goblinDotFree: {
    backgroundColor: "#22c55e",
    borderWidth: 1.5,
    borderColor: "rgba(34,197,94,0.35)",
  },

  goblinDotBusy: {
    backgroundColor: "#ef4444",
  },

  goblinDotInactive: {
    backgroundColor: "rgba(66,247,126,0.2)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.25)",
  },

  // ── Village tabs ──
  villageTabs: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderRadius: 999,
    padding: 4,
    height: 48,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 14,
  },

  villageTab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    zIndex: 10,
  },

  villageIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#fbbf24",
    zIndex: 1,
  },

  villageIcon: {
    width: 20,
    height: 20,
  },

  villageIconInactive: {
    opacity: 0.4,
  },

  villageTabLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
  },

  villageTabLabelActive: {
    color: "#0f172a",
  },

  villageHallBadge: {
    backgroundColor: "rgba(251,191,36,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },

  villageHallBadgeActive: {
    backgroundColor: "rgba(15,23,42,0.15)",
  },

  villageHallBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fbbf24",
  },

  villageHallBadgeTextActive: {
    color: "#0f172a",
  },

  // ── Upgrade list ──
  upgradesSection: {
    paddingHorizontal: 16,
    gap: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  countBadge: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },

  countBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },

  upgradeCard: {
    borderRadius: 14,
    overflow: "visible",
    marginBottom: 8,
  },

  upgradeCardCompleted: {
    // shadow handled on content
  },

  upgradeContent: {
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#263244",
    gap: 10,
  },

  upgradeContentCompleted: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },

  goblinUpgradeCard: {
    // border handled on content via goblinUpgradeContent — kept here as container hook
  },

  goblinBadge: {
    backgroundColor: "#22c55e",
  },

  builderBadge: {
    position: "absolute",
    top: -7,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbbf24",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    zIndex: 10,
  },

  builderBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0f172a",
  },

  goblinBadgeIcon: {
    width: 13,
    height: 13,
    marginLeft: 3,
  },

  upgradeMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  upgradeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: "rgba(251,191,36,0.1)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  upgradeIcon: {
    width: 30,
    height: 30,
  },

  upgradeNameSection: {
    gap: 4,
    flex: 1,
  },

  upgradeName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  levelsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(14,165,233,0.12)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: "flex-start",
  },

  levelsText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0ea5e9",
  },

  helperRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  helperIcon: {
    width: 13,
    height: 13,
  },

  helperSaved: {
    marginLeft: 3,
    fontSize: 10,
    color: "#94a3b8",
  },

  recurrentBadge: {
    marginLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  upgradeRight: {
    alignItems: "flex-end",
    gap: 2,
    flexShrink: 0,
  },

  remainingTime: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fbbf24",
  },

  totalTimeText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "500",
  },

  progressTrack: {
    height: 3,
    backgroundColor: "rgba(148,163,184,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#fbbf24",
    borderRadius: 2,
  },

  progressBarGoblin: {
    backgroundColor: "#22c55e",
  },

  // ── Empty state ──
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 30,
    gap: 14,
  },

  emptyIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(251,191,36,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  emptyIcon: {
    width: 56,
    height: 56,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f1f5f9",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 26,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#fbbf24",
  },

  emptyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },

  // ── Refresh hint ──
  refreshHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 18,
  },

  refreshHintText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "500",
  },

  // ── Dev buttons ──
  devButton: {
    alignSelf: "center",
    marginTop: 16,
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
    marginTop: 16,
    marginBottom: 16,
  },

  resetButtonText: {
    color: "#475569",
    fontSize: 12,
  },

  // ── Action Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
    gap: 14,
  },

  modalHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#f1f5f9",
    marginBottom: 4,
  },

  modalDivider: {
    height: 1,
    backgroundColor: "#263244",
    marginVertical: 4,
  },

  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
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
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  modalButtonDelete: {
    color: "#ef4444",
  },

  modalCancel: {
    paddingVertical: 13,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#263244",
  },

  modalCancelPressed: {
    opacity: 0.8,
  },

  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#94a3b8",
  },

  // ── misc kept for other usage ──
  addButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
});
