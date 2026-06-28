import { ENV } from "@/config/env";
import { PlayerFull } from "@/types/playerFull";
import { EntityRecord } from "@/types/upgrade";
import {
  resolveBuilderBaseLeagueIcon,
  resolveEntityIcon,
} from "@/utils/icons/resolveEntityIcon";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { XPBadge } from "../XPBadge";

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
  const hasBuilderBase = !!data.builderHallLevel;

  return (
    <View style={styles.container}>
      {/* ── Name & Tag ── */}
      <View style={styles.heroTop}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{data.name}</Text>
          <View style={styles.tagRow}>
            <Text style={styles.tag}>{data.tag}</Text>
            {data.expLevel && <XPBadge level={data.expLevel} />}
          </View>
        </View>

        {/* TH + BH icons stacked */}
        <View style={styles.hallBadgesRow}>
          <View style={styles.hallBadge}>
            <Image
              source={{
                uri: resolveEntityIcon(1000001, {
                  context: { hallLevel: data.townHallLevel },
                }),
              }}
              style={styles.hallIcon}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
          {hasBuilderBase && (
            <View style={[styles.hallBadge, styles.hallBadgeBuilder]}>
              <Image
                source={{
                  uri: resolveEntityIcon(1000034, {
                    context: { hallLevel: data.builderHallLevel },
                  }),
                }}
                style={styles.hallIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>
          )}
        </View>
      </View>

      {/* ── Dual Village Row ── */}
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
                source={{
                  uri:
                    data.leagueTier?.iconUrls.large ??
                    data.leagueTier?.iconUrls.small ??
                    data.league?.iconUrls.small,
                }}
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
            {data.leagueTier?.name ?? data.league?.name ?? "Unranked"}
          </Text>
          <View style={styles.trophyRow}>
            <Image
              source={{ uri: `${ENV.CDN_BASE}/entities/other/trophy.png` }}
              style={styles.trophyIcon}
              contentFit="contain"
            />
            <Text style={styles.trophyText}>{data.trophies}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: 10,
            }}
          >
            <Text style={styles.bestText}>
              Legacy Best: {data.bestTrophies}
            </Text>
            <Image
              source={{
                uri:
                  data.league?.iconUrls.small ?? data.league?.iconUrls.medium,
              }}
              style={styles.tierIcon}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.villageDivider} />

        {/* Builder Base */}
        {hasBuilderBase ? (
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
                      data.builderBaseLeague?.id,
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
              {data.builderBaseLeague?.name ?? "Unranked"}
            </Text>

            <View style={styles.trophyRow}>
              <Image
                source={{ uri: `${ENV.CDN_BASE}/entities/other/trophy.png` }}
                style={styles.trophyIcon}
                contentFit="contain"
              />
              <Text style={styles.trophyText}>{data.builderBaseTrophies}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: 10,
              }}
            >
              <Text style={styles.bestText}>
                Best {data.bestBuilderBaseTrophies}
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

      {/* ── Helpers & Guardians ── */}
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
                      source={{ uri: resolveEntityIcon(helper.dataId) }}
                      style={styles.helperIcon}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                    <Text style={styles.helperLevel}>Lv{helper.level}</Text>
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
                      source={{ uri: resolveEntityIcon(guardian.dataId) }}
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

      {/* ── Clan ── */}
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
            <View style={styles.clanNameRow}>
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

      {/* ── Labels ── */}
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

      {/* ── War Preference ── */}
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
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  // ── Header ──────────────────────────────────────────────
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.5)",
  },
  nameSection: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fbbf24",
    letterSpacing: -0.5,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tag: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
    fontFamily: "monospace",
  },

  // Hall badges (TH + BH stacked)
  hallBadgesRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  hallBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  hallBadgeBuilder: {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    borderColor: "rgba(168, 85, 247, 0.3)",
  },
  hallIcon: {
    width: 40,
    height: 40,
  },

  // ── Dual Village Row ─────────────────────────────────────
  villageRow: {
    flexDirection: "row",
    gap: 0,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.6)",
  },
  villageCard: {
    flex: 1,
    padding: 12,
    gap: 6,
    justifyContent: "center",
  },
  villageCardHome: {
    backgroundColor: "rgba(14, 165, 233, 0.08)",
  },
  villageCardBuilder: {
    backgroundColor: "rgba(168, 85, 247, 0.08)",
  },
  villageCardBuilderEmpty: {
    backgroundColor: "rgba(71, 85, 105, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tierIcon: {
    width: 20,
    height: 20,
  },
  villageDivider: {
    width: 1,
    backgroundColor: "rgba(51, 65, 85, 0.6)",
  },

  // Village card inner
  villageCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  villageLeagueIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  homeLeagueIconWrapper: {
    backgroundColor: "rgba(14, 165, 233, 0.15)",
  },
  builderLeagueIconWrapper: {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
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
  trophyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(241, 245, 249, 0.07)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trophyIcon: {
    width: 14,
    height: 14,
  },
  trophyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f1f5f9",
  },
  bestText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  villageEmptyText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },

  // ── Helpers & Guardians ──────────────────────────────────
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

  // ── Clan ────────────────────────────────────────────────
  clanCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    padding: 10,
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
    height: 32,
  },
  clanText: {
    flex: 1,
    gap: 6,
  },
  clanNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  // ── Labels ──────────────────────────────────────────────
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
    flexWrap: "wrap",
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

  // ── War ─────────────────────────────────────────────────
  warContainer: {
    marginTop: 4,
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
