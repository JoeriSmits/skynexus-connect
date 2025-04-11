// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::thread;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|_app| {
            thread::spawn(|| {
                #[cfg(target_os = "windows")]
                {
                    Command::new("python")
                        .args(["../../backend/main.py"])
                        .spawn()
                        .expect("Failed to start Python backend");
                }

                #[cfg(not(target_os = "windows"))]
                {
                    Command::new("python3")
                        .args(["../../backend/main.py"])
                        .spawn()
                        .expect("Failed to start Python backend");
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
