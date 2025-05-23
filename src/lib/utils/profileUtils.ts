import { getNoriskProfiles } from "$lib/api/noriskVersions";
import { copyProfile, getProfiles, createProfile as _createProfile, updateProfile } from "$lib/api/profiles";
import type { CreateProfileParams, Profile } from "$lib/types/profile";
import { get, writable, type Writable } from "svelte/store";

export const profiles: Writable<Profile[]> = writable([]);
export const selectedProfile: Writable<Profile | null> = writable(null);

export async function createProfile(profile: Profile): Promise<void> {
    try {
        const newProfileId = await _createProfile({
            name: profile.name,
            game_version: profile.game_version,
            loader: profile.loader,
            loader_version: profile.loader_version ?? undefined,
            selected_norisk_pack_id: profile.selected_norisk_pack_id ?? undefined,
        });
        
        await updateProfile(newProfileId, {
            group: profile.group!,
            description: profile.description!,
            settings: profile.settings
        })

        await loadProfiles();
    } catch (error) {
        console.error("Failed to create profile:", error);
    }
}

export async function loadProfiles(): Promise<void> {
    try {
        const profileList = await getProfiles();
        const defaultProfileList = await getNoriskProfiles();
        profiles.set([...defaultProfileList, ...profileList]);
        
        console.log("Profiles loaded:", profileList);
        console.log("Default profiles loaded:", defaultProfileList);

        // Optional: Auto-select the first profile if none is selected
        if (get(selectedProfile) == null && defaultProfileList.length > 0) {
            selectProfile(defaultProfileList[0].id);
        }

    } catch (error) {
        console.error("Failed to load profiles:", error);
        profiles.set([]);
        selectedProfile.set(null);
    }
}

export function selectProfile(profileId: string | null): void {
    if (profileId) {
        const profileList = get(profiles);
        const selected = profileList.find(profile => profile.id === profileId);
        selectedProfile.set(selected || null);
    } else {
        selectedProfile.set(null);
    }
}

export async function cloneProfile(profileId: string, newProfileName: string): Promise<boolean> {
    try {
        await copyProfile({ source_profile_id: profileId, new_profile_name: newProfileName, include_files: undefined });
        await loadProfiles();
        return true;
    } catch (error) {
        console.error("Failed to clone profile:", error);
        return false;
    }
}