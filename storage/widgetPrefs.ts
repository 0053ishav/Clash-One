import { STORAGE_KEYS } from "@/storage//keys";
import { storage } from "@/storage//mmkv";

export type WidgetPrefs = {
    selectedAccountTag: string | null;
}

export function saveWidgetPrefs(prefs: WidgetPrefs) {
    storage.set(STORAGE_KEYS.WIDGET_PREFS, JSON.stringify(prefs));
}

export function getWidgetPrefs(): WidgetPrefs {
    const raw = storage.getString(STORAGE_KEYS.WIDGET_PREFS);

    if (!raw) {
        return {
            selectedAccountTag: null,
        };
    }

    try {
        return JSON.parse(raw);
    } catch {
        return {
            selectedAccountTag: null,
        };
    }
}