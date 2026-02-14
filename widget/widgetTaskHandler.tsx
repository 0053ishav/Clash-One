import { renderBuilderWidget } from "@/utils/renderBuilderWidget";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

// const nameToWidget = {
//   BuilderStatusWidget,
// };

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  // const widgetInfo = props.widgetInfo;
  // const Widget =
  //   nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
      props.renderWidget(renderBuilderWidget());
      break;

    case "WIDGET_RESIZED":
      // Not needed for now
      break;

    case "WIDGET_DELETED":
      break;

    case "WIDGET_CLICK":
      // Not needed for now
      break;

    default:
      break;
  }
}
