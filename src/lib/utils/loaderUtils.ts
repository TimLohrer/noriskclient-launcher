import { getFabricLoaderVersions, getForgeVersions, getMinecraftVersions, getNeoForgeVersions, getQuiltLoaderVersions } from "$lib/api/profiles";
import type { FabricVersionInfo } from "$lib/types/fabric";
import type { ForgeVersion } from "$lib/types/forge";
import type { QuiltVersionInfo } from "$lib/types/quilt";
import type { VersionManifest } from "$lib/types/vanilla";
import { writable, type Writable } from "svelte/store";

export const vanillaVersions: Writable<VersionManifest | null> = writable(null);
export const fabricVersions: Writable<FabricVersionInfo[]> = writable([]);
export const forgeVersions: Writable<ForgeVersion[]> = writable([]);
export const quiltVersions: Writable<QuiltVersionInfo[]> = writable([]);
export const neoforgeVersions: Writable<string[]> = writable([]);

export async function loadVanillaVersions() {
    const versions = await getMinecraftVersions() ?? null;
    
    vanillaVersions.set(versions);
}

export async function loadLoaderVersions(gameVersion: string) {
    const fabric = await getFabricLoaderVersions(gameVersion) ?? [];
    const froge = await getForgeVersions(gameVersion) ?? [];
    const quilt = await getQuiltLoaderVersions(gameVersion) ?? [];
    const neoforge = await getNeoForgeVersions(gameVersion) ?? [];
    
    fabricVersions.set(fabric);
    forgeVersions.set(froge.map(v => { return  {game_version: v.split('-')[0], loader_version: v.split('-')[1]} }));
    quiltVersions.set(quilt);
    neoforgeVersions.set(neoforge);

    console.log(
        "Fabric: ", fabric,
        "Forge: ", froge,
        "Quilt: ", quilt,
        "NeoForge: ", neoforge
    );
    
}

export function clearLoaderVersions() {
    fabricVersions.set([]);
    forgeVersions.set([]);
    quiltVersions.set([]);
    neoforgeVersions.set([]);
}
