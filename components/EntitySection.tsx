import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function EntitySection({
  title,
  count,
  icon,
  onViewAll,
  children,
}: any) {
  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <View style={styles.titleRow}>
          {icon && <Ionicons name={icon} size={16} color="#fbbf24" />}
          <Text style={styles.title}>
            {title} ({count})
          </Text>
        </View>

        {onViewAll && (
          <Pressable
            onPress={onViewAll}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.viewAll}>View All →</Text>
          </Pressable>
        )}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
    paddingTop: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 12,
    fontWeight: "700",
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  viewAll: {
    fontSize: 12,
    fontWeight: "600",
    color: "#38bdf8",
  },

  pressed: {
    opacity: 0.7,
  },
});
