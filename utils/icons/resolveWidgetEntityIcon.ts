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

  if (!remoteIcon) {
    return undefined;
  }

  return await cacheEntityIcon(
    remoteIcon,
  );
}