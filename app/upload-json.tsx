import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function UploadJsonScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>PLAYER DATA IMPORT</Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#6b7280"
            />
            <Text style={styles.description}>
              Your player file stays on your device. It is never uploaded or
              shared.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Export</Text>

          <View style={styles.steps}>
            <Text style={styles.step}>1. Open Clash of Clans</Text>
            <Text style={styles.step}>2. Go to Settings → More Settings</Text>
            <Text style={styles.step}>3. Tap “Export Player Data”</Text>
            <Text style={styles.step}>4. Upload the JSON file here</Text>
          </View>
        </View>

        <Pressable
          style={styles.uploadButton}
          onPress={() => {
            console.log("Upload JSON pressed");
          }}
        >
          <Ionicons name="cloud-upload-outline" size={18} color="#000" />
          <Text style={styles.uploadButtonText}>Upload JSON</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#eef2f7",
  },

  container: {
    padding: 20,
    paddingBottom: 60,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: 1,
    marginBottom: 14,
    textTransform: "uppercase",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2328",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  description: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },

  steps: {
    gap: 10,
  },

  step: {
    fontSize: 14,
    color: "#374151",
  },

  uploadButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffd33d",
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    marginTop: 10,
  },

  uploadButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  backText: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 14,
    color: "#6b7280",
  },
});
