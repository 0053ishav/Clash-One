import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

interface EntitySectionProps {
  title: string;
  icon?: IconName;
  count: number;
  children: React.ReactNode;
  onViewAll?: () => void;
}

export default function EntitySection({
  title,
  icon,
  count,
  children,
  onViewAll,
}: EntitySectionProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={14} color="#fbbf24" />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>

        {onViewAll && (
          <Pressable
            onPress={onViewAll}
            style={({ pressed }) => [
              styles.viewAllButton,
              pressed && styles.viewAllButtonPressed,
            ]}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={14} color="#fbbf24" />
          </Pressable>
        )}
      </View>

      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  countBadge: {
    backgroundColor: "rgba(148, 163, 184, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  viewAllButtonPressed: {
    opacity: 0.6,
  },

  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fbbf24",
  },
});
