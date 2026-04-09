import { PlayerFull } from "@/types/playerFull";
import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ProfileHeroCard({ data }: { data: PlayerFull }) {
  const hasLabels = data.labels && data.labels.length > 0;

  return (
    <View style={styles.container}>
      {/* Name & TH */}
      <View style={styles.heroTop}>
        <View>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.tag}>{data.tag}</Text>
        </View>
        <View style={styles.thBadge}>
          <Image
            source={getIconByEntityType(data.townHallLevel, "townhall")}
            style={styles.thBadgeIcon}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* League & Trophies */}
      <View style={styles.heroMid}>
        {data.leagueTier?.iconUrls.large && (
          <Image
            source={{ uri: data.leagueTier.iconUrls.large }}
            style={styles.tierIcon}
            resizeMode="contain"
          />
        )}
        <View style={styles.leagueInfo}>
          <Text style={styles.leagueName}>{data.leagueTier?.name}</Text>
          <View style={styles.trophyRow}>
            <Text style={styles.trophyText}>{data.trophies} 🏆</Text>
            <Text style={styles.bestText}>Best: {data.bestTrophies}</Text>
          </View>
        </View>
      </View>

      {/* Helpers & Guardians */}
      {(data.helpers?.length || data.guardians?.length) && (
        <View style={styles.helperRow}>
          {data.helpers?.map((helper) => (
            <View key={`helper-${helper.id}`} style={styles.helperBadge}>
              <Image
                source={getIconByEntityType(helper.id, "helper")}
                style={styles.helperIcon}
                resizeMode="contain"
              />
              <Text style={styles.helperText}>L{helper.level}</Text>
            </View>
          ))}

          {data.guardians?.map((guardian) => (
            <View key={`guardian-${guardian.id}`} style={styles.helperBadge}>
              <Image
                source={getIconByEntityType(guardian.id, "guardian")}
                style={styles.helperIcon}
                resizeMode="contain"
              />
              <Text style={styles.helperText}>L{guardian.level}</Text>
            </View>
          ))}
        </View>
      )}
      {/* 
        TODO:
          Helpers & Guardians are not provided by Clash API.
          Data will come from:
            1. Village JSON import
            2. Future backend database
          For now this UI renders only if data exists. */}

      {/* Clan */}
      {data.clan && (
        <View style={styles.clanCard}>
          {data.clan.badgeUrls.medium && (
            <Image
              source={{ uri: data.clan.badgeUrls.medium }}
              style={styles.clanBadge}
              resizeMode="contain"
            />
          )}
          <View style={styles.clanText}>
            <Text style={styles.clanName}>{data.clan.name}</Text>
            <Text style={styles.clanDetails}>
              Lv {data.clan.clanLevel}
              {data.role
                ? ` • ${data.role.charAt(0).toUpperCase() + data.role.slice(1)}`
                : ""}
            </Text>
          </View>
        </View>
      )}

      {/* Labels */}
      {hasLabels && (
        <View style={styles.subSection}>
          <Text style={styles.subtitle}>Labels ({data.labels?.length})</Text>
          <View style={styles.labelsList}>
            {data.labels?.map((label, i) => (
              <View key={i} style={styles.labelBadge}>
                {label.iconUrls?.small && (
                  <Image
                    source={{ uri: label.iconUrls.small }}
                    style={styles.labelIcon}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.labelText} numberOfLines={1}>
                  {label.name}
                </Text>
              </View>
            ))}
          </View>
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
    marginBottom: 20,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fbbf24",
    letterSpacing: -0.5,
  },

  tag: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 4,
  },

  thBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fbbf24",
  },

  thBadgeIcon: {
    width: 44,
    height: 44,
  },

  thText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fbbf24",
  },

  heroMid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(14, 165, 233, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.3)",
  },

  tierIcon: {
    width: 44,
    height: 44,
  },

  leagueInfo: {
    flex: 1,
    gap: 4,
  },

  leagueName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0ea5e9",
  },

  trophyRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  trophyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f1f5f9",
  },

  bestText: {
    fontSize: 11,
    color: "#94a3b8",
  },

  helperRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },

  helperBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  helperIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },

  helperText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
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

  clanText: {
    flex: 1,
  },

  clanName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#22c55e",
  },

  clanDetails: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
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

  labelsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  labelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },

  labelIcon: {
    width: 18,
    height: 18,
  },

  labelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#f1f5f9",
    maxWidth: 100,
  },
});
