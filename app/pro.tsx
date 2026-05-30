import { track } from "@/utils/analytics/analytics";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ProScreen() {
  const router = useRouter();

  useEffect(() => {
    track("screen_view", { screen: "pro" });
  }, []);

  const handleChief = () => {
    console.log("RevenueCat Lifetime Purchase");
  };

  const handleFieldMarshal = () => {
    console.log("Coming Soon");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Choose Your Path</Text>

      <Text style={styles.subtitle}>
        Track villages for free. Upgrade when you need more power.
      </Text>

      {/* FREE */}
      <PlanCard
        badge="CURRENT PLAN"
        title="FREE"
        price="₹0"
        subtitle="Everything needed to track your villages"
        features={[
          "Builder Tracking",
          "Lab Tracking",
          "Hero Tracking",
          "Pet Tracking",
          "Notifications",
          "Multi-Account Support",
          "Limited Widget Accounts",
          "Ads Supported",
        ]}
        buttonLabel="Current Plan"
        disabled
      />

      {/* CHIEF */}
      <PlanCard
        badge="LIFETIME"
        title="CHIEF"
        price="₹199"
        subtitle="Personal progression & planning"
        highlight
        features={[
          "Remove Ads",
          "Unlimited Widget Accounts",
          "COMING SOON",
          "📊 Base Progress Tracking",
          "📝 Upgrade Planner",
          "🧠 Smart Suggestions",
          "📈 Weekly Progress Reports",
          "⚡ Builder Optimization",
          "🔮 Upgrade Forecasting",
          "👥 Multi-Account Intelligence",
        ]}
        buttonLabel="Unlock Chief"
        onPress={handleChief}
      />

      {/* FIELD MARSHAL */}
      <PlanCard
        badge="COMING SOON"
        title="FIELD MARSHAL"
        price="Future Subscription"
        subtitle="Clan leadership & war intelligence"
        features={[
          "⚔️ War Analytics",
          "🗺️ War Map Intelligence",
          "📢 Leader Coordination Tools",
          "🏆 CWL Tracking",
          "🔔 Real-Time War Alerts",
          "📊 Clan Performance Analytics",
          "📈 Attack Efficiency Tracking",
          "🎯 Attack Reminders",
        ]}
        buttonLabel="Coming Soon"
        disabled
        marshal
      />

      <Pressable onPress={() => router.back()}>
        <Text style={styles.secondary}>Continue without upgrading</Text>
      </Pressable>
    </ScrollView>
  );
}

type PlanCardProps = {
  badge: string;
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  buttonLabel: string;
  disabled?: boolean;
  highlight?: boolean;
  marshal?: boolean;
  onPress?: () => void;
};

function PlanCard({
  badge,
  title,
  price,
  subtitle,
  features,
  buttonLabel,
  disabled,
  highlight,
  marshal,
  onPress,
}: PlanCardProps) {
  return (
    <View
      style={[
        styles.card,
        highlight && styles.highlightCard,
        marshal && styles.marshalCard,
      ]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>

      <Text style={styles.planTitle}>{title}</Text>

      <Text style={styles.price}>{price}</Text>

      <Text style={styles.planSubtitle}>{subtitle}</Text>

      <View style={styles.features}>
        {features.map((feature, index) => (
          <Text
            key={`${feature}-${index}`}
            style={[
              styles.feature,
              feature === "COMING SOON" && styles.comingSoon,
            ]}
          >
            {feature === "COMING SOON" ? feature : `✓ ${feature}`}
          </Text>
        ))}
      </View>

      <Pressable
        style={[styles.button, disabled && styles.disabledButton]}
        disabled={disabled}
        onPress={onPress}
      >
        <Text
          style={[styles.buttonText, disabled && styles.disabledButtonText]}
        >
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    color: "#fbbf24",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 20,
  },

  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },

  highlightCard: {
    borderColor: "#fbbf24",
  },

  marshalCard: {
    borderColor: "#38bdf8",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(251,191,36,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: "800",
  },

  planTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 12,
  },

  price: {
    color: "#fbbf24",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 8,
  },

  planSubtitle: {
    color: "#94a3b8",
    marginTop: 4,
  },

  features: {
    marginTop: 18,
    gap: 10,
  },

  feature: {
    color: "#f8fafc",
    fontSize: 14,
  },

  comingSoon: {
    color: "#fbbf24",
    fontWeight: "800",
    marginTop: 4,
  },

  button: {
    marginTop: 22,
    backgroundColor: "#fbbf24",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 15,
  },

  disabledButton: {
    backgroundColor: "#334155",
  },

  disabledButtonText: {
    color: "#94a3b8",
  },

  secondary: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 10,
    marginBottom: 30,
  },
});
