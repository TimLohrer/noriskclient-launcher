import type { NoriskVersionsConfig } from "$lib/types/noriskVersions";
import type { Profile } from "$lib/types/profile";
import { invoke } from "@tauri-apps/api/core";

export async function getNoriskProfiles(): Promise<Profile[]> {
    return ((await invoke('get_standard_profiles')) as NoriskVersionsConfig).profiles;
}