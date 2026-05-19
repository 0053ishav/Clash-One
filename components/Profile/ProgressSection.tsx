import { PlayerFull } from "@/types/playerFull";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function ProgressSection({ data }: { data: PlayerFull }) {
  const hasAchievements = data.achievements && data.achievements.length > 0;

  if (!hasAchievements) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={20} color="#fbbf24" />
        <Text style={styles.title}>Progress</Text>
      </View>

      {/* Achievements */}
      {hasAchievements && (
        <View style={styles.subSection}>
          <Text style={styles.subtitle}>
            Achievements ({data.achievements?.length})
          </Text>
          <View style={styles.achievementsList}>
            {data.achievements?.slice(0, 5).map((achievement, i) => (
              <AchievementItem
                key={i}
                name={achievement.name}
                stars={achievement.stars}
                info={achievement.info}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function AchievementItem({ name, stars, info }: any) {
  return (
    <View style={styles.achievementItem}>
      <Text style={styles.achievementStars}>
        {"⭐".repeat(Math.min(stars || 0, 3))}
      </Text>
      <View style={styles.achievementText}>
        <Text style={styles.achievementName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.achievementInfo} numberOfLines={1}>
          {info}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f1f5f9",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  subSection: {
    gap: 8,
  },

  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  achievementsList: {
    gap: 8,
  },

  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0f172a",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },

  achievementIcon: {
    width: 32,
    height: 32,
  },

  achievementText: {
    flex: 1,
    gap: 8,
  },

  achievementName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f1f5f9",
  },

  achievementInfo: {
    fontSize: 10,
    fontWeight: "400",
    color: "#f1f5f97e",
  },

  achievementStars: {
    fontSize: 10,
    marginTop: 2,
  },
});
