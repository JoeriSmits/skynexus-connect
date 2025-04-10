// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

fn main() {
  tauri::Builder::default()
    .setup(|_app| {
        // Update to one level higher if backend is outside of frontend/
        #[cfg(target_os = "windows")]
        Command::new("python")
            .args(["../../backend/main.py"])
            .spawn()
            .unwrap();

        #[cfg(not(target_os = "windows"))]
        Command::new("python3")
            .args(["../../backend/main.py"])
            .spawn()
            .unwrap();

        Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}