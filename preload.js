const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, options) => ipcRenderer.invoke('show-notification', title, options),
  modeSelected: (mode) => ipcRenderer.send('mode-selected', mode)
});

window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hostname === 'www.instagram.com') {
    const currentUA = navigator.userAgent;
    const isMobileMode = currentUA.includes('iPhone');
    
    if (isMobileMode) {
      Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      });
      
      if (window.screen && window.screen.orientation) {
        Object.defineProperty(window.screen.orientation, 'type', { get: () => 'portrait-primary' });
      }
      if (window.screen && !window.screen.orientation) {
        window.screen.orientation = { type: 'portrait-primary' };
      }
      if (window.orientation !== 0) {
        try { Object.defineProperty(window, 'orientation', { get: () => 0 }); } catch (e) {}
      }
    } else {
      Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
      });
      
      if (window.screen && window.screen.orientation) {
        Object.defineProperty(window.screen.orientation, 'type', { get: () => 'landscape-primary' });
      }
      if (window.screen && !window.screen.orientation) {
        window.screen.orientation = { type: 'landscape-primary' };
      }
      if (window.orientation !== 90) {
        try { Object.defineProperty(window, 'orientation', { get: () => 90 }); } catch (e) {}
      }
    }
  }
  
  const OriginalNotification = window.Notification;
  
  if (OriginalNotification) {
    window.Notification = function(title, options = {}) {
      if (window.electronAPI && window.electronAPI.showNotification) {
        window.electronAPI.showNotification(title, options);
      }
      
      const dummyNotification = {
        title: title,
        body: options.body || '',
        icon: options.icon || '',
        tag: options.tag || '',
        close: () => {},
        addEventListener: () => {},
        removeEventListener: () => {}
      };
      
      return dummyNotification;
    };
    
    window.Notification.permission = 'granted';
    window.Notification.requestPermission = function() {
      return Promise.resolve('granted');
    };
  }
});