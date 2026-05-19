import EntityCard from "@/components/EntityCard";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { fetchFullPlayer } from "@/services/clashApi";
import { track } from "@/utils/analytics/analytics";
import { parseArmy } from "@/utils/profile/parseArmy";
import { getUpgradeStatus } from "@/utils/progression/getUpgradeStatus";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Troop {
  dataId: number;
  name: string;
  level: number;
  maxLevel: number;
  status: "max" | "near" | "mid" | "low";
  village: string;
}

const STATUS_PRIORITY: Record<Troop["status"], number> = {
  max: 0,
  near: 1,
  mid: 2,
  low: 3,
};

export default function TroopsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = usePlayerProfile();

  const [troops, setTroops] = useState<Troop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "maxed" | "upgradable">("all");

  useEffect(() => {
    track("screen_view", {
      screen: "troops",
    });
  }, []);

  const load = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError(null);

      if (!profile?.playerTag) {
        setError("No player tag found");
        return;
      }

      const data = await fetchFullPlayer(profile.playerTag);

      const parsed = parseArmy(data);

      const homeTroops: Troop[] =
        parsed.troops
          ?.filter((t: any) => t.village === "home")
          .map((t: any) => ({
            dataId: t.dataId,
            name: t.name,
            level: t.level,
            maxLevel: t.maxLevel,
            village: t.village,
            status: getUpgradeStatus(t.level, t.maxLevel),
          }))
          .sort(
            (a: Troop, b: Troop) =>
              STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status],
          ) ?? [];

      setTroops(homeTroops);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load troops");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    load();
  }, [profile?.playerTag]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await load(true);
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    let list = troops;

    if (search.trim()) {
      list = list.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (filter === "maxed") {
      list = list.filter((t) => t.status === "max");
    }

    if (filter === "upgradable") {
      list = list.filter((t) => t.status !== "max");
    }

    return list;
  }, [troops, search, filter]);

  const stats = useMemo(() => {
    const maxed = troops.filter((t) => t.status === "max").length;

    const totalLevels = troops.reduce((sum, troop) => sum + troop.level, 0);

    const maxLevels = troops.reduce((sum, troop) => sum + troop.maxLevel, 0);

    const progress =
      maxLevels > 0 ? Math.round((totalLevels / maxLevels) * 100) : 0;

    return {
      maxed,
      remaining: troops.length - maxed,
      progress,
    };
  }, [troops]);

  if (loading && troops.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size={42} color="#fbbf24" />

        <Text style={styles.loadingText}>Loading troops...</Text>
      </View>
    );
  }

  if (error && troops.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={52} color="#ef4444" />

        <Text style={styles.errorText}>{error}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => load()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => `${item.dataId}-${item.level}-${item.village}`}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 8,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fbbf24"
          />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={22} color="#f8fafc" />
              </Pressable>

              <Text style={styles.headerTitle}>Troops</Text>

              <View style={{ width: 40 }} />
            </View>

            {/* Overview */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewTop}>
                <Text style={styles.overviewTitle}>Progress</Text>

                <Text style={styles.overviewValue}>{stats.progress}%</Text>
              </View>

              <View style={styles.overviewProgressBar}>
                <View
                  style={[
                    styles.overviewProgressFill,
                    {
                      width: `${stats.progress}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.overviewStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{troops.length}</Text>

                  <Text style={styles.statLabel}>Total</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: "#22c55e" }]}>
                    {stats.maxed}
                  </Text>

                  <Text style={styles.statLabel}>Maxed</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: "#94a3b8" }]}>
                    {stats.remaining}
                  </Text>

                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={16} color="#64748b" />

              <TextInput
                placeholder="Search troops..."
                placeholderTextColor="#64748b"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {search.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSearch("")}
                >
                  <Ionicons name="close-circle" size={18} color="#64748b" />
                </Pressable>
              )}
            </View>

            {/* Filters */}
            <View style={styles.filterButtons}>
              {[
                {
                  key: "all",
                  label: "All",
                  icon: "grid",
                },
                {
                  key: "upgradable",
                  label: "Upgradable",
                  icon: "arrow-up",
                },
                {
                  key: "maxed",
                  label: "Maxed",
                  icon: "checkmark",
                },
              ].map((f) => {
                const active = filter === f.key;

                return (
                  <Pressable
                    key={f.key}
                    accessibilityRole="button"
                    onPress={() =>
                      setFilter(f.key as "all" | "maxed" | "upgradable")
                    }
                    style={[
                      styles.filterButton,
                      active && styles.filterButtonActive,
                    ]}
                  >
                    <Ionicons
                      name={f.icon as any}
                      size={14}
                      color={active ? "#fbbf24" : "#64748b"}
                    />

                    <Text
                      style={[
                        styles.filterButtonText,
                        active && styles.filterButtonTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Results */}
            <Text style={styles.resultsText}>
              {filtered.length} troop
              {filtered.length !== 1 ? "s" : ""}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <EntityCard
            name={item.name}
            level={item.level}
            maxLevel={item.maxLevel}
            dataId={item.dataId}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={42} color="#475569" />

            <Text style={styles.emptyText}>No troops found</Text>

            <Text style={styles.emptySubtext}>
              Try changing your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  gridRow: {
    gap: 10,
    marginBottom: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fbbf24",
    letterSpacing: -0.4,
  },

  overviewCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  overviewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  overviewTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  overviewValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: -0.5,
  },

  overviewProgressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    marginBottom: 16,
  },

  overviewProgressFill: {
    height: "100%",
    backgroundColor: "#fbbf24",
    borderRadius: 999,
  },

  overviewStats: {
    flexDirection: "row",
    alignItems: "center",
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
  },

  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
  },

  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "500",
  },

  filterButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#111827",
  },

  filterButtonActive: {
    backgroundColor: "rgba(251,191,36,0.12)",
  },

  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },

  filterButtonTextActive: {
    color: "#fbbf24",
  },

  resultsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  loadingText: {
    marginTop: 12,
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },

  errorText: {
    marginTop: 12,
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: "#fbbf24",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryButtonText: {
    color: "#0f172a",
    fontWeight: "700",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
    gap: 10,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94a3b8",
  },

  emptySubtext: {
    fontSize: 13,
    color: "#64748b",
  },
});
