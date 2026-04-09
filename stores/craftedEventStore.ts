import { create } from "zustand";

type CraftedDefenseMap = Record<
  number,
  {
    name: string;
    icon?: string;
    modules: Record<number, { name: string; stat: string }>;
  }
>;

interface CraftedState {
  defenses: CraftedDefenseMap;
  duration: { start: number; end: number } | null;

  setCraftedData: (data: any) => void;
  isActive: () => boolean;
}

export const useCraftedStore = create<CraftedState>((set, get) => ({
  defenses: {},
  duration: null,

  setCraftedData: (data) => {
    set({
      defenses: data.defenses || {},
      duration: data.duration || null,
    });
  },

  isActive: () => {
    const d = get().duration;
    if (!d) return false;
    const now = Date.now();
    return now >= d.start && now <= d.end;
  },
}));