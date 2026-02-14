import { setOnboardingComplete } from "@/storage/appConfig";
import { configureNotifications } from "@/utils/notificationEngine";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Track Your Builders",
    description:
      "Manually track your active upgrades and know exactly when builders are free.",
    image: require("@/assets/images/builder/builder-working.png"),
  },
  {
    title: "Smart Widget",
    description:
      "See countdown and progress directly from your home screen widget.",
    image: require("@/assets/images/builder/builder-board.png"),
  },
  {
    title: "Stay Ahead",
    description: "Never waste builder time again. Optimize your upgrade flow.",
    image: require("@/assets/images/builder/builder-idle.png"),
  },
  {
    title: "Enable Notifications",
    description:
      "Get notified exactly when upgrades finish so you never waste builder time.",
    image: require("@/assets/images/builder/builder-complete.png"),
    type: "notification",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (index + 1) * width,
        animated: true,
      });
      setIndex(index + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setOnboardingComplete();
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      {/* Skip */}
      <Pressable style={styles.skip} onPress={finishOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <Image source={slide.image} style={styles.image} />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>

            {slide.type === "notification" && (
              <Pressable
                style={({ pressed }) => [
                  styles.enableButton,
                  notificationsGranted && styles.enableButtonActive,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={async () => {
                  const { status } =
                    await Notifications.requestPermissionsAsync();

                  if (status === "granted") {
                    await configureNotifications();
                    setNotificationsGranted(true);
                  }
                }}
              >
                <Text style={styles.enableButtonText}>
                  {notificationsGranted
                    ? "Notifications Enabled ✓"
                    : "Enable Notifications"}{" "}
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <Text key={i} style={[styles.dot, i === index && styles.dotActive]}>
            ●
          </Text>
        ))}
      </View>

      {/* Button */}
      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {index === SLIDES.length - 1 ? "Get Started" : "Next"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  skip: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },

  skipText: {
    color: "#9ca3af",
    fontSize: 14,
  },

  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  image: {
    width: 120,
    height: 120,
    marginBottom: 40,
    resizeMode: "contain",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    color: "#9ca3af",
    textAlign: "center",
  },

  enableButton: {
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: "#ffd33d",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  enableButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.3,
  },

  enableButtonActive: {
    backgroundColor: "#16a34a",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },

  dot: {
    fontSize: 10,
    marginHorizontal: 6,
    color: "#475569",
  },

  dotActive: {
    color: "#ffd33d",
  },

  button: {
    marginHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#ffd33d",
    alignItems: "center",
    marginBottom: 50,
  },

  buttonText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#000",
  },
});
