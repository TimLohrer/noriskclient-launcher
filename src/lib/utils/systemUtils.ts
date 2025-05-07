import { getSystemMemory } from "$lib/api/system";
import { writable } from "svelte/store";

export const systemMemory = writable(0);

export async function loadSystemMemory(): Promise<void> {
    const memory = await getSystemMemory();
    systemMemory.set(memory);
}