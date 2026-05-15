import { track } from "@/utils/analytics/analytics";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ProScreen() {
  const router = useRouter();

  useEffect(() => {
    track("screen_view", { screen: "pro" });
  }, []);

  const handleUpgrade = () => {
    // TODO: RevenueCat
    console.log("Upgrade clicked");
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Become an Architect</Text>
      <Text style={styles.subtitle}>
        Stop wasting builders. Run your village like a system.
      </Text>

      {/* FEATURES */}
      <View style={styles.features}>
        <Feature text="🧠 Smart upgrade priority engine (what to upgrade next)" />
        <Feature text="📊 Multi-account tracking (no limits)" />
        <Feature text="🔔 Precise completion notifications (no idle time)" />
        <Feature text="⚡ Faster sync + background optimization" />
        <Feature text="📅 Upgrade planning (coming soon)" />
        <Feature text="📝 Strategy notes & planning (coming soon)" />
      </View>

      {/* PRICING */}
      <View style={styles.pricingCard}>
        <Text style={styles.price}>₹149</Text>
        <Text style={styles.priceSub}>One-time • Lifetime access</Text>
      </View>

      {/* CTA */}
      <Pressable style={styles.cta} onPress={handleUpgrade}>
        <Text style={styles.ctaText}>Unlock Architect</Text>
      </Pressable>

      {/* SECONDARY */}
      <Pressable onPress={() => router.back()}>
        <Text style={styles.secondary}>Continue without upgrade</Text>
      </Pressable>
    </View>
  );
}

function Feature({ text }: { text: string }) {
  return <Text style={styles.featureText}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    justifyContent: "center",
  },

  title: {
    color: "#fbbf24",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },

  features: {
    marginVertical: 20,
    gap: 10,
  },

  featureText: {
    color: "#f1f5f9",
    fontSize: 14,
    fontWeight: "600",
  },

  pricingCard: {
    backgroundColor: "rgba(251,191,36,0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginVertical: 20,
  },

  price: {
    color: "#fbbf24",
    fontSize: 28,
    fontWeight: "800",
  },

  priceSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },

  cta: {
    backgroundColor: "#fbbf24",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  ctaText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },

  secondary: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 16,
    fontSize: 12,
  },
});
