import { cacheEntityIcon } from "./cacheEntityIcon";

import { resolveEntityIcon } from "./resolveEntityIcon";

export async function resolveWidgetEntityIcon(
  entityId: number,
  options?: {
    isCrafted?: boolean;
    townHallLevel?: number;
  },
) {
  const remoteIcon =
    resolveEntityIcon(
      entityId,
      options,
    );

     console.log("Entity:", entityId);
  console.log("Resolved icon:", remoteIcon);
  
  if (!remoteIcon) {
    return undefined;
  }

  return await cacheEntityIcon(
    remoteIcon,
  );
}