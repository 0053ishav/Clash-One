import { create } from "zustand";

type PremiumState = {
    isPro: boolean;
    setPro: (value: boolean) => void;
};

export const usePremiumStore = create<PremiumState>((set) => ({
    isPro: true,
    setPro: (value) => set({ isPro: value }),
}));