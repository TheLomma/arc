import { useState, useEffect, useCallback, useRef } from "react";

const CONDITION_META = {
  "Close Scrutiny":       { icon: "🔍", color: "#f97316", desc: "Erhöhte Feindaktivität" },
  "Hidden Bunker":        { icon: "🏚️", color: "#8b5cf6", desc: "Geheimer Bunker zugänglich" },
  "Lush Blooms":          { icon: "🌸", color: "#ec4899", desc: "Reichhaltige Ressourcen" },
  "Electromagnetic Storm":{ icon: "⚡", color: "#facc15", desc: "Elektronik gestört" },
  "Harvester":            { icon: "🤖", color: "#ef4444", desc: "Harvester aktiv" },
  "Bird City":            { icon: "🦅", color: "#06b6d4", desc: "Vogelschwärme aktiv" },
  "Matriarch":            { icon: "👑", color: "#a855f7", desc: "Boss-Spawns erhöht" },
  "Night Raid":           { icon: "🌙", color: "#3b82f6", desc: "Nachtmission" },
  "Hurricane":            { icon: "🌀", color: "#60a5fa", desc: "Sturmbedingungen" },
  "Launch Tower Loot":    { icon: "🚀", color: "#22c55e", desc: "Bonus-Loot am Turm" },
  "Prospecting Probes":   { icon: "🔭", color: "#f59e0b", desc: "Sonden aktiv" },
  "Locked Gate":          { icon: "🔒", color: "#9ca3af", desc: "Tor gesperrt" },
};

const MAP_COLORS = {
  "Dam Battlegrounds":  "#ef4444",
  "Spaceport":          "#8b5cf6",
  "The Blue Gate":      "#3b82f6",
  "Buried City":        "#f97316",
  "Stella Montis":      "#22c55e",
};

const SCRAPED_DATA = {
  fetchedAt: new Date().toISOString(),
  active: [
    { condition: "Close Scrutiny",  map: "Dam Battlegrounds", timeRange: "11:00 – 12:00", date: "19. Apr." },
    { condition: "Hidden Bunker",   map: "Spaceport",         timeRange: "11:00 – 12:00", date: "19. Apr." },
    { condition: "Lush Blooms",     map: "The Blue Gate",     timeRange: "11:00 – 12:00", date: "19. Apr." },
  ],
  upcoming: [
    { condition: "Close Scrutiny",        map: "Spaceport",         timeRange: "12:00 – 13:00", date: "19. Apr.", countdownH: 0,  countdownM: 25 },
    { condition: "Electromagnetic Storm", map: "The Blue Gate",     timeRange: "12:00 – 13:00", date: "19. Apr.", countdownH: 0,  countdownM: 25 },
    { condition: "Harvester",             map: "Spaceport",         timeRange: "12:00 – 13:00", date: "19. Apr.", countdownH: 0,  countdownM: 25 },
    { condition: "Bird City",             map: "Buried City",       timeRange: "13:00 – 14:00", date: "19. Apr.", countdownH: 1,  countdownM: 25 },
    { condition: "Matriarch",             map: "Dam Battlegrounds", timeRange: "13:00 – 14:00", date: "19. Apr.", countdownH: 1,  countdownM: 25 },
    { condition: "Night Raid",            map: "Dam Battlegrounds", timeRange: "13:00 – 14:00", date: "19. Apr.", countdownH: 1,  countdownM: 25 },
    { condition: "Hurricane",             map: "Buried City",       timeRange: "14:00 – 15:00", date: "19. Apr.", countdownH: 2,  countdownM: 25 },
    { condition: "Lush Blooms",           map: "Buried City",       timeRange: "16:00 – 17:00", date: "19. Apr.", countdownH: 4,  countdownM: 25 },
    { condition: "Launch Tower Loot",     map: "Spaceport",         timeRange: "21:00 – 22:00", date: "19. Apr.", countdownH: 9,  countdownM: 25 },
    { condition: "Prospecting Probes",    map: "Buried City",       timeRange: "1:00 – 2:00",   date: "20. Apr.", countdownH: 13, countdownM: 25 },
    { condition: "Hidden Bunker",         map: "Spaceport",         timeRange: "8:00 – 9:00",   date: "20. Apr.", countdownH: 20, countdownM: 25 },
    { condition: "Locked Gate",           map: "The Blue Gate",     timeRange: "9:00 – 10:00",  date: "20. Apr.", countdownH: 21, countdownM: 25 },
  ],
};

