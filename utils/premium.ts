import { usePremiumStore } from "@/stores/premiumStore";

export function isChiefOrAbove() {
  const tier = usePremiumStore.getState().tier;

  return tier === "chief" || tier === "field_marshal";
}

export function isFieldMarshal() {
  return usePremiumStore.getState().tier === "field_marshal";
}

export function getTier() {
  return usePremiumStore.getState().tier;
}

export function hasUnlimitedWidgetAccounts() {
  const tier = usePremiumStore.getState().tier;

  return tier === "chief" || tier === "field_marshal";
}