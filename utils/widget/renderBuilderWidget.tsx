import { useAccountStore } from "@/stores/accountStore";
import { resolveWidgetEntityIcon } from "@/utils/icons/resolveWidgetEntityIcon";
import { setWidgetCache } from "@/utils/widget/widgetCache";
import { BuilderStatusWidget } from "@/widget/BuilderStatusWidget";
import { getBuilderWidgetData } from "@/widget/getBuilderWidgetData";

export async function renderBuilderWidget() {
  try {
    const { activeTag, widgetPrefs, accounts } = useAccountStore.getState();

    const selectedTag = widgetPrefs.selectedAccountTag;
    const fallbackTag = accounts[0]?.tag;

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

    const tag = accounts.some((a) => a.tag === selectedTag)
      ? selectedTag
      : accounts.some((a) => a.tag === activeTag)
        ? activeTag
        : fallbackTag;

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
      return renderBuilderWidget();
    }

    const account = accounts.find((a) => a.tag === tag);

    if (!account) {
      throw new Error("Invalid account");
    }

    const data = await getBuilderWidgetData(tag);

    setWidgetCache(tag, "builder", {
      ...data,
      renderedAt: Date.now(),
    });

    const icon = data.dataId
      ? ((await resolveWidgetEntityIcon(data.dataId, {
          isCrafted: data.isCrafted,
        })) ?? undefined)
      : undefined;

    return (
      <BuilderStatusWidget
        title={data.title ?? "Builders"}
        subtitle={data.subtitle ?? "All builders free"}
        icon={icon}
        progress={data.progress ?? 0}
        showProgress={data.showProgress ?? false}
        levelText={data.levelText}
        builderCountText={data.builderCountText}
        nextUpgradeText={data.nextUpgradeText}
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
