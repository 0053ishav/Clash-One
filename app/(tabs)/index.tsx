import GoblinEventBanner from "@/components/GoblinEventBanner";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { cancelBuilderNotification } from "@/services/notifications/builderNotificationService";
import { setOnboardingIncomplete } from "@/storage/appConfig";
import {
  deleteBuilderUpgrade,
  getActiveBuilderUpgrades,
} from "@/storage/builderUpgrades";
import {
  setGoblinBannerDismissedUntil,
  shouldShowGoblinBanner,
} from "@/storage/goblinStorage";
import { BuilderUpgrade } from "@/types/upgrade";
import { getBuilderStatus } from "@/utils/builderStatus";
import { calculateProgress } from "@/utils/calculateProgress";
import { formatBuildingName } from "@/utils/formatBuildingName";
import { formatCountdown } from "@/utils/formatCountdown";
import {
  canUseGoblinBuilder,
  getCurrentWorkForHireEventEnd,
  isWorkForHireActive,
} from "@/utils/goblin";
import { renderBuilderWidget } from "@/utils/renderBuilderWidget";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { BuilderStatusWidget } from "@/widget/BuilderStatusWidget";
import { getBuilderWidgetData } from "@/widget/getBuilderWidgetData";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  LayoutAnimation,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  requestWidgetUpdate,
  WidgetPreview,
} from "react-native-android-widget";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [loadingScaleAnim] = useState(new Animated.Value(0.8));
  const [contentFadeAnim] = useState(new Animated.Value(0));

  const [activeUpgrades, setActiveUpgrades] = useState<BuilderUpgrade[]>([]);
  const [selectedUpgrade, setSelectedUpgrade] = useState<BuilderUpgrade | null>(
    null,
  );
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Loading animation - pulse effect
  useEffect(() => {
    if (!isLoading) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingScaleAnim, {
          toValue: 1.05,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(loadingScaleAnim, {
          toValue: 0.95,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [isLoading, loadingScaleAnim]);

  useEffect(() => {
    if (isLoading) {
      contentFadeAnim.setValue(0);
    } else {
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, contentFadeAnim]);

  const refreshUpgrades = useCallback(() => {
    setActiveUpgrades(getActiveBuilderUpgrades());
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        refreshUpgrades();
        await new Promise((res) => setTimeout(res, 800));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [refreshUpgrades]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setActiveUpgrades((prev) => {
        const finished = prev.find((u) => u.endTime <= now);

        if (finished && !completedId) {
          setCompletedId(finished.id);
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [completedId]);

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

      await requestWidgetUpdate({
        widgetName: "BuilderStatusWidget",
        renderWidget: renderBuilderWidget,
      });

      startSmartWidgetScheduler();

      setCompletedId(null);
    }, 800);

    return () => clearTimeout(timeout);
  }, [completedId]);

  const data = getBuilderWidgetData();

  useFocusEffect(
    useCallback(() => {
      refreshUpgrades();
    }, [refreshUpgrades]),
  );

  useEffect(() => {
    const interval = setInterval(refreshUpgrades, 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshUpgrades]);

  const { profile } = usePlayerProfile();
  const builderCount = profile.normalBuilderCount;

  const isGoblinActive = isWorkForHireActive();
  const eventEndsAt = getCurrentWorkForHireEventEnd();

  const showBanner = !!eventEndsAt && shouldShowGoblinBanner(eventEndsAt);

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

    await requestWidgetUpdate({
      widgetName: "BuilderStatusWidget",
      renderWidget: renderBuilderWidget,
    });

    startSmartWidgetScheduler();

    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Animated.View
              style={[
                styles.loadingContent,
                {
                  transform: [{ scale: loadingScaleAnim }],
                },
              ]}
            >
              <View style={styles.glowBg} />

              <View style={styles.imageWrapper}>
                <Image
                  source={require("@/assets/images/builder/builder-working.png")}
                  style={styles.builderImage}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.loadingTitle}>Waking Builders...</Text>
            </Animated.View>
          </View>
        )}
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              opacity: contentFadeAnim,
            },
          ]}
        >
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
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.headerTitle}>Builder Status</Text>
              <Text style={styles.headerSubtitle}>Track your upgrades</Text>
            </Animated.View>
            {/* Premium Status Card */}
            <Animated.View
              style={[
                styles.statusCardContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.statusCard}>
                <View style={styles.statusCardContent}>
                  <View style={styles.statusIconContainer}>
                    <Image
                      source={
                        status.allFree
                          ? require("@/assets/images/builder/builder-idle.png")
                          : require("@/assets/images/builder/builder-working.png")
                      }
                      style={styles.statusCardIcon}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.statusInfo}>
                    <Text style={styles.statusCardLabel}>
                      {status.allFree
                        ? "All Builders Free"
                        : `Next Builder Ready: ${nextBuilderLabel}`}
                    </Text>

                    <Text style={styles.statusCardTime}>
                      {status.allFree
                        ? "Ready to build"
                        : formatCountdown(remainingMs)}
                    </Text>
                    <View style={styles.builderIndicators}>
                      {/* Normal Builders */}
                      {Array.from({ length: profile.normalBuilderCount }).map(
                        (_, i) => {
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
                        },
                      )}

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
            </Animated.View>
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
                    ? "🟢 G"
                    : `B${(u.builderSlot as number) + 1}`;
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
                                source={require("@/assets/images/builder/builder-working.png")}
                                style={styles.upgradeIcon}
                                resizeMode="contain"
                              />
                            </View>

                            <View style={styles.upgradeNameSection}>
                              <Text style={styles.upgradeName}>
                                {formatBuildingName(u.name)}
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
                  <Text style={styles.refreshHintText}>
                    Pull down to refresh
                  </Text>
                </View>
              </View>
            )}
            {/* Empty State */}
            {!isLoading && sortedUpgrades.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconWrapper}>
                  <Image
                    source={require("@/assets/images/builder/builder-idle.png")}
                    style={styles.emptyIcon}
                    resizeMode="contain"
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
            {__DEV__ && (
              <WidgetPreview
                renderWidget={() => (
                  <BuilderStatusWidget
                    title={data.title}
                    subtitle={data.subtitle}
                    progress={data.progress}
                    showProgress={data.showProgress}
                  />
                )}
                width={320}
                height={200}
              />
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
        </Animated.View>
        {/* Action Modal */}
        <Modal transparent visible={actionModalVisible} animationType="slide">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setActionModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />

              <Text style={styles.modalTitle}>{selectedUpgrade?.name}</Text>

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
                <Ionicons name="pencil" size={18} color="#fbbf24" />
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
                  await requestWidgetUpdate({
                    widgetName: "BuilderStatusWidget",
                    renderWidget: renderBuilderWidget,
                  });

                  startSmartWidgetScheduler();
                  refreshUpgrades();
                  setActionModalVisible(false);
                }}
              >
                <Ionicons name="trash" size={18} color="#ef4444" />
                <Text
                  style={[styles.modalButtonText, styles.modalButtonDelete]}
                >
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
    </SafeAreaView>
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
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
    paddingTop: 20,
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
