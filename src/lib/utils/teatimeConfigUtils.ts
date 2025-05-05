import { getTeaTimeConfig, setTeaTimeConfig } from "$lib/api/teatimeConfig";
import type { TeaTimeConfig } from "$lib/types/core";
import { writable, type Writable } from "svelte/store";

export const teatimeConfig: Writable<TeaTimeConfig | null> = writable(null);

export async function loadTeaTimeConfig(): Promise<void> {
    const config = await getTeaTimeConfig();
    teatimeConfig.set(config);
}

export async function updateTeaTimeConfig(config: TeaTimeConfig): Promise<void> {
    teatimeConfig.set(config);
    await setTeaTimeConfig(config);
}