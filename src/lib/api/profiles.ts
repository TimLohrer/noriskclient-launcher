import { invoke } from '@tauri-apps/api/core';
import type { CopyProfileParams, CreateProfileParams, Profile, UpdateProfileParams } from '$lib/types/profile';
import type { FabricVersionInfo } from '$lib/types/fabric';
import type { QuiltVersionInfo } from '$lib/types/quilt';
import type { VersionManifest } from '$lib/types/vanilla';

// Profil erstellen
export async function createProfile(params: CreateProfileParams): Promise<string> {
    return invoke('create_profile', { params });
}

// Profile-Liste abrufen
export async function getProfiles(): Promise<Profile[]> {
    return invoke('list_profiles');
}

// Einzelnes Profil abrufen
export async function getProfile(id: string): Promise<Profile> {
    return invoke('get_profile', { id });
}

// Profil aktualisieren
export async function updateProfile(id: string, params: UpdateProfileParams): Promise<void> {
    return invoke('update_profile', { id, params });
}

// Profil löschen
export async function deleteProfile(id: string): Promise<void> {
    return invoke('delete_profile', { id });
}

// Profil-Ordner öffnen
export async function openProfileFolder(profileId: string): Promise<void> {
    return invoke('open_profile_folder', { profileId });
}

// Profil starten
export async function launchProfile(id: string): Promise<void> {
    return invoke('launch_profile', { id });
}

// Profil start abbrechen
export async function abortProfileLaunch(prodileId: string): Promise<void> {
    return invoke('abort_profile_launch', { prodileId });
}

// Profil kopieren mit ausgewählten Dateien
export async function copyProfile(params: CopyProfileParams): Promise<string> {
    return invoke('copy_profile', { params });
}

// Verzeichnisstruktur eines Profils laden
export async function getProfileDirectoryStructure(profileId: string): Promise<any> {
    return invoke('get_profile_directory_structure', { profileId });
} 

export async function getMinecraftVersions(): Promise<VersionManifest> {
    return invoke('get_minecraft_versions');
}

export async function getForgeVersions(minecraftVersion: string): Promise<string[]> {
    return invoke('get_forge_versions', { minecraftVersion });
}

export async function getFabricLoaderVersions(minecraftVersion: string): Promise<FabricVersionInfo[]> {
    return invoke('get_fabric_loader_versions', { minecraftVersion });;
}

export async function getNeoForgeVersions(minecraftVersion: string): Promise<string[]> {
    return invoke('get_neoforge_versions', { minecraftVersion });
}

export async function getQuiltLoaderVersions(minecraftVersion: string): Promise<QuiltVersionInfo[]> {
    return invoke('get_quilt_loader_versions', { minecraftVersion });
}