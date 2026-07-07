import { getUpcomingUpgradesWidgetData } from "@/widget/getUpcomingUpgradesWidgetData";
import { UpcomingUpgradesWidget } from "@/widget/UpcomingUpgradesWidget";
import * as FileSystem from "expo-file-system/legacy";
import { resolveWidgetEntityIcon } from "../icons/resolveWidgetEntityIcon";
import { setUpcomingWidgetCache } from "./widgetCache";

export async function renderUpcomingUpgradesWidget() {
  try {
    const rows = await getUpcomingUpgradesWidgetData();

    const rowsWithIcons = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        icon: row.dataId
          ? ((await resolveWidgetEntityIcon(row.dataId, {
              isCrafted: row.isCrafted,
            })) ?? undefined)
          : undefined,
      })),
    );
    setUpcomingWidgetCache({
      rows: rowsWithIcons,
      cachedAt: Date.now(),
    });

    console.log(
      await FileSystem.getInfoAsync(
        "file:///data/user/0/com.strngelabs.clashone/cache/entity-icons/1000084.png",
      ),
    );
    return <UpcomingUpgradesWidget rows={rowsWithIcons} />;
  } catch (e) {
    console.log("renderUpcomingUpgradesWidget error", e);

    return <UpcomingUpgradesWidget rows={[]} />;
  }
}
