import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

export interface StatItem {
  icon: IconName;
  label: string;
  value?: string | number;
  highlight?: boolean;
}

interface StatsGridProps {
  title?: string;
  stats: StatItem[];
}

export default function StatsGrid({ title = "Stats", stats }: StatsGridProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.grid}>
        {stats.map(
          (stat, index) =>
            stat.value !== undefined && (
              <View key={index} style={styles.statItem}>
                <View style={styles.row}>
                  <Ionicons
                    name={stat.icon}
                    size={14}
                    color={stat.highlight ? "#fbbf24" : "#64748b"}
                  />

                  <Text style={styles.label}>{stat.label}</Text>
                </View>

                <Text
                  style={[
                    styles.value,
                    stat.highlight && styles.highlightValue,
                  ]}
                >
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </Text>
              </View>
            ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 18,
  },

  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    paddingHorizontal: 2,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  statItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },

  value: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: -0.3,
  },

  highlightValue: {
    color: "#fbbf24",
  },
});
