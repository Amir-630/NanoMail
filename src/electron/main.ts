import { app, BrowserWindow, Menu, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupIpcHandlers } from './ipcHandlers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

/**
 * Create the main application window with proper security configuration
 */
async function createWindow() {
  try {
    // Determine the URL to load
    const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
    const startUrl = isDev
      ? 'http://localhost:5173' // Vite dev server
      : `file://${path.join(__dirname, '../../app/index.html')}`; // Production build

    // Create the browser window with security settings
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      icon: path.join(__dirname, '../../public/icon.png'), // Add your app icon
      webPreferences: {
        // Security: Enable context isolation
        contextIsolation: true,

        // Security: Use preload script to expose safe APIs
        preload: path.join(__dirname, 'preload.js'),

        // Security: Disable node integration
        nodeIntegration: false,

        // Security: Disable remote module
        enableRemoteModule: false,

        // Security: Enable sandbox
        sandbox: true,

        // Performance
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    });

    // Load the app
    await mainWindow.loadURL(startUrl);

    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools({
        mode: 'detach',
      });
    }

    // Handle window closed
    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    // Handle any uncaught exceptions in the renderer
    mainWindow.webContents.on('crashed', () => {
      dialog.showErrorBox(
        'Application Error',
        'The application has encountered an error and must restart.'
      );
      mainWindow?.reload();
    });

    console.log('Main window created successfully');
  } catch (error) {
    console.error('Failed to create window:', error);
    throw error;
  }
}

/**
 * Create application menu with standard actions
 */
function createMenu() {
  const isMac = process.platform === 'darwin';

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    // File menu
    {
      label: isMac ? 'nanoMail' : 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { type: 'separator' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll',
        },
      ],
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          role: 'forceReload',
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'CmdOrCtrl+Shift+I',
          role: 'toggleDevTools',
        },
        { type: 'separator' },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          role: 'zoomIn',
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+Minus',
          role: 'zoomOut',
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          role: 'resetZoom',
        },
      ],
    },

    // Help menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'About nanoMail',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About nanoMail',
              message: 'nanoMail v1.0.0',
              detail: 'A secure desktop email client powered by Electron',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * App ready event - setup when app is ready to start
 */
app.on('ready', async () => {
  try {
    // Setup IPC handlers before creating window
    setupIpcHandlers();

    // Create the main window
    await createWindow();

    // Create application menu
    createMenu();

    console.log('Application ready');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    dialog.showErrorBox('Startup Error', 'Failed to start the application');
    app.quit();
  }
});

/**
 * Window all closed event
 */
app.on('window-all-closed', () => {
  // On macOS, applications stay active until user quits explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Activate event - on macOS, re-create window when dock icon is clicked
 */
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Handle any uncaught exceptions in the main process
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in main process:', error);

  // Show error dialog
  dialog.showErrorBox(
    'Application Error',
    'An unexpected error occurred. Please restart the application.'
  );
});

/**
 * Graceful shutdown
 */
app.on('before-quit', async () => {
  console.log('Shutting down application...');
  // Add any cleanup code here
});

// Enable V8 code caching
app.commandLine.appendSwitch('v8-code-cache-strategies', 'code');

