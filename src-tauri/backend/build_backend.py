# src-tauri/backend/build_backend.py
import subprocess
import sys
import os

# Set correct path to main.py relative to this script
MAIN_SCRIPT = os.path.join(os.path.dirname(__file__), "main.py")
DIST_DIR = os.path.join(os.path.dirname(__file__), "dist")

print("🔨 Building Python backend with PyInstaller...")

try:
    subprocess.run([
        os.path.expandvars(r"%LOCALAPPDATA%\Packages\PythonSoftwareFoundation.Python.3.10_qbz5n2kfra8p0\LocalCache\local-packages\Python310\Scripts\pyinstaller.exe"),
        MAIN_SCRIPT,
        "--onefile",
        "--distpath", DIST_DIR,
    ], check=True)
    print("✅ Python backend build complete.")
except subprocess.CalledProcessError as e:
    print("❌ PyInstaller build failed:", e)
    sys.exit(1)
