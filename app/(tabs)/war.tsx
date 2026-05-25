import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, Text, View } from "react-native";

const warFeatures = [
  {
    icon: "shield-checkmark-outline",
    title: "Live War Map",
    description:
      "Track both clans with real-time stars, destruction, and remaining attacks.",
  },
  {
    icon: "flash-outline",
    title: "Attack Feed",
    description:
      "See every attack instantly with stars, percentages, and replay-ready insights.",
  },
  {
    icon: "notifications-outline",
    title: "Smart Notifications",
    description:
      "Get alerts for remaining attacks, war ending soon, triples, and missed hits.",
  },
  {
    icon: "time-outline",
    title: "War Timers",
    description:
      "Preparation day, battle day, CWL rounds, and clan reminders in one place.",
  },
  {
    icon: "analytics-outline",
    title: "War Intelligence",
    description:
      "Track hit rates, attack consistency, cleanup efficiency, and clan performance.",
  },
];

export default function WarScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0f172a" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: "#1e293b",
          borderRadius: 24,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: "#334155",
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundColor: "#f59e0b20",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <Ionicons name="shield-half-outline" size={38} color="#fbbf24" />
        </View>

        <Text
          style={{
            color: "#f8fafc",
            fontSize: 30,
            fontWeight: "800",
            marginBottom: 8,
          }}
        >
          War System
        </Text>

        <Text
          style={{
            color: "#94a3b8",
            fontSize: 15,
            lineHeight: 24,
          }}
        >
          Real-time clan war tracking, attack intelligence, smart reminders, and
          live coordination tools built for serious Clash players.
        </Text>

        <View
          style={{
            marginTop: 18,
            alignSelf: "flex-start",
            backgroundColor: "#f59e0b20",
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              color: "#fbbf24",
              fontWeight: "700",
              fontSize: 13,
            }}
          >
            COMING SOON
          </Text>
        </View>
      </View>

      {/* Mock War Card */}
      <View
        style={{
          backgroundColor: "#1e293b",
          borderRadius: 24,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: "#334155",
        }}
      >
        <Text
          style={{
            color: "#f8fafc",
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 16,
          }}
        >
          Live War Preview
        </Text>

        <View
          style={{
            backgroundColor: "#0f172a",
            borderRadius: 18,
            padding: 18,
          }}
        >
          {/* Clan Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#f8fafc",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                ALL FOR ONE
              </Text>

              <Text style={{ color: "#94a3b8", marginTop: 4 }}>
                38 ⭐ • 88.2%
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: "#f8fafc",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                VIKINGS
              </Text>

              <Text style={{ color: "#94a3b8", marginTop: 4 }}>
                37 ⭐ • 89.9%
              </Text>
            </View>
          </View>

          {/* Timer */}
          <View
            style={{
              backgroundColor: "#1e293b",
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#fbbf24",
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              WAR ENDING SOON
            </Text>

            <Text
              style={{
                color: "#f8fafc",
                fontSize: 22,
                fontWeight: "800",
              }}
            >
              2h 14m
            </Text>
          </View>

          {/* Mock Feed */}
          <View style={{ gap: 10 }}>
            <View
              style={{
                backgroundColor: "#1e293b",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <Text style={{ color: "#f8fafc", fontWeight: "600" }}>
                🔥 Turtle tripled #10
              </Text>

              <Text style={{ color: "#94a3b8", marginTop: 4 }}>
                3⭐ • 100% destruction
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "#1e293b",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <Text style={{ color: "#f8fafc", fontWeight: "600" }}>
                ⚠️ 3 attacks remaining
              </Text>

              <Text style={{ color: "#94a3b8", marginTop: 4 }}>
                Leader reminder notification triggered
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Features */}
      <Text
        style={{
          color: "#f8fafc",
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 16,
        }}
      >
        Planned Features
      </Text>

      <View style={{ gap: 14 }}>
        {warFeatures.map((feature) => (
          <View
            key={feature.title}
            style={{
              backgroundColor: "#1e293b",
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: "#334155",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: "#334155",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name={feature.icon as any} size={24} color="#fbbf24" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#f8fafc",
                  fontSize: 16,
                  fontWeight: "700",
                  marginBottom: 6,
                }}
              >
                {feature.title}
              </Text>

              <Text
                style={{
                  color: "#94a3b8",
                  lineHeight: 22,
                }}
              >
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
