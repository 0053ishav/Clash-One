import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

interface Props {
  visible: boolean;
  message?: string;
}

export default function AppLoadingOverlay({
  visible,
  message = "Loading...",
}: Props) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!visible) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [visible, scaleAnim]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[styles.content, { transform: [{ scale: scaleAnim }] }]}
      >
        <Image
          source={require("@/assets/images/builder/builder-working.png")}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  image: {
    width: 90,
    height: 90,
  },
  text: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fbbf24",
  },
});
