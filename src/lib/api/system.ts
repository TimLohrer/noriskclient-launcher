import { invoke } from "@tauri-apps/api/core";

// returns the systems memory in MB
export async function getSystemMemory(): Promise<number> {
    return invoke('get_system_ram_mb');
}