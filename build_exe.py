import os
import subprocess
import shutil
import sys

print("Step 1: Building React Frontend... (Skipped in script, already built)")
# subprocess.run(["npm.cmd", "run", "build"], check=True)

print("\nStep 2: Cleaning up old backend builds...")
for folder in ["build", "dist_backend", "dist_electron"]:
    if os.path.exists(folder):
        try:
            shutil.rmtree(folder)
        except Exception as e:
            print(f"Warning: Could not remove folder {folder}: {e}")

print("\nStep 3: Running PyInstaller to package Python backend...")

# Compile the python backend
# We output it to 'dist_backend' so Electron builder can scoop it up
pyinstaller_cmd = [sys.executable, "-m", "PyInstaller", "--noconfirm", "--onefile", "--noconsole", "--name", "main", "--hidden-import", "fpdf", "--add-data", "dist;dist", "--add-data", "backend;backend", "--distpath", "dist_backend", "backend/main.py"]
subprocess.run(pyinstaller_cmd, check=True)

print("\nStep 4: Running Electron Packager to package final application...")

electron_cmd = ["npx.cmd", "electron-packager", ".", "Sentinel Audit", "--platform=win32", "--arch=x64", "--out=dist_electron", "--overwrite", "--ignore=dist_electron", "--ignore=dist_backend", "--ignore=venv", "--ignore=.git", "--ignore=node_modules", "--ignore=backend", "--extra-resource=dist_backend/main.exe", "--icon=icon.ico"]
subprocess.run(electron_cmd, check=True)

print("\nBuild Complete! The final standalone executable is located in 'dist_electron/Sentinel Audit-win32-x64/Sentinel Audit.exe'.")
