import { create } from "zustand";

export type PremiumTier =
  | "free"
  | "chief"
  | "field_marshal";

type PremiumState = {
  tier: PremiumTier;

  isChief: boolean;
  isFieldMarshal: boolean;

  setTier: (tier: PremiumTier) => void;
};

export const usePremiumStore = create<PremiumState>((set) => ({
  tier: "free",

  isChief: false,
  isFieldMarshal: false,

  setTier: (tier) =>
    set({
      tier,
      isChief: tier === "chief" || tier === "field_marshal",
      isFieldMarshal: tier === "field_marshal",
    }),
}));