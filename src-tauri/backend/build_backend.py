import subprocess
import os
import sys

# ✅ Absolute path to the PyInstaller executable
PYINSTALLER = os.path.expandvars(
    r"%LOCALAPPDATA%\Packages\PythonSoftwareFoundation.Python.3.10_qbz5n2kfra8p0\LocalCache\local-packages\Python310\Scripts\pyinstaller.exe"
)

# ✅ Define project paths
BACKEND_PATH = os.path.abspath("main.py").replace("\\", "/")
DIST_PATH = os.path.abspath("dist").replace("\\", "/")
SIMCONNECT_DLL_DIR = os.path.abspath("SimConnect").replace("\\", "/")

print("📦 Bundling Python backend with PyInstaller...")

# ✅ Build the onefile executable with SimConnect.dll included
result = subprocess.run([
    PYINSTALLER,
    BACKEND_PATH,
    "--onefile",
    "--distpath", DIST_PATH,
    "--clean",
    "--add-data", f"{SIMCONNECT_DLL_DIR}/SimConnect.dll;SimConnect",  # format: source;relative_dest (Windows: `;`)
], shell=True)

# ✅ Handle errors
if result.returncode != 0:
    print("❌ PyInstaller build failed")
    sys.exit(1)
else:
    print("✅ Backend build complete!")
