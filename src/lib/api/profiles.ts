import { invoke } from '@tauri-apps/api/core';
import type { Profile } from '$lib/types/profile';
import type { FabricVersionInfo } from '$lib/types/fabric';
import type { QuiltVersionInfo } from '$lib/types/quilt';
import type { VersionManifest } from '$lib/types/vanilla';

// Interface für die Profile-Parameter
export interface CreateProfileParams {
    name: string;
    game_version: string;
    loader: string;
    loader_version?: string;
    selected_norisk_pack_id?: string;
}

// Interface für die Profile-Update Parameter
export interface UpdateProfileParams {
    name?: string;
    game_version?: string;
    loader?: string;
    loader_version?: string;
    settings?: any; // Angepasst, da ProfileSettings nicht exportiert wird
    selected_norisk_pack_id?: string;
}

// Neue Interface für die Profile-Kopier Parameter
export interface CopyProfileParams {
    source_profile_id: string;
    new_profile_name: string;
    include_files?: string[];
}

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

export async function getForgeLoaderVersions(minecraftVersion: string): Promise<string[]> {
    return invoke('get_forge_loader_versions', { minecraftVersion });
}

export async function getFabricLoaderVersions(minecraftVersion: string): Promise<FabricVersionInfo[]> {
    return invoke('get_fabric_loader_versions', { minecraftVersion });;
}

export async function getNeoForgeLoaderVersions(minecraftVersion: string): Promise<string[]> {
    return invoke('get_neoforge_loader_versions', { minecraftVersion });
}

export async function getQuiltLoaderVersions(minecraftVersion: string): Promise<QuiltVersionInfo[]> {
    return invoke('get_quilt_loader_versions', { minecraftVersion });
}