import { usePremiumStore } from "@/stores/premiumStore";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function ChiefCard() {
  const router = useRouter();

  const { isChief } = usePremiumStore();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>👑</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {isChief ? "Chief Member" : "Become Chief"}
          </Text>

          <Text style={styles.subtitle}>
            {isChief
              ? "Lifetime access active"
              : "Remove ads and unlock unlimited widget accounts"}
          </Text>
        </View>
      </View>

      <View style={styles.features}>
        <Text style={styles.feature}>✓ No Ads</Text>

        <Text style={styles.feature}>✓ Unlimited Widget Accounts</Text>

        <Text style={styles.feature}>✓ Future Chief Features</Text>
      </View>

      <Pressable
        disabled={isChief}
        onPress={() => router.push("/pro")}
        style={[styles.button, isChief && styles.activeButton]}
      >
        <Text style={[styles.buttonText, isChief && styles.activeText]}>
          {isChief ? "Active" : "₹199 Lifetime"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 4,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fbbf24",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    fontSize: 28,
    marginRight: 12,
  },

  title: {
    color: "#fbbf24",
    fontSize: 18,
    fontWeight: "800",
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 13,
  },

  features: {
    marginTop: 14,
    gap: 6,
  },

  feature: {
    color: "#f1f5f9",
    fontSize: 13,
  },

  button: {
    backgroundColor: "#fbbf24",
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  activeButton: {
    backgroundColor: "#334155",
  },

  buttonText: {
    color: "#0f172a",
    fontWeight: "800",
  },

  activeText: {
    color: "#94a3b8",
  },
});
