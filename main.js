const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Data persistence
const DATA_DIR = app.getPath('userData');
const BOOKMARKS_FILE = path.join(DATA_DIR, 'bookmarks.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const TABS_FILE = path.join(DATA_DIR, 'tabs.json');

function safeReadJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file));
  } catch {
    return fallback;
  }
}
function safeWriteJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Keep track of BrowserViews (tabs)
let mainWindow;
let browserViews = [];
let tabMeta = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('renderer.html');

  // Restore tabs
  tabMeta = safeReadJSON(TABS_FILE, []);
  if (tabMeta.length === 0) tabMeta = [{ url: 'https://www.google.com', title: 'Google' }];

  for (const tab of tabMeta) {
    browserViews.push(new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    }));
  }
  // Load URLs in BrowserViews
  browserViews.forEach((view, i) => {
    view.webContents.loadURL(tabMeta[i].url);
    view.webContents.on('page-title-updated', (e, title) => {
      tabMeta[i].title = title;
      saveTabs();
      sendTabs();
    });
    view.webContents.on('did-navigate', (e, url) => {
      tabMeta[i].url = url;
      saveTabs();
      sendTabs();
    });
  });

  // Attach first tab
  if (browserViews.length > 0) {
    mainWindow.setBrowserView(browserViews[0]);
    resizeBrowserView();
  }

  mainWindow.on('resize', resizeBrowserView);
}

function resizeBrowserView() {
  if (!mainWindow || browserViews.length === 0) return;
  const [w, h] = mainWindow.getContentSize();
  // Leave 260px for vertical tabs/settings
  browserViews.forEach((view, i) => {
    view.setBounds({ x: 260, y: 0, width: w - 260, height: h });
    view.setAutoResize({ width: true, height: true });
  });
}

function sendTabs() {
  if (!mainWindow) return;
  mainWindow.webContents.send('update-tabs', tabMeta.map((tab, i) => ({
    ...tab, active: browserViews[i] === mainWindow.getBrowserView()
  })));
}
function saveTabs() {
  safeWriteJSON(TABS_FILE, tabMeta);
}

// IPC: Renderer <-> Main
ipcMain.handle('get-bookmarks', () => safeReadJSON(BOOKMARKS_FILE, []));
ipcMain.handle('save-bookmarks', (_, bookmarks) => { safeWriteJSON(BOOKMARKS_FILE, bookmarks); });

ipcMain.handle('get-settings', () => safeReadJSON(SETTINGS_FILE, { home: 'https://www.google.com', theme: 'light' }));
ipcMain.handle('save-settings', (_, settings) => { safeWriteJSON(SETTINGS_FILE, settings); });

ipcMain.handle('get-tabs', () => tabMeta.map((tab, i) => ({ ...tab, active: browserViews[i] === mainWindow.getBrowserView() })));

ipcMain.on('switch-tab', (_, index) => {
  if (browserViews[index]) {
    mainWindow.setBrowserView(browserViews[index]);
    resizeBrowserView();
    sendTabs();
  }
});
ipcMain.on('new-tab', (_, url) => {
  const bv = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  browserViews.push(bv);
  tabMeta.push({ url, title: 'New Tab' });
  bv.webContents.loadURL(url);
  bv.webContents.on('page-title-updated', (e, title) => {
    tabMeta[browserViews.length - 1].title = title;
    saveTabs();
    sendTabs();
  });
  bv.webContents.on('did-navigate', (e, navUrl) => {
    tabMeta[browserViews.length - 1].url = navUrl;
    saveTabs();
    sendTabs();
  });
  mainWindow.setBrowserView(bv);
  resizeBrowserView();
  sendTabs();
  saveTabs();
});
ipcMain.on('close-tab', (_, index) => {
  if (browserViews[index]) {
    browserViews[index].destroy();
    browserViews.splice(index, 1);
    tabMeta.splice(index, 1);
    saveTabs();
    // Switch to last tab
    if (browserViews.length > 0) {
      mainWindow.setBrowserView(browserViews[Math.min(index, browserViews.length - 1)]);
      resizeBrowserView();
    } else {
      // Always have at least one tab
      mainWindow.setBrowserView(null);
    }
    sendTabs();
  }
});
ipcMain.on('navigate', (_, { index, url }) => {
  if (browserViews[index]) {
    browserViews[index].webContents.loadURL(url);
  }
});
ipcMain.on('reload-tab', (_, index) => {
  if (browserViews[index]) {
    browserViews[index].webContents.reload();
  }
});
ipcMain.on('open-settings', () => {
  mainWindow.webContents.send('show-settings');
});
ipcMain.on('open-bookmarks', () => {
  mainWindow.webContents.send('show-bookmarks');
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
