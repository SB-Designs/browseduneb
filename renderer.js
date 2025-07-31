const React = window.React = require('react');
const ReactDOM = require('react-dom');

function IconGear({size=24}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{display:'block'}} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 12 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09A1.65 1.65 0 0 0 21 12h.09a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function IconDownload({size=24}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{display:'block'}} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function Sidebar({
  tabs, activeIdx, onSwitch, onNew, onClose, onNavBack, onNavForward,
  address, onAddressChange, onAddressGo, onSettings, onDownload
}) {
  return (
    <div className="sidebar-gradient">
      <div style={{padding: '0 0 0 0', display:'flex', flexDirection:'column', height:'100%'}}>
        <div style={{padding: '32px 0 0 0', alignItems:'center', display:'flex', flexDirection:'column'}}>
          <div style={{fontWeight:'bold', fontSize:36, color:'white', fontFamily:'Montserrat,sans-serif', marginBottom:24, letterSpacing:1}}>
            Duneb
          </div>
          <form onSubmit={e=>{e.preventDefault();onAddressGo(address);}} style={{width:'85%', marginBottom:18}}>
            <input
              className="address-bar"
              style={{width:'100%'}}
              placeholder="Address Bar"
              value={address}
              onChange={e=>onAddressChange(e.target.value)}
              spellCheck={false}
            />
          </form>
        </div>
        <div style={{padding:'0 0 0 0', flex:1, display:'flex', flexDirection:'column'}}>
          <div style={{color:'#fff', fontWeight:'bold', fontSize:20, textAlign:'center', letterSpacing:0.5, marginBottom:4, marginTop:4}}>
            My Tabs
          </div>
          <div className="newtab-btn" onClick={onNew}>New Tab +</div>
          <div style={{display:'flex', justifyContent:'center', gap:16, margin:'16px 0'}}>
            <button className="nav-arrow" tabIndex={-1} onClick={onNavBack} aria-label="Back">{'←'}</button>
            <button className="nav-arrow" tabIndex={-1} onClick={onNavForward} aria-label="Forward">{'→'}</button>
          </div>
          <div style={{flex:1, overflowY:'auto', paddingBottom:10}}>
            {tabs.length === 0 && (
              <div style={{
                color:'#fff', textAlign:'center', opacity:0.7, marginTop:20
              }}>No tabs open</div>
            )}
            {tabs.map((tab, i) => (
              <div
                key={i}
                className="tab-btn"
                style={{
                  background: i===activeIdx ? '#fff' : 'rgba(255,255,255,0.95)',
                  color: i===activeIdx ? '#3d3d3d' : '#3d3d3d',
                  fontWeight: 500,
                }}
              >
                <span onClick={()=>onSwitch(i)} style={{flex:1, cursor:'pointer', minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {tab.title || tab.url || `Tab ${i+1}`}
                </span>
                <button className="tab-close" tabIndex={-1} onClick={()=>onClose(i)} title="Close Tab">x</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 28px 16px 28px'}}>
          <button className="icon-btn" tabIndex={-1} title="Settings" onClick={onSettings}><IconGear/></button>
          <button className="icon-btn" tabIndex={-1} title="Download Bookmarks" onClick={onDownload}><IconDownload/></button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tabs, setTabs] = React.useState([]);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [address, setAddress] = React.useState('');

  React.useEffect(() => {
    // Fetch initial tabs
    window.electronAPI.getTabs().then(tabs => {
      setTabs(tabs);
      const idx = tabs.findIndex(t=>t.active);
      setActiveIdx(idx>=0?idx:0);
      setAddress(tabs[idx>=0?idx:0]?.url || '');
    });
    // Listen for tab updates
    window.electronAPI.onUpdateTabs(tabs => {
      setTabs(tabs);
      const idx = tabs.findIndex(t=>t.active);
      setActiveIdx(idx>=0?idx:0);
      setAddress(tabs[idx>=0?idx:0]?.url || '');
    });
  }, []);

  // Tab actions
  const handleSwitchTab = i => { setActiveIdx(i); window.electronAPI.switchTab(i); };
  const handleNewTab = () => window.electronAPI.newTab('https://www.google.com');
  const handleCloseTab = i => window.electronAPI.closeTab(i);
  const handleNavBack = () => window.electronAPI.navigate(activeIdx, 'back');
  const handleNavForward = () => window.electronAPI.navigate(activeIdx, 'forward');
  const handleSettings = () => window.electronAPI.openSettings();
  const handleDownload = () => window.electronAPI.openBookmarks();
  const handleAddressGo = url => {
    let clean = url.trim();
    if (!/^https?:\/\//.test(clean)) clean = 'https://' + clean;
    window.electronAPI.navigate(activeIdx, clean);
    setAddress(clean);
  };

  return (
    <div style={{display:'flex', height:'100vh'}}>
      <Sidebar
        tabs={tabs}
        activeIdx={activeIdx}
        onSwitch={handleSwitchTab}
        onNew={handleNewTab}
        onClose={handleCloseTab}
        onNavBack={handleNavBack}
        onNavForward={handleNavForward}
        address={address}
        onAddressChange={setAddress}
        onAddressGo={handleAddressGo}
        onSettings={handleSettings}
        onDownload={handleDownload}
      />
      <div className="main-view">
        {/* The BrowserView will overlay here via Electron */}
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
