import { useAccountStore } from "@/stores/accountStore";
import { resolveWidgetEntityIcon } from "@/utils/icons/resolveWidgetEntityIcon";
import { setWidgetCache } from "@/utils/widget/widgetCache";
import { LabStatusWidget } from "@/widget/LabStatusWidget";
import { getLabWidgetData } from "@/widget/getLabWidgetData";

export async function renderLabWidget() {
  try {
    const { activeTag, widgetPrefs, accounts } = useAccountStore.getState();

    const selectedTag = widgetPrefs.selectedAccountTag;
    const fallbackTag = accounts[0]?.tag;

    if (!accounts || accounts.length === 0) {
      return (
        <LabStatusWidget
          title="Laboratory"
          subtitle="Loading..."
          progress={0}
          showProgress={false}
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
        <LabStatusWidget
          title="Laboratory"
          subtitle="No account"
          progress={0}
          showProgress={false}
        />
      );
    }

    const accountExists = accounts.some((a) => a.tag === tag);

    if (!accountExists) {
      // ❌ avoid recursion
      return (
        <LabStatusWidget
          title="Laboratory"
          subtitle="Invalid account"
          progress={0}
          showProgress={false}
        />
      );
    }

    const account = accounts.find((a) => a.tag === tag);

    if (!account) {
      throw new Error("Invalid account");
    }

    const data = await getLabWidgetData(tag);
    const icon = data.dataId
      ? ((await resolveWidgetEntityIcon(data.dataId)) ?? undefined)
      : undefined;

    setWidgetCache(tag, "lab", {
      ...data,
      renderedAt: Date.now(),
    });

    return (
      <LabStatusWidget
        title={data.title ?? "Laboratory"}
        subtitle={data.subtitle ?? "Idle"}
        icon={icon}
        progress={data.progress ?? 0}
        showProgress={data.showProgress ?? false}
        levelText={data.levelText}
        nextUpgradeText={data.nextUpgradeText}
        color={data.color}
        accountInitials={data.accountInitials}
        updatedAt={data.updatedAt}
      />
    );
  } catch (error) {
    console.log("renderLabWidget error:", error);

    return (
      <LabStatusWidget
        title="Laboratory"
        subtitle="Open app to sync"
        progress={0}
        showProgress={false}
      />
    );
  }
}
