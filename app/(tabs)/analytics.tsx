import { Text, View } from "react-native";

export default function AnalyticsScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f172a",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          color: "#f8fafc",
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 12,
        }}
      >
        Coming Soon
      </Text>

      <Text
        style={{
          color: "#94a3b8",
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        Advanced multi-account insights, efficiency tracking, upgrade analytics,
        and progression intelligence.
      </Text>
    </View>
  );
}
