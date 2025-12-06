const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Create the browser window with appropriate size for the game
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Remove menu bar for cleaner experience
    autoHideMenuBar: true,
  });

  // Load the built game
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  // Prevent opening developer tools in production for a cleaner experience
  if (app.isPackaged) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Block F12 and common devtools shortcuts
      if (input.key === 'F12' || 
          (input.control && input.shift && input.key === 'I') ||
          (input.control && input.shift && input.key === 'C')) {
        event.preventDefault();
      }
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed (Windows & Linux behavior)
app.on('window-all-closed', () => {
  // On macOS, apps typically stay active until user quits explicitly
  // But for a game meant for children, it's better to quit immediately
  app.quit();
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked and no windows exist
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
