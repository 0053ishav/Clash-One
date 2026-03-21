import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";
import { WidgetCacheData } from "@/types/widgetTypes";

const getKey = (tag: string) => `${STORAGE_KEYS.WIDGET_CACHE}_${tag}`;

export function setWidgetCache(tag: string, data: WidgetCacheData) {
  try {
    storage.set(getKey(tag), JSON.stringify(data));
  } catch (e) {
    console.log("Cache save failed:", e);
  }
}

export function getWidgetCache(tag: string): WidgetCacheData | null {
  try {
    const raw = storage.getString(getKey(tag));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.log("Cache read failed:", e);
    return null;
  }
}

export function getAllWidgetCaches(tags: string[]) {
  return tags
    .map((tag) => ({
      tag,
      data: getWidgetCache(tag),
    }))
    .filter((x) => x.data !== null);
}