import { getAccounts } from "@/services/accountService";
import { getAccountState } from "@/services/accountStateService";
import { formatBuildingName } from "@/utils/formatBuildingName";

export type UpcomingUpgradeRow = {
  accountTag: string;
  accountName: string;
  accountColor: string;

  entity: string;
  upgradeType: "BUILDER" | "LAB" | "PET";

  endTime: number;
  remainingMs: number;

  dataId?: number;
  isCrafted?: boolean;
  icon?: string | number;
};

export async function getUpcomingUpgradesWidgetData() {
  const accounts = await getAccounts();

  const rows: UpcomingUpgradeRow[] = [];

  for (const account of accounts) {
    const state = await getAccountState(account.tag);

    if (!state) continue;

    const upgrades = [
      ...(state.builders.home ?? []),

      ...(state.lab?.home.normal ? [state.lab.home.normal] : []),
      ...(state.lab?.home.goblin ? [state.lab.home.goblin] : []),

      ...(state.pet ? [state.pet] : []),
    ];

    for (const upgrade of upgrades) {
      const remainingMs = Math.max(
        upgrade.endTime - Date.now(),
        0
      );

      rows.push({
        accountTag: account.tag,
        accountName: account.name,
        accountColor: account.color,

        entity: formatBuildingName(upgrade.entity),
        upgradeType: upgrade.upgradeType,

        endTime: upgrade.endTime,
        remainingMs,

        dataId: upgrade.dataId,
        isCrafted: upgrade.isCrafted,
      });
    }
  }

  return rows.sort(
    (a, b) => a.endTime - b.endTime
  );
}