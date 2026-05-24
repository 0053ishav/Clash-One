import { useAccountStore } from "@/stores/accountStore";
import { renderBuilderWidget } from "@/utils/widget/renderBuilderWidget";
import { renderMultiWidget } from "@/utils/widget/renderMultiWidget";
import { getWidgetCache } from "@/utils/widget/widgetCache";
import { isWidgetCacheStale } from "@/utils/widget/widgetFreshness";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { BuilderStatusWidget } from "./BuilderStatusWidget";
import { LabStatusWidget } from "./LabStatusWidget";
import { PetStatusWidget } from "./PetStatusWidget";

function resolveTag() {
  const { activeTag, widgetPrefs, accounts } = useAccountStore.getState();

  const selected = widgetPrefs.selectedAccountTag;

  if (accounts.some((a) => a.tag === selected)) return selected;
  if (accounts.some((a) => a.tag === activeTag)) return activeTag;

  return accounts[0]?.tag;
}
function getWidgetType(widgetName?: string): "builder" | "lab" | "pet" | null {
  switch (widgetName) {
    case "BuilderStatusWidget":
      return "builder";
    case "LabWidget":
      return "lab";
    case "PetWidget":
      return "pet";
    default:
      return null;
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  try {
    if (
      props.widgetAction !== "WIDGET_ADDED" &&
      props.widgetAction !== "WIDGET_UPDATE"
    ) {
      return;
    }
    const widgetName = props.widgetInfo?.widgetName;

    if (widgetName === "MultiAccountWidget") {
      const widget = await renderMultiWidget();
      props.renderWidget(widget);
      return;
    }

    const tag = resolveTag();

    if (!tag) {
      props.renderWidget(
        <BuilderStatusWidget
          title="No account"
          subtitle="Setup required"
          progress={0}
          showProgress={false}
        />,
      );
      return;
    }

    const type = getWidgetType(widgetName);

    if (!type) {
      console.log("Unknown widget type:", widgetName);
      return;
    }

    const cached = getWidgetCache(tag, type);

    if (cached && !isWidgetCacheStale(cached, type)) {
      if (type === "builder") {
        props.renderWidget(<BuilderStatusWidget {...cached} />);

        renderBuilderWidget().then(props.renderWidget);
      }

      if (type === "lab") {
        const { renderLabWidget } =
          await import("@/utils/widget/renderLabWidget");

        props.renderWidget(<LabStatusWidget {...cached} />);

        renderLabWidget().then(props.renderWidget);
      }

      if (type === "pet") {
        const { renderPetWidget } =
          await import("@/utils/widget/renderPetWidget");

        props.renderWidget(<PetStatusWidget {...cached} />);

        renderPetWidget().then(props.renderWidget);
      }
    } else {
      if (type === "builder") {
        props.renderWidget(await renderBuilderWidget());
      }

      if (type === "lab") {
        const { renderLabWidget } =
          await import("@/utils/widget/renderLabWidget");
        props.renderWidget(await renderLabWidget());
      }

      if (type === "pet") {
        const { renderPetWidget } =
          await import("@/utils/widget/renderPetWidget");
        props.renderWidget(await renderPetWidget());
      }
    }
  } catch (err) {
    console.log("Widget handler error:", err);
  }
}
