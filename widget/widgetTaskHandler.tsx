import { useAccountStore } from "@/stores/accountStore";
import { renderBuilderWidget } from "@/utils/widget/renderBuilderWidget";
import { renderMultiWidget } from "@/utils/widget/renderMultiWidget";
import { getWidgetCache } from "@/utils/widget/widgetCache";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { BuilderStatusWidget } from "./BuilderStatusWidget";

function resolveTag() {
  const { activeTag, widgetPrefs, accounts } = useAccountStore.getState();

  const selected = widgetPrefs.selectedAccountTag;

  if (accounts.some((a) => a.tag === selected)) return selected;
  if (accounts.some((a) => a.tag === activeTag)) return activeTag;

  return accounts[0]?.tag;
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

    // 🔥 MULTI WIDGET SUPPORT
    if (widgetName === "MultiAccountWidget") {
      const widget = renderMultiWidget();
      props.renderWidget(widget);
      return;
    }

    // 🔥 DEFAULT: single account widget
    const tag = resolveTag();

    if (!tag) {
      props.renderWidget(
        <BuilderStatusWidget
          title="Builders"
          subtitle="No account"
          progress={0}
          showProgress={false}
          builderCountText="Setup required"
        />,
      );
      return;
    }

    const cached = getWidgetCache(tag);

    if (cached) {
      props.renderWidget(
        <BuilderStatusWidget
          title={cached.title}
          subtitle={cached.subtitle}
          progress={cached.progress}
          showProgress={cached.showProgress}
          levelText={cached.levelText}
          builderCountText={cached.builderCountText}
          nextUpgradeText={cached.nextUpgradeText}
          dataId={cached.dataId}
          type={cached.type}
          color={cached.color}
          accountInitials={cached.accountInitials}
          updatedAt={cached.updatedAt}
          renderedAt={cached.renderedAt}
        />,
      );

      // ⚡ silent refresh (same tag)
      renderBuilderWidget(tag).then((widget) => {
        props.renderWidget(widget);
      });
    } else {
      const widget = await renderBuilderWidget(tag);
      props.renderWidget(widget);
    }
  } catch (err) {
    console.log("Widget handler error:", err);
  }
}
