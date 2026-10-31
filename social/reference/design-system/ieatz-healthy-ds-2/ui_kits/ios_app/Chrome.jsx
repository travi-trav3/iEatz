// Chrome.jsx — iOS chrome elements: status bar, tab bar.

function IOSStatus({ dark }) {
  return (
    <div className="ios-status" style={dark ? { color:"#fff" } : null}>
      <div>9:41</div>
      <div className="icons">
        <I.Signal style={{ width:18, height:12 }}/>
        <I.Wifi style={{ width:18, height:14 }}/>
        <I.Battery style={{ width:26, height:14 }}/>
      </div>
    </div>
  );
}

function IOSHomeIndicator() { return <div className="ios-home"/>; }

function IOSTabBar({ active = "home", onChange }) {
  const tab = (key, Icon, label) => (
    <div className={"ios-tab " + (active === key ? "on" : "")} onClick={() => onChange?.(key)}>
      <Icon/><span>{label}</span>
    </div>
  );
  return (
    <>
      <div className="ios-tabbar">
        {tab("home", I.Home, "Home")}
        {tab("fav", I.Heart, "Favorites")}
        <div style={{ width:56 }}></div>
        {tab("inv", I.Fridge, "Inventory")}
        {tab("prof", I.Profile, "Profile")}
      </div>
      <button className="ios-fab"><I.Plus/></button>
    </>
  );
}

Object.assign(window, { IOSStatus, IOSHomeIndicator, IOSTabBar });
