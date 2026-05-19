import StatsGrid from "@/components/Profile/StatsGrid";
import { PlayerFull } from "@/types/playerFull";

export default function BattleStatsGrid({ data }: { data: PlayerFull }) {
  return (
    <StatsGrid
      title="Battle Stats"
      stats={[
        {
          icon: "star",
          label: "War Stars",
          value: data.warStars,
          highlight: true,
        },
        {
          icon: "arrow-up",
          label: "Donated",
          value: data.donations,
        },
        {
          icon: "arrow-down",
          label: "Received",
          value: data.donationsReceived,
        },
        {
          icon: "flame",
          label: "Attacks Won",
          value: data.attackWins,
        },
        {
          icon: "shield-checkmark",
          label: "Defenses Won",
          value: data.defenseWins,
        },
      ]}
    />
  );
}
