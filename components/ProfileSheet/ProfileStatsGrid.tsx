import StatsGrid from "@/components/Profile/StatsGrid";
import { PlayerProfile } from "@/types/player";

function formatCapital(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";

  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";

  return value.toString();
}

export default function ProfileStatsGrid({
  profile,
  builderCount,
}: {
  profile: PlayerProfile;
  builderCount: number;
}) {
  return (
    <StatsGrid
      title="Battle Stats"
      stats={[
        {
          icon: "star",
          label: "War Stars",
          value: profile.warStars,
          highlight: true,
        },
        {
          icon: "arrow-up",
          label: "Donated",
          value: profile.donations,
        },
        {
          icon: "arrow-down",
          label: "Received",
          value: profile.donationsReceived,
        },
        {
          icon: "flame",
          label: "Attacks",
          value: profile.attackWins,
        },
        {
          icon: "shield-checkmark",
          label: "Defense",
          value: profile.defenseWins,
        },
        {
          icon: "diamond",
          label: "Capital",
          value:
            typeof profile.clanCapitalGold === "number"
              ? formatCapital(profile.clanCapitalGold)
              : undefined,
        },
        {
          icon: "construct",
          label: "Builders",
          value: builderCount,
        },
      ]}
    />
  );
}
