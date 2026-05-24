import { useAccountStore } from "@/stores/accountStore";
import { usePremiumStore } from "@/stores/premiumStore";
import { getMultiWidgetDataFree } from "@/widget/getMultiWidgetDataFree";
import { getMultiWidgetDataPro } from "@/widget/getMultiWidgetDataPro";
import { MultiAccountWidget } from "@/widget/MultiAccountWidget";
import { getWidgetCache, setWidgetCache } from "./widgetCache";

export async function renderMultiWidget() {
  try {
    const { accounts } = useAccountStore.getState();
    const isPro = usePremiumStore.getState().isPro;
    if (!accounts || accounts.length === 0) {
      return (
        <MultiAccountWidget
          accounts={[]}
          totalAccounts={0}
          error={false}
          isPro={isPro}
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
    const data = isPro
      ? await getMultiWidgetDataPro()
      : await getMultiWidgetDataFree();

    if (!data || data.length === 0) {
      return (
        <MultiAccountWidget
          accounts={[]}
          totalAccounts={accounts.length}
          isPro={isPro}
        />
      );
    }

    return (
      <MultiAccountWidget
        accounts={data}
        totalAccounts={accounts.length}
        isPro={isPro}
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
