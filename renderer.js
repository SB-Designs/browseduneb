<style>
  .sidebar-gradient {
    width: 270px;
    height: 100vh;
    background: linear-gradient(160deg, #ff4436 0%, #ff9700 100%);
    border-radius: 30px 0 30px 0;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 16px 0 rgba(0,0,0,0.07);
    margin: 12px 0 12px 12px;
    position: relative;
    z-index: 1;
  }
  .address-bar {
    border: none;
    border-radius: 20px;
    background: #fff;
    height: 38px;
    font-size: 1.1em;
    padding: 0 18px;
    outline: none;
    font-family: inherit;
    box-shadow: 0 2px 6px 0 rgba(0,0,0,0.04);
    margin-bottom: 12px;
  }
  .newtab-btn {
    width: 85%;
    margin: 0 auto 12px auto;
    padding: 10px 0;
    background: rgba(255,255,255,0.2);
    border-radius: 18px;
    color: #fff;
    font-weight: 600;
    font-size: 1em;
    text-align: center;
    cursor: pointer;
    transition: background 0.2s;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
  }
  .newtab-btn:hover {
    background: rgba(255,255,255,0.32);
  }
  .nav-arrow {
    background: #fff;
    color: #ff4436;
    font-size: 2rem;
    border: none;
    width: 48px;
    height: 38px;
    border-radius: 12px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,0.08);
    transition: background 0.15s;
  }
  .nav-arrow:hover {
    background: #ffe1d5;
  }
  .tab-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 20px;
    margin: 10px auto;
    padding: 0 8px 0 22px;
    width: 85%;
    min-height: 44px;
    font-size: 1.1em;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.05);
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
  }
  .tab-btn:not(:last-child) {
    margin-bottom: 0px;
  }
  .tab-btn:hover {
    background: #ffe0c8 !important;
  }
  .tab-close {
    background: none;
    color: #ff4436;
    border: none;
    font-size: 1.3em;
    border-radius: 50%;
    width: 30px; height: 30px;
    cursor: pointer;
    margin-left: 8px;
    transition: background 0.13s;
    align-self: center;
  }
  .tab-close:hover {
    background: #ffd1c1;
  }
  .icon-btn {
    background: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    padding: 6px;
    transition: background 0.16s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon-btn:hover {
    background: rgba(255,255,255,0.23);
  }
  .main-view {
    flex: 1;
    margin: 12px 12px 12px 0;
    background: #fff;
    border-radius: 0 30px 30px 0;
    box-shadow: 0 1.5px 20px 0 rgba(0,0,0,0.08);
    overflow: hidden;
    min-width:0;
    display: flex;
    flex-direction: column;
    position: relative;
  }
</style>
