// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use tauri::{Builder, Window, WindowEvent};

fn main() {
    let python_process: Arc<Mutex<Option<Child>>> = Arc::new(Mutex::new(None));
    let process_clone = python_process.clone();

    Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(move |_app| {
            let child = if cfg!(target_os = "windows") {
                use std::os::windows::process::CommandExt;
                const CREATE_NO_WINDOW: u32 = 0x08000000;
            
                Command::new("cmd")
                    .args(["/k", "python", "./backend/main.py"])
                    // .creation_flags(CREATE_NO_WINDOW)
                    .spawn()
                    .expect("❌ Failed to start Python backend")
            } else {
                Command::new("cmd")
                    .args(["/k", "python", "./backend/main.py"])
                    .spawn()
                    .expect("❌ Failed to start Python backend")
            };            

            *process_clone.lock().unwrap() = Some(child);
            Ok(())
        })
        .on_window_event({
            let process_clone = python_process.clone();
            move |_window: &Window, event: &WindowEvent| {
                if let WindowEvent::CloseRequested { .. } = event {
                    if let Some(mut child) = process_clone.lock().unwrap().take() {
                        let _ = child.kill();
                        println!("🛑 Python backend stopped.");
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
