import { getEntityTypeByDataId } from "@/data/entityMap";
import { Upgrade } from "@/types/upgrade";
import { calculateProgress } from "@/utils/calculateProgress";
import { formatCountdown } from "@/utils/formatCountdown";
import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function PetSection({
  pet,
  onAddPress,
  onLongPress,
}: {
  pet: Upgrade | null;
  onAddPress?: () => void;
  onLongPress?: (pet: Upgrade) => void;
}) {
  const activePet = pet;
  const isBusy = !!activePet;

  const now = Date.now();
  const progress = activePet
    ? calculateProgress(activePet.startTime, activePet.endTime)
    : 0;
  const remainingMs = activePet ? Math.max(activePet.endTime - now, 0) : 0;
  const totalMs = activePet ? activePet.endTime - activePet.startTime : 0;

  const entityType = activePet?.dataId
    ? getEntityTypeByDataId(activePet.dataId, activePet.isCrafted)
    : undefined;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>🐾</Text>
            <Text style={styles.sectionTitle}>Pet House</Text>
          </View>
          <View
            style={[
              styles.statusDot,
              isBusy ? styles.petDotBusy : styles.dotFree,
            ]}
          />
        </View>
        {onAddPress && !isBusy && (
          <Pressable
            onPress={onAddPress}
            style={({ pressed }) => [
              styles.addIconButton,
              pressed && styles.addIconButtonPressed,
            ]}
          >
            <Ionicons name="add-circle" size={22} color="#a78bfa" />
          </Pressable>
        )}
      </View>

      {/* Active Upgrade Card */}
      {activePet ? (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            styles.petCard,
            pressed && styles.cardPressed,
          ]}
          onLongPress={() => onLongPress?.(activePet)}
          delayLongPress={300}
        >
          <View style={styles.cardContent}>
            {/* Pet Icon */}
            <View style={[styles.iconContainer, styles.petIconContainer]}>
              <Image
                source={
                  activePet.dataId && entityType
                    ? getIconByEntityType(
                        activePet.dataId,
                        entityType,
                        undefined,
                        activePet.isCrafted,
                      )
                    : require("@/assets/images/builder/builder-working.png")
                }
                style={styles.petIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.topRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {activePet.entity}
                </Text>
                {activePet.currentLevel !== undefined &&
                  activePet.nextLevel !== undefined && (
                    <View style={[styles.levelBadge, styles.petLevelBadge]}>
                      <Text style={styles.levelText}>
                        Lv {activePet.currentLevel} → {activePet.nextLevel}
                      </Text>
                    </View>
                  )}
              </View>

              {/* Time Display */}
              <View style={styles.timeRow}>
                <Text style={[styles.remainingTime, styles.petTime]}>
                  {formatCountdown(remainingMs)}
                </Text>
                <Text style={styles.totalTime}>
                  of {formatCountdown(totalMs)}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    styles.petProgressBar,
                    { width: `${progress * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </Pressable>
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="paw" size={28} color="#475569" />
          </View>
          <Text style={styles.emptyText}>No pet upgrading</Text>
          {onAddPress && (
            <Pressable
              style={({ pressed }) => [
                styles.emptyAddButton,
                styles.petEmptyButton,
                pressed && styles.emptyAddButtonPressed,
              ]}
              onPress={onAddPress}
            >
              <Text style={[styles.emptyAddText, styles.petEmptyText]}>
                Start Upgrade
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  emoji: {
    fontSize: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  petDotBusy: {
    backgroundColor: "#8b5cf6",
  },

  labDotBusy: {
    backgroundColor: "#06b6d4",
  },

  dotFree: {
    backgroundColor: "#22c55e",
  },

  addIconButton: {
    padding: 4,
    borderRadius: 20,
  },

  addIconButtonPressed: {
    opacity: 0.6,
  },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  petCard: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#8b5cf6",
  },

  labCard: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#06b6d4",
  },

  cardPressed: {
    opacity: 0.9,
  },

  cardContent: {
    flexDirection: "row",
    padding: 16,
    gap: 14,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  petIconContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },

  labIconContainer: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
  },

  petIcon: {
    width: 40,
    height: 40,
  },

  labIcon: {
    width: 40,
    height: 40,
  },

  infoSection: {
    flex: 1,
    gap: 8,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f1f5f9",
    flex: 1,
  },

  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  petLevelBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
  },

  labLevelBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.2)",
  },

  levelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#a78bfa",
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },

  remainingTime: {
    fontSize: 16,
    fontWeight: "800",
  },

  petTime: {
    color: "#a78bfa",
  },

  labTime: {
    color: "#22d3ee",
  },

  totalTime: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },

  progressTrack: {
    height: 4,
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 2,
  },

  petProgressBar: {
    backgroundColor: "#8b5cf6",
  },

  labProgressBar: {
    backgroundColor: "#06b6d4",
  },

  emptyCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
  },

  emptyIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(71, 85, 105, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },

  emptyAddButton: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  petEmptyButton: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },

  labEmptyButton: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
  },

  emptyAddButtonPressed: {
    opacity: 0.7,
  },

  emptyAddText: {
    fontSize: 13,
    fontWeight: "600",
  },

  petEmptyText: {
    color: "#a78bfa",
  },

  labEmptyText: {
    color: "#22d3ee",
  },
});
