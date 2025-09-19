const { app, BrowserWindow, shell, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
let mainWindow;
let deeplinkUrl = null;

if (!app.isDefaultProtocolClient('lunagram')) {
  app.setAsDefaultProtocolClient('lunagram');
}

function createWindow() {
  const userDataPath = path.join(app.getPath('appData'), 'LunaGram');
  app.setPath('userData', userDataPath);

  const win = new BrowserWindow({
    width: 414,
    height: 896,
    titleBarStyle: 'default',
    title: 'LunaGram',
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      webgl: false,
      plugins: false,
      notifications: true
    },
    show: false,
    icon: path.join(__dirname, 'icon.png')
  });

  win.loadFile('splash.html');

  win.webContents.once('did-finish-load', () => {
    win.show();
  });

  let selectedMode = null;

  ipcMain.on('mode-selected', (event, mode) => {
    selectedMode = mode;
    loadInstagram(selectedMode);
  });

  function loadInstagram(mode) {
    win.webContents.executeJavaScript(`
      try {
        if (window.completeLoading) {
          window.completeLoading();
        }
      } catch (error) {
        console.log('Loading completion script error:', error);
      }
    `).catch(err => {
      console.log('Failed to execute loading completion script:', err);
    });
    
    setTimeout(() => {
      const userAgents = {
        mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        desktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
      };
      
      win.loadURL('https://www.instagram.com', {
        userAgent: userAgents[mode] || userAgents.desktop
      });
    }, 200);
  }

  setTimeout(() => {
    if (!selectedMode) {
      win.webContents.executeJavaScript(`
        if (!selectedMode) {
          selectMode('desktop');
        }
      `).catch(() => {
        loadInstagram('desktop');
      });
    }
  }, 10000);

  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      if ('Notification' in window) {
        Notification.requestPermission();
      }
    `);
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow = win;
  if (deeplinkUrl) {
    handleDeeplink(deeplinkUrl);
  }

  win.webContents.on('did-attach-webview', (event, webContents) => {
    webContents.on('ipc-message', (event2, channel, data) => {
      if (channel === 'show-context-menu') {
        const menu = Menu.buildFromTemplate([
          {
            label: 'Download Media',
            click: () => {
              webContents.send('download-media', data);
            }
          }
        ]);
        menu.popup({ window: win });
      } else if (channel === 'show-download-location') {
        const downloadPath = app.getPath('downloads');
        dialog.showMessageBox(win, {
          type: 'info',
          message: `Post media saved to:`,
          detail: downloadPath,
          buttons: ['OK']
        });
      }
    });
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function handleDeeplink(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'lunagram:') {
      const igPath = parsed.pathname + parsed.search;
      const igUrl = 'https://www.instagram.com' + igPath;
      if (mainWindow) {
        mainWindow.loadURL(igUrl);
      }
    }
  } catch (e) {}
}

ipcMain.handle('show-notification', async (event, title, options = {}) => {
  try {
    const { Notification } = require('electron');
    
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: title,
        body: options.body || '',
        icon: options.icon ? options.icon : path.join(__dirname, 'icon.png'),
        sound: options.silent !== true
      });
      
      notification.show();
      
      notification.on('click', () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.focus();
          mainWindow.show();
        }
      });
      
      return { success: true };
    } else {
      return { success: false, message: 'Notifications not supported' };
    }
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false, message: error.message };
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  deeplinkUrl = url;
  if (mainWindow) {
    handleDeeplink(url);
  } else {
    if (app.isReady()) {
      createWindow();
    } else {
      app.once('ready', createWindow);
    }
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});