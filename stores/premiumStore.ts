import { create } from "zustand";

type PremiumState = {
    isPro: boolean;
    setPro: (value: boolean) => void;
};

export const usePremiumStore = create<PremiumState>((set) => ({
    isPro: false,
    setPro: (value) => set({ isPro: value }),
}));