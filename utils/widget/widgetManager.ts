import { renderBuilderWidget } from "@/utils/widget/renderBuilderWidget";
import { subscribeWidgetUpdate } from "@/utils/widget/widgetEvents";
import { requestWidgetUpdate } from "react-native-android-widget";
import { prefillAllWidgetCache } from "./prefillAllWidgetCache";
import { renderMultiWidget } from "./renderMultiWidget";

let timeout: ReturnType<typeof setTimeout> | null = null;

async function updateWidget() {
  try {

    await prefillAllWidgetCache();
    
    await requestWidgetUpdate({
      widgetName: "BuilderStatusWidget",
      renderWidget: async () => {
        return await renderBuilderWidget()
      },
    });
    await requestWidgetUpdate({
      widgetName: "MultiAccountWidget",
      renderWidget: async () => {
        return await renderMultiWidget()
      },
    });
  } catch (e) {
    console.log("Widget update failed:", e);
  }
}

function scheduleUpdate() {
  if (timeout) {
    clearTimeout(timeout);
  };

  timeout = setTimeout(() => {
    updateWidget();
    timeout = null;
  }, 400);
}


export function initWidgetManager() {
  subscribeWidgetUpdate(() => {
    scheduleUpdate();
  });
}