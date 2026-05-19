import { getAccountState } from "@/services/accountStateService";
import { getEntities } from "@/services/entityService";
import { useAccountStore } from "@/stores/accountStore";
import { calculateProgress } from "@/utils/calculateProgress";
import { formatCountdown } from "@/utils/formatCountdown";
import { getEntity } from "@/utils/getEntity";
import { getNextPetSuggestion } from "@/utils/suggestion/getNextPetSuggestion";

export async function getPetWidgetData(inputTag?: string) {
  const { activeTag, widgetPrefs, accounts, lastJsonSyncMap } =
    useAccountStore.getState();

  const tag = inputTag ?? widgetPrefs.selectedAccountTag ?? activeTag;

  if (!tag) {
    return {
      title: "Pets",
      subtitle: "No account selected",
      progress: 0,
      showProgress: false,
    };
  }

  const entities = await getEntities(tag);
  const pets = entities.filter((e) => e.type === "pet");

  const suggestion = getNextPetSuggestion(pets);

  const account = accounts.find((a) => a.tag === tag);
  const updatedAt = lastJsonSyncMap[tag] ?? null;

  if (!account) {
    return {
      title: "Pets",
      subtitle: "Open app to sync",
      progress: 0,
      showProgress: false,
    };
  }

  const state = await getAccountState(tag);
  const pet = state.pet;

  // 🟢 IDLE
  if (!pet) {
    return {
      title: "Pet",
      subtitle: "Idle",
      suggestion: suggestion
        ? `Upgrade ${getEntity(suggestion?.dataId).name} • Lv ${suggestion.level}`
        : "Idle",
      progress: 0,
      showProgress: false,

      color: account.color,
      accountInitials: account.name.slice(0, 2).toUpperCase(),
      updatedAt,
    };
  }

  const remainingMs = Math.max(pet.endTime - Date.now(), 0);
  const totalMs = pet.endTime - pet.startTime;

  const progress =
    totalMs > 0 ? calculateProgress(pet.startTime, pet.endTime) : 0;

  return {
    title: `Pet - ${pet.entity}`,
    subtitle: formatCountdown(remainingMs),
    progress,
    showProgress: true,

    levelText:
      pet.currentLevel !== undefined && pet.nextLevel !== undefined
        ? `Lv ${pet.currentLevel} → ${pet.nextLevel}`
        : undefined,

    dataId: pet.dataId,
    suggestion: suggestion
      ? `Upgrade ${getEntity(suggestion?.dataId).name} • Lv ${suggestion.level}`
      : "Maxed",

    color: account.color,
    accountInitials: account.name.slice(0, 2).toUpperCase(),
    updatedAt,
  };
}
