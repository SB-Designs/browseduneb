// React-based UI for renderer
const React = window.React = require('react');
const ReactDOM = require('react-dom');

function useIpcState(getter, updater, defaultValue = []) {
  // Helper hook to sync state with main process (bookmarks/tabs/settings)
  const [state, setState] = React.useState(defaultValue);
  React.useEffect(() => {
    getter().then(setState);
  }, []);
  const save = (value) => {
    setState(value);
    updater(value);
  };
  return [state, save, setState];
}

function TabsPanel({ tabs, onSwitch, onNew, onClose, onReload, onBookmark, activeIdx }) {
  return (
    <div style={{
      width: 260,
      background: '#23272f',
      color: '#fff',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #111'
    }}>
      <div style={{ padding: 10, borderBottom: '1px solid #333', flexShrink: 0, display: 'flex', gap: 6 }}>
        <button onClick={() => onNew()} title="New Tab" style={{ width: 32, height: 32 }}>+</button>
        <button onClick={onReload} title="Reload Tab" style={{ width: 32, height: 32 }}>⟳</button>
        <button onClick={onBookmark} title="Bookmark" style={{ width: 32, height: 32 }}>★</button>
        <button onClick={() => window.electronAPI.openBookmarks()} style={{ width: 32, height: 32 }}>☰</button>
        <button onClick={() => window.electronAPI.openSettings()} style={{ width: 32, height: 32 }}>⚙</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tabs.map((tab, i) => (
          <div key={i}
            onClick={() => onSwitch(i)}
            style={{
              display: 'flex', alignItems: 'center', padding: 8,
              background: tab.active ? '#1c2027' : 'transparent',
              cursor: 'pointer', borderBottom: '1px solid #111', position: 'relative'
            }}>
            <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span>{tab.title || tab.url}</span>
            </div>
            <button onClick={e => { e.stopPropagation(); onClose(i); }}
              style={{
                marginLeft: 5, background: 'transparent', border: 'none',
                color: '#fff', cursor: 'pointer', fontSize: 16
              }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressBar({ value, onChange, onGo }) {
  const [input, setInput] = React.useState(value);
  React.useEffect(() => setInput(value), [value]);
  return (
    <form style={{ display: 'flex', alignItems: 'center', padding: 6, background: '#eee' }}
      onSubmit={e => { e.preventDefault(); onGo(input); }}>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        style={{ flex: 1, fontSize: 16, padding: 6, borderRadius: 4, border: '1px solid #999' }}
        spellCheck={false}
        autoFocus
      />
      <button type="submit" style={{ marginLeft: 8 }}>Go</button>
    </form>
  );
}

function SettingsPanel({ settings, onSave, onClose }) {
  const [local, setLocal] = React.useState(settings);
  React.useEffect(() => setLocal(settings), [settings]);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 260, right: 0, bottom: 0,
      background: '#fff', zIndex: 100, boxShadow: '0 0 10px #0005', padding: 30
    }}>
      <h2>Settings</h2>
      <label>
        Home page:
        <input
          type="text"
          value={local.home}
          onChange={e => setLocal({ ...local, home: e.target.value })}
          style={{ marginLeft: 8, width: 400, fontSize: 16 }}
        />
      </label>
      <div style={{ marginTop: 20 }}>
        Theme:
        <select
          value={local.theme}
          onChange={e => setLocal({ ...local, theme: e.target.value })}
          style={{ marginLeft: 8, fontSize: 16 }}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div style={{ marginTop: 30 }}>
        <button onClick={() => { onSave(local); onClose(); }}>Save</button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>Cancel</button>
      </div>
    </div>
  );
}

function BookmarksPanel({ bookmarks, onNavigate, onRemove, onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 260, right: 0, bottom: 0,
      background: '#fff', zIndex: 100, boxShadow: '0 0 10px #0005', padding: 30
    }}>
      <h2>Bookmarks</h2>
      <ul>
        {bookmarks.map((bm, i) => (
          <li key={i} style={{ marginBottom: 10 }}>
            <a href="#" onClick={e => { e.preventDefault(); onNavigate(bm.url); }}>{bm.title || bm.url}</a>
            <button style={{ marginLeft: 10 }} onClick={() => onRemove(i)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

function App() {
  const [tabs, setTabs] = React.useState([]);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [address, setAddress] = React.useState('');
  const [settings, saveSettings, setSettings] = useIpcState(
    () => window.electronAPI.getSettings(), (s) => window.electronAPI.saveSettings(s),
    { home: 'https://www.google.com', theme: 'light' }
  );
  const [bookmarks, saveBookmarks, setBookmarks] = useIpcState(
    () => window.electronAPI.getBookmarks(), (b) => window.electronAPI.saveBookmarks(b), []
  );
  const [showSettings, setShowSettings] = React.useState(false);
  const [showBookmarks, setShowBookmarks] = React.useState(false);

  // Listen to tab updates from main
  React.useEffect(() => {
    window.electronAPI.getTabs().then(tabs => {
      setTabs(tabs);
      const idx = tabs.findIndex(t => t.active);
      setActiveIdx(idx >= 0 ? idx : 0);
      setAddress(tabs[idx >= 0 ? idx : 0]?.url || '');
    });
    window.electronAPI.onUpdateTabs((tabs) => {
      setTabs(tabs);
      const idx = tabs.findIndex(t => t.active);
      setActiveIdx(idx >= 0 ? idx : 0);
      setAddress(tabs[idx >= 0 ? idx : 0]?.url || '');
    });
    window.electronAPI.onShowSettings(() => setShowSettings(true));
    window.electronAPI.onShowBookmarks(() => setShowBookmarks(true));
  }, []);

  // Tab actions
  const handleSwitchTab = idx => { setActiveIdx(idx); window.electronAPI.switchTab(idx); };
  const handleNewTab = (url) => {
    const navUrl = url || settings.home || 'https://www.google.com';
    window.electronAPI.newTab(navUrl);
  };
  const handleCloseTab = idx => { window.electronAPI.closeTab(idx); };
  const handleReload = () => window.electronAPI.reloadTab(activeIdx);
  const handleBookmark = () => {
    const tab = tabs[activeIdx];
    if (!tab) return;
    setBookmarks([...bookmarks, { url: tab.url, title: tab.title }]);
    saveBookmarks([...bookmarks, { url: tab.url, title: tab.title }]);
  };
  const handleGo = url => {
    let clean = url.trim();
    if (!/^https?:\/\//.test(clean)) clean = 'https://' + clean;
    window.electronAPI.navigate(activeIdx, clean);
    setAddress(clean);
  };

  // Settings/bookmarks panels
  const handleSettingsSave = (newSettings) => { saveSettings(newSettings); };
  const handleBookmarkNavigate = url => { handleNewTab(url); setShowBookmarks(false); };
  const handleRemoveBookmark = idx => {
    const b = [...bookmarks];
    b.splice(idx, 1);
    setBookmarks(b);
    saveBookmarks(b);
  };

  // Theme
  React.useEffect(() => {
    document.body.style.background = settings.theme === 'dark' ? '#14161a' : '#fafafa';
    document.body.style.color = settings.theme === 'dark' ? '#fff' : '#222';
  }, [settings.theme]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <TabsPanel
        tabs={tabs}
        activeIdx={activeIdx}
        onSwitch={handleSwitchTab}
        onNew={handleNewTab}
        onClose={handleCloseTab}
        onReload={handleReload}
        onBookmark={handleBookmark}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AddressBar value={address} onChange={setAddress} onGo={handleGo} />
        <div style={{ flex: 1 }}></div>
      </div>
      {showSettings &&
        <SettingsPanel settings={settings}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)} />}
      {showBookmarks &&
        <BookmarksPanel bookmarks={bookmarks}
          onNavigate={handleBookmarkNavigate}
          onRemove={handleRemoveBookmark}
          onClose={() => setShowBookmarks(false)} />}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
