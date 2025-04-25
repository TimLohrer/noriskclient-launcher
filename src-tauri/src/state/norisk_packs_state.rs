use crate::config::{LAUNCHER_DIRECTORY, ProjectDirsExt};
use crate::error::Result;
use crate::integrations::norisk_packs::NoriskModpacksConfig;
use log::{info, error};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::fs;
use tokio::sync::RwLock;
use tokio::sync::Mutex;

// Default filename for the Norisk packs configuration
const NORISK_PACKS_FILENAME: &str = "norisk_modpacks.json";

pub struct NoriskPackManager {
    config: Arc<RwLock<NoriskModpacksConfig>>,
    config_path: PathBuf,
    save_lock: Mutex<()>,
}

impl NoriskPackManager {
    /// Creates a new NoriskPackManager instance, loading the configuration from the specified path.
    /// If the file doesn't exist, it initializes with a default empty configuration.
    pub async fn new(config_path: PathBuf) -> Result<Self> {
        info!("Initializing NoriskPackManager with path: {:?}", config_path);
        let config = Self::load_config(&config_path).await?;
        Ok(Self {
            config: Arc::new(RwLock::new(config)),
            config_path,
            save_lock: Mutex::new(()),
        })
    }

    /// Loads the Norisk packs configuration from a JSON file.
    /// Returns a default empty config if the file doesn't exist or cannot be parsed.
    async fn load_config(path: &PathBuf) -> Result<NoriskModpacksConfig> {
        if !path.exists() {
            info!("Norisk packs config file not found at {:?}, using default empty config.", path);
            return Ok(NoriskModpacksConfig {
                packs: HashMap::new(),
                repositories: HashMap::new(),
            });
        }

        let data = fs::read_to_string(path).await?;

        match serde_json::from_str(&data) {
            Ok(config) => Ok(config),
            Err(e) => {
                error!("Failed to parse norisk_modpacks.json at {:?}: {}. Returning default empty config.", path, e);
                Ok(NoriskModpacksConfig {
                    packs: HashMap::new(),
                    repositories: HashMap::new(),
                })
            }
        }
    }

    /// Saves the current configuration back to the JSON file.
    async fn save_config(&self) -> Result<()> {
        let _guard = self.save_lock.lock().await;

        let config_data = { // Limit the scope of the read lock
            let config_guard = self.config.read().await;
            serde_json::to_string_pretty(&*config_guard)?
        }; // Read lock is released here
        
        if let Some(parent_dir) = self.config_path.parent() {
             if !parent_dir.exists() {
                fs::create_dir_all(parent_dir).await?;
                info!("Created directory for norisk packs config: {:?}", parent_dir);
            }
        }

        fs::write(&self.config_path, config_data).await?;
        info!("Successfully saved norisk packs config to {:?}", self.config_path);
        Ok(())
    }

    /// Returns a clone of the entire current NoriskModpacksConfig.
    pub async fn get_config(&self) -> NoriskModpacksConfig {
        self.config.read().await.clone()
    }

     /// Updates the entire configuration and saves it to the file.
     pub async fn update_config(&self, new_config: NoriskModpacksConfig) -> Result<()> {
         { 
             let mut config_guard = self.config.write().await;
             *config_guard = new_config;
         } 
         self.save_config().await // Save the updated config (already handles locking)
     }

    /// Prints the current configuration to the console for debugging.
    #[allow(dead_code)] // Allow unused function for debugging purposes
    pub async fn print_current_config(&self) {
        let config_guard = self.config.read().await;
        println!("--- Current Norisk Packs Config ---");
        println!("{:#?}", *config_guard); // Use pretty-print debug format
        match config_guard.print_resolved_packs() {
            Ok(_) => (),
            Err(e) => error!("Failed to print resolved packs: {}", e),
        }
        println!("--- End Norisk Packs Config ---");
    }

    // Add more specific accessor methods if needed, e.g.:
    // pub async fn get_pack_definition(&self, pack_id: &str) -> Option<NoriskPackDefinition> { ... }
    // pub async fn get_repository_url(&self, repo_ref: &str) -> Option<String> { ... }
}

/// Returns the default path for the norisk_modpacks.json file within the launcher directory.
pub fn default_norisk_packs_path() -> PathBuf {
    LAUNCHER_DIRECTORY.root_dir().join(NORISK_PACKS_FILENAME)
} 