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

    // Set hidden attribute on Windows so kids don't mess with it
    if (process.platform === 'win32') {
      try {
        const { exec } = require('child_process');
        exec(`attrib +h "${dataDir}"`, (error) => {
          if (error) console.log('[Electron] Could not hide data folder:', error.message);
        });
      } catch (e) {
        // Silently fail - hiding is not critical
      }
    }
  }

  return dataDir;
}

function createWindow() {
  // DESIGN RESOLUTION - This is the resolution the app is designed for
  // The app will render at this resolution and be scaled to fit any screen
  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 1080;

  // Get the primary display's work area (screen size minus taskbar)
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  const scaleFactor = primaryDisplay.scaleFactor; // For high-DPI screens

  // Calculate the zoom factor needed to fit the design resolution to this screen
  // Account for device pixel ratio on high-DPI displays
  const effectiveWidth = screenWidth;
  const effectiveHeight = screenHeight;

  const scaleX = effectiveWidth / DESIGN_WIDTH;
  const scaleY = effectiveHeight / DESIGN_HEIGHT;
  const zoomFactor = Math.min(scaleX, scaleY);

  console.log(`[Electron] Screen: ${screenWidth}x${screenHeight}, Scale Factor: ${scaleFactor}`);
  console.log(`[Electron] Design: ${DESIGN_WIDTH}x${DESIGN_HEIGHT}, Zoom: ${zoomFactor.toFixed(3)}`);

  // Create window at DESIGN resolution (will be zoomed to fit)
  mainWindow = new BrowserWindow({
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    minWidth: 1024,
    minHeight: 576, // 16:9 aspect ratio minimum
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      // Force consistent zoom level
      zoomFactor: zoomFactor
    },
    // Remove menu bar for cleaner experience
    autoHideMenuBar: true,
    // Don't show until we've set up zoom
    show: false,
    // Use content size so width/height refer to web page, not window chrome
    useContentSize: true,
  });

  // Set zoom factor and maximize when ready
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(zoomFactor);
  });

  // Show window maximized when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Maintain zoom factor when window is resized
  mainWindow.on('resize', () => {
    const [newWidth, newHeight] = mainWindow.getContentSize();
    // Skip if window is minimized (size is 0)
    if (newWidth <= 0 || newHeight <= 0) return;

    const newScaleX = newWidth / DESIGN_WIDTH;
    const newScaleY = newHeight / DESIGN_HEIGHT;
    const newZoom = Math.min(newScaleX, newScaleY);

    // Zoom factor must be greater than 0
    if (newZoom > 0) {
      mainWindow.webContents.setZoomFactor(newZoom);
    }
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
