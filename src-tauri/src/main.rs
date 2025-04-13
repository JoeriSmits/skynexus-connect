#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use tauri::{Builder, Window, WindowEvent};

#[tauri::command]
fn stop_backend(python_process: tauri::State<Arc<Mutex<Option<Child>>>>) {
    if let Some(mut child) = python_process.lock().unwrap().take() {
        let _ = child.kill();
        println!("🛑 Backend process stopped via command.");
    }
}

fn main() {
    let python_process: Arc<Mutex<Option<Child>>> = Arc::new(Mutex::new(None));
    let process_clone = python_process.clone();

    Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(python_process.clone())
        .setup(move |_app| {
            let child = if cfg!(debug_assertions) {
                Command::new("python")
                    .args(["./backend/main.py"])
                    .spawn()
                    .expect("❌ Failed to start Python backend (main.py)")
            } else {
                use std::os::windows::process::CommandExt;
                const CREATE_NO_WINDOW: u32 = 0x08000000;

                Command::new("./backend/dist/main.exe")
                    .creation_flags(CREATE_NO_WINDOW)
                    .spawn()
                    .expect("❌ Failed to start backend executable (main.exe)")
            };

            *process_clone.lock().unwrap() = Some(child);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![stop_backend])
        .on_window_event({
            let process_clone = python_process.clone();
            move |_window: &Window, event: &WindowEvent| {
                if let WindowEvent::CloseRequested { .. } = event {
                    if let Some(mut child) = process_clone.lock().unwrap().take() {
                        let _ = child.kill();
                        println!("🛑 Backend process stopped.");
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Tauri app");
}
