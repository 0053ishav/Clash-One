import { cancelBuilderNotification } from "@/services/builderNotificationService";
import { setOnboardingIncomplete } from "@/storage/appConfig";
import { getBuilderCount } from "@/storage/builderConfig";
import {
  deleteBuilderUpgrade,
  getActiveBuilderUpgrades,
} from "@/storage/builderUpgrades";
import { BuilderUpgrade } from "@/types/upgrade";
import { getBuilderStatus } from "@/utils/builderStatus";
import { calculateProgress } from "@/utils/calculateProgress";
import { formatBuildingName } from "@/utils/formatBuildingName";
import { formatCountdown } from "@/utils/formatCountdown";
import { renderBuilderWidget } from "@/utils/renderBuilderWidget";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { BuilderStatusWidget } from "@/widget/BuilderStatusWidget";
import { getBuilderWidgetData } from "@/widget/getBuilderWidgetData";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import {
  requestWidgetUpdate,
  WidgetPreview,
} from "react-native-android-widget";

export default function HomeScreen() {
  const router = useRouter();

  const [activeUpgrades, setActiveUpgrades] = useState<BuilderUpgrade[]>([]);
  const [selectedUpgrade, setSelectedUpgrade] = useState<BuilderUpgrade | null>(
    null,
  );
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);

  const refreshUpgrades = useCallback(() => {
    setActiveUpgrades(getActiveBuilderUpgrades());
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

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

  const status = getBuilderStatus({
    normalBuilderCount: getBuilderCount(),
    goblinBuilderUnlocked: false,
    activeUpgrades,
  });

  const nextEndTime = activeUpgrades.length
    ? Math.min(...activeUpgrades.map((u) => u.endTime))
    : null;

  const remainingMs = nextEndTime ? Math.max(nextEndTime - Date.now(), 0) : 0;

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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ffd33d"
          />
        }
      >
        {/* Builder Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Image
              source={
                status.allFree
                  ? require("@/assets/images/builder/builder-idle.png")
                  : require("@/assets/images/builder/builder-working.png")
              }
              style={styles.builderIcon}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>
                {status.allFree ? "Builders Available" : "Next Builder Ready"}
              </Text>

              <Text style={styles.statusMain}>
                {status.allFree
                  ? "All builders free"
                  : formatCountdown(remainingMs)}
              </Text>

              <Text style={styles.statusMeta}>
                {status.freeBuilders} / {status.maxBuilders} builders free
              </Text>
            </View>
          </View>
        </View>

        {/* Primary CTA */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/add-upgrade")}
        >
          <Text style={styles.addButtonText}>+ Add Upgrade</Text>
        </Pressable>

        {/* Upgrades List */}

        {/* Active Builder Upgrades List */}
        {activeUpgrades.length > 0 && (
          <View style={styles.upgradeList}>
            <Text style={styles.sectionTitle}>Active Upgrades</Text>

            {activeUpgrades.map((u) => {
              const remainingMs = Math.max(u.endTime - Date.now(), 0);

              return (
                <Pressable
                  key={u.id}
                  style={[
                    styles.upgradeCard,
                    completedId === u.id && styles.completedFlash,
                  ]}
                  onLongPress={() => handleRowLongPress(u)}
                >
                  <Image
                    source={require("@/assets/images/builder/builder-working.png")}
                    style={styles.rowIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.upgradeContent}>
                    <View style={styles.rowTop}>
                      <Text style={styles.upgradeName}>
                        {formatBuildingName(u.name)}
                      </Text>
                      <Text style={styles.upgradeTime}>
                        {formatCountdown(remainingMs)}
                      </Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${calculateProgress(u.startTime, u.endTime) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}

            <View style={styles.lastUpdated}>
              <Text style={styles.lastUpdatedText}>Pull down to refresh</Text>
              <Ionicons name="arrow-down" />
            </View>
          </View>
        )}

        {/* Upgrade EmptyState */}
        {activeUpgrades.length === 0 && (
          <View style={styles.emptyState}>
            <Image
              source={require("@/assets/images/builder/builder-idle.png")}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>No Active Upgrades</Text>
            <Text style={styles.emptySubtitle}>
              Start an upgrade to track your builders.
            </Text>
          </View>
        )}

        {__DEV__ && activeUpgrades.length > 0 && (
          <Pressable
            style={{
              marginTop: 16,
              alignSelf: "center",
              backgroundColor: "#0ea5e9",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
            }}
            onPress={() => {
              const first = activeUpgrades[0];
              setCompletedId(first.id);
              setTimeout(() => setCompletedId(null), 8000);
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              Test Completion Animation
            </Text>
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
            style={{
              marginTop: 20,
              alignSelf: "center",
            }}
            onPress={() => {
              setOnboardingIncomplete();
              router.replace("/onboarding");
            }}
          >
            <Text style={{ color: "#888" }}>Reset Onboarding</Text>
          </Pressable>
        )}

        <Modal transparent visible={actionModalVisible} animationType="slide">
          <Pressable
            style={styles.sheetOverlay}
            onPress={() => setActionModalVisible(false)}
          >
            <View style={styles.sheetContainer}>
              <View style={styles.sheetHandle} />

              <Text style={styles.sheetTitle}>
                Building Name: {selectedUpgrade?.name}
              </Text>

              <Pressable
                style={styles.sheetButton}
                onPress={() => {
                  setActionModalVisible(false);
                  router.push({
                    pathname: "/add-upgrade",
                    params: { editId: selectedUpgrade?.id },
                  });
                }}
              >
                <Text style={styles.sheetButtonText}>Edit</Text>
              </Pressable>

              <Pressable
                style={styles.sheetButton}
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
                <Text style={[styles.sheetButtonText, { color: "#b91c1c" }]}>
                  Delete
                </Text>
              </Pressable>

              <Pressable
                style={styles.sheetCancel}
                onPress={() => setActionModalVisible(false)}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </ScrollView>

      {/* Floating Plus Button */}
      <Pressable style={styles.fab} onPress={() => router.push("/add-upgrade")}>
        <Ionicons name="add" size={28} color="#000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  completedFlash: {
    backgroundColor: "#5ffc96",
  },

  container: {
    padding: 16,
    backgroundColor: "#eef2f7",
  },

  scrollContent: {
    paddingBottom: 140,
  },

  statusCard: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 24,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  builderIcon: {
    width: 42,
    height: 42,
  },

  statusTitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  statusMain: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffd33d",
  },

  statusMeta: {
    fontSize: 13,
    color: "#cbd5e1",
    marginTop: 6,
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
  },

  statusText: {
    fontSize: 18,
    fontWeight: "500",
  },

  subText: {
    fontSize: 12,
    fontWeight: "200",
  },

  lastUpdated: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 24,
  },

  lastUpdatedText: {
    fontSize: 11,
    color: "#9aa0a6",
    marginTop: 6,
    alignItems: "center",
  },

  addButton: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#ffd33d",
    alignItems: "center",
    marginBottom: 24,
    elevation: 3,
  },

  addButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },

  placeholder: {
    marginTop: 12,
  },

  placeholderText: {
    color: "#888",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffd33d",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  upgradeList: {
    marginTop: 4,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },

  upgradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#FAFAFA",
    marginBottom: 8,
  },

  rowIcon: {
    width: 36,
    height: 36,
    marginLeft: 12,
    marginRight: 6,
  },

  upgradeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    marginBottom: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  upgradeContent: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },

  upgradeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2328",
  },

  upgradeTime: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },

  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  progressBarContainer: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    marginTop: 12,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#ffd33d",
    borderRadius: 6,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheetContainer: {
    backgroundColor: "#ffffff",
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: "center",
  },

  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 16,
  },

  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1f2328",
  },

  sheetButton: {
    paddingVertical: 16,
  },

  sheetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2328",
  },

  sheetCancel: {
    marginTop: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  sheetCancelText: {
    fontSize: 14,
    color: "#6b7280",
  },

  emptyState: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});

// Improve widget update reliability premium

// Add JSON auto-builder-count parsing