function getMeta(condition) {
  return CONDITION_META[condition] || { icon: "🗺️", color: "#6b7280", desc: "" };
}

function Countdown({ seconds }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return (
    <span className="font-mono text-xs text-gray-400">
      {h > 0 && `${h}h `}{m > 0 && `${m}m `}{s}s
    </span>
  );
}

function StarButton({ condition, favs, toggle }) {
  const isFav = favs.includes(condition);
  return (
    <button
      onClick={e => { e.stopPropagation(); toggle(condition); }}
      title={isFav ? "Aus Favoriten entfernen" : "Als Favorit markieren"}
      className={`text-lg transition-transform hover:scale-125 active:scale-95 ${isFav ? "text-yellow-400" : "text-gray-600 hover:text-yellow-300"}`}
    >
      {isFav ? "★" : "☆"}
    </button>
  );
}

function ActiveCard({ item, favs = [], toggleFav = () => {} }) {
  const meta = getMeta(item.condition);
  const mapColor = MAP_COLORS[item.map] || "#6b7280";
  const [secs, setSecs] = useState(25 * 60 + 8);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ borderColor: meta.color }} className="rounded-2xl border-2 bg-gray-900 p-5 flex flex-col gap-3 shadow-xl relative overflow-hidden">
      <div style={{ backgroundColor: meta.color, opacity: 0.08 }} className="absolute inset-0 rounded-2xl" />
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <div>
            <p style={{ color: meta.color }} className="font-bold text-base leading-tight">{item.condition}</p>
            <p className="text-gray-400 text-xs">{meta.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarButton condition={item.condition} favs={favs} toggle={toggleFav} />
          <span className="flex items-center gap-1 text-green-400 text-xs font-semibold bg-green-400/10 px-2 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
            LIVE
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between relative">
        <span style={{ backgroundColor: mapColor + "22", color: mapColor, borderColor: mapColor + "55" }} className="text-xs font-semibold px-3 py-1 rounded-full border">
          📍 {item.map}
        </span>
        <div className="text-right">
          <p className="text-white text-xs font-mono">{item.timeRange}</p>
          <Countdown seconds={secs} />
        </div>
      </div>
    </div>
  );
}

function UpcomingRow({ item, index, favs = [], toggleFav = () => {} }) {
  const meta = getMeta(item.condition);
  const mapColor = MAP_COLORS[item.map] || "#6b7280";
  const initSecs = item.countdownH * 3600 + item.countdownM * 60 + 8;
  const [secs, setSecs] = useState(initSecs);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-600">
      <StarButton condition={item.condition} favs={favs} toggle={toggleFav} />
      <span className="text-xl w-8 text-center">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p style={{ color: meta.color }} className="font-semibold text-sm truncate">{item.condition}</p>
        <span style={{ color: mapColor }} className="text-xs">{item.map}</span>
      </div>
      <div className="text-right shrink-0">
        <p className="text-white text-xs font-mono">{item.date} {item.timeRange}</p>
        <Countdown seconds={secs} />
      </div>
    </div>
  );
}

function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("arc_favs") || "[]"); }
    catch { return []; }
  });
  const toggle = useCallback((condition) => {
    setFavs(prev => {
      const next = prev.includes(condition) ? prev.filter(f => f !== condition) : [...prev, condition];
      localStorage.setItem("arc_favs", JSON.stringify(next));
      return next;
    });
  }, []);
  return [favs, toggle];
}

