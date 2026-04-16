import { useAccountStore } from "@/stores/accountStore";
import { usePremiumStore } from "@/stores/premiumStore";
import { getMultiWidgetDataFree } from "@/widget/getMultiWidgetDataFree";
import { getMultiWidgetDataPro } from "@/widget/getMultiWidgetDataPro";
import { MultiAccountWidget } from "@/widget/MultiAccountWidget";

export function renderMultiWidget() {
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

    const data = isPro ? getMultiWidgetDataPro() : getMultiWidgetDataFree();

    console.log(data, "data");

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
