import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function UploadJsonScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Clash Widget uses your player data only to set up builders and lab. This
        file is stored locally on your device and never uploaded.
      </Text>

      <View style={styles.steps}>
        <Text style={styles.step}>1. Open Clash of Clans</Text>
        <Text style={styles.step}>2. Go to Settings → More Settings</Text>
        <Text style={styles.step}>3. Export Player Data</Text>
        <Text style={styles.step}>4. Upload the JSON file here</Text>
      </View>

      <Pressable
        style={styles.uploadButton}
        onPress={() => {
          // logic comes later
          console.log("Upload JSON pressed");
        }}
      >
        <Text style={styles.uploadButtonText}>Upload JSON</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },

  steps: {
    marginBottom: 30,
  },

  step: {
    fontSize: 14,
    marginBottom: 6,
  },

  uploadButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    marginBottom: 16,
  },

  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  backText: {
    textAlign: "center",
    color: "#777",
  },
});
