import EntitySection from "@/components/EntitySection";
import { PlayerFull } from "@/types/playerFull";
import { getProgressColor } from "@/utils/getProgressColor";
import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";

import { parseArmy } from "@/utils/profile/parseArmy";
import { getUpgradeStatus } from "@/utils/progression/getUpgradeStatus";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

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
        <Ionicons name="shield" size={20} color="#fbbf24" />
        <Text style={styles.title}>Army</Text>
      </View>

      <EntitySection
        title="Troops"
        count={troops.length}
        onViewAll={() => router.push("/profile/troops")}
      >
        <Grid items={troops.slice(0, 6)} type="troop" />
      </EntitySection>

      <EntitySection title="Heroes" icon="person" count={heroes.length}>
        <Grid items={heroes} type="hero" />
      </EntitySection>

      <EntitySection title="Pets" icon="paw" count={pets.length}>
        <Grid items={pets} type="pet" />
      </EntitySection>

      <EntitySection
        title="Siege Machines"
        icon="hammer"
        count={siegeMachines.length}
      >
        <Grid items={siegeMachines} type="siege" />
      </EntitySection>
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
          {...item}
          type={type}
        />
      ))}
    </View>
  );
}

function ItemCard({ name, dataId, level, maxLevel, type }: any) {
  const status = getUpgradeStatus(level, maxLevel);
  const progressColor = getProgressColor(status);
  const progress = maxLevel > 0 ? Math.min((level / maxLevel) * 100, 100) : 0;
  // console.log("ICON TEST", name, dataId, type);
  return (
    <View style={styles.card}>
      <Image
        source={getIconByEntityType(dataId, type)}
        style={styles.icon}
        resizeMode="contain"
      />

      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>

      <Text style={[styles.level, { color: progressColor }]}>
        {level} / {maxLevel}
      </Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f1f5f9",
    textTransform: "uppercase",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

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
  },

  level: {
    fontSize: 10,
    fontWeight: "700",
  },

  max: { color: "#22c55e" },
  near: { color: "#fbbf24" },
  mid: { color: "#38bdf8" },
  low: { color: "#ef4444" },

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
});
