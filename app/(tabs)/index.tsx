import { getActiveBuilderUpgrades } from "@/storage/builderUpgrades";
import { getBuilderStatus } from "@/utils/builderStatus";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const mockProfile = {
    normalBuilderCount: 5,
    goblinBuilderUnlocked: false,
  };

  const activeUpgrades = getActiveBuilderUpgrades();

  const status = getBuilderStatus({
    normalBuilderCount: mockProfile.normalBuilderCount,
    goblinBuilderUnlocked: mockProfile.goblinBuilderUnlocked,
    activeUpgrades,
  });

  return (
    <View style={styles.container}>
      {/* Builder Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusText}>
          {status.allFree
            ? "Builders are free"
            : `${status.freeBuilders} / ${status.maxBuilders} builders free`}
        </Text>
      </View>

      {/* Primary CTA */}
      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/add-upgrade")}
      >
        <Text style={styles.addButtonText}>+ Add Upgrade</Text>
      </Pressable>

      {/* Placeholder */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Active upgrades will appear here
        </Text>
      </View>

      {/* Floating Plus Button */}
      <Pressable style={styles.fab} onPress={() => router.push("/upload-json")}>
        <Ionicons name="add" size={28} color="#000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
  },

  statusCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    marginBottom: 20,
  },

  statusText: {
    fontSize: 18,
    fontWeight: "500",
  },

  addButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    marginBottom: 24,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  placeholder: {
    marginTop: 12,
  },

  placeholderText: {
    color: "#888",
  },

  /* Floating Action Button */
  fab: {
    position: "absolute",
    right: 20,
    bottom: 50,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffd33d",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
