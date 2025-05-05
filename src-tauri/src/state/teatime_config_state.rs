use crate::config::{ProjectDirsExt, LAUNCHER_DIRECTORY};
use crate::error::Result;
use log::{debug, error, info, warn};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::fs;
use tokio::sync::{Mutex, RwLock};

const CONFIG_FILENAME: &str = "teatime_config.json";
const TEATIME_CONFIG_CURRENT_VERSION: u32 = 1;
const DEFAULT_LANGUAGE: &str = "en_US";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeaTimeConfig {
    #[serde(default = "default_config_version")]
    pub version: u32,
    #[serde(default = "default_language")]
    pub language: String,
    #[serde(default = "default_language")]
    pub theme: String,
}

fn default_config_version() -> u32 {
    TEATIME_CONFIG_CURRENT_VERSION
}

fn default_language() -> String {
    DEFAULT_LANGUAGE.to_string()
}

impl Default for TeaTimeConfig {
    fn default() -> Self {
        let mode = dark_light::detect();
        let theme = match mode {
            // Dark mode
            Ok(dark_light::Mode::Dark) => "DARK",
            // Light mode
            Ok(dark_light::Mode::Light) => "LIGHT",
            // Unspecified
            Ok(dark_light::Mode::Unspecified) => "LIGHT",
            Err(_) => "LIGHT", // Fallback to light mode on error
        };

        Self {
            version: TEATIME_CONFIG_CURRENT_VERSION,
            language: DEFAULT_LANGUAGE.to_string(),
            theme: theme.to_string(),
        }
    }
}

pub struct TeaTimeConfigManager {
    config: Arc<RwLock<TeaTimeConfig>>,
    config_path: PathBuf,
    save_lock: Mutex<()>,
}

impl TeaTimeConfigManager {
    pub async fn new() -> Result<Self> {
        let config_path = LAUNCHER_DIRECTORY.root_dir().join(CONFIG_FILENAME);
        info!("Initializing ConfigManager with path: {:?}", config_path);

        let manager = Self {
            config: Arc::new(RwLock::new(TeaTimeConfig::default())),
            config_path,
            save_lock: Mutex::new(()),
        };

        // Load config if it exists
        manager.load_config().await?;

        Ok(manager)
    }

    async fn load_config(&self) -> Result<()> {
        if !self.config_path.exists() {
            info!("Config file not found, using default teatime configuration");
            // Save the default config
            self.save_config().await?;
            return Ok(());
        }

        info!(
            "Loading teatime configuration from: {:?}",
            self.config_path
        );
        let config_data = fs::read_to_string(&self.config_path).await?;

        match serde_json::from_str::<TeaTimeConfig>(&config_data) {
            Ok(loaded_config) => {
                info!("Successfully loaded teatime configuration");
                debug!("Loaded config: {:?}", loaded_config);

                // Update the stored config
                let mut config = self.config.write().await;
                *config = loaded_config;
            }
            Err(e) => {
                error!("Failed to parse teatime config file: {}", e);
                warn!("Using default teatime configuration and saving it");
                // Save the default config to repair the file
                self.save_config().await?;
            }
        }

        Ok(())
    }

    async fn save_config(&self) -> Result<()> {
        let _guard = self.save_lock.lock().await;
        debug!("Acquired save lock, proceeding to save teatime config...");

        // Ensure directory exists
        if let Some(parent_dir) = self.config_path.parent() {
            if !parent_dir.exists() {
                fs::create_dir_all(parent_dir).await?;
                info!("Created directory for teatime config file: {:?}", parent_dir);
            }
        }

        let config = self.config.read().await;
        let config_data = serde_json::to_string_pretty(&*config)?;

        fs::write(&self.config_path, config_data).await?;
        info!(
            "Successfully saved teatime configuration to: {:?}",
            self.config_path
        );

        Ok(())
    }

    // Public methods for accessing and modifying configuration

    pub async fn get_config(&self) -> TeaTimeConfig {
        self.config.read().await.clone()
    }

    pub async fn set_config(&self, new_config: TeaTimeConfig) -> Result<()> {
        let should_save = {
            let mut config = self.config.write().await;
            let current = &*config;

            // Check if there's any change to avoid unnecessary saves
            if current.language == new_config.language && current.theme == new_config.theme {
                debug!("No config changes detected, skipping save");
                false
            } else {
                // Preserve version during replacement
                let version = config.version;

                // Update config while preserving version
                *config = TeaTimeConfig {
                    version,
                    language: new_config.language,
                    theme: new_config.theme,
                };

                true
            }
        };

        // Save the updated config if needed
        if should_save {
            self.save_config().await?;
        }

        Ok(())
    }
}
