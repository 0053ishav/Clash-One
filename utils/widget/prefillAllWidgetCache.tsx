import { useAccountStore } from "@/stores/accountStore";
import { setWidgetCache } from "@/utils/widget/widgetCache";
import { getBuilderWidgetData } from "@/widget/getBuilderWidgetData";

export async function prefillAllWidgetCache() {
  const { accounts } = useAccountStore.getState();

  for (const acc of accounts) {
    try {
      const data = await getBuilderWidgetData(acc.tag);

      setWidgetCache(acc.tag, {
        ...data,
        renderedAt: Date.now(),
      });
    } catch {
      console.log("prefill cache failed:", acc.tag);
    }
  }
}
