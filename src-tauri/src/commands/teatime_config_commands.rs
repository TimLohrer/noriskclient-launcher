use crate::error::CommandError;
use crate::state::State;
use crate::state::teatime_config_state::TeaTimeConfig;
use tauri::command;

type Result<T> = std::result::Result<T, CommandError>;

#[command]
pub async fn get_teatime_config() -> Result<TeaTimeConfig> {
    let state = State::get().await?;
    let config = state.teatime_config_manager.get_config().await;
    Ok(config)
}

#[command]
pub async fn set_teatime_config(config: TeaTimeConfig) -> Result<TeaTimeConfig> {
    let state = State::get().await?;

    // Set the entire configuration
    state.teatime_config_manager.set_config(config.clone()).await?;

    // Return the updated config
    Ok(config)
}