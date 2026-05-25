// app/(tabs)/analytics.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import { DimensionValue, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalyticsScreen() {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: "#0f172a",
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 18,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text
            style={{
              color: "#fbbf24",
              fontSize: 30,
              fontWeight: "900",
            }}
          >
            Analytics
          </Text>

          <View
            style={{
              backgroundColor: "rgba(251,191,36,0.12)",
              borderWidth: 1,
              borderColor: "rgba(251,191,36,0.25)",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: "#fbbf24",
                fontSize: 10,
                fontWeight: "800",
                letterSpacing: 0.8,
              }}
            >
              COMING SOON
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: "#94a3b8",
            marginTop: 8,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          Account intelligence, efficiency tracking, and progression insights.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#0f172a" }}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: "#1e293b",
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: "#334155",
          }}
        >
          <Text
            style={{
              color: "#94a3b8",
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            ACCOUNT INTELLIGENCE
          </Text>

          <Text
            style={{
              color: "#f8fafc",
              fontSize: 26,
              fontWeight: "900",
            }}
          >
            Efficiency Score
          </Text>

          <Text
            style={{
              color: "#fbbf24",
              fontSize: 56,
              fontWeight: "900",
              marginTop: 10,
            }}
          >
            92
          </Text>

          <Text
            style={{
              color: "#94a3b8",
              marginTop: 6,
            }}
          >
            Higher than 84% of tracked accounts
          </Text>
        </View>

        {/* Analytics Cards */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {[
            {
              label: "Builder Uptime",
              value: "96%",
              icon: "construct",
            },
            {
              label: "Idle Time",
              value: "4h",
              icon: "time",
            },
            {
              label: "Upgrades",
              value: "18",
              icon: "trending-up",
            },
            {
              label: "Saved Time",
              value: "22h",
              icon: "flash",
            },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                width: "47%",
                backgroundColor: "#1e293b",
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: "#334155",
              }}
            >
              <Ionicons name={item.icon as any} size={22} color="#fbbf24" />

              <Text
                style={{
                  color: "#f8fafc",
                  fontSize: 24,
                  fontWeight: "800",
                  marginTop: 12,
                }}
              >
                {item.value}
              </Text>

              <Text
                style={{
                  color: "#94a3b8",
                  marginTop: 4,
                }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Activity */}
        <View
          style={{
            backgroundColor: "#1e293b",
            borderRadius: 20,
            padding: 18,
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
            Weekly Progress
          </Text>

          {[
            "🔥 Builder uptime increased by 6%",
            "⚡ 18 upgrades completed",
            "📈 Idle time reduced by 4h",
            "🏆 Most efficient account this week",
          ].map((item) => (
            <View
              key={item}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#334155",
              }}
            >
              <Text
                style={{
                  color: "#cbd5e1",
                  fontSize: 15,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Multi Account */}
        <View
          style={{
            backgroundColor: "#1e293b",
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: "#334155",
          }}
        >
          <Text
            style={{
              color: "#f8fafc",
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 18,
            }}
          >
            Multi-Account Comparison
          </Text>

          {[
            {
              name: "Main Account",
              score: "96%",
            },
            {
              name: "Donation Account",
              score: "71%",
            },
            {
              name: "War Alt",
              score: "88%",
            },
          ].map((acc) => (
            <View
              key={acc.name}
              style={{
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: "#f8fafc",
                    fontWeight: "600",
                  }}
                >
                  {acc.name}
                </Text>

                <Text
                  style={{
                    color: "#fbbf24",
                    fontWeight: "800",
                  }}
                >
                  {acc.score}
                </Text>
              </View>

              <View
                style={{
                  height: 10,
                  backgroundColor: "#334155",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: acc.score as DimensionValue,
                    height: "100%",
                    backgroundColor: "#fbbf24",
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Future Features */}
        <View
          style={{
            backgroundColor: "#172033",
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: "#334155",
          }}
        >
          <Text
            style={{
              color: "#f8fafc",
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 14,
            }}
          >
            Upcoming Intelligence
          </Text>

          {[
            "Upgrade forecasting",
            "Builder optimization engine",
            "Progress prediction",
            "Account efficiency trends",
            "Behavioral insights",
          ].map((feature) => (
            <View
              key={feature}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="analytics" size={18} color="#fbbf24" />

              <Text
                style={{
                  color: "#cbd5e1",
                  marginLeft: 10,
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
