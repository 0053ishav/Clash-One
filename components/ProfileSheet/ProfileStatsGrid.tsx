import { PlayerProfile } from "@/types/player";
import { StyleSheet, Text, View } from "react-native";

function formatCapital(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value.toString();
}

export default function ProfileStatsGrid({
  profile,
}: {
  profile: PlayerProfile;
}) {
  const stats = [
    {
      emoji: "⭐",
      label: "War Stars",
      value: profile.warStars,
    },
    {
      emoji: "📤",
      label: "Given",
      value: profile.donations,
    },
    {
      emoji: "📥",
      label: "Received",
      value: profile.donationsReceived,
    },
    {
      emoji: "⚔️",
      label: "Attacks",
      value: profile.attackWins,
    },
    {
      emoji: "🛡️",
      label: "Defense",
      value: profile.defenseWins,
    },
    {
      emoji: "💎",
      label: "Capital",
      value:
        typeof profile.clanCapitalGold === "number"
          ? formatCapital(profile.clanCapitalGold)
          : undefined,
    },
    {
      emoji: "🔨",
      label: "Builders",
      value: profile.normalBuilderCount,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battle Stats</Text>
      <View style={styles.grid}>
        {stats.map(
          (stat, index) =>
            stat.value !== undefined && (
              <View key={index} style={styles.statItem}>
                <Text style={styles.emoji}>{stat.emoji}</Text>
                <Text style={styles.label}>{stat.label}</Text>
                <Text style={styles.value}>{stat.value}</Text>
              </View>
            ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    gap: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f1f5f9",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  statItem: {
    width: "31%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    gap: 6,
  },

  emoji: {
    fontSize: 24,
  },

  label: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textAlign: "center",
  },

  value: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fbbf24",
  },
});
