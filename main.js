const { app, BrowserWindow, shell, Menu, dialog, session, ipcMain } = require('electron');
const path = require('path');
let mainWindow;
let deeplinkUrl = null;
const fs = require('fs');
const https = require('https');

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
      notifications: true // Enable notifications
    },
    show: false,
    icon: path.join(__dirname, 'icon.png')
  });

  // Show splash screen first
  const iconPath = 'file://' + path.join(__dirname, 'icon.png');
  win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <html><head><title>LunaGram</title>
    <link href="https://fonts.googleapis.com/css?family=Inter:400,600&display=swap" rel="stylesheet">
            <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          
          :root {
            --gradient-background-start: rgb(108, 0, 162);
            --gradient-background-end: rgb(0, 17, 82);
            --first-color: 18, 113, 255;
            --second-color: 221, 74, 255;
            --third-color: 100, 220, 255;
            --fourth-color: 200, 50, 50;
            --fifth-color: 180, 180, 50;
            --size: 80%;
            --blending-value: hard-light;
          }
          
          body {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(40deg, var(--gradient-background-start), var(--gradient-background-end));
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Display', system-ui, sans-serif;
            color: white;
            overflow: hidden;
            position: relative;
          }
          
          .gradients-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            filter: blur(40px);
            z-index: 1;
          }
          
          .gradient-orb {
            position: absolute;
            width: var(--size);
            height: var(--size);
            top: calc(50% - var(--size) / 2);
            left: calc(50% - var(--size) / 2);
            mix-blend-mode: var(--blending-value);
            border-radius: 50%;
          }
          
          .gradient-orb:nth-child(1) {
            background: radial-gradient(circle at center, rgba(var(--first-color), 1) 0%, rgba(var(--first-color), 0) 50%);
            animation: moveVertical 30s ease infinite;
            opacity: 1;
          }
          
          .gradient-orb:nth-child(2) {
            background: radial-gradient(circle at center, rgba(var(--second-color), 0.8) 0%, rgba(var(--second-color), 0) 50%);
            animation: moveInCircle 20s reverse infinite;
            transform-origin: calc(50% - 400px);
            opacity: 1;
          }
          
          .gradient-orb:nth-child(3) {
            background: radial-gradient(circle at center, rgba(var(--third-color), 0.8) 0%, rgba(var(--third-color), 0) 50%);
            animation: moveInCircle 40s linear infinite;
            transform-origin: calc(50% + 400px);
            opacity: 1;
          }
          
          .gradient-orb:nth-child(4) {
            background: radial-gradient(circle at center, rgba(var(--fourth-color), 0.8) 0%, rgba(var(--fourth-color), 0) 50%);
            animation: moveHorizontal 40s ease infinite;
            transform-origin: calc(50% - 200px);
            opacity: 0.7;
          }
          
          .gradient-orb:nth-child(5) {
            background: radial-gradient(circle at center, rgba(var(--fifth-color), 0.8) 0%, rgba(var(--fifth-color), 0) 50%);
            animation: moveInCircle 20s ease infinite;
            transform-origin: calc(50% - 800px) calc(50% + 800px);
            opacity: 1;
          }
          
          @keyframes moveHorizontal {
            0% { transform: translateX(-50%) translateY(-10%); }
            50% { transform: translateX(50%) translateY(10%); }
            100% { transform: translateX(-50%) translateY(-10%); }
          }
          
          @keyframes moveInCircle {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(180deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes moveVertical {
            0% { transform: translateY(-50%); }
            50% { transform: translateY(50%); }
            100% { transform: translateY(-50%); }
          }
          
          .content {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .app-name {
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -1px;
            animation: fadeInUp 0.8s ease-out;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Display', system-ui, sans-serif;
          }
          
          .tagline {
            font-size: 18px;
            font-weight: 500;
            opacity: 0.85;
            margin-bottom: 50px;
            text-align: center;
            animation: fadeInUp 1s ease-out;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Display', system-ui, sans-serif;
            letter-spacing: 0.5px;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .progress-container {
            width: 300px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 30px;
            animation: fadeInUp 1.2s ease-out;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: none;
          }
          
          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #ffffff, #f0f0f0, #ffffff);
            background-size: 200% 100%;
            border-radius: 2px;
            width: 0%;
            transition: width 0.3s ease;
            animation: shimmer 2s linear infinite;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .mode-selection {
            display: flex;
            gap: 30px;
            margin-top: 20px;
            animation: fadeInUp 1.4s ease-out;
          }
          
          .mode-button {
            position: relative;
            width: 90px;
            height: 90px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            color: white;
            font-size: 36px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(20px);
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            user-select: none;
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.1);
          }
          
          .mode-button:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
          }
          
          .mode-button:active {
            background: rgba(255, 255, 255, 0.25);
          }
        </style></head><body>
        <div class="gradients-container">
          <div class="gradient-orb"></div>
          <div class="gradient-orb"></div>
          <div class="gradient-orb"></div>
          <div class="gradient-orb"></div>
          <div class="gradient-orb"></div>
        </div>
        
        <div class="content">
          <div class="app-name">LunaGram</div>
          <div class="tagline">by Kaushik S</div>
          
          <div class="mode-selection">
            <div class="mode-button" onclick="selectMode('mobile')">
              📱
            </div>
            <div class="mode-button" onclick="selectMode('desktop')">
              💻
            </div>
          </div>
          
          <div class="progress-container" id="progressContainer">
            <div class="progress-bar" id="progressBar"></div>
          </div>
        </div>
      <script>
        let progress = 0;
        let selectedMode = null;
        const progressBar = document.getElementById('progressBar');
        const progressContainer = document.getElementById('progressContainer');
        let updateProgress = null;
        let startTime = null;
        const minLoadingTime = 5000; // 5 seconds minimum
        
        window.selectMode = function(mode) {
          selectedMode = mode;
          startTime = Date.now();
          
          // Hide mode selection and show progress
          document.querySelector('.mode-selection').style.display = 'none';
          progressContainer.style.display = 'block';
          
          // Start loading animation
          updateProgress = setInterval(() => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed < minLoadingTime) {
              // First 5 seconds: smooth progress to 90%
              const targetProgress = (elapsed / minLoadingTime) * 90;
              if (progress < targetProgress) {
                progress += Math.random() * 4 + 2;
                if (progress > targetProgress) progress = targetProgress;
              }
            } else {
              // After 5 seconds: slow progress if still loading
              if (progress < 95) {
                progress += Math.random() * 1 + 0.5;
                if (progress > 95) progress = 95;
              }
            }
            
            progressBar.style.width = progress + '%';
          }, 200);
          
          // Notify Electron about the selected mode
          if (window.electronAPI && window.electronAPI.modeSelected) {
            window.electronAPI.modeSelected(mode);
          }
        };
        
        // Function to complete loading (called from main process)
        window.completeLoading = function() {
          if (updateProgress) {
            clearInterval(updateProgress);
            progress = 100;
            progressBar.style.width = '100%';
          }
        };
      </script>
    </body></html>
  `));

  // Show the window after splash loads
  win.webContents.once('did-finish-load', () => {
    win.show();
  });

  let selectedMode = null;

  // Handle mode selection from splash screen
  ipcMain.on('mode-selected', (event, mode) => {
    selectedMode = mode;
    loadInstagram(selectedMode);
  });

  function loadInstagram(mode) {
    // Wait for minimum loading time before proceeding
    setTimeout(() => {
      // Complete the progress bar with error handling
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
      
      // Load Instagram after progress completes
      setTimeout(() => {
        const userAgents = {
          mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          desktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
        };
        
        win.loadURL('https://www.instagram.com', {
          userAgent: userAgents[mode] || userAgents.desktop
        });
      }, 500);
    }, 5000); // Minimum 5 seconds
  }

  // Fallback: Auto-load desktop mode after 15 seconds if no selection
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
  }, 15000);

  // All further Instagram-specific JS/CSS injection and UA spoofing is now handled in the webview via preload.js
  
  // Handle notification permissions and display
  win.webContents.on('did-finish-load', () => {
    // Request notification permissions
    win.webContents.executeJavaScript(`
      if ('Notification' in window) {
        Notification.requestPermission();
      }
    `);
  });

  // Intercept web notifications and show native notifications
  win.webContents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });

  // Handle notification creation from the web page
  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow = win;
  if (deeplinkUrl) {
    handleDeeplink(deeplinkUrl);
  }

  // All further Instagram-specific JS/CSS injection and UA spoofing is now handled in the webview via preload.js

  // Listen for context menu events from webview
  win.webContents.on('did-attach-webview', (event, webContents) => {
    webContents.on('ipc-message', (event2, channel, data) => {
      if (channel === 'show-context-menu') {
        // Show custom context menu for media
        const menu = Menu.buildFromTemplate([
          {
            label: 'Download Media',
            click: () => {
              // Send IPC back to webview to trigger download
              webContents.send('download-media', data);
            }
          }
        ]);
        menu.popup({ window: win });
      } else if (channel === 'show-download-location') {
        // Show dialog with download folder location
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

// IPC handler for native notifications
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
      
      // Handle notification click
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
    // Only create window if app is ready
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