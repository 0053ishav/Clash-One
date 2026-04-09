import ArmySection from "@/components/Profile/ArmySection";
import BattleStatsGrid from "@/components/Profile/BattleStatsGrid";
import ProfileHeroCard from "@/components/Profile/ProfileHeroCard";
import ProgressSection from "@/components/Profile/ProgressSection";
import { fetchFullPlayer } from "@/services/clashApi";
import { useAccountStore } from "@/stores/accountStore";
import { PlayerFull } from "@/types/playerFull";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState<PlayerFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTag = useAccountStore((s) => s.activeTag);

  // useEffect(() => {
  //   (async () => {
  //     const tag = await getActiveAccount();
  //     setActiveTag(tag!);
  //   })();
  // }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!activeTag) {
        setError("No player tag found");
        return;
      }

      const playerData = await fetchFullPlayer(activeTag);

      console.log("full player data: ", playerData);

      setData(playerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  if (loading && !data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size={48} color="#fbbf24" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>
          {error || "Failed to load profile"}
        </Text>
        <Ionicons
          name="alert-circle"
          size={48}
          color="#ef4444"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fbbf24"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.headerRow}>
          <Ionicons
            name="chevron-back"
            size={24}
            color="#fbbf24"
            onPress={() => router.back()}
            style={{ padding: 8 }}
          />
          <Text style={styles.headerTitle}>Full Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ProfileHeroCard data={data} />

        <BattleStatsGrid data={data} />

        <ArmySection data={data} />

        <ProgressSection data={data} />

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
          <Text style={styles.footerText}>Synced from Clash of Clans API</Text>
        </View>
      </ScrollView>
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
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fbbf24",
    letterSpacing: -0.5,
  },

  loadingWrapper: {
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    fontSize: 16,
    color: "#94a3b8",
    fontWeight: "600",
  },

  errorText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "600",
    textAlign: "center",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },

  footerText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});
