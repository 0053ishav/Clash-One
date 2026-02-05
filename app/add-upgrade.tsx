import { addBuilderUpgrade } from "@/storage/builderUpgrades";
import { createBuilderUpgrade } from "@/utils/createBuilderUpgrade";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddUpgradeScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  return (
    <View style={styles.container}>
      {/* Upgrade Name */}
      <View style={styles.field}>
        <TextInput
          style={styles.input}
          placeholder="e.g. Archer Tower"
          placeholderTextColor="#afaeae"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Duration */}
      <View style={styles.field}>
        <Text style={styles.label}>Duration</Text>
        <View style={styles.durationRow}>
          <TextInput
            style={styles.durationInput}
            placeholder="Days"
            placeholderTextColor="#afaeae"
            keyboardType="number-pad"
            value={days}
            onChangeText={setDays}
          />
          <TextInput
            style={styles.durationInput}
            placeholder="Hours"
            placeholderTextColor="#afaeae"
            keyboardType="number-pad"
            value={hours}
            onChangeText={setHours}
          />
          <TextInput
            style={styles.durationInput}
            placeholder="Minutes"
            placeholderTextColor="#afaeae"
            keyboardType="number-pad"
            value={minutes}
            onChangeText={setMinutes}
          />
        </View>
      </View>

      {/* Start Button */}
      <Pressable
        style={styles.startButton}
        onPress={async () => {
          if (!name) return;

          const upgrade = await createBuilderUpgrade({
            name,
            days: Number(days || 0),
            hours: Number(hours || 0),
            minutes: Number(minutes || 0),
          });
          console.log("Start upgrade pressed", {
            name,
            days,
            hours,
            minutes,
          });
          addBuilderUpgrade(upgrade);
          router.back();
        }}
      >
        <Text style={styles.startButtonText}>Start Upgrade</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
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
    marginBottom: 24,
  },

  field: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#555",
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },

  durationRow: {
    flexDirection: "row",
    gap: 12,
  },

  durationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },

  startButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    marginBottom: 16,
  },

  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  cancelText: {
    textAlign: "center",
    color: "#777",
  },
});
