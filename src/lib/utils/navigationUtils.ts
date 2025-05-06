import { get, writable, type Writable } from "svelte/store";

export const tabs: Writable<Record<string, any>[]> = writable([]);
export const activeTab = writable('play');
export const closeTabDirection: Writable<"right" | "left" | null> = writable(null);

export function selectTab(tab: string) {
    const _tabs = get(tabs);
    const active = _tabs.find(t => t.name === get(activeTab))!;
    const newTab = _tabs.find(t => t.name === tab)!;
    if (active === newTab) return;
    
    closeTabDirection.set(_tabs.indexOf(active) > _tabs.indexOf(newTab) ? 'right' : 'left');
    setTimeout(() => {
        activeTab.set(tab);
    }, 100);
}

export function resetCloseTabDirection() {
    closeTabDirection.set(null);
}