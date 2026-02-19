// import { STORAGE_KEYS } from "@/storage/keys";
// import { storage } from "@/storage/mmkv";

// export function setBuilderCount(count: number) {
//   storage.set(STORAGE_KEYS.BUILDER_COUNT, count);
// }

// export function getBuilderCount(): number {
//   const value = storage.getNumber(STORAGE_KEYS.BUILDER_COUNT);
//   return value ?? 5; // fallback default
// }



// export const BUILDING_MAX_LEVELS: Record<string, number> = {
//   "Archer Tower": 21,
//   "Cannon": 21,
//   "Wizard Tower": 15,
//   "Inferno Tower": 9,
//   "Town Hall": 16,
//   "Laboratory": 14,
//   "Barracks": 16,
//   "Army Camp": 12,
//   "X-Bow": 10,
//   "Air Defense": 13,
// };
// const maxLevel = BUILDING_MAX_LEVELS[finalName];

// if (parsedCurrent !== undefined && maxLevel !== undefined) {
//   if (parsedCurrent >= maxLevel) {
//     showError(
//       "Max Level Reached",
//       `${finalName} is already at max level (${maxLevel}).`
//     );
//     return false;
//   }
// }
