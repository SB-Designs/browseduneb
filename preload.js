const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  saveBookmarks: (bookmarks) => ipcRenderer.invoke('save-bookmarks', bookmarks),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getTabs: () => ipcRenderer.invoke('get-tabs'),
  switchTab: (index) => ipcRenderer.send('switch-tab', index),
  newTab: (url) => ipcRenderer.send('new-tab', url),
  closeTab: (index) => ipcRenderer.send('close-tab', index),
  navigate: (index, url) => ipcRenderer.send('navigate', { index, url }),
  reloadTab: (index) => ipcRenderer.send('reload-tab', index),
  openSettings: () => ipcRenderer.send('open-settings'),
  openBookmarks: () => ipcRenderer.send('open-bookmarks'),

  // Listen to updates
  onUpdateTabs: (cb) => ipcRenderer.on('update-tabs', (_, tabs) => cb(tabs)),
  onShowSettings: (cb) => ipcRenderer.on('show-settings', cb),
  onShowBookmarks: (cb) => ipcRenderer.on('show-bookmarks', cb),
});
