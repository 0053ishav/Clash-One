import { useAccountStore } from "@/stores/accountStore";
import { getMultiWidgetDataFree } from "@/widget/getMultiWidgetDataFree";
import { getMultiWidgetDataPro } from "@/widget/getMultiWidgetDataPro";
import { MultiAccountWidget } from "@/widget/MultiAccountWidget";
import { hasUnlimitedWidgetAccounts } from "../premium";
import { getWidgetCache, setWidgetCache } from "./widgetCache";

export async function renderMultiWidget() {
  try {
    const { accounts } = useAccountStore.getState();
    const unlimitedWidgets = hasUnlimitedWidgetAccounts();
    console.log("unlimitedWidgets", unlimitedWidgets);

    if (!accounts || accounts.length === 0) {
      return (
        <MultiAccountWidget
          accounts={[]}
          totalAccounts={0}
          error={false}
          isPro={unlimitedWidgets}
        />
      );
    }

    await Promise.all(
      accounts.map(async (acc) => {
        const cache = getWidgetCache(acc.tag, "builder");

        if (!cache) {
          const { getBuilderWidgetData } =
            await import("@/widget/getBuilderWidgetData");

          const data = await getBuilderWidgetData(acc.tag);

          setWidgetCache(acc.tag, "builder", {
            ...data,
            cachedAt: Date.now(),
          });
        }
        const fresh = getWidgetCache(acc.tag, "builder");

        // console.log("CACHE VERIFY", fresh);
      }),
    );
    const data = unlimitedWidgets
      ? await getMultiWidgetDataPro()
      : await getMultiWidgetDataFree();

    if (!data || data.length === 0) {
      return (
        <MultiAccountWidget
          accounts={[]}
          totalAccounts={accounts.length}
          isPro={unlimitedWidgets}
        />
      );
    }

    return (
      <MultiAccountWidget
        accounts={data}
        totalAccounts={accounts.length}
        isPro={unlimitedWidgets}
      />
    );
  } catch (e) {
    console.log("renderMultiWidget error:", e);

    return (
      <MultiAccountWidget
        accounts={[]}
        totalAccounts={0}
        error={true}
        isPro={false}
      />
    );
  }
}
