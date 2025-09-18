// Preload script for LunaGram (Instagram Electron wrapper)
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, options) => ipcRenderer.invoke('show-notification', title, options),
  modeSelected: (mode) => ipcRenderer.send('mode-selected', mode)
});

// Minimal preload for LunaGram: spoof user agent, orientation, and handle notifications
window.addEventListener('DOMContentLoaded', () => {
  // Check current URL to determine if we're on Instagram
  if (window.location.hostname === 'www.instagram.com') {
    // Get the current user agent to determine mode
    const currentUA = navigator.userAgent;
    const isMobileMode = currentUA.includes('iPhone');
    
    if (isMobileMode) {
      // Mobile mode configuration for stories
      Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      });
      
      // Mobile orientation
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
      // Desktop mode configuration for posts
      Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
      });
      
      // Desktop orientation
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
  
  // Override web notifications to use native notifications
  const OriginalNotification = window.Notification;
  
  if (OriginalNotification) {
    window.Notification = function(title, options = {}) {
      // Send to main process for native notification
      if (window.electronAPI && window.electronAPI.showNotification) {
        window.electronAPI.showNotification(title, options);
      }
      
      // Create a dummy notification object for compatibility
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
    
    // Copy static properties
    window.Notification.permission = 'granted';
    window.Notification.requestPermission = function() {
      return Promise.resolve('granted');
    };
  }
});
