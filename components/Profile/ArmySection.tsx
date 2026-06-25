import EntitySection from "@/components/Profile/EntitySection";
import { PlayerFull } from "@/types/playerFull";
import { parseArmy } from "@/utils/profile/parseArmy";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import EntityCard from "../EntityCard";

interface ArmyEntity {
  dataId: number;
  name: string;
  level: number;
  maxLevel: number;
}

export default function ArmySection({ data }: { data: PlayerFull }) {
  const router = useRouter();

  const army = parseArmy(data);

  if (
    !army.home.troops?.length &&
    !army.home.heroes?.length &&
    !army.home.pets?.length &&
    !army.home.siegeMachines?.length
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
      {army.home.troops.length > 0 && (
        <EntitySection
          title="Home Troops"
          icon="flash"
          count={army.home.troops.length}
          onViewAll={
            army.home.troops.length > 6
              ? () => router.push("/profile/troops")
              : undefined
          }
        >
          <Grid items={army.home.troops.slice(0, 6)} />
        </EntitySection>
      )}

      {army.builderBase.troops.length > 0 && (
        <EntitySection
          title="Builder Base Troops"
          icon="construct"
          count={army.builderBase.troops.length}
        >
          <Grid items={army.builderBase.troops} />
        </EntitySection>
      )}

      {/* Heroes */}
      {army.home.heroes.length > 0 && (
        <EntitySection
          title="Heroes"
          icon="person"
          count={army.home.heroes.length}
        >
          <Grid items={army.home.heroes} />
        </EntitySection>
      )}
      {/* Heroes */}
      {army.builderBase.heroes.length > 0 && (
        <EntitySection
          title="Builder Base Heroes"
          icon="person"
          count={army.builderBase.heroes.length}
        >
          <Grid items={army.builderBase.heroes} />
        </EntitySection>
      )}

      {/* Pets */}
      {army.home.pets.length > 0 && (
        <EntitySection title="Pets" icon="paw" count={army.home.pets.length}>
          <Grid items={army.home.pets} />
        </EntitySection>
      )}

      {/* Siege Machines */}
      {army.home.siegeMachines.length > 0 && (
        <EntitySection
          title="Siege Machines"
          icon="hammer"
          count={army.home.siegeMachines.length}
        >
          <Grid items={army.home.siegeMachines} />
        </EntitySection>
      )}
    </View>
  );
}

function Grid({ items }: { items: ArmyEntity[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item, index) => (
        <EntityCard
          key={`${item.dataId}-${item.level}-${index}`}
          name={item.name}
          dataId={item.dataId}
          level={item.level}
          maxLevel={item.maxLevel}
        />
      ))}
    </View>
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
});
