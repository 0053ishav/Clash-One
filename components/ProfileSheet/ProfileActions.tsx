import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProfileActionsProps {
  onSync: () => void;
  onSetting: () => void;
  onOpenProfile: () => void;
  onClose: () => void;
}

export default function ProfileActions({
  onSync,
  onSetting,
  onClose,
}: ProfileActionsProps) {
  const router = useRouter();

  const handleOpenProfile = () => {
    onClose();
    router.push("/profile");
  };

  return (
    <View style={styles.container}>
      <ActionButton
        label="Sync Profile"
        description="Update from Clash API"
        icon="sync"
        buttonStyle={styles.syncButton}
        iconBg="#fbbf24"
        onPress={onSync}
      />

      <ActionButton
        label="Full Profile"
        description="View all details"
        icon="person"
        buttonStyle={styles.profileButton}
        iconBg="#0ea5e9"
        onPress={handleOpenProfile}
      />

      <ActionButton
        label="Settings"
        description="App preferences"
        icon="settings"
        buttonStyle={styles.settingsButton}
        iconBg="#f87171"
        onPress={onSetting}
      />
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  description: string;
  icon: any;
  buttonStyle: any;
  iconBg: string;
  onPress: () => void;
}

function ActionButton({
  label,
  description,
  icon,
  buttonStyle,
  iconBg,
  onPress,
}: ActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        buttonStyle,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color="#0f172a" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  syncButton: {
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    borderColor: "#fbbf24",
  },

  profileButton: {
    backgroundColor: "rgba(14, 165, 233, 0.15)",
    borderColor: "#0ea5e9",
  },

  settingsButton: {
    backgroundColor: "rgba(248, 113, 113, 0.15)",
    borderColor: "#f87171",
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    gap: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  description: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
});