function requestNotifPermission() {
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
}

function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted")
    new Notification(title, { body, icon: "https://arcraiders.com/favicon.ico" });
}

function NextChanceView({ favs, toggleFav }) {
  const allConditions = Object.keys(CONDITION_META);
  const schedule = allConditions.map(condition => {
    const next = SCRAPED_DATA.upcoming.find(u => u.condition === condition) || SCRAPED_DATA.active.find(a => a.condition === condition);
    const isActive = SCRAPED_DATA.active.some(a => a.condition === condition);
    return { condition, next, isActive };
  }).sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    const secsA = a.next ? (a.next.countdownH || 0) * 3600 + (a.next.countdownM || 0) * 60 : 99999;
    const secsB = b.next ? (b.next.countdownH || 0) * 3600 + (b.next.countdownM || 0) * 60 : 99999;
    return secsA - secsB;
  });
  return (
    <div className="flex flex-col gap-2">
      <p className="text-gray-500 text-xs mb-2">Nächste Chance für jede Condition — sortiert nach Verfügbarkeit. ⭐ Favoriten werden hervorgehoben.</p>
      {schedule.map(({ condition, next, isActive }) => {
        const meta = getMeta(condition);
        const isFav = favs.includes(condition);
        const mapColor = next ? (MAP_COLORS[next.map] || "#6b7280") : "#6b7280";
        return (
          <div key={condition} style={{ borderColor: isFav ? "#facc15" : "transparent" }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${isActive ? "bg-green-950/40" : "bg-gray-900 hover:bg-gray-800"}`}>
            <StarButton condition={condition} favs={favs} toggle={toggleFav} />
            <span className="text-xl w-8 text-center">{meta.icon}</span>
            <div className="flex-1 min-w-0">
              <p style={{ color: meta.color }} className="font-semibold text-sm truncate">{condition}</p>
              {next ? <span style={{ color: mapColor }} className="text-xs">{next.map}</span>
                    : <span className="text-gray-600 text-xs">Nicht geplant</span>}
            </div>
            <div className="text-right shrink-0">
              {isActive ? (
                <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>Jetzt aktiv
                </span>
              ) : next ? (
                <>
                  <p className="text-white text-xs font-mono">{next.date} {next.timeRange}</p>
                  <p className="text-gray-400 text-xs">in {next.countdownH > 0 ? `${next.countdownH}h ` : ""}{next.countdownM}m</p>
                </>
              ) : <span className="text-gray-600 text-xs">–</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [favs, toggleFav] = useFavorites();
  const notifiedRef = useRef(new Set());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeTab, setActiveTab] = useState("main");
  const [filter, setFilter] = useState("all");
  const [mapFilter, setMapFilter] = useState("all");
  const refresh = useCallback(() => setLastRefresh(new Date()), []);

  useEffect(() => {
    requestNotifPermission();
    const check = setInterval(() => {
      SCRAPED_DATA.upcoming.forEach(item => {
        if (!favs.includes(item.condition)) return;
        const key = `${item.condition}|${item.date}|${item.timeRange}`;
        if (notifiedRef.current.has(key)) return;
        const totalSecs = item.countdownH * 3600 + item.countdownM * 60;
        if (totalSecs <= 15 * 60 && totalSecs > 0) {
          sendNotification(`⭐ ${item.condition} startet bald!`, `📍 ${item.map} · ${item.date} ${item.timeRange}`);
          notifiedRef.current.add(key);
        }
      });
    }, 30000);
    return () => clearInterval(check);
  }, [favs]);

  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const maps = ["all", ...Object.keys(MAP_COLORS)];
  const conditions = ["all", ...Object.keys(CONDITION_META)];
  const filteredActive = SCRAPED_DATA.active.filter(i =>
    (mapFilter === "all" || i.map === mapFilter) && (filter === "all" || i.condition === filter));
  const filteredUpcoming = SCRAPED_DATA.upcoming.filter(i =>
    (mapFilter === "all" || i.map === mapFilter) && (filter === "all" || i.condition === filter));

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="38" rx="9" fill="#111827"/>
            <polygon points="19,4 34,30 4,30" fill="none" stroke="#f97316" strokeWidth="2.2" strokeLinejoin="round"/>
            <polygon points="19,10 29,28 9,28" fill="#f97316" fillOpacity="0.13"/>
            <line x1="19" y1="4" x2="19" y2="30" stroke="#facc15" strokeWidth="1.2" strokeDasharray="2,2"/>
            <circle cx="19" cy="19" r="3.2" fill="#facc15" fillOpacity="0.9"/>
            <circle cx="19" cy="19" r="5.5" fill="none" stroke="#facc15" strokeWidth="0.8" strokeOpacity="0.4"/>
          </svg>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-bold text-lg text-white leading-none">ARC Twix</h1>
              <span className="text-gray-600 text-xs font-mono">v1.0</span>
            </div>
            <p className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Map Conditions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {favs.length > 0 && (
            <span className="bg-yellow-400/10 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-400/30">
              ⭐ {favs.length} Favorit{favs.length > 1 ? "en" : ""}
            </span>
          )}
          <span className="text-gray-500 text-xs hidden sm:inline">Aktualisiert: {lastRefresh.toLocaleTimeString("de-DE")}</span>
          <button onClick={refresh} className="bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="border-b border-gray-800 bg-gray-950 sticky top-[73px] z-10">
        <div className="max-w-3xl mx-auto px-4 flex gap-1 pt-2">
          {[{ id: "main", label: "📋 Übersicht" }, { id: "schedule", label: "🗓️ Mein Zeitplan" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab.id ? "border-orange-500 text-orange-400 bg-gray-900" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <select value={mapFilter} onChange={e => setMapFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
            {maps.map(m => <option key={m} value={m}>{m === "all" ? "🗺️ Alle Karten" : m}</option>)}
          </select>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
            {conditions.map(c => <option key={c} value={c}>{c === "all" ? "⚡ Alle Bedingungen" : c}</option>)}
          </select>
        </div>

        {activeTab === "main" && <>
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <h2 className="text-green-400 font-bold text-sm uppercase tracking-widest">Jetzt Aktiv</h2>
              <span className="bg-green-400/10 text-green-400 text-xs px-2 py-0.5 rounded-full">{filteredActive.length}</span>
            </div>
            {filteredActive.length === 0
              ? <p className="text-gray-500 text-sm">Keine aktiven Bedingungen für diesen Filter.</p>
              : <div className="grid gap-3 sm:grid-cols-2">
                  {filteredActive.map((item, i) => <ActiveCard key={i} item={item} favs={favs} toggleFav={toggleFav} />)}
                </div>}
          </section>
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-400 text-sm">⏳</span>
              <h2 className="text-orange-400 font-bold text-sm uppercase tracking-widest">Bald Verfügbar</h2>
              <span className="bg-orange-400/10 text-orange-400 text-xs px-2 py-0.5 rounded-full">{filteredUpcoming.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {filteredUpcoming.length === 0
                ? <p className="text-gray-500 text-sm">Keine bevorstehenden Bedingungen für diesen Filter.</p>
                : filteredUpcoming.map((item, i) => <UpcomingRow key={i} item={item} index={i} favs={favs} toggleFav={toggleFav} />)}
            </div>
          </section>
        </>}

        {activeTab === "schedule" && <NextChanceView favs={favs} toggleFav={toggleFav} />}

        <p className="text-center text-gray-600 text-xs">Daten von arcraiders.com/de/map-conditions · ARC Twix v1.0</p>
      </div>
    </div>
  );
}
