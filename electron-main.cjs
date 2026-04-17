const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let pythonProcess;

const API_PORT = 8000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Sentinel Audit',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true
  });

  // Load the backend server instead of a local file
  // Wait for the python server to boot up before loading
  const loadUrl = `http://127.0.0.1:${API_PORT}`;
  const checkServerAndLoad = () => {
    http.get(loadUrl + '/api/status', (res) => {
      if (res.statusCode === 200) {
        mainWindow.loadURL(loadUrl);
      } else {
        setTimeout(checkServerAndLoad, 500);
      }
    }).on('error', () => {
      setTimeout(checkServerAndLoad, 500);
    });
  };

  checkServerAndLoad();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startPythonBackend() {
  // In production (packaged via electron-builder), the exe is in resources/backend
  // In development, we can run the python script directly or the compiled exe
  
  const isPackaged = app.isPackaged;
  let executablePath;

  if (isPackaged) {
    executablePath = path.join(process.resourcesPath, 'main.exe');
    // Spawn the packaged python executable
    pythonProcess = spawn(executablePath, [], { detached: false });
  } else {
    // In dev mode, run as a module so imports like `backend.scanner` work
    pythonProcess = spawn('python', ['-m', 'backend.main'], { detached: false });
  }

  pythonProcess.stdout.on('data', (data) => console.log(`Backend stdout: ${data}`));
  pythonProcess.stderr.on('data', (data) => console.error(`Backend stderr: ${data}`));
  
  pythonProcess.on('close', (code) => {
    console.log(`Python backend exited with code ${code}`);
  });
}

app.on('ready', () => {
  startPythonBackend();
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  // Kill the python background process when Electron quits
  if (pythonProcess) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', pythonProcess.pid, '/f', '/t']);
    } else {
      pythonProcess.kill('SIGINT');
    }
  }
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
