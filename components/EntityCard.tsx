import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";
import { getUpgradeStatus } from "@/utils/progression/getUpgradeStatus";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

export default function EntityCard({
  dataId,
  name,
  type,
  level,
  maxLevel,
}: {
  dataId: number;
  name: string;
  type: "troop" | "hero" | "pet" | "spell" | "siege";
  level: number;
  maxLevel: number;
}) {
  const status = getUpgradeStatus(level, maxLevel);

  const progressColor =
    status === "max"
      ? "#22c55e"
      : status === "near"
        ? "#fbbf24"
        : status === "mid"
          ? "#38bdf8"
          : "#ef4444";

  const progress = (level / maxLevel) * 100;
  const remaining = maxLevel - level;
  const isMax = status === "max";

  return (
    <View style={[styles.card, { opacity: isMax ? 0.7 : 1 }]}>
      {/* Icon */}
      <Image
        source={getIconByEntityType(dataId, type)}
        style={styles.cardImage}
        resizeMode="contain"
      />

      {/* Name */}
      <Text style={styles.cardName} numberOfLines={1}>
        {name}
      </Text>

      {/* Status / Progress */}
      {isMax ? (
        <View style={styles.maxBadge}>
          <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
          <Text style={styles.maxText}>MAX</Text>
        </View>
      ) : (
        <>
          {remaining > 0 && (
            <View style={styles.remainingBadge}>
              <Text style={styles.remainingText}>{remaining} left</Text>
            </View>
          )}

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
        </>
      )}

      {/* Level */}
      <Text style={styles.levelText}>
        {level}/{maxLevel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "31%",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 4,
  },

  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  cardImage: {
    width: 48,
    height: 48,
  },

  cardName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f1f5f9",
    marginTop: 4,
  },

  maxBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    backgroundColor: "rgba(34,197,94,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  maxText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#22c55e",
  },

  remainingBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },

  remainingText: {
    fontSize: 10,
    color: "#fbbf24",
    fontWeight: "700",
  },

  levelText: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 3,
  },
});
