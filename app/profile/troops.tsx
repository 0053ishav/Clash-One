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
    track("screen_view", { screen: "troops" });
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!profile.playerTag) {
        setError("No player tag found");
        return;
      }

      const data = await fetchFullPlayer(profile.playerTag);
      const { troops } = parseArmy(data);

      const homeTroops = troops
        ?.filter((t: any) => t.village === "home")
        .map((t: any) => ({
          dataId: t.dataId,
          name: t.name,
          level: t.level,
          maxLevel: t.maxLevel,
          village: t.village,
          status: getUpgradeStatus(t.level, t.maxLevel),
        }))
        .sort((a: Troop, b: Troop) => {
          if (a.status === "max" && b.status !== "max") return 1;
          if (b.status === "max" && a.status !== "max") return -1;

          const remainingA = a.maxLevel - a.level;
          const remainingB = b.maxLevel - b.level;

          return remainingB - remainingA;
        });

      setTroops(homeTroops);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load troops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [profile.playerTag]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    let list = troops;

    if (search) {
      list = list.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (filter === "maxed") list = list.filter((t) => t.status === "max");
    if (filter === "upgradable") list = list.filter((t) => t.status !== "max");

    return list;
  }, [troops, search, filter]);

  const maxedCount = troops.filter((t) => t.status === "max").length;
  const totalLevels = troops.reduce((sum, t) => sum + t.level, 0);
  const maxLevels = troops.reduce((sum, t) => sum + t.maxLevel, 0);

  const overallProgress =
    maxLevels > 0 ? Math.round((totalLevels / maxLevels) * 100) : 0;

  if (loading && troops.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size={48} color="#fbbf24" />
        <Text style={styles.loadingText}>Loading troops...</Text>
      </View>
    );
  }

  if (error && troops.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={56} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={load}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.dataId.toString()}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8 },
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
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={24} color="#fbbf24" />
              </Pressable>

              <Text style={styles.headerTitle}>Troops Collection</Text>

              <View style={{ width: 40 }} />
            </View>

            {/* Overview Card */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <View style={styles.overviewIconWrapper}>
                  <Ionicons name="flash" size={20} color="#fbbf24" />
                </View>
                <View style={styles.overviewHeaderText}>
                  <Text style={styles.overviewLabel}>Collection Progress</Text>
                  <Text style={styles.overviewValue}>{overallProgress}%</Text>
                </View>
              </View>

              <View style={styles.overviewProgressBar}>
                <View
                  style={[
                    styles.overviewProgressFill,
                    { width: `${overallProgress}%` },
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
                    {maxedCount}
                  </Text>
                  <Text style={styles.statLabel}>Maxed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: "#ef4444" }]}>
                    {troops.length - maxedCount}
                  </Text>
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#94a3b8" />
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
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={18} color="#64748b" />
                </Pressable>
              )}
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterButtons}>
              {[
                { key: "all", label: "All", icon: "grid" },
                { key: "upgradable", label: "Upgradable", icon: "arrow-up" },
                { key: "maxed", label: "Maxed", icon: "checkmark" },
              ].map((f) => (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key as any)}
                  style={({ pressed }) => [
                    styles.filterButton,
                    filter === f.key && styles.filterButtonActive,
                    pressed && styles.filterButtonPressed,
                  ]}
                >
                  <Ionicons
                    name={f.icon as any}
                    size={14}
                    color={filter === f.key ? "#0f172a" : "#94a3b8"}
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      filter === f.key && styles.filterButtonTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Results Count */}
            <Text style={styles.resultsText}>
              {filtered.length} {filtered.length === 1 ? "troop" : "troops"}{" "}
              {search || filter !== "all" ? "found" : ""}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <EntityCard
            name={item.name}
            level={item.level}
            maxLevel={item.maxLevel}
            dataId={item.dataId}
            type="troop"
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#475569" />
            <Text style={styles.emptyText}>No troops found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
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

  gridRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fbbf24",
    letterSpacing: -0.5,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  overviewCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  overviewIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  overviewHeaderText: {
    flex: 1,
    gap: 4,
  },

  overviewLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  overviewValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fbbf24",
    letterSpacing: -0.5,
  },

  overviewProgressBar: {
    height: 8,
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    borderRadius: 4,
    marginBottom: 14,
    overflow: "hidden",
  },

  overviewProgressFill: {
    height: "100%",
    backgroundColor: "#fbbf24",
  },

  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fbbf24",
  },

  statLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#334155",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  filterButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },

  filterButtonActive: {
    backgroundColor: "#fbbf24",
    borderColor: "#fbbf24",
  },

  filterButtonPressed: {
    opacity: 0.7,
  },

  filterButtonText: {
    textAlign: "center",
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: 12,
  },

  filterButtonTextActive: {
    color: "#0f172a",
  },

  resultsText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },

  loadingText: {
    color: "#94a3b8",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },

  errorText: {
    color: "#ef4444",
    marginVertical: 12,
    fontSize: 14,
    fontWeight: "600",
  },

  retryButton: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },

  retryButtonText: {
    fontWeight: "700",
    color: "#0f172a",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748b",
  },

  emptySubtext: {
    fontSize: 13,
    color: "#475569",
  },
});
