use crate::error::{AppError, Result};
use crate::minecraft::dto::piston_meta::DownloadInfo;
use crate::config::{LAUNCHER_DIRECTORY, ProjectDirsExt};
use std::path::PathBuf;
use log::info;
use reqwest;
use tokio::fs;
use tokio::io::AsyncWriteExt;

const VERSIONS_DIR: &str = "versions";

pub struct MinecraftClientDownloadService {
    base_path: PathBuf,
}

impl MinecraftClientDownloadService {
    pub fn new() -> Self {
        let base_path = LAUNCHER_DIRECTORY.meta_dir().join(VERSIONS_DIR);
        Self { 
            base_path,
        }
    }

    pub async fn download_client(&self, client_info: &DownloadInfo, version_id: &str) -> Result<()> {
        let version_dir = self.base_path.join(version_id);
        let target_path = version_dir.join(format!("{}.jar", version_id));
        
        fs::create_dir_all(&version_dir).await?;
        
        if target_path.exists() {
            let metadata = fs::metadata(&target_path).await?;
            if metadata.len() as i64 == client_info.size {
                info!("Client jar already exists with correct size");
                return Ok(());
            }
        }

        let url = &client_info.url;
        let response = reqwest::get(url)
            .await
            .map_err(AppError::MinecraftApi)?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "No error details available".to_string());
            return Err(AppError::Download(
                format!("Failed to download client jar - Status {}: {}", status, error_text)
            ));
        }

        let bytes = response.bytes()
            .await
            .map_err(AppError::MinecraftApi)?;

        let mut file = fs::File::create(&target_path).await?;
        file.write_all(&bytes).await?;

        info!("Downloaded client jar to: {}", target_path.display());
        Ok(())
    }
} 