import { beginLogin, getAccounts, removeAccount as removeAccountInternal, setActiveAccount } from "$lib/api/accounts";
import type { MinecraftAccount } from "$lib/types/minecraft";
import { get, writable, type Writable } from "svelte/store";
import { translations } from "./translationUtils";
import { selectTab } from "./navigationUtils";

export const accounts: Writable<MinecraftAccount[] | null> = writable(null);
export const selectedAccount: Writable<MinecraftAccount | null> = writable(null);

export const DUMMY_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

export async function loadAccounts() {
    const loadedAccounts = await getAccounts();
    
    accounts.set(loadedAccounts);
    selectedAccount.set(loadedAccounts.find(account => account.active) ?? null);

    console.log("Accounts loaded:", loadedAccounts);
}

export async function addAccount(): Promise<void> {
    accounts.set([...get(accounts) ?? [], {
        id: DUMMY_ACCOUNT_ID,
        username: get(translations).settings.accounts.modal.dummy_account_name,
        minecraft_username: get(translations).settings.accounts.modal.dummy_account_name,
        active: false,
        access_token: '',
        refresh_token: '',
        expires_at: '',
    }]);
    await beginLogin()
    await loadAccounts();
}

export async function selectAccount(accountId: string) {
    if (accountId == get(selectedAccount)?.id) return;

    const loadedAccounts = get(accounts);
    const selected = loadedAccounts?.find(account => account.id === accountId);
    
    if (selected) {
        await setActiveAccount(accountId);
        selectedAccount.set(selected);
    } else {
        console.error(`Account with ID ${accountId} not found.`);
    }
}

export async function removeAccount(accountId: string) {
    await removeAccountInternal(accountId);
    loadAccounts();
    selectAccount(get(accounts)?.[0]?.id ?? '');
}
