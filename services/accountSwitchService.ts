import { getAccountByTag } from "@/services/accountService";
import { setActiveAccount } from "@/storage/activeAccount";
import { getPlayerProfile, savePlayerProfile } from "@/storage/playerProfile";

export async function switchAccountService(tag: string) {

    setActiveAccount(tag);

    const account = await getAccountByTag(tag);

    if (!account) return;

    const current = getPlayerProfile();

    savePlayerProfile({
        ...current,
        playerTag: account.tag,
        playerName: account.name,
        townHallLevel: account.townhall,
    });
}