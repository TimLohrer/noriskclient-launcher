export type ModLoader = "vanilla" | "forge" | "fabric" | "quilt" | "neoforge";
export type ProfileState =
  | "not_installed"
  | "installing"
  | "installed"
  | "running"
  | "error";

interface ImageSourceBase {
  type: "url" | "relativePath" | "relativeProfile" | "absolutePath" | "base64";
}

export interface ImageSourceUrl extends ImageSourceBase {
  type: "url";
  url: string;
}

export interface ImageSourceRelativePath extends ImageSourceBase {
  type: "relativePath";
  path: string;
}

export interface ImageSourceRelativeProfile extends ImageSourceBase {
  type: "relativeProfile";
  path: string;
}

export interface ImageSourceAbsolutePath extends ImageSourceBase {
  type: "absolutePath";
  path: string;
}

export interface ImageSourceBase64 extends ImageSourceBase {
  type: "base64";
  data: string;
  mime_type?: string;
}

export type ImageSource =
  | ImageSourceUrl
  | ImageSourceRelativePath
  | ImageSourceRelativeProfile
  | ImageSourceAbsolutePath
  | ImageSourceBase64;

export interface ProfileBanner {
  source: ImageSource;
}

export interface MemorySettings {
  min: number;
  max: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface ProfileSettings {
  java_path: string | null;       // Option<String> -> string | null
  use_custom_java_path: boolean; // Added boolean flag
  memory: MemorySettings;
  resolution: WindowSize | null;
  fullscreen: boolean;
  extra_game_args: string[];           // Vec<String> -> string[] (Renamed from extra_args)
  custom_jvm_args: string | null;   // Option<String> -> string | null (New)
}

interface ModSourceBase {
  type: "local" | "url" | "maven" | "embedded" | "modrinth";
}

export interface ModSourceLocal extends ModSourceBase {
  type: "local";
  file_name: string;
}

export interface ModSourceUrl extends ModSourceBase {
  type: "url";
  url: string;
  file_name: string | null;
}

export interface ModSourceMaven extends ModSourceBase {
  type: "maven";
  coordinates: string;
  repository_url: string | null;
}

export interface ModSourceEmbedded extends ModSourceBase {
  type: "embedded";
  name: string;
}

export interface ModSourceModrinth extends ModSourceBase {
  type: "modrinth";
  project_id: string;
  version_id: string;
  file_name: string;
  download_url: string;
  file_hash_sha1: string | null;
}

export type ModSource =
  | ModSourceLocal
  | ModSourceUrl
  | ModSourceMaven
  | ModSourceEmbedded
  | ModSourceModrinth;

export interface Mod {
  id: string;
  source: ModSource;
  enabled: boolean;
  display_name: string | null;
  version: string | null;
  game_versions: string[] | null;
  file_name_override: string | null;
  associated_loader: ModLoader | null;
}

export interface NoriskModIdentifier {
  pack_id: string;
  mod_id: string;
  game_version: string;
  loader: ModLoader;
}

export interface NoriskInformation {
  keep_local_assets: boolean;
  is_experimental: boolean;
}

export interface CustomModInfo {
  filename: string;
  is_enabled: boolean;
  path: string;
}

export interface Profile {
  id: string;
  name: string;
  path: string;
  game_version: string;
  loader: ModLoader;
  loader_version: string | null;
  created: string;
  last_played: string | null;
  settings: ProfileSettings;
  state: ProfileState;
  mods: Mod[];
  selected_norisk_pack_id: string | null;
  disabled_norisk_mods_detailed: NoriskModIdentifier[];
  source_standard_profile_id: string | null;
  group: string | null;
  is_standard_version: boolean;
  description: string | null;
  banner: ProfileBanner | null;
  norisk_information: NoriskInformation | null;
}

export interface ProfileGroup {
  id: string;
  name: string;
  profiles: string[];
}

export type ProfileFilterType = "all" | "custom" | "standard";

export interface CreateProfileParams {
  name: string;
  game_version: string;
  loader: string;
  loader_version?: string;
  selected_norisk_pack_id?: string;
}

export interface UpdateProfileParams {
  name?: string;
  game_version?: string;
  loader?: string;
  loader_version?: string;
  settings?: ProfileSettings;
  selected_norisk_pack_id?: string;
  group?: string | null;
  description?: string | null;
}

export interface CopyProfileParams {
  source_profile_id: string;
  new_profile_name: string;
  include_files?: string[];
}

export interface ExportProfileParams {
  profile_id: string;
  file_name: string;
  include_files?: string[];
  open_folder: boolean;
}

// --- Types for Commands ---

/**
 * Parameters for the `copy_world` Tauri command.
 */
export interface CopyWorldParams {
  source_profile_id: string; // Uuid
  source_world_folder: string;
  target_profile_id: string; // Uuid
  target_world_name: string;
}

// --- Types for check_content_installed command ---

/**
 * Parameters for the `is_content_installed` Tauri command.
 */
export interface CheckContentParams {
  profile_id: string; // Uuid -> string
  project_id?: string | null;
  version_id?: string | null;
  file_hash_sha1?: string | null;
  file_name?: string | null;
  project_type?: string | null;
  game_version?: string | null;
  loader?: string | null;
  pack_version_number?: string | null;
}

/**
 * Return type for the `is_content_installed` Tauri command.
 */
export interface ContentInstallStatus {
  is_included_in_norisk_pack: boolean;
  is_installed: boolean;
  is_specific_version_in_pack: boolean;
}

// Added: Type for Screenshot Information
export interface ScreenshotInfo {
  filename: string;
  path: string;
  modified: string | null; // DateTime<Utc> -> string (ISO 8601) | null
}