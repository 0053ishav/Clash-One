import { ENV } from "@/config/env";
import { PlayerProfile } from "@/types/player";
import { EntityRecord } from "@/types/upgrade";
import { formatCountdown } from "@/utils/formatCountdown";
import {
  resolveBuilderBaseLeagueIcon,
  resolveEntityIcon,
} from "@/utils/icons/resolveEntityIcon";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { XPBadge } from "../XPBadge";

export default function ProfileHeader({
  profile,
  helpers,
  guardians,
}: {
  profile: PlayerProfile;
  helpers: EntityRecord[];
  guardians: EntityRecord[];
}) {
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

  const hasHelpers = helpers.length > 0;
  const hasGuardians = guardians.length > 0;

  return (
    <View style={styles.container}>
      {/* Top Row - Name & Tier Icon */}
      <View style={styles.topRow}>
        <View style={styles.nameSection}>
          <Text style={styles.playerName}>{profile.playerName || "Chief"}</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.playerTag}>{profile.playerTag}</Text>
            {profile.expLevel && <XPBadge level={profile.expLevel} />}
          </View>
        </View>

        <View style={styles.hallBadgesRow}>
          <View style={styles.thBadge}>
            <Image
              source={{
                uri: resolveEntityIcon(1000001, {
                  context: {
                    hallLevel: profile.townHallLevel,
                  },
                }),
              }}
              style={styles.thBadgeIcon}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>

          {!!profile.builderHallLevel && (
            <View style={[styles.thBadge, styles.bhBadge]}>
              <Image
                source={{
                  uri: resolveEntityIcon(1000034, {
                    context: {
                      hallLevel: profile.builderHallLevel,
                    },
                  }),
                }}
                style={styles.thBadgeIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.villageRow}>
        {/* Home Village */}
        <View style={[styles.villageCard, styles.villageCardHome]}>
          <View style={styles.villageCardHeader}>
            <View
              style={[
                styles.villageLeagueIconWrapper,
                styles.homeLeagueIconWrapper,
              ]}
            >
              <Image
                source={{ uri: profile.leagueTierIconUrl }}
                style={styles.villageLeagueIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>

            <Text style={[styles.villageLabel, styles.homeTitleText]}>
              Home
            </Text>
          </View>

          <Text
            style={[styles.villageLeagueName, styles.homeLeagueName]}
            numberOfLines={1}
          >
            {profile.leagueTierName ?? "Unranked"}
          </Text>

          <View style={styles.trophyRow}>
            <Image
              source={{ uri: `${ENV.CDN_BASE}/entities/other/trophy.png` }}
              style={styles.trophyIcon}
              contentFit="contain"
            />
            <Text style={styles.trophyText}>{profile.trophies ?? 0}</Text>
          </View>

          <View style={styles.bestRow}>
            <Text style={styles.bestText}>
              Legacy Best: {profile.bestTrophies ?? 0}
            </Text>

            {!!profile.leagueIconUrl && (
              <Image
                source={{ uri: profile.leagueIconUrl }}
                style={styles.smallLeagueIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            )}
          </View>
        </View>

        <View style={styles.villageDivider} />

        {/* Builder Base */}
        {!!profile.builderHallLevel ? (
          <View style={[styles.villageCard, styles.villageCardBuilder]}>
            <View style={styles.villageCardHeader}>
              <View
                style={[
                  styles.villageLeagueIconWrapper,
                  styles.builderLeagueIconWrapper,
                ]}
              >
                <Image
                  source={{
                    uri: resolveBuilderBaseLeagueIcon(
                      profile.builderBaseLeague?.id,
                    ),
                  }}
                  style={styles.villageLeagueIcon}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </View>

              <Text style={[styles.villageLabel, styles.builderTitleText]}>
                Builder
              </Text>
            </View>

            <Text
              style={[styles.villageLeagueName, styles.builderLeagueName]}
              numberOfLines={1}
            >
              {profile.builderBaseLeague?.name ?? "Unranked"}
            </Text>

            <View style={styles.trophyRow}>
              <Image
                source={{ uri: `${ENV.CDN_BASE}/entities/other/trophy.png` }}
                style={styles.trophyIcon}
                contentFit="contain"
              />
              <Text style={styles.trophyText}>
                {profile.builderBaseTrophies ?? 0}
              </Text>
            </View>

            <View style={styles.bestRow}>
              <Text style={styles.bestText}>
                Best {profile.bestBuilderBaseTrophies ?? 0}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.villageCard, styles.villageCardBuilderEmpty]}>
            <Ionicons name="construct-outline" size={22} color="#475569" />
            <Text style={styles.villageEmptyText}>No Builder Base</Text>
          </View>
        )}
      </View>

      {/* Clan Card */}
      {profile.clanName && (
        <View style={styles.clanCard}>
          {profile.clanBadgeUrl && (
            <Image
              source={{ uri: profile.clanBadgeUrl }}
              style={styles.clanBadge}
              contentFit="contain"
              cachePolicy="memory-disk"
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
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          ))}
        </View>
      )}

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
                  <View
                    key={`helper-${helper.id}`}
                    style={styles.helperContainer}
                  >
                    <View style={styles.helperBadge}>
                      <Image
                        source={{
                          uri: resolveEntityIcon(helper.dataId),
                        }}
                        style={styles.helperIcon}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                      />
                      <Text style={styles.helperLevel}>Lv{helper.level}</Text>
                    </View>
                    {/* Cooldown or Ready State Below */}
                    {typeof helper.cooldown === "number" &&
                    helper.cooldown > 0 ? (
                      <View style={styles.cooldownBadge}>
                        <Ionicons
                          name="time-outline"
                          size={10}
                          color="#ef4444"
                        />
                        <Text style={styles.cooldownText}>
                          {formatCountdown(helper.cooldown)}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.readyBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={10}
                          color="#22c55e"
                        />
                        <Text style={styles.readyText}>Ready</Text>
                      </View>
                    )}
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
                      source={{
                        uri: resolveEntityIcon(guardian.dataId),
                      }}
                      style={styles.helperIcon}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                    <Text style={styles.guardianLevel}>Lv{guardian.level}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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

  tierIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(14, 165, 233, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  tierIcon: {
    width: 40,
    height: 40,
  },

  leagueThRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(14, 165, 233, 0.1)",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.25)",
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

  trophyIcon: {
    width: 16,
    height: 16,
  },

  trophyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  trophyEmoji: {
    fontSize: 13,
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

  hallBadgesRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },

  bhBadge: {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    borderColor: "rgba(168, 85, 247, 0.3)",
  },

  builderLeagueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.25)",
  },

  villageRow: {
    flexDirection: "row",
    gap: 0,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.6)",
  },

  villageCard: {
    flex: 1,
    padding: 12,
    gap: 6,
    justifyContent: "center",
  },

  villageCardHome: {
    backgroundColor: "rgba(14,165,233,0.08)",
  },

  villageCardBuilder: {
    backgroundColor: "rgba(168,85,247,0.08)",
  },

  villageCardBuilderEmpty: {
    backgroundColor: "rgba(71,85,105,0.08)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  villageDivider: {
    width: 1,
    backgroundColor: "rgba(51,65,85,0.6)",
  },

  villageCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  villageLeagueIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  homeLeagueIconWrapper: {
    backgroundColor: "rgba(14,165,233,0.15)",
  },

  builderLeagueIconWrapper: {
    backgroundColor: "rgba(168,85,247,0.15)",
  },

  villageLeagueIcon: {
    width: 26,
    height: 26,
  },

  villageLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  homeTitleText: {
    color: "#38bdf8",
  },

  builderTitleText: {
    color: "#c084fc",
  },

  villageLeagueName: {
    fontSize: 13,
    minHeight: 34,
    fontWeight: "700",
  },

  homeLeagueName: {
    color: "#0ea5e9",
  },

  builderLeagueName: {
    color: "#a855f7",
  },

  bestRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
  },

  bestText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },

  smallLeagueIcon: {
    width: 18,
    height: 18,
    marginLeft: 4,
  },

  villageEmptyText: {
    fontSize: 12,
    color: "#475569",
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

  entityContainer: {
    gap: 14,
    flexDirection: "column",
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
    flexWrap: "wrap",
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
  // Add to existing styles:

  helperContainer: {
    alignItems: "center",
    gap: 6,
  },

  helperBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
  },

  cooldownBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  cooldownText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ef4444",
  },

  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  readyText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#22c55e",
  },
  guardianLevel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#06b6d4",
  },
});
