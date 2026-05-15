import { Resource } from "@/types/entity";
import { create } from "zustand";

type CraftedDefenseMap = Record<
  number,
  {
    name: string;
    icon: string;
    modules: Record<number, { name: string; stat: string, resource: Resource; }>;
  }
>;

interface CraftedState {
  defenses: CraftedDefenseMap;
  duration: { start: number; end: number } | null;
  availableForTH?: number;
  setCraftedData: (data: any) => void;
  isActive: () => boolean;
  markEventSeen: () => void;
  lastNotifiedEventEnd?: number;
  hasNewEvent: boolean;
  lastUpdated: number;
}

export const useCraftedStore = create<CraftedState>((set, get) => ({
  defenses: {},
  duration: null,
  hasNewEvent: false,
  lastUpdated: 0,
  setCraftedData: (data) => {
    const prevEnd = get().lastNotifiedEventEnd;

    const newEnd = data.duration?.end;

    set({
      defenses: data.defenses || {},
      duration: data.duration || null,
      availableForTH: data.availableForTH,
      hasNewEvent: newEnd && newEnd !== prevEnd,
      lastUpdated: Date.now(),
    });
  },
  markEventSeen: () => {
    set({ hasNewEvent: false });
  },
  isActive: () => {
    const d = get().duration;
    if (!d) return false;
    const now = Date.now();
    return now >= d.start && now <= d.end;
  },
}));