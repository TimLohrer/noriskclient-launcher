use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::thread;
use tokio::sync::oneshot::Receiver;
use tokio::process::{Child, Command};
use anyhow::{Result, bail};
use tokio::io::AsyncReadExt;
use log::debug;
use crate::custom_servers::forwarding_manager::{start_forwarding, GetTokenResponse};
use crate::custom_servers::models::CustomServer;

pub struct JavaRuntime(PathBuf);

impl JavaRuntime {

    pub fn new(path: PathBuf) -> JavaRuntime {
        JavaRuntime(path)
    }

    pub async fn execute(&self, arguments: Vec<String>, game_dir: &Path) -> Result<Child> {
        let mut command = Command::new(&self.0);
        command.current_dir(game_dir);
        command.args(arguments);

        command
            .stderr(Stdio::piped())
            .stdout(Stdio::piped());

        let child = command.spawn()?;
        Ok(child)
    }

    pub async fn run_server(&self, max_ram: u64, min_ram: u64, server_dir: &Path) -> Result<Child> {
        let mut command = Command::new(&self.0);
        command.current_dir(server_dir);
        command.arg("-Xmx".to_owned() + &max_ram.to_string() + "M");
        command.arg("-Xms".to_owned() + &min_ram.to_string() + "M");
        command.arg("-jar").arg("server.jar");
        command.arg("nogui".to_owned());

        command
            .stderr(Stdio::piped())
            .stdout(Stdio::piped());

        let child = command.spawn()?;
        Ok(child)
    }

    pub async fn handle_io<D: Send + Sync>(&self, running_task: &mut Child, on_stdout: fn(&D, &[u8]) -> Result<()>, on_stderr: fn(&D, &[u8]) -> Result<()>, terminator: Receiver<()>, data: &D) -> Result<()> {
        let mut stdout = running_task.stdout.take().unwrap();
        let mut stderr = running_task.stderr.take().unwrap();
    
        let mut stdout_buf = vec![0; 1024];
        let mut stderr_buf = vec![0; 1024];
    
        tokio::pin!(terminator);
    
        loop {
            tokio::select! {
                read_len = stdout.read(&mut stdout_buf) => {
                    let _ = (on_stdout)(&data, &stdout_buf[..read_len?]);
                },
                read_len = stderr.read(&mut stderr_buf) => {
                    let _ = (on_stderr)(&data, &stderr_buf[..read_len?]);
                },
                _ = &mut terminator => {
                    running_task.kill().await?;
                    break;
                },
                exit_status = running_task.wait() => {
                    let code = exit_status?.code().unwrap_or(7900); // 7900 = unwrap failed error code

                    debug!("Process exited with code: {}", code);
                    if code != 0 && code != -1073740791 { // -1073740791 = happens when the process is killed forcefully, we don't want to bail in this case
                        bail!("Process exited with non-zero code: {}", code);
                    }
                    break;
                },
            }
        }
        Ok(())
    }

    pub async fn handle_server_io<D: Send + Sync>(&self, running_task: &mut Child, server: &CustomServer, tokens: &GetTokenResponse, on_stdout: fn(&D, &str, &[u8]) -> Result<()>, on_stderr: fn(&D, &str, &[u8]) -> Result<()>, data: &D) -> Result<()> {
        let mut stdout = running_task.stdout.take().unwrap();
        let mut stderr = running_task.stderr.take().unwrap();
    
        let mut stdout_buf = vec![0; 1024];
        let mut stderr_buf = vec![0; 1024];

        let mut startet_forwarding = false;
    
        loop {
            tokio::select! {
                read_len = stdout.read(&mut stdout_buf) => {
                    let content = &stdout_buf[..read_len?];
                    if String::from_utf8_lossy(content).contains("Done") && !startet_forwarding {
                        let server_clone = server.clone();
                        let tokens_clone = tokens.clone();
                        thread::spawn(move || {
                            let _ = start_forwarding(server_clone, tokens_clone).map_err(|e| format!("Failed to start forwarding: {}", e));
                        });
                        startet_forwarding = true;
                    }
                    let _ = (on_stdout)(&data, &server.id, content);
                },
                read_len = stderr.read(&mut stderr_buf) => {
                    let _ = (on_stderr)(&data, &server.id, &stderr_buf[..read_len?]);
                },
                exit_status = running_task.wait() => {
                    let code = exit_status?.code().unwrap_or(7900); // 7900 = unwrap failed error code

                    debug!("Process exited with code: {}", code);
                    if code != 0 && code != -1073740791 { // -1073740791 = happens when the process is killed forcefully, we don't want to bail in this case
                        bail!("Process exited with non-zero code: {}", code);
                    }
                    break;
                },
            }
        }
        Ok(())
    }
}