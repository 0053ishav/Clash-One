import { useAccountStore } from "@/stores/accountStore";
import { setWidgetCache } from "@/utils/widget/widgetCache";
import { BuilderStatusWidget } from "@/widget/BuilderStatusWidget";
import { getBuilderWidgetData } from "@/widget/getBuilderWidgetData";

export async function renderBuilderWidget(inputTag?: string) {
  try {
    const { activeTag, widgetPrefs, accounts } = useAccountStore.getState();

    if (!accounts || accounts.length === 0) {
      return (
        <BuilderStatusWidget
          title="Builders"
          subtitle="Loading..."
          progress={0}
          showProgress={false}
          builderCountText="Please wait"
        />
      );
    }

    const selectedTag = widgetPrefs.selectedAccountTag;
    const fallbackTag = accounts[0]?.tag;

    const tag =
      inputTag ??
      (accounts.some((a) => a.tag === selectedTag)
        ? selectedTag
        : accounts.some((a) => a.tag === activeTag)
          ? activeTag
          : fallbackTag);

    if (!tag) {
      return (
        <BuilderStatusWidget
          title="Builders"
          subtitle="No account"
          progress={0}
          showProgress={false}
          builderCountText="Add account"
        />
      );
    }

    const accountExists = accounts.some((a) => a.tag === tag);

    if (!accountExists) {
      return renderBuilderWidget(accounts[0].tag);
    }

    const data = await getBuilderWidgetData(tag);

    setWidgetCache(tag, {
      ...data,
      renderedAt: Date.now(),
    });

    return (
      <BuilderStatusWidget
        title={data.title ?? "Builders"}
        subtitle={data.subtitle ?? "All builders free"}
        progress={data.progress ?? 0}
        showProgress={data.showProgress ?? false}
        levelText={data.levelText}
        builderCountText={data.builderCountText}
        nextUpgradeText={data.nextUpgradeText}
        dataId={data.dataId}
        type={data.type}
        color={data.color}
        accountInitials={data.accountInitials}
        updatedAt={data.updatedAt}
      />
    );
  } catch (error) {
    console.log("renderBuilderWidget error:", error);

    return (
      <BuilderStatusWidget
        title="Builders"
        subtitle="Open app to sync"
        progress={0}
        showProgress={false}
        builderCountText="Tap to refresh"
      />
    );
  }
}
