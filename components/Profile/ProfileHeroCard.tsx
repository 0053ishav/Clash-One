import { PlayerFull } from "@/types/playerFull";
import { EntityRecord } from "@/types/upgrade";
import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileHeroCard({
  data,
  helpers,
  guardians,
}: {
  data: PlayerFull;
  helpers: EntityRecord[];
  guardians: EntityRecord[];
}) {
  const hasLabels = data.labels && data.labels.length > 0;
  const hasHelpers = helpers.length > 0;
  const hasGuardians = guardians.length > 0;

  return (
    <View style={styles.container}>
      {/* Name & TH */}
      <View style={styles.heroTop}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.tag}>{data.tag}</Text>
        </View>
        <View style={styles.thBadge}>
          <Image
            source={getIconByEntityType(data.townHallLevel, "townhall")}
            style={styles.thBadgeIcon}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        </View>
      </View>

      {/* League & Trophies */}
      <View style={styles.heroMid}>
        {data.leagueTier?.iconUrls.large && (
          <View style={styles.tierIconWrapper}>
            <Image
              source={{ uri: data.leagueTier.iconUrls.large }}
              style={styles.tierIcon}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
        )}
        <View style={styles.leagueInfo}>
          <Text style={styles.leagueName}>{data.leagueTier?.name}</Text>
          <View style={styles.trophyRow}>
            <View style={styles.trophyBadge}>
              <Text style={styles.trophyText}>{data.trophies}</Text>
              <Text style={styles.trophyEmoji}>🏆</Text>
            </View>
            <Text style={styles.bestText}>Best: {data.bestTrophies}</Text>
          </View>
        </View>
      </View>

      {/* Helpers & Guardians */}
      {(hasHelpers || hasGuardians) && (
        <View style={styles.entityContainer}>
          {hasHelpers && (
            <View style={styles.entityColumn}>
              <View style={styles.entityHeader}>
                <Ionicons name="hammer" size={14} color="#f97316" />
                <Text style={styles.entityTitle}>
                  Helpers ({helpers.length})
                </Text>
              </View>
              <View style={styles.entityList}>
                {helpers.map((helper) => (
                  <View key={`helper-${helper.id}`} style={styles.helperBadge}>
                    <Image
                      source={getIconByEntityType(helper.dataId, "helper")}
                      style={styles.helperIcon}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                    <Text style={styles.helperLevel}>L{helper.level}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {hasGuardians && (
            <View style={styles.entityColumn}>
              <View style={styles.entityHeader}>
                <Ionicons name="shield" size={14} color="#06b6d4" />
                <Text style={styles.entityTitle}>
                  Guardians ({guardians.length})
                </Text>
              </View>
              <View style={styles.entityList}>
                {guardians.map((guardian) => (
                  <View
                    key={`guardian-${guardian.id}`}
                    style={styles.guardianBadge}
                  >
                    <Image
                      source={getIconByEntityType(guardian.dataId, "guardian")}
                      style={styles.helperIcon}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                    <Text style={styles.guardianLevel}>L{guardian.level}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Clan */}
      {data.clan && (
        <View style={styles.clanCard}>
          {data.clan.badgeUrls.medium && (
            <View style={styles.clanBadgeWrapper}>
              <Image
                source={{ uri: data.clan.badgeUrls.medium }}
                style={styles.clanBadge}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>
          )}
          <View style={styles.clanText}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.clanName}>{data.clan.name}</Text>
              <Text style={styles.clanTag}>{data.clan.tag}</Text>
            </View>
            <View style={styles.clanDetailsRow}>
              <View style={styles.clanLevelBadge}>
                <Text style={styles.clanLevelText}>
                  Lv {data.clan.clanLevel}
                </Text>
              </View>
              {data.role && (
                <>
                  <Text style={styles.clanDivider}>•</Text>
                  <Text style={styles.clanRole}>
                    {data.role.charAt(0).toUpperCase() + data.role.slice(1)}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Labels */}
      {hasLabels && (
        <View style={styles.labelsSection}>
          <View style={styles.labelsSectionHeader}>
            <Ionicons name="pricetag" size={14} color="#a78bfa" />
            <Text style={styles.labelsTitle}>
              Labels ({data.labels?.length})
            </Text>
          </View>
          <View style={styles.labelsList}>
            {data.labels?.map((label, i) => (
              <View key={i} style={styles.labelBadge}>
                {label.iconUrls?.small && (
                  <Image
                    source={{ uri: label.iconUrls.small }}
                    style={styles.labelIcon}
                    contentFit="contain"
                    cachePolicy="memory-disk"
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

      <View style={styles.warContainer}>
        <View
          style={[
            styles.warBadge,
            data.warPreference === "in" ? styles.warIn : styles.warOut,
          ]}
        >
          <Ionicons
            name={data.warPreference === "in" ? "flame" : "pause"}
            size={14}
            color={data.warPreference === "in" ? "#22c55e" : "#ef4444"}
          />

          <Text
            style={[
              styles.warText,
              data.warPreference === "in"
                ? styles.warTextIn
                : styles.warTextOut,
            ]}
          >
            {data.warPreference === "in" ? "War Ready" : "Opted Out"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.5)",
  },

  nameSection: {
    flex: 1,
    gap: 6,
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
    fontFamily: "monospace",
  },

  thBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },

  thBadgeIcon: {
    width: 48,
    height: 48,
  },

  heroMid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(14, 165, 233, 0.1)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.25)",
  },

  tierIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(14, 165, 233, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  tierIcon: {
    width: 48,
    height: 48,
  },

  leagueInfo: {
    flex: 1,
    gap: 6,
  },

  leagueName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0ea5e9",
  },

  trophyRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  trophyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(241, 245, 249, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  trophyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  trophyEmoji: {
    fontSize: 13,
  },

  bestText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },

  entityContainer: {
    gap: 14,
    flexDirection: "row",
  },

  entityColumn: {
    gap: 6,
  },

  entityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  entityTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  entityList: {
    flexDirection: "row",
    gap: 8,
  },

  helperBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
  },

  guardianBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.2)",
  },

  helperIcon: {
    width: 20,
    height: 20,
  },

  helperLevel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f97316",
  },

  guardianLevel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#06b6d4",
  },

  clanCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.25)",
  },

  clanBadgeWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  clanBadge: {
    width: 40,
    height: 40,
  },

  clanText: {
    flex: 1,
    gap: 6,
  },

  clanName: {
    fontSize: 14,
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

  clanDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  clanLevelBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  clanLevelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#22c55e",
  },

  clanDivider: {
    fontSize: 11,
    color: "#64748b",
  },

  clanRole: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },

  labelsSection: {
    gap: 10,
  },

  labelsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  labelsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  labelsList: {
    flexDirection: "row",
    gap: 8,
  },

  labelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },

  labelIcon: {
    width: 18,
    height: 18,
  },

  labelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a78bfa",
    maxWidth: 120,
  },

  warContainer: {
    marginTop: 6,
  },

  warBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  warIn: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.3)",
  },

  warOut: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },

  warText: {
    fontSize: 12,
    fontWeight: "700",
  },

  warTextIn: {
    color: "#22c55e",
  },

  warTextOut: {
    color: "#ef4444",
  },
});
