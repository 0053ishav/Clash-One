import { BuilderStatusWidget } from "@/widget/BuilderStatusWidget";
import { getBuilderWidgetData } from "@/widget/getBuilderWidgetData";

export function renderBuilderWidget() {
  try {
    const data = getBuilderWidgetData();
    return (
      <BuilderStatusWidget
        title={data.title}
        subtitle={data.subtitle}
        progress={data.progress}
        showProgress={data.showProgress}
      />
    );
  } catch {
    return (
      <BuilderStatusWidget
        title="Builders"
        subtitle="All builders free"
        progress={0}
        showProgress
      />
    );
  }
}
