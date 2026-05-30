"use no memo";

import { isChiefOrAbove } from "@/utils/premium";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle: string;
  image: any;
  selected?: boolean;
  onPress?: () => void;
  isLocked?: boolean;
  onLockedPress?: () => void;
};

export default function WidgetPreviewCard({
  title,
  subtitle,
  image,
  selected = false,
  onPress,
  isLocked = false,
  onLockedPress,
}: Props) {
  const isPro = isChiefOrAbove();
  const isActuallyLocked = isLocked && !isPro;

  const handlePress = () => {
    if (isActuallyLocked) {
      onLockedPress?.(); // 🔥 trigger paywall
      return;
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
    >
      <View style={[styles.card, selected && styles.selected]}>
        {/* 🖼 Image */}
        <Image source={image} style={styles.image} resizeMode="contain" />

        {/* 🔒 LOCK OVERLAY */}
        {isActuallyLocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={18} color="#fff" />
            <Text style={styles.lockText}>Pro</Text>
          </View>
        )}

        {/* 🔥 Data Overlay */}
        <View style={styles.overlay}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* ✅ Selected */}
        {!isActuallyLocked && selected && (
          <View style={styles.checkmark}>
            <Text style={styles.check}>✓</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
  },

  selected: {
    borderWidth: 2,
    borderColor: "#fbbf24",
  },

  image: {
    width: "100%",
    height: 140,
  },

  overlay: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },

  subtitle: {
    fontSize: 12,
    color: "#cbd5e1",
    marginTop: 2,
  },

  checkmark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fbbf24",
    justifyContent: "center",
    alignItems: "center",
  },

  check: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 14,
  },

  // 🔒 LOCK STATE (IMPORTANT)
  lockOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  lockText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
