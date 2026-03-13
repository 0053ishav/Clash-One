import { PlayerFull } from "@/types/playerFull";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function BattleStatsGrid({ data }: { data: PlayerFull }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battle Stats</Text>
      <View style={styles.grid}>
        <StatBox icon="star" label="War Stars" value={data.warStars} />
        <StatBox icon="arrow-up" label="Given" value={data.donations} />
        <StatBox
          icon="arrow-down"
          label="Received"
          value={data.donationsReceived}
        />
        <StatBox icon="flame" label="Attacks" value={data.attackWins} />
        <StatBox
          icon="shield-checkmark"
          label="Defense"
          value={data.defenseWins}
        />
        <StatBox icon="trophy" label="Best" value={data.bestTrophies} />
      </View>
    </View>
  );
}

function StatBox({ icon, label, value }: any) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={20} color="#fbbf24" />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 20,
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
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    gap: 6,
  },

  label: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  value: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fbbf24",
  },
});
