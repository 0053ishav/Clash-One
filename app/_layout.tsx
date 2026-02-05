import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#25292e",
        },
        headerTintColor: "#fff",
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="upload-json"
        options={{ title: "Import Player Data" }}
      />

      <Stack.Screen name="add-upgrade" options={{ title: "Add Upgrade" }} />

      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}
