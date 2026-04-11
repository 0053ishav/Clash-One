import { PlayerProfile } from "@/types/player";
import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ProfileHeader({ profile }: { profile: PlayerProfile }) {
  if (!profile.playerTag) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-circle-outline" size={48} color="#64748b" />
        <Text style={styles.emptyTitle}>No Account Synced</Text>
        <Text style={styles.emptySubtitle}>
          Import village JSON to sync your profile
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Row - Name & Tier Icon */}
      <View style={styles.topRow}>
        <View style={styles.nameSection}>
          <Text style={styles.playerName}>{profile.playerName || "Chief"}</Text>
          <Text style={styles.playerTag}>{profile.playerTag}</Text>
          {profile.expLevel && (
            <Text style={styles.expLevel}>Exp Level {profile.expLevel}</Text>
          )}
        </View>

        {profile.leagueTierIconUrl && (
          <Image
            source={{ uri: profile.leagueTierIconUrl }}
            style={styles.tierIcon}
            resizeMode="contain"
          />
        )}
      </View>

      {/* League & TH Row */}
      <View style={styles.leagueThRow}>
        <View style={styles.thBadge}>
          <Image
            source={getIconByEntityType(profile.townHallLevel, "townhall")}
            style={styles.thBadgeIcon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.leagueInfo}>
          {profile.leagueTierName && (
            <Text style={styles.leagueName}>{profile.leagueTierName}</Text>
          )}
          {typeof profile.trophies === "number" && (
            <Text style={styles.trophies}>{profile.trophies} 🏆</Text>
          )}

          {typeof profile.bestTrophies === "number" && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.bestTrophies}>
                Best: {profile.bestTrophies}
              </Text>
              <Image
                source={{ uri: profile.leagueIconUrl }}
                style={styles.tierIcon}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </View>

      {/* Clan Card */}
      {profile.clanName && (
        <View style={styles.clanCard}>
          {profile.clanBadgeUrl && (
            <Image
              source={{ uri: profile.clanBadgeUrl }}
              style={styles.clanBadge}
              resizeMode="contain"
            />
          )}
          <View style={styles.clanContent}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.clanName}>{profile.clanName}</Text>

              {/* Clan Tag (secondary info) */}
              <Text style={styles.clanTag}>{profile.clanTag}</Text>
            </View>

            <View style={styles.clanMeta}>
              {profile.clanLevel && (
                <Text style={styles.clanMetaText}>Lv {profile.clanLevel}</Text>
              )}
              {profile.role && (
                <Text style={styles.clanMetaText}>
                  •{" "}
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Labels */}
      {profile.labels && profile.labels.length > 0 && (
        <View style={styles.labelsRow}>
          {profile.labels.slice(0, 4).map((label, index) => (
            <Image
              key={index}
              source={{ uri: label.iconUrl }}
              style={styles.labelIcon}
              resizeMode="contain"
            />
          ))}
        </View>
      )}
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
    marginBottom: 16,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  emptySubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  nameSection: {
    flex: 1,
    gap: 3,
  },

  playerName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fbbf24",
    letterSpacing: -0.5,
  },

  playerTag: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
  },

  expLevel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },

  tierIcon: {
    width: 40,
    height: 40,
  },

  leagueThRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  thBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#fbbf24",
  },

  thBadgeIcon: {
    width: 44,
    height: 44,
  },

  thText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fbbf24",
  },

  leagueInfo: {
    flex: 1,
    gap: 2,
  },

  leagueName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0ea5e9",
  },

  trophies: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f1f5f9",
  },

  bestTrophies: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },

  clanCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },

  clanBadge: {
    width: 36,
    height: 36,
  },

  clanContent: {
    flex: 1,
    gap: 2,
  },

  clanName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#22c55e",
  },

  clanTag: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    backgroundColor: "rgba(148,163,184,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  clanMeta: {
    flexDirection: "row",
    gap: 4,
  },

  clanMetaText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },

  labelsRow: {
    flexDirection: "row",
    gap: 6,
  },

  labelIcon: {
    width: 24,
    height: 24,
  },
});
