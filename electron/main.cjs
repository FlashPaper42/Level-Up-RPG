const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');

let mainWindow;

// Get the directory where the exe is located (or app directory in dev)
function getDataDirectory() {
  if (app.isPackaged) {
    // In production, use the directory where the exe is located
    return path.dirname(process.execPath);
  } else {
    // In development, use the project root
    return path.join(__dirname, '..');
  }
}

// Get the profile data directory (creates it if it doesn't exist)
async function getProfileDataDirectory() {
  const baseDir = getDataDirectory();
  const dataDir = path.join(baseDir, 'LevelUp_RPG_Data');
  
  // Create directory if it doesn't exist
  if (!existsSync(dataDir)) {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  return dataDir;
}

function createWindow() {
  // Create the browser window with appropriate size for the game
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
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

// IPC handler for fullscreen toggle
ipcMain.handle('toggle-fullscreen', async () => {
  if (mainWindow) {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
    return !isFullScreen; // Return new fullscreen state
  }
  return false;
});

// IPC handlers for file operations
ipcMain.handle('save-profile-data', async (event, profileId, data) => {
  try {
    const dataDir = await getProfileDataDirectory();
    const filename = `profile_${profileId}.json`;
    const filepath = path.join(dataDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving profile data:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-profile-data', async (event, profileId) => {
  try {
    const dataDir = await getProfileDataDirectory();
    const filename = `profile_${profileId}.json`;
    const filepath = path.join(dataDir, filename);
    
    if (!existsSync(filepath)) {
      return { success: true, data: null };
    }
    
    const content = await fs.readFile(filepath, 'utf8');
    const data = JSON.parse(content);
    return { success: true, data };
  } catch (error) {
    console.error('Error loading profile data:', error);
    return { success: false, error: error.message, data: null };
  }
});

ipcMain.handle('save-profile-settings', async (event, data) => {
  try {
    const dataDir = await getProfileDataDirectory();
    const filename = 'profile_settings.json';
    const filepath = path.join(dataDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving profile settings:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-profile-settings', async (event) => {
  try {
    const dataDir = await getProfileDataDirectory();
    const filename = 'profile_settings.json';
    const filepath = path.join(dataDir, filename);
    
    if (!existsSync(filepath)) {
      return { success: true, data: null };
    }
    
    const content = await fs.readFile(filepath, 'utf8');
    const data = JSON.parse(content);
    return { success: true, data };
  } catch (error) {
    console.error('Error loading profile settings:', error);
    return { success: false, error: error.message, data: null };
  }
});

ipcMain.handle('get-data-directory', async () => {
  try {
    const dataDir = await getProfileDataDirectory();
    return { success: true, path: dataDir };
  } catch (error) {
    console.error('Error getting data directory:', error);
    return { success: false, error: error.message };
  }
});

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
