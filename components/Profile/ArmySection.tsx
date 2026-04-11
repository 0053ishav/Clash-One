import EntitySection from "@/components/Profile/EntitySection";
import { PlayerFull } from "@/types/playerFull";
import { getProgressColor } from "@/utils/getProgressColor";
import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";
import { parseArmy } from "@/utils/profile/parseArmy";
import { getUpgradeStatus } from "@/utils/progression/getUpgradeStatus";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ArmyEntity {
  dataId: number;
  name: string;
  level: number;
  maxLevel: number;
}

export default function ArmySection({ data }: { data: PlayerFull }) {
  const router = useRouter();

  const { troops, pets, heroes, siegeMachines } = parseArmy(data);

  if (
    !troops?.length &&
    !heroes?.length &&
    !pets?.length &&
    !siegeMachines?.length
  )
    return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            <Ionicons name="shield" size={18} color="#fbbf24" />
          </View>
          <Text style={styles.title}>Army Overview</Text>
        </View>
      </View>

      {/* Troops */}
      {troops.length > 0 && (
        <EntitySection
          title="Troops"
          icon="flash"
          count={troops.length}
          onViewAll={
            troops.length > 6 ? () => router.push("/profile/troops") : undefined
          }
        >
          <Grid items={troops.slice(0, 6)} type="troop" />
        </EntitySection>
      )}

      {/* Heroes */}
      {heroes.length > 0 && (
        <EntitySection title="Heroes" icon="person" count={heroes.length}>
          <Grid items={heroes} type="hero" />
        </EntitySection>
      )}

      {/* Pets */}
      {pets.length > 0 && (
        <EntitySection title="Pets" icon="paw" count={pets.length}>
          <Grid items={pets} type="pet" />
        </EntitySection>
      )}

      {/* Siege Machines */}
      {siegeMachines.length > 0 && (
        <EntitySection
          title="Siege Machines"
          icon="hammer"
          count={siegeMachines.length}
        >
          <Grid items={siegeMachines} type="siege" />
        </EntitySection>
      )}
    </View>
  );
}

function Grid({
  items,
  type,
}: {
  items: ArmyEntity[];
  type: "troop" | "hero" | "pet" | "siege";
}) {
  return (
    <View style={styles.grid}>
      {items.map((item, index) => (
        <ItemCard
          key={`${item.dataId}-${item.level}-${index}`}
          name={item.name}
          dataId={item.dataId}
          level={item.level}
          maxLevel={item.maxLevel}
          type={type}
        />
      ))}
    </View>
  );
}

function ItemCard({
  name,
  dataId,
  level,
  maxLevel,
  type,
}: ArmyEntity & { type: "troop" | "hero" | "pet" | "siege" }) {
  const status = getUpgradeStatus(level, maxLevel);
  const progressColor = getProgressColor(status);
  const progress = maxLevel > 0 ? Math.min((level / maxLevel) * 100, 100) : 0;
  const isMaxed = level === maxLevel && maxLevel > 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isMaxed && styles.cardMaxed,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Maxed Badge */}
      {isMaxed && (
        <View style={styles.maxedBadge}>
          <Ionicons name="checkmark" size={10} color="#0f172a" />
        </View>
      )}

      {/* Icon Container */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${progressColor}15` },
        ]}
      >
        <Image
          source={getIconByEntityType(dataId, type)}
          style={styles.icon}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </View>

      {/* Name */}
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>

      {/* Level Display */}
      <View style={styles.levelContainer}>
        <Text style={[styles.levelText, { color: progressColor }]}>
          Lv {level}
        </Text>
        <Text style={styles.maxLevelText}>/ {maxLevel}</Text>
      </View>

      {/* Progress Bar */}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.5)",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  card: {
    width: "31%",
    backgroundColor: "#0f172a",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    gap: 6,
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  cardMaxed: {
    borderColor: "#22c55e",
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },

  cardPressed: {
    opacity: 0.7,
  },

  maxedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },

  icon: {
    width: 44,
    height: 44,
  },

  name: {
    fontSize: 11,
    fontWeight: "600",
    color: "#f1f5f9",
    textAlign: "center",
    width: "100%",
    minHeight: 14,
  },

  levelContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },

  levelText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  maxLevelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
  },

  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    borderRadius: 2,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
