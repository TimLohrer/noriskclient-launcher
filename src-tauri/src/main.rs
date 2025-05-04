// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod config;
mod error;
pub mod integrations;
mod logging;
mod minecraft;
mod state;
mod utils;
use crate::integrations::norisk_packs;
use crate::integrations::norisk_versions;
use log::{debug, error, info, warn};
use rand::seq::SliceRandom;
use std::sync::Arc;
use tauri::Listener;

use crate::commands::process_command::{
    get_full_log, get_process, get_processes, get_processes_by_profile, open_log_window,
    set_discord_state, stop_process,
};
use commands::minecraft_auth_command::{
    begin_login, get_accounts, get_active_account, remove_account, set_active_account,
};
use commands::minecraft_command::{
    add_skin,
    apply_skin_from_base64,
    // Local skin database commands
    get_all_skins,
    get_fabric_loader_versions,
    get_forge_versions,
    get_minecraft_versions,
    get_neoforge_versions,
    get_quilt_loader_versions,
    get_skin_by_id,
    // Skin management commands
    get_user_skin_data,
    remove_skin,
    reset_skin,
    update_skin_properties,
    upload_log_to_mclogs_command,
    upload_skin,
};
use commands::profile_command::{
    abort_profile_launch, add_modrinth_content_to_profile, add_modrinth_mod_to_profile,
    copy_profile, create_profile, delete_custom_mod, delete_mod_from_profile, delete_profile,
    export_profile, get_custom_mods, get_local_datapacks, get_local_resourcepacks,
    get_local_shaderpacks, get_norisk_packs, get_norisk_packs_resolved, get_profile,
    get_profile_directory_structure, get_standard_profiles, get_system_ram_mb, import_local_mods,
    import_profile_from_file, is_content_installed, is_profile_launching, launch_profile,
    list_profiles, open_profile_folder, refresh_norisk_packs, refresh_standard_versions,
    search_profiles, set_custom_mod_enabled, set_norisk_mod_status, set_profile_mod_enabled,
    update_datapack_from_modrinth, update_modrinth_mod_version, update_profile,
    update_resourcepack_from_modrinth, update_shaderpack_from_modrinth,
};

// Use statements for registered commands only
use commands::modrinth_commands::{
    check_modrinth_updates, download_and_install_modrinth_modpack,
    get_all_modrinth_versions_for_contexts, get_modrinth_mod_versions,
    get_modrinth_project_details, search_modrinth_mods, search_modrinth_projects,
}; // Remove or comment out if not needed

use commands::file_command::{
    delete_file, get_icons_for_archives, get_icons_for_norisk_mods, open_file_directory,
    set_file_enabled,
};

// Import config commands
use commands::config_commands::{get_launcher_config, set_launcher_config};

// Import path commands
use commands::path_commands::{get_launcher_directory, resolve_image_path};

// Import cape commands
use commands::cape_command::{
    browse_capes, delete_cape, equip_cape, get_player_capes, unequip_cape, upload_cape,
};

use commands::updater_commands::*;

use tauri::Manager;

#[tokio::main]
async fn main() {
    if let Err(e) = logging::setup_logging().await {
        eprintln!("ERROR: Failed to initialize logging: {}", e);
    }

    info!("Starting NoRiskClient Launcher...");

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            // Initialize the state asynchronously
            let app_handle  = Arc::new(app.handle().clone());
            let app_handle_for_updater = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                let _ = norisk_versions::load_dummy_versions().await;
                let _ = norisk_packs::load_dummy_modpacks().await;

                if let Err(e) = state::state_manager::State::init(app_handle).await {
                    error!("Failed to initialize state: {}", e);
                    // Consider exiting or notifying the user if state init fails critically
                }

                let _ = open_updater((*app_handle_for_updater).clone()).await;
            });

            // --- Register Focus Event Listener for Discord RPC --- 
            if let Some(main_window) = app.get_webview_window("main") { // Use get_webview_window
                main_window.listen("tauri://focus", move |_event| {
                    tokio::spawn(async move {
                        debug!("Main window focus event received. Triggering DiscordManager handler.");
                        // Get the global state using the static getter and call the handler
                        match state::state_manager::State::get().await {
                            Ok(state) => {
                                if let Err(e) = state.discord_manager.handle_focus_event().await {
                                     error!("Error during DiscordManager focus handling: {}", e);
                                }
                            }
                            Err(e) => {
                                error!("Focus event listener: Failed to get global state using State::get(): {}", e);
                            }
                        }
                    });
                });
            } else {
                error!("Could not get main window handle to attach focus listener!");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            has_internet_connection,
            check_nrc_online_status,
            open_updater,
            close_updater,
            create_profile,
            get_profile,
            update_profile,
            delete_profile,
            list_profiles,
            search_profiles,
            get_minecraft_versions,
            launch_profile,
            abort_profile_launch,
            is_profile_launching,
            get_processes,
            get_process,
            get_processes_by_profile,
            stop_process,
            open_log_window,
            begin_login,
            remove_account,
            get_active_account,
            set_active_account,
            get_accounts,
            search_modrinth_mods,
            search_modrinth_projects,
            get_modrinth_mod_versions,
            add_modrinth_mod_to_profile,
            add_modrinth_content_to_profile,
            get_modrinth_project_details,
            check_modrinth_updates,
            get_icons_for_archives,
            set_profile_mod_enabled,
            delete_mod_from_profile,
            get_norisk_packs,
            get_norisk_packs_resolved,
            set_norisk_mod_status,
            update_modrinth_mod_version,
            get_all_modrinth_versions_for_contexts,
            get_full_log,
            get_custom_mods,
            get_local_resourcepacks,
            get_local_shaderpacks,
            get_local_datapacks,
            set_custom_mod_enabled,
            import_local_mods,
            get_system_ram_mb,
            delete_custom_mod,
            open_profile_folder,
            import_profile_from_file,
            upload_log_to_mclogs_command,
            get_fabric_loader_versions,
            get_forge_versions,
            get_neoforge_versions,
            get_quilt_loader_versions,
            set_file_enabled,
            delete_file,
            get_icons_for_norisk_mods,
            open_file_directory,
            download_and_install_modrinth_modpack,
            get_standard_profiles,
            get_profile_directory_structure,
            copy_profile,
            export_profile,
            get_launcher_config,
            set_launcher_config,
            get_launcher_directory,
            resolve_image_path,
            // Resource and Shader pack updates
            update_resourcepack_from_modrinth,
            update_shaderpack_from_modrinth,
            update_datapack_from_modrinth,
            // Skin management commands
            get_user_skin_data,
            upload_skin,
            reset_skin,
            apply_skin_from_base64,
            // Local skin database commands
            get_all_skins,
            get_skin_by_id,
            add_skin,
            remove_skin,
            update_skin_properties,
            set_discord_state,
            // Cape commands
            browse_capes,
            get_player_capes,
            equip_cape,
            delete_cape,
            upload_cape,
            unequip_cape,
            refresh_norisk_packs,
            refresh_standard_versions,
            is_content_installed
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
