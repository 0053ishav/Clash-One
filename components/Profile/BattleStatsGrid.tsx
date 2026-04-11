import { PlayerFull } from "@/types/playerFull";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

interface StatBoxProps {
  icon: IconName;
  label: string;
  value: number;
  color?: string;
  bgColor?: string;
}

export default function BattleStatsGrid({ data }: { data: PlayerFull }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bar-chart" size={16} color="#fbbf24" />
        <Text style={styles.title}>Battle Stats</Text>
      </View>

      <View style={styles.grid}>
        <StatBox
          icon="star"
          label="War Stars"
          value={data.warStars}
          color="#fbbf24"
          bgColor="rgba(251, 191, 36, 0.15)"
        />
        <StatBox
          icon="arrow-up"
          label="Donated"
          value={data.donations}
          color="#22c55e"
          bgColor="rgba(34, 197, 94, 0.15)"
        />
        <StatBox
          icon="arrow-down"
          label="Received"
          value={data.donationsReceived}
          color="#8b5cf6"
          bgColor="rgba(139, 92, 246, 0.15)"
        />
        <StatBox
          icon="flame"
          label="Attacks Won"
          value={data.attackWins}
          color="#ef4444"
          bgColor="rgba(239, 68, 68, 0.15)"
        />
        <StatBox
          icon="shield-checkmark"
          label="Defenses Won"
          value={data.defenseWins}
          color="#06b6d4"
          bgColor="rgba(6, 182, 212, 0.15)"
        />
        <StatBox
          icon="trophy"
          label="Best Trophies"
          value={data.bestTrophies}
          color="#f97316"
          bgColor="rgba(249, 115, 22, 0.15)"
        />
      </View>
    </View>
  );
}

function StatBox({
  icon,
  label,
  value,
  color = "#fbbf24",
  bgColor = "rgba(251, 191, 36, 0.15)",
}: StatBoxProps) {
  return (
    <View style={styles.statItem}>
      {/* Icon Container */}
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>

      {/* Value */}
      <Text style={[styles.value, { color }]}>{value.toLocaleString()}</Text>

      {/* Label */}
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    width: "31.5%",
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  value: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  label: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textAlign: "center",
  },
});
