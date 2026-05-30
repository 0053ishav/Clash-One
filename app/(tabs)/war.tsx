// app/(tabs)/war.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WarScreen() {
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
            War
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
          Real-time clan war coordination, attack tracking, and war
          intelligence.
        </Text>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#0f172a" }}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
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
              color: "#94a3b8",
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            LIVE WAR
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 18,
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
                C.R.E.A.M
              </Text>

              <Text
                style={{
                  color: "#64748b",
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                #2JRY8U8L9
              </Text>

              <Text
                style={{
                  color: "#fbbf24",
                  fontSize: 34,
                  fontWeight: "900",
                  marginTop: 8,
                }}
              >
                38⭐
              </Text>

              <Text style={{ color: "#94a3b8" }}>88.2%</Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: "#ef4444",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                2h 14m
              </Text>

              <Text style={{ color: "#64748b", marginTop: 4 }}>WAR ENDS</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: "#f8fafc",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                NO ONE
              </Text>

              <Text
                style={{
                  color: "#64748b",
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                #Y98GYJC2
              </Text>

              <Text
                style={{
                  color: "#fbbf24",
                  fontSize: 34,
                  fontWeight: "900",
                  marginTop: 8,
                }}
              >
                37⭐
              </Text>

              <Text style={{ color: "#94a3b8" }}>89.9%</Text>
            </View>
          </View>
        </View>

        {/* Status Cards */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
          }}
        >
          {[
            {
              label: "Attacks Used",
              value: "25/30",
              icon: "flash",
            },
            {
              label: "Remaining",
              value: "5",
              icon: "time",
            },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                flex: 1,
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
                  marginTop: 10,
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

        {/* Live Feed */}
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
            Live Attack Feed
          </Text>

          {[
            "🔥 Phantom tripled #10",
            "⚔️ Dream attacked #1 (72%)",
            "⚠️ 4 attacks remaining",
            "🔥 War lead +1 star",
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

        {/* War Map Preview */}
        <View
          style={{
            backgroundColor: "#1e293b",
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: "#334155",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                color: "#f8fafc",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              War Map
            </Text>

            <Text
              style={{
                color: "#fbbf24",
                fontWeight: "700",
              }}
            >
              Coming Soon
            </Text>
          </View>

          {[1, 2, 3, 4].map((base) => (
            <View
              key={base}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#0f172a",
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: "#f8fafc",
                  fontWeight: "700",
                }}
              >
                #{base}
              </Text>

              <Text style={{ color: "#94a3b8" }}>⭐⭐⭐ 100%</Text>

              <Text style={{ color: "#22c55e" }}>Cleared</Text>
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
            Upcoming Features
          </Text>

          {[
            "Real-time war notifications",
            "CWL tracking",
            "Attack reminders",
            "War map intelligence",
            "Leader coordination tools",
          ].map((feature) => (
            <View
              key={feature}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="checkmark-circle" size={18} color="#fbbf24" />

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
