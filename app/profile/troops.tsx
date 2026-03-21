import EntityCard from "@/components/EntityCard";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { fetchFullPlayer } from "@/services/clashApi";
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

type TroopCardProps = {
  troop: Troop;
  type: "troop" | "hero" | "pet" | "spell" | "siege";
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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

              <Text style={styles.headerTitle}>Troops</Text>

              <View style={{ width: 40 }} />
            </View>

            {/* Overview */}
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Collection Strength</Text>
              <Text style={styles.overviewValue}>{overallProgress}%</Text>

              <View style={styles.overviewProgressBar}>
                <View
                  style={[
                    styles.overviewProgressFill,
                    { width: `${overallProgress}%` },
                  ]}
                />
              </View>

              <View style={styles.overviewStats}>
                <Text style={styles.overviewStat}>Total: {troops.length}</Text>
                <Text style={styles.overviewStat}>Maxed: {maxedCount}</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#94a3b8" />
              <TextInput
                placeholder="Search troops..."
                placeholderTextColor="#64748b"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>

            {/* Filters */}
            <View style={styles.filterButtons}>
              {["all", "maxed", "upgradable"].map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f as any)}
                  style={[
                    styles.filterButton,
                    filter === f && styles.filterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filter === f && styles.filterButtonTextActive,
                    ]}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
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
    marginBottom: 10,
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
    fontSize: 18,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  overviewCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  overviewLabel: {
    color: "#94a3b8",
    fontSize: 11,
    textTransform: "uppercase",
  },

  overviewValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fbbf24",
  },

  overviewProgressBar: {
    height: 8,
    backgroundColor: "#0f172a",
    borderRadius: 4,
    marginVertical: 8,
    overflow: "hidden",
  },

  overviewProgressFill: {
    height: "100%",
    backgroundColor: "#fbbf24",
  },

  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  overviewStat: {
    color: "#cbd5f5",
    fontWeight: "600",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#fff",
  },

  filterButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#1e293b",
  },

  filterButtonActive: {
    backgroundColor: "#fbbf24",
  },

  filterButtonText: {
    textAlign: "center",
    color: "#94a3b8",
    fontWeight: "600",
  },

  filterButtonTextActive: {
    color: "#0f172a",
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  loadingText: {
    color: "#94a3b8",
    marginTop: 12,
  },

  errorText: {
    color: "#ef4444",
    marginVertical: 12,
  },

  retryButton: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  retryButtonText: {
    fontWeight: "700",
    color: "#0f172a",
  },
});
