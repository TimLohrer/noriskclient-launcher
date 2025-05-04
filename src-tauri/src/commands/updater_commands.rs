use noriskclient_launcher_v3_lib::error::CommandError;
use tauri::{Manager, WebviewWindow};

#[tauri::command]
pub async fn open_updater<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
) -> Result<(), CommandError> {
    if let Some(window) = app.get_webview_window("updater") {
        window.set_focus().ok();
        return Ok(());
    }

    // Create a new window for the log viewer
    tauri::WebviewWindowBuilder::new(
        &app,
        "updater",
        tauri::WebviewUrl::App("/updater".into()),
    )
    .title("NoRiskClient Updater")
    .resizable(false)
    .decorations(false)
    .closable(false)
    .inner_size(400.0, 380.0)
    .center()
    .build()
    .map_err(|e| CommandError::from(noriskclient_launcher_v3_lib::error::AppError::Other(e.to_string())))?;

    Ok(())
}


#[tauri::command]
pub async fn close_updater(window: WebviewWindow) {
    // Close updater
    let updater = window.get_webview_window("updater");
    if updater.is_some() {
        updater.unwrap().close().unwrap();
    }
    
    // Show main window
    let main = window.get_webview_window("main");
    if main.is_some() {
        main.clone().unwrap().show().unwrap();
        main.unwrap().set_focus().unwrap();
    }
}

#[tauri::command]
pub async fn has_internet_connection() -> bool {
    reqwest::get("https://www.google.com").await.is_ok()
}

#[tauri::command]
pub async fn check_nrc_online_status() -> Result<bool, String> {
    let is_online = reqwest::Client::new()
        .get("https://api.norisk.gg/api/v1/core/online")
        .send()
        .await
        .is_ok();

    Ok(is_online)
}