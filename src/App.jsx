import React, { useState, useEffect, useCallback, useRef, useContext, createContext } from "react";

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

// ── Verlauf: bereits gelaufene Conditions (simuliert aus dem Tagesplan) ──────
const HISTORY_DATA = [
  { condition: "Night Raid",            map: "Spaceport",         timeRange: "10:00 – 11:00", date: "Heute" },
  { condition: "Harvester",             map: "Buried City",       timeRange: "10:00 – 11:00", date: "Heute" },
  { condition: "Bird City",             map: "The Blue Gate",     timeRange: "09:00 – 10:00", date: "Heute" },
  { condition: "Electromagnetic Storm", map: "Dam Battlegrounds", timeRange: "09:00 – 10:00", date: "Heute" },
  { condition: "Matriarch",             map: "Spaceport",         timeRange: "08:00 – 09:00", date: "Heute" },
  { condition: "Hurricane",             map: "The Blue Gate",     timeRange: "08:00 – 09:00", date: "Heute" },
  { condition: "Lush Blooms",           map: "Dam Battlegrounds", timeRange: "07:00 – 08:00", date: "Heute" },
  { condition: "Locked Gate",           map: "Buried City",       timeRange: "06:00 – 07:00", date: "Heute" },
  { condition: "Launch Tower Loot",     map: "Spaceport",         timeRange: "05:00 – 06:00", date: "Heute" },
  { condition: "Prospecting Probes",    map: "The Blue Gate",     timeRange: "04:00 – 05:00", date: "Heute" },
  { condition: "Close Scrutiny",        map: "Buried City",       timeRange: "03:00 – 04:00", date: "Heute" },
  { condition: "Hidden Bunker",         map: "Dam Battlegrounds", timeRange: "02:00 – 03:00", date: "Heute" },
  // Gestern
  { condition: "Hidden Bunker",         map: "Spaceport",         timeRange: "23:00 – 00:00", date: "Gestern" },
  { condition: "Night Raid",            map: "Buried City",       timeRange: "22:00 – 23:00", date: "Gestern" },
  { condition: "Matriarch",             map: "The Blue Gate",     timeRange: "21:00 – 22:00", date: "Gestern" },
  { condition: "Launch Tower Loot",     map: "Dam Battlegrounds", timeRange: "20:00 – 21:00", date: "Gestern" },
  { condition: "Bird City",             map: "Spaceport",         timeRange: "19:00 – 20:00", date: "Gestern" },
  { condition: "Hurricane",             map: "Buried City",       timeRange: "18:00 – 19:00", date: "Gestern" },
  { condition: "Electromagnetic Storm", map: "The Blue Gate",     timeRange: "17:00 – 18:00", date: "Gestern" },
  { condition: "Prospecting Probes",    map: "Spaceport",         timeRange: "16:00 – 17:00", date: "Gestern" },
  { condition: "Lush Blooms",           map: "Dam Battlegrounds", timeRange: "15:00 – 16:00", date: "Gestern" },
  { condition: "Locked Gate",           map: "Buried City",       timeRange: "14:00 – 15:00", date: "Gestern" },
  { condition: "Harvester",             map: "The Blue Gate",     timeRange: "13:00 – 14:00", date: "Gestern" },
  { condition: "Close Scrutiny",        map: "Spaceport",         timeRange: "12:00 – 13:00", date: "Gestern" },
];

// --- Fallback-Daten (statisch, werden durch useLiveData ersetzt wenn API verfuegbar) ---
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

// ── PWA: Manifest + Install-Prompt ─────────────────────────────────────────
function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Dynamisch manifest.json via Blob injizieren
    const manifest = {
      name: "ARC Raiders – Map Conditions Tracker",
      short_name: "ARC Twix",
      description: "Echtzeit Map-Conditions Tracker für ARC Raiders",
      start_url: ".",
      display: "standalone",
      background_color: "#111827",
      theme_color: "#f97316",
      orientation: "portrait-primary",
      icons: [
        { src: "https://arcraiders.com/favicon.ico", sizes: "64x64",   type: "image/x-icon" },
        { src: "https://arcraiders.com/favicon.ico", sizes: "192x192", type: "image/x-icon" },
        { src: "https://arcraiders.com/favicon.ico", sizes: "512x512", type: "image/x-icon" },
      ],
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    let link = document.querySelector("link[rel='manifest']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = url;

    // Theme-color Meta
    let meta = document.querySelector("meta[name='theme-color']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = "#111827";

    // Install-Prompt abfangen
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);

    // Bereits installiert?
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    window.addEventListener("appinstalled", () => { setInstalled(true); setInstallPrompt(null); });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      URL.revokeObjectURL(url);
    };
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") { setInstalled(true); setInstallPrompt(null); }
  };

  return { installPrompt, installed, triggerInstall };
}

function PWAInstallButton({ installPrompt, installed, triggerInstall }) {
  if (installed) return (
    <span className="flex items-center gap-1 text-green-400 text-xs font-semibold bg-green-400/10 px-2 py-0.5 rounded-full">
      📲 Installiert
    </span>
  );
  if (!installPrompt) return null;
  return (
    <button
      onClick={triggerInstall}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border-2 border-orange-500 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
    >
      📲 App installieren
    </button>
  );
}

// ── Live-Daten Context ───────────────────────────────────────────────────────────
  // Alle Child-Komponenten greifen per Context auf liveData zu.
  // Kein Prop-Drilling noetig.
  const LiveDataContext = createContext(SCRAPED_DATA);
  function useLiveDataCtx() { return useContext(LiveDataContext); }

  // ── Live-Daten Hook ───────────────────────────────────────────────────────────
  // Trage hier deine API-URL ein sobald ein CORS-Proxy oder eigene API verfuegbar ist.
  // Erwartet JSON: { active: [...], upcoming: [...] } - gleiche Struktur wie SCRAPED_DATA.
  const LIVE_API_URL = null; // z.B. "https://mein-proxy.example.com/arc-conditions"

  function useLiveData(addToast) {
    const [liveData, setLiveData] = useState(SCRAPED_DATA);
    const [fetchStatus, setFetchStatus] = useState(LIVE_API_URL ? "loading" : "fallback");
    const [lastFetch, setLastFetch] = useState(null);

    const doFetch = useCallback(async () => {
      if (!LIVE_API_URL) { setFetchStatus("fallback"); return; }
      setFetchStatus("loading");
      try {
        const res = await fetch(LIVE_API_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        setLiveData({ ...json, fetchedAt: new Date().toISOString() });
        setFetchStatus("live");
        setLastFetch(new Date());
        if (addToast) addToast("Live-Daten geladen", "success", 2500);
      } catch (err) {
        setFetchStatus("error");
        setLiveData(SCRAPED_DATA);
        if (addToast) addToast("Fetch fehlgeschlagen - Fallback aktiv", "warning", 4000);
      }
    }, [addToast]);

    useEffect(() => {
      doFetch();
      const t = setInterval(doFetch, 60000);
      return () => clearInterval(t);
    }, [doFetch]);

    return { liveData, fetchStatus, lastFetch, refetch: doFetch };
  }

  function LiveStatusBadge({ fetchStatus, lastFetch }) {
    const cfgMap = {
      live:     { bg: "#14532d", color: "#22c55e", pulse: true,  label: "LIVE" },
      loading:  { bg: "#1c1917", color: "#f59e0b", pulse: false, label: "Laedt" },
      fallback: { bg: "#1c1917", color: "#6b7280", pulse: false, label: "Fallback" },
      error:    { bg: "#450a0a", color: "#ef4444", pulse: false, label: "Fehler" },
    };
    const cfg = cfgMap[fetchStatus] || cfgMap.fallback;
    return (
      <span
        title={lastFetch ? "Zuletzt: " + lastFetch.toLocaleTimeString("de-DE") : "Kein Live-Fetch (Fallback)"}
        style={{ backgroundColor: cfg.bg, color: cfg.color, border: "1px solid " + cfg.color + "55" }}
        className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full cursor-default select-none shrink-0"
      >
        {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />}
        {cfg.label}
      </span>
    );
  }

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

function ActiveCard({ item, favs = [], toggleFav = () => {}, onToast }) {
  const meta = getMeta(item.condition);
  const mapColor = MAP_COLORS[item.map] || "#6b7280";

  // Parse end time from timeRange e.g. "11:00 – 12:00" → end = 12:00
  const getEndSecs = () => {
    try {
      const endStr = item.timeRange.split("\u2013")[1]?.trim() || item.timeRange.split("-")[1]?.trim();
      if (!endStr) return 25 * 60;
      const [h, m] = endStr.split(":").map(Number);
      const now = new Date();
      const end = new Date();
      end.setHours(h, m, 0, 0);
      let diff = Math.floor((end - now) / 1000);
      if (diff < 0) diff += 24 * 3600; // next day
      return diff;
    } catch { return 25 * 60; }
  };

  const endTimeLabel = (() => {
    try {
      return (item.timeRange.split("\u2013")[1]?.trim() || item.timeRange.split("-")[1]?.trim() || "");
    } catch { return ""; }
  })();

  const [secs, setSecs] = useState(getEndSecs);

  useEffect(() => {
    setSecs(getEndSecs());
    const intervalId = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(intervalId);
  }, [item.timeRange]);

  return (
    <div
      style={{ borderColor: meta.color }}
      className="rounded-2xl border-2 bg-gray-900 p-5 flex flex-col gap-3 shadow-xl relative overflow-hidden"
    >
      {/* Pulsing glow */}
      <div
        style={{ backgroundColor: meta.color, opacity: 0.08 }}
        className="absolute inset-0 rounded-2xl"
      />
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <div>
            <p style={{ color: meta.color }} className="font-bold text-base leading-tight">{item.condition}</p>
            <p className="text-gray-400 text-xs">{meta.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarButton condition={item.condition} favs={favs} toggle={toggleFav} onToast={onToast} />
          <span className="flex items-center gap-1 text-green-400 text-xs font-semibold bg-green-400/10 px-2 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
          LIVE
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between relative">
        <span
          style={{ backgroundColor: mapColor + "22", color: mapColor, borderColor: mapColor + "55" }}
          className="text-xs font-semibold px-3 py-1 rounded-full border"
        >
          📍 {item.map}
        </span>
        <div className="text-right">
          <p className="text-white text-xs font-mono">{item.timeRange}</p>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-xs">endet in</span>
            <Countdown seconds={secs} />
          </div>
        </div>
      </div>
    </div>
  );
}

function UpcomingRow({ item, favs = [], toggleFav = () => {}, onToast }) {
  const meta = getMeta(item.condition);
  const mapColor = MAP_COLORS[item.map] || "#6b7280";
  const initSecs = item.countdownH * 3600 + item.countdownM * 60 + 8;
  const [secs, setSecs] = useState(initSecs);

  useEffect(() => {
    const intervalId = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-600">
      <StarButton condition={item.condition} favs={favs} toggle={toggleFav} onToast={onToast} />
      <span className="text-xl w-8 text-center">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p style={{ color: meta.color }} className="font-semibold text-sm truncate">{item.condition}</p>
        <span
          style={{ color: mapColor }}
          className="text-xs"
        >
          {item.map}
        </span>
      </div>
      <div className="text-right shrink-0">
        <p className="text-white text-xs font-mono">{item.date} {item.timeRange}</p>
        <Countdown seconds={secs} />
      </div>
    </div>
  );
}

// ── Favourites + Notification logic ──────────────────────────────────────────
function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("arc_favs") || "[]"); }
    catch { return []; }
  });
  const toggle = useCallback((condition) => {
    setFavs(prev => {
      const next = prev.includes(condition)
        ? prev.filter(f => f !== condition)
        : [...prev, condition];
      localStorage.setItem("arc_favs", JSON.stringify(next));
      return next;
    });
  }, []);
  return [favs, toggle];
}

// ── Toast System ─────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const remove = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return [toasts, add, remove];
}

function ToastContainer({ toasts, remove }) {
  if (!toasts.length) return null;
  const typeStyles = {
    info:    { bg: "#1e3a5f", border: "#3b82f6", icon: "ℹ️" },
    success: { bg: "#14532d", border: "#22c55e", icon: "✅" },
    warning: { bg: "#451a03", border: "#f97316", icon: "⚠️" },
    fav:     { bg: "#3b2a00", border: "#facc15", icon: "⭐" },
  };
  return (
    <div style={{ position: "fixed", top: 80, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
      {toasts.map(toast => {
        const s = typeStyles[toast.type] || typeStyles.info;
        return (
          <div key={toast.id}
            style={{ backgroundColor: s.bg, borderColor: s.border, border: `1.5px solid ${s.border}`, borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10, boxShadow: "0 4px 24px #0008", animation: "slideIn 0.25s ease" }}>
            <span style={{ fontSize: 18, lineHeight: 1.3 }}>{s.icon}</span>
            <span style={{ color: "#f1f5f9", fontSize: 13, flex: 1, lineHeight: 1.45 }}>{toast.message}</span>
            <button onClick={() => remove(toast.id)} style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
          </div>
        );
      })}
      <style>{`@keyframes slideIn { from { opacity:0; transform: translateX(40px);} to { opacity:1; transform: translateX(0);} }`}</style>
    </div>
  );
}

function useNotifSettings() {
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("arc_notif") || '{"enabled":false,"minutesBefore":15,"favsOnly":true}'); }
    catch { return { enabled: false, minutesBefore: 15, favsOnly: true }; }
  });
  const update = (patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem("arc_notif", JSON.stringify(next));
      return next;
    });
  };
  return [settings, update];
}

async function requestNotifPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

// ── Notification Settings View ───────────────────────────────────────────────
function NotifSettingsView({ notifSettings, updateNotif }) {
  const [permStatus, setPermStatus] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );
  const [testSent, setTestSent] = useState(false);

  const handleEnable = async () => {
    const result = await requestNotifPermission();
    setPermStatus(result);
    if (result === "granted") {
      updateNotif({ enabled: true });
      new Notification("✅ ARC Twix Notifications aktiv!", {
        body: "Du wirst rechtzeitig über deine Conditions informiert.",
        icon: "https://arcraiders.com/favicon.ico",
      });
    }
  };

  const handleTest = () => {
    if (Notification.permission !== "granted") return;
    new Notification("🔔 Test-Benachrichtigung", {
      body: `⚡ Hidden Bunker startet in ${notifSettings.minutesBefore} Min! 📍 Spaceport`,
      icon: "https://arcraiders.com/favicon.ico",
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const granted = permStatus === "granted";
  const denied  = permStatus === "denied";
  const unsupported = permStatus === "unsupported";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-white text-sm font-bold">🔔 Browser-Benachrichtigungen</p>
        <span style={{ backgroundColor: granted ? "#14532d" : "#1f2937", color: granted ? "#22c55e" : "#6b7280" }}
          className="text-xs font-semibold px-2 py-0.5 rounded-full">
          {unsupported ? "Nicht unterstützt" : granted ? "✅ Erlaubt" : denied ? "❌ Blockiert" : "⏳ Ausstehend"}
        </span>
      </div>

      {unsupported && (
        <p className="text-red-400 text-xs">Dein Browser unterstützt keine Push-Notifications.</p>
      )}

      {denied && (
        <div className="bg-red-950/40 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-xs font-bold mb-1">❌ Notifications blockiert</p>
          <p className="text-gray-400 text-xs">Bitte in den Browser-Einstellungen manuell erlauben (🔒 Schloss-Symbol in der Adressleiste).</p>
        </div>
      )}

      {!granted && !denied && !unsupported && (
        <button onClick={handleEnable}
          className="py-2.5 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white transition-colors">
          🔔 Notifications erlauben
        </button>
      )}

      {granted && (
        <>
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Benachrichtigungen aktiv</span>
            <button onClick={() => updateNotif({ enabled: !notifSettings.enabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                notifSettings.enabled ? "bg-orange-500" : "bg-gray-700"
              }`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                notifSettings.enabled ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Vorlauf */}
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">⏰ Vorlauf vor Condition-Start</p>
            <div className="flex gap-2 flex-wrap">
              {[5, 10, 15, 30].map(min => (
                <button key={min} onClick={() => updateNotif({ minutesBefore: min })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                    notifSettings.minutesBefore === min
                      ? "border-orange-500 bg-orange-500/10 text-orange-400"
                      : "border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300"
                  }`}>
                  {min} Min
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Nur Favoriten benachrichtigen</p>
              <p className="text-gray-600 text-xs">Aus = alle Conditions</p>
            </div>
            <button onClick={() => updateNotif({ favsOnly: !notifSettings.favsOnly })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                notifSettings.favsOnly ? "bg-yellow-500" : "bg-orange-500"
              }`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                notifSettings.favsOnly ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Test */}
          <button onClick={handleTest}
            className={`py-2 rounded-lg text-sm font-semibold transition-colors border-2 ${
              testSent ? "border-green-500 bg-green-500/10 text-green-400" : "border-gray-700 bg-gray-900 text-gray-300 hover:text-white"
            }`}>
            {testSent ? "✅ Test gesendet!" : "🧪 Test-Notification senden"}
          </button>
        </>
      )}
    </div>
  );
}

// ── Sound System ───────────────────────────────────────────────────────────────
function playAlarmSound(type = "alert") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const sequences = {
      alert: [ // 3 ascending beeps
        { freq: 520, start: 0,    dur: 0.12 },
        { freq: 660, start: 0.15, dur: 0.12 },
        { freq: 880, start: 0.30, dur: 0.20 },
      ],
      live: [ // single deep pulse
        { freq: 200, start: 0,    dur: 0.08 },
        { freq: 440, start: 0.10, dur: 0.25 },
      ],
      fav: [ // soft chime
        { freq: 880, start: 0,    dur: 0.15 },
        { freq: 1100, start: 0.18, dur: 0.15 },
      ],
    };
    const notes = sequences[type] || sequences.alert;
    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch (e) { /* AudioContext nicht verfügbar */ }
}

function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "https://arcraiders.com/favicon.ico" });
  }
}

// ── Star Button ───────────────────────────────────────────────────────────────
function StarButton({ condition, favs, toggle, onToast }) {
  const isFav = favs.includes(condition);
  return (
    <button
      onClick={e => {
          e.stopPropagation();
          const wasFav = favs.includes(condition);
          toggle(condition);
          if (onToast) {
            const meta = getMeta(condition);
            if (wasFav) {
              onToast(`${meta.icon} ${condition} aus Favoriten entfernt`, "info", 2500);
            } else {
              onToast(`⭐ ${condition} zu Favoriten hinzugefügt!`, "fav", 3000);
            }
          }
        }}
      title={isFav ? "Aus Favoriten entfernen" : "Als Favorit markieren"}
      className={`text-lg transition-transform hover:scale-125 active:scale-95 ${
        isFav ? "text-yellow-400" : "text-gray-600 hover:text-yellow-300"
      }`}
    >
      {isFav ? "★" : "☆"}
    </button>
  );
}

// ── Karten-Übersicht ────────────────────────────────────────────────────────
const MAP_INFO = {
  "Dam Battlegrounds":  { icon: "🏞️", desc: "Industriegebiet mit Staudamm. Hohe Feindaktivität, gute Loot-Spots." },
  "Spaceport":          { icon: "🚀", desc: "Verlassenes Raumfahrtzentrum. Viele vertikale Ebenen, Hidden Bunker möglich." },
  "The Blue Gate":      { icon: "🔵", desc: "Mysteriöse Anlage. Electromagnetic Storms häufig. Riskant, aber lohnend." },
  "Buried City":        { icon: "🏙️", desc: "Versunkene Stadt. Weitläufig, ideal für Bird City & Prospecting Probes." },
  "Stella Montis":      { icon: "⛰️", desc: "Bergmassiv. Seltene Conditions, aber hochwertige Ressourcen." },
};

function MapCard({ mapName, favs, toggleFav, onToast }) {
  const color = MAP_COLORS[mapName] || "#6b7280";
  const info = MAP_INFO[mapName] || { icon: "🗺️", desc: "" };
  const SCRAPED_DATA = useLiveDataCtx();

  const activeHere = SCRAPED_DATA.active.filter(a => a.map === mapName);
  const upcomingHere = SCRAPED_DATA.upcoming.filter(u => u.map === mapName).slice(0, 3);
  const historyHere = HISTORY_DATA.filter(h => h.map === mapName && h.date === "Heute").slice(0, 3);

  return (
    <div style={{ borderColor: color + "55" }} className="rounded-2xl border-2 bg-gray-900 overflow-hidden shadow-xl">
      {/* Map Header */}
      <div style={{ backgroundColor: color + "22" }} className="px-5 py-4 flex items-center gap-3 border-b border-gray-800">
        <span className="text-3xl">{info.icon}</span>
        <div className="flex-1">
          <h3 style={{ color }} className="font-bold text-base leading-tight">{mapName}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{info.desc}</p>
        </div>
        {activeHere.length > 0 && (
          <span className="flex items-center gap-1 text-green-400 text-xs font-semibold bg-green-400/10 px-2 py-1 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
            {activeHere.length} aktiv
          </span>
        )}
      </div>

      <div className="px-5 py-3 flex flex-col gap-3">
        {/* Active */}
        {activeHere.length > 0 && (
          <div>
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1.5">Jetzt aktiv</p>
            <div className="flex flex-col gap-1">
              {activeHere.map((item, i) => {
                const meta = getMeta(item.condition);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <StarButton condition={item.condition} favs={favs} toggle={toggleFav} onToast={onToast} />
                    <span>{meta.icon}</span>
                    <span style={{ color: meta.color }} className="text-sm font-semibold flex-1">{item.condition}</span>
                    <span className="text-gray-500 text-xs font-mono">{item.timeRange}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcomingHere.length > 0 && (
          <div>
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1.5">Als nächstes</p>
            <div className="flex flex-col gap-1">
              {upcomingHere.map((item, i) => {
                const meta = getMeta(item.condition);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <StarButton condition={item.condition} favs={favs} toggle={toggleFav} onToast={onToast} />
                    <span className="opacity-70">{meta.icon}</span>
                    <span style={{ color: meta.color }} className="text-sm flex-1 opacity-80">{item.condition}</span>
                    <span className="text-gray-500 text-xs font-mono">{item.timeRange}</span>
                    <span className="text-gray-600 text-xs">in {item.countdownH > 0 ? `${item.countdownH}h` : `${item.countdownM}m`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History */}
        {historyHere.length > 0 && (
          <div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-1.5">Heute gelaufen</p>
            <div className="flex flex-col gap-1">
              {historyHere.map((item, i) => {
                const meta = getMeta(item.condition);
                return (
                  <div key={i} className="flex items-center gap-2 opacity-50">
                    <span className="w-5"></span>
                    <span>{meta.icon}</span>
                    <span style={{ color: meta.color }} className="text-xs flex-1">{item.condition}</span>
                    <span className="text-gray-600 text-xs font-mono">{item.timeRange}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeHere.length === 0 && upcomingHere.length === 0 && (
          <p className="text-gray-600 text-xs">Keine Conditions geplant.</p>
        )}
      </div>
    </div>
  );
}

function MapsView({ favs, toggleFav, onToast }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-500 text-xs">Alle Karten auf einen Blick — aktive Conditions, nächste Events und heutiger Verlauf pro Map.</p>
      {Object.keys(MAP_COLORS).map(mapName => (
        <MapCard key={mapName} mapName={mapName} favs={favs} toggleFav={toggleFav} onToast={onToast} />
      ))}
    </div>
  );
}

// ── Wochenansicht / Kalender-View ────────────────────────────────────────────────────
function WeekView({ favs, toggleFav, onToast }) {
  const SCRAPED_DATA = useLiveDataCtx();
  // Generate 7 days starting today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  const allConditions = Object.keys(CONDITION_META);
  const allMaps = Object.keys(MAP_COLORS);
  const [selectedDay, setSelectedDay] = useState(0);
  const [filterFavs, setFilterFavs] = useState(false);
  const nowHour = new Date().getHours();

  // TODAY: real data from HISTORY + SCRAPED
  const buildTodaySlots = () => {
    const slotMap = {};
    HISTORY_DATA.filter(h => h.date === "Heute").forEach(h => {
      const hour = parseInt(h.timeRange.split(":")[0], 10);
      if (!slotMap[hour]) slotMap[hour] = [];
      slotMap[hour].push({ condition: h.condition, map: h.map, timeRange: h.timeRange, source: "history" });
    });
    SCRAPED_DATA.active.forEach(a => {
      const hour = parseInt(a.timeRange.split(":")[0], 10);
      if (!slotMap[hour]) slotMap[hour] = [];
      slotMap[hour].push({ condition: a.condition, map: a.map, timeRange: a.timeRange, source: "live" });
    });
    SCRAPED_DATA.upcoming.filter(u => u.date && u.date.includes("19.")).forEach(u => {
      const hour = parseInt(u.timeRange.split(":")[0], 10);
      if (!slotMap[hour]) slotMap[hour] = [];
      slotMap[hour].push({ condition: u.condition, map: u.map, timeRange: u.timeRange, source: "upcoming", countdownH: u.countdownH, countdownM: u.countdownM });
    });
    return Array.from({ length: 24 }, (_, hour) => ({
      hour, entries: slotMap[hour] || [],
      timeRange: `${String(hour).padStart(2,"0")}:00 \u2013 ${String(hour+1).padStart(2,"0")}:00`,
      simulated: false,
    }));
  };

  // FUTURE DAYS: simulated, clearly labeled
  const buildSimulatedSlots = (dayOffset) => Array.from({ length: 24 }, (_, hour) => {
    const condIdx = (dayOffset * 7 + Math.floor(hour / 2)) % allConditions.length;
    const mapIdx  = (dayOffset * 3 + hour) % allMaps.length;
    return {
      hour,
      entries: [{ condition: allConditions[condIdx], map: allMaps[mapIdx], source: "simulated" }],
      timeRange: `${String(hour).padStart(2,"0")}:00 \u2013 ${String(hour+1).padStart(2,"0")}:00`,
      simulated: true,
    };
  });

  const slots = selectedDay === 0 ? buildTodaySlots() : buildSimulatedSlots(selectedDay);
  const displayed = filterFavs
    ? slots.filter(s => s.entries.some(e => favs.includes(e.condition)))
    : slots.filter(s => s.entries.length > 0);

  // sourceLabel war toter Code (nirgends aufgerufen) — entfernt
    const _sourceLabel = (source) => {
    if (source === "live")      return <span className="text-green-400 text-xs font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>LIVE</span>;
    if (source === "upcoming")  return <span className="text-orange-400 text-xs">⏳ Bald</span>;
    if (source === "history")   return <span className="text-gray-500 text-xs">✓ Gelaufen</span>;
    if (source === "simulated") return <span className="text-gray-700 text-xs italic">Vorschau</span>;
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-500 text-xs">Kalender-Übersicht der nächsten 7 Tage — alle Conditions stundenweise.</p>

      {/* Day Selector */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {days.map((d, i) => {
          const isToday = i === 0;
          const isSelected = selectedDay === i;
          return (
            <button key={i} onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl border-2 shrink-0 transition-all ${
                isSelected
                  ? "border-orange-500 bg-orange-500/10 text-orange-400"
                  : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600"
              }`}>
              <span className="text-xs font-bold">{dayNames[d.getDay()]}</span>
              <span className="text-lg font-mono leading-none mt-0.5">{d.getDate()}</span>
              {isToday && <span className="text-orange-400 text-xs mt-0.5">Heute</span>}
            </button>
          );
        })}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-3">
        <button onClick={() => setFilterFavs(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
            filterFavs
              ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
              : "border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300"
          }`}>
          ⭐ Nur Favoriten
        </button>
        <span className="text-gray-600 text-xs">{displayed.length} Zeitslots</span>
      </div>

      {/* Hourly Slots */}
      <div className="flex flex-col gap-1.5">
        {displayed.flatMap((slot, i) =>
        slot.entries.map((entry, j) => {
          const meta = getMeta(entry.condition);
          const mapColor = MAP_COLORS[entry.map] || "#6b7280";
          const isNow = selectedDay === 0 && slot.hour === nowHour;
          const isPast = selectedDay === 0 && slot.hour < nowHour;
          return (
            <div key={`${i}-${j}`}
              style={{ borderColor: isNow ? meta.color : "transparent", opacity: isPast ? 0.45 : 1 }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 ${
                isNow ? "bg-gray-800" : "bg-gray-900"
              }`}>
              <div className="w-14 shrink-0 text-right">
                <span className={`text-xs font-mono ${ isNow ? "text-orange-400 font-bold" : isPast ? "text-gray-600" : "text-gray-400" }`}>
                  {String(slot.hour).padStart(2,"0")}:00
                </span>
              </div>
              <span className="text-lg">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <p style={{ color: meta.color }} className="text-sm font-semibold truncate">{entry.condition}</p>
                <span style={{ color: mapColor }} className="text-xs">{entry.map}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isNow && (
                  <span className="flex items-center gap-1 text-green-400 text-xs font-semibold bg-green-400/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
                    LIVE
                  </span>
                )}
                <StarButton condition={entry.condition} favs={favs} toggle={toggleFav} onToast={onToast} />
              </div>
            </div>
          );
        })
      )}
        {displayed.length === 0 && (
          <div className="text-center py-10 text-gray-600">
            <p className="text-3xl mb-2">⭐</p>
            <p className="text-sm">Keine Favoriten-Conditions für diesen Tag.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Loot-Guide pro Condition ────────────────────────────────────────────────
const LOOT_GUIDE = {
  "Close Scrutiny": {
    tip: "Feinde droppen häufiger Ausrüstung und Munition. Lohnt sich für Gear-Farming.",
    loot: [
      { item: "Militär-Munition", rarity: "Selten", color: "#3b82f6" },
      { item: "Taktische Ausrüstung", rarity: "Ungewöhnlich", color: "#22c55e" },
      { item: "Waffenmodifikationen", rarity: "Selten", color: "#3b82f6" },
      { item: "Medikits (groß)", rarity: "Gewöhnlich", color: "#6b7280" },
    ],
    tip2: "💡 Fokus auf Feinde statt Kisten — Kills lohnen sich mehr.",
  },
  "Hidden Bunker": {
    tip: "Exklusiver Bunker mit hochwertigem Loot. Teamarbeit empfohlen — viele Spieler kämpfen darum.",
    loot: [
      { item: "Seltene Waffen", rarity: "Episch", color: "#a855f7" },
      { item: "Hochwertige Komponenten", rarity: "Selten", color: "#3b82f6" },
      { item: "Spezial-Ausrüstung", rarity: "Episch", color: "#a855f7" },
      { item: "Große Ressourcenpakete", rarity: "Selten", color: "#3b82f6" },
    ],
    tip2: "💡 40-Minuten-Timer — schnell rein, Bunker sichern, dann looten.",
  },
  "Lush Blooms": {
    tip: "Pflanzenbasierte Ressourcen in großer Menge. Ideal für Crafting-Materialien.",
    loot: [
      { item: "Heilkräuter", rarity: "Gewöhnlich", color: "#6b7280" },
      { item: "Seltene Pflanzenextrakte", rarity: "Selten", color: "#3b82f6" },
      { item: "Crafting-Komponenten", rarity: "Ungewöhnlich", color: "#22c55e" },
      { item: "Bio-Materialien", rarity: "Ungewöhnlich", color: "#22c55e" },
    ],
    tip2: "💡 Karten-Randbereiche absuchen — dort spawnen die meisten Blooms.",
  },
  "Electromagnetic Storm": {
    tip: "Elektronik funktioniert eingeschränkt. Dafür spawnen seltene Tech-Komponenten.",
    loot: [
      { item: "Tech-Schrott (hochwertig)", rarity: "Selten", color: "#3b82f6" },
      { item: "Elektronische Bauteile", rarity: "Selten", color: "#3b82f6" },
      { item: "Energiezellen", rarity: "Ungewöhnlich", color: "#22c55e" },
      { item: "Störsender-Komponenten", rarity: "Episch", color: "#a855f7" },
    ],
    tip2: "💡 Drohnen & Elektronik deaktiviert — auf Nahkampf setzen.",
  },
  "Harvester": {
    tip: "Riesige ARC-Maschine patrouilliert die Map. Besiegen lohnt sich sehr!",
    loot: [
      { item: "Harvester-Kernteile", rarity: "Episch", color: "#a855f7" },
      { item: "Schwere Metalle", rarity: "Selten", color: "#3b82f6" },
      { item: "Maschinen-Schrottteile", rarity: "Ungewöhnlich", color: "#22c55e" },
      { item: "Energie-Kristalle", rarity: "Episch", color: "#a855f7" },
    ],
    tip2: "💡 Schwachpunkte anvisieren — Harvester hat kritische Trefferzonen.",
  },
  "Bird City": {
    tip: "Große Vogelschwärme mit wertvollen Federn und organischen Materialien.",
    loot: [
      { item: "Seltene Federn", rarity: "Selten", color: "#3b82f6" },
      { item: "Organische Materialien", rarity: "Gewöhnlich", color: "#6b7280" },
      { item: "Leichte Verbundwerkstoffe", rarity: "Ungewöhnlich", color: "#22c55e" },
      { item: "Bionik-Komponenten", rarity: "Selten", color: "#3b82f6" },
    ],
    tip2: "💡 Schrotflinte oder Schnellfeuer für Vogel-Kills nutzen.",
  },
  "Matriarch": {
    tip: "Mächtiger Boss-Spawn. Gefährlich, aber mit den besten Drops im Spiel.",
    loot: [
      { item: "Matriarch-Trophäe", rarity: "Legendär", color: "#f59e0b" },
      { item: "Boss-Exklusiv-Items", rarity: "Episch", color: "#a855f7" },
      { item: "Verstärkte Rüstungsteile", rarity: "Selten", color: "#3b82f6" },
      { item: "Spezialwaffen-Teile", rarity: "Episch", color: "#a855f7" },
    ],
    tip2: "💡 Nur mit vollem Squad angehen — Solo ist extrem riskant.",
  },
  "Night Raid": {
    tip: "Dunkelheit erschwert Sicht, aber schützt auch dich. Stealth-Taktiken bevorzugen.",
    loot: [
      { item: "Nachtsicht-Equipment", rarity: "Selten", color: "#3b82f6" },
      { item: "Schalldämpfer", rarity: "Ungewöhnlich", color: "#22c55e" },
      { item: "Taktische Granaten", rarity: "Gewöhnlich", color: "#6b7280" },
      { item: "Stealth-Ausrüstung", rarity: "Selten", color: "#3b82f6" },
    ],
    tip2: "💡 Nachtsicht-Ausrüstung anlegen — gibt massiven Vorteil.",
  },
  "Hurricane": {
    tip: "Sturm reduziert Sichtweite drastisch. Ressourcen-Spawns erhöht.",
    loot: [
      { item: "Wetter-Überlebenskit", rarity: "Ungewöhnlich", color: "#22c55e" },
      { item: "Verstärktes Schutzmaterial", rarity: "Selten", color: "#3b82f6" },
      { item: "Sturm-Ressourcen", rarity: "Gewöhnlich", color: "#6b7280" },
      { item: "Seltene Mineralien", rarity: "Selten", color: "#3b82f6" },
    ],
    tip2: "💡 Gebäude als Schutz nutzen — im Freien ist man leichtes Ziel.",
  },
  "Launch Tower Loot": {
    tip: "Raketenbasis mit exklusivem High-Tech-Loot. Nur im Spaceport verfügbar.",
    loot: [
      { item: "Raketenkomponenten", rarity: "Episch", color: "#a855f7" },
      { item: "Avionik-Teile", rarity: "Selten", color: "#3b82f6" },
      { item: "Treibstoffzellen", rarity: "Ungewöhnlich", color: "#22c55e" },
      { item: "Satelliten-Hardware", rarity: "Episch", color: "#a855f7" },
    ],
    tip2: "💡 Turm von oben erkunden — bestes Loot in den oberen Ebenen.",
  },
  "Prospecting Probes": {
    tip: "Sonden markieren Ressourcenvorkommen. Folge den Signalen für seltene Materialien.",
    loot: [
      { item: "Seltene Erze", rarity: "Selten", color: "#3b82f6" },
      { item: "Rohdiamanten", rarity: "Episch", color: "#a855f7" },
      { item: "Mineralproben", rarity: "Ungewöhnlich", color: "#22c55e" },
      { item: "Geo-Scanner-Daten", rarity: "Selten", color: "#3b82f6" },
    ],
    tip2: "💡 Sonden-Signale auf der Minikarte verfolgen — führen zu Loot-Hotspots.",
  },
  "Locked Gate": {
    tip: "Gesperrter Bereich mit exklusivem Loot dahinter. Schlüssel oder Sprengstoff nötig.",
    loot: [
      { item: "Gesperrter-Bereich-Loot", rarity: "Episch", color: "#a855f7" },
      { item: "Spezial-Schlüsselkarten", rarity: "Selten", color: "#3b82f6" },
      { item: "Hochsicherheits-Ausrüstung", rarity: "Episch", color: "#a855f7" },
      { item: "Geheime Dokumente", rarity: "Selten", color: "#3b82f6" },
    ],
    tip2: "💡 Schlüssel vorher farmen oder Sprengstoff mitbringen.",
  },
};



function LootGuideView() {
  const [selected, setSelected] = useState(null);
  const conditions = Object.keys(CONDITION_META);

  const guide = selected ? LOOT_GUIDE[selected] : null;
  const meta = selected ? getMeta(selected) : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-500 text-xs">Wähle eine Condition um zu sehen, welche Items besonders häufig droppen und welche Strategie sich lohnt.</p>

      {/* Condition Picker */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {conditions.map(cond => {
          const m = getMeta(cond);
          const isSelected = selected === cond;
          return (
            <button key={cond} onClick={() => setSelected(isSelected ? null : cond)}
              style={{ borderColor: isSelected ? m.color : "transparent", backgroundColor: isSelected ? m.color + "18" : "" }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 bg-gray-900 hover:bg-gray-800 transition-all text-left">
              <span className="text-lg">{m.icon}</span>
              <span style={{ color: m.color }} className="text-xs font-semibold leading-tight">{cond}</span>
            </button>
          );
        })}
      </div>

      {/* Loot Detail */}
      {guide && meta && (
        <div style={{ borderColor: meta.color + "55" }} className="rounded-2xl border-2 bg-gray-900 overflow-hidden">
          <div style={{ backgroundColor: meta.color + "18" }} className="px-5 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{meta.icon}</span>
              <div>
                <h3 style={{ color: meta.color }} className="font-bold text-base">{selected}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{guide.tip}</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 flex flex-col gap-4">
            {/* Loot List */}
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">🎁 Drop-Tabelle</p>
              <div className="flex flex-col gap-2">
                {guide.loot.map((l, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }}></span>
                      <span className="text-white text-sm">{l.item}</span>
                    </div>
                    <span style={{ color: l.color, borderColor: l.color + "44", backgroundColor: l.color + "11" }}
                      className="text-xs font-semibold px-2 py-0.5 rounded-full border">{l.rarity}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Strategie-Tipp */}
            <div className="bg-gray-800 rounded-xl px-4 py-3">
              <p className="text-white text-sm">{guide.tip2}</p>
            </div>
          </div>
        </div>
      )}

      {!selected && (
        <div className="text-center py-8 text-gray-600">
          <p className="text-3xl mb-2">🎁</p>
          <p className="text-sm">Condition auswählen für Loot-Details</p>
        </div>
      )}
    </div>
  );
}

// ── Loadout-Planer ──────────────────────────────────────────────────────────
const LOADOUT_SLOTS = [
  { id: "primary",   label: "Primärwaffe",     icon: "🔫" },
  { id: "secondary", label: "Sekundärwaffe",   icon: "🔫" },
  { id: "melee",     label: "Nahkampf",        icon: "🗡️" },
  { id: "helmet",   label: "Helm",            icon: "⛑️" },
  { id: "vest",     label: "Weste",           icon: "🧯" },
  { id: "backpack", label: "Rucksack",        icon: "🎒" },
  { id: "med",      label: "Medizin",         icon: "💉" },
  { id: "gadget",   label: "Gadget",          icon: "🔧" },
];

const LOADOUT_SUGGESTIONS = {
  "Night Raid":           { primary: "Schalldämpfer-Gewehr", secondary: "Pistole", melee: "Messer", helmet: "Nachtsicht-Helm", vest: "Leichte Weste", backpack: "Stealth-Pack", med: "Kleines Medikit", gadget: "Rauchgranate" },
  "Harvester":            { primary: "Schweres MG", secondary: "Shotgun", melee: "Beil", helmet: "Stahlhelm", vest: "Schwere Weste", backpack: "Großer Rucksack", med: "Großes Medikit", gadget: "EMP-Granate" },
  "Matriarch":            { primary: "Scharfschützengewehr", secondary: "SMG", melee: "Machete", helmet: "Verbundhelm", vest: "Taktische Weste", backpack: "Combat-Pack", med: "Erste-Hilfe-Set", gadget: "Claymore" },
  "Electromagnetic Storm":{ primary: "Mechanisches Gewehr", secondary: "Revolver", melee: "Hammer", helmet: "Isolierhelm", vest: "Isolierende Weste", backpack: "Standard-Pack", med: "Mittelgroßes Medikit", gadget: "Blendgranate" },
  "Hidden Bunker":        { primary: "Sturmgewehr", secondary: "Shotgun", melee: "Messer", helmet: "Taktikhelm", vest: "Schwere Weste", backpack: "Großer Rucksack", med: "Großes Medikit", gadget: "Sprengladung" },
  "default":              { primary: "Sturmgewehr", secondary: "Pistole", melee: "Messer", helmet: "Standardhelm", vest: "Mittlere Weste", backpack: "Standard-Pack", med: "Mittelgroßes Medikit", gadget: "Granate" },
};

function useLoadouts() {
  const [loadouts, setLoadouts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("arc_loadouts") || "{}"); }
    catch { return {}; }
  });
  const save = (name, data) => {
    const next = { ...loadouts, [name]: data };
    setLoadouts(next);
    localStorage.setItem("arc_loadouts", JSON.stringify(next));
  };
  const remove = (name) => {
    const next = { ...loadouts };
    delete next[name];
    setLoadouts(next);
    localStorage.setItem("arc_loadouts", JSON.stringify(next));
  };
  return [loadouts, save, remove];
}

function LoadoutView() {
  const [loadouts, saveLoadout, removeLoadout] = useLoadouts();
  const [slots, setSlots] = useState({ primary: "", secondary: "", melee: "", helmet: "", vest: "", backpack: "", med: "", gadget: "" });
  const [loadoutName, setLoadoutName] = useState("");
  const [selectedCond, setSelectedCond] = useState("");
  const [activeLoadout, setActiveLoadout] = useState(null);
  const [saved, setSaved] = useState(false);
  const [mapFilter, setMapFilter] = useState("all");
  const [filter, setFilter] = useState("all");
    

  const applySuggestion = (cond) => {
    const s = LOADOUT_SUGGESTIONS[cond] || LOADOUT_SUGGESTIONS["default"];
    setSlots(s);
    setSelectedCond(cond);
  };

  const handleSave = () => {
    if (!loadoutName.trim()) return;
    saveLoadout(loadoutName.trim(), { slots, condition: selectedCond });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLoad = (name) => {
    const l = loadouts[name];
    setSlots(l.slots);
    setSelectedCond(l.condition || "");
    setLoadoutName(name);
    setActiveLoadout(name);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-500 text-xs">Plane deine Ausrüstung für die nächste Session. Wähle eine Condition für einen Vorschlag oder füll alles manuell aus. Loadouts werden lokal gespeichert.</p>

      {/* Condition-Vorschlag */}
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">⚡ Vorschlag für Condition</p>
        <div className="flex flex-col gap-2">
            {/* Karten-Chips */}
            <div className="flex gap-1.5 flex-wrap">
              {["all",...Object.keys(MAP_COLORS)].map(m => { const col=MAP_COLORS[m]; const isAll=m==="all"; const active=mapFilter===m; return(<button key={m} onClick={()=>setMapFilter(m)} style={active&&!isAll?{borderColor:col,backgroundColor:col+"22",color:col}:{}} className={`px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-all whitespace-nowrap ${active?(isAll?"border-orange-500 bg-orange-500/15 text-orange-400":""):"border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300"}`}>{isAll?"🗺️ Alle Karten":m}</button>); })}
            </div>
            {/* Condition-Chips */}
            <div className="flex gap-1.5 flex-wrap">
              {["all",...Object.keys(CONDITION_META)].map(c => { const meta=getMeta(c); const isAll=c==="all"; const active=filter===c; return(<button key={c} onClick={()=>setFilter(c)} style={active&&!isAll?{borderColor:meta.color,backgroundColor:meta.color+"22",color:meta.color}:{}} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-all whitespace-nowrap ${active?(isAll?"border-orange-500 bg-orange-500/15 text-orange-400":""):"border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300"}`}>{!isAll&&<span>{meta.icon}</span>}{isAll?"⚡ Alle":c}</button>); })}
            </div>
        </div>
      </div>

      {/* Slots */}
      <div className="grid grid-cols-2 gap-2">
        {LOADOUT_SLOTS.map(slot => (
          <div key={slot.id} className="bg-gray-900 rounded-xl px-3 py-2.5 border border-gray-800">
            <label className="text-gray-500 text-xs flex items-center gap-1 mb-1">
              <span>{slot.icon}</span>{slot.label}
            </label>
            <input
              value={slots[slot.id] || ""}
              onChange={e => setSlots(s => ({ ...s, [slot.id]: e.target.value }))}
              placeholder={`${slot.label} eintragen…`}
              className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-700 border-b border-gray-700 focus:border-orange-500 pb-0.5 transition-colors"
            />
          </div>
        ))}
      </div>

      {/* Speichern */}
      <div className="flex gap-2 items-center">
        <input
          value={loadoutName}
          onChange={e => setLoadoutName(e.target.value)}
          placeholder="Loadout-Name…"
          className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500 placeholder-gray-600"
        />
        <button onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            saved ? "bg-green-600 text-white" : "bg-orange-500 hover:bg-orange-400 text-white"
          }`}>
          {saved ? "✅ Gespeichert" : "💾 Speichern"}
        </button>
      </div>

      {/* Gespeicherte Loadouts */}
      {Object.keys(loadouts).length > 0 && (
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">📂 Gespeicherte Loadouts</p>
          <div className="flex flex-col gap-2">
            {Object.entries(loadouts).map(([name, data]) => {
              const isActive = activeLoadout === name;
              const condMeta = data.condition ? getMeta(data.condition) : null;
              return (
                <div key={name} style={{ borderColor: isActive ? "#f97316" : "transparent" }}
                  className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3 border-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{name}</p>
                    {condMeta && (
                      <span style={{ color: condMeta.color }} className="text-xs">{condMeta.icon} {data.condition}</span>
                    )}
                  </div>
                  <button onClick={() => handleLoad(name)}
                    className="text-xs text-orange-400 hover:text-orange-300 font-semibold px-2 py-1 rounded-lg hover:bg-orange-400/10 transition-colors">
                    Laden
                  </button>
                  <button onClick={() => { removeLoadout(name); if (activeLoadout === name) setActiveLoadout(null); }}
                    className="text-xs text-gray-600 hover:text-red-400 font-semibold px-2 py-1 rounded-lg hover:bg-red-400/10 transition-colors">
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Session-Planer ──────────────────────────────────────────────────────────
function SessionPlannerView({  favs, toggleFav, onToast }) {
  const [hours, setHours] = useState(2);
  const [startNow, setStartNow] = useState(true);
  const [customStart, setCustomStart] = useState("");

  const SCRAPED_DATA = useLiveDataCtx();
    // Build a flat timeline: active + upcoming, each with absolute start offset in minutes
  const timeline = [
    ...SCRAPED_DATA.active.map(a => ({ ...a, startMin: 0, endMin: 60 })),
    ...SCRAPED_DATA.upcoming.map(u => ({
      ...u,
      startMin: u.countdownH * 60 + u.countdownM,
      endMin:   u.countdownH * 60 + u.countdownM + 60,
    })),
  ];

  // Parse custom start time (HH:MM) into offset from now in minutes
  const getStartOffset = () => {
    if (startNow) return 0;
    if (!customStart) return 0;
    const [h, m] = customStart.split(":").map(Number);
    const now = new Date();
    const start = new Date();
    start.setHours(h, m, 0, 0);
    let diff = (start - now) / 60000;
    if (diff < 0) diff += 24 * 60;
    return Math.round(diff);
  };

  const startOffset = getStartOffset();
  const endOffset = startOffset + hours * 60;

  const matchingConditions = timeline.filter(item =>
    item.startMin < endOffset && item.endMin > startOffset
  ).sort((a, b) => a.startMin - b.startMin);

  // Deduplicate by condition+map
  const seen = new Set();
  const unique = matchingConditions.filter(item => {
    const key = `${item.condition}|${item.map}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sessionDurationLabel = `${hours}h`;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-500 text-xs">Gib an wie lange du spielst — die App zeigt dir welche Conditions in deinem Zeitfenster aktiv sein werden.</p>

      {/* Controls */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex flex-col gap-4">
        {/* Session-Dauer */}
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">⏱️ Session-Dauer</p>
          <div className="flex items-center gap-3">
            <input type="range" min="1" max="8" step="1" value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="flex-1 accent-orange-500" />
            <span className="text-orange-400 font-bold text-lg w-12 text-center">{sessionDurationLabel}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-xs mt-1">
            <span>1h</span><span>2h</span><span>3h</span><span>4h</span><span>5h</span><span>6h</span><span>7h</span><span>8h</span>
          </div>
        </div>

        {/* Startzeit */}
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">🕒 Startzeit</p>
          <div className="flex gap-2">
            <button onClick={() => setStartNow(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border-2 ${
                startNow ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
              }`}>
              Jetzt
            </button>
            <button onClick={() => setStartNow(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border-2 ${
                !startNow ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
              }`}>
              Uhrzeit wählen
            </button>
          </div>
          {!startNow && (
            <input type="time" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="mt-2 w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500" />
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-orange-400 text-sm">🎮</span>
          <h3 className="text-white font-bold text-sm">
            {unique.length} Condition{unique.length !== 1 ? "s" : ""} in deiner {sessionDurationLabel}-Session
          </h3>
        </div>

        {unique.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p className="text-3xl mb-2">😴</p>
            <p className="text-sm">Keine Conditions in diesem Zeitfenster.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {unique.map((item, i) => {
              const meta = getMeta(item.condition);
              const mapColor = MAP_COLORS[item.map] || "#6b7280";
              const isActive = item.startMin === 0;
              const startsIn = item.startMin - startOffset;
              return (
                <div key={i} style={{ borderColor: isActive ? meta.color + "88" : "transparent" }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${
                    isActive ? "bg-green-950/30" : "bg-gray-900"
                  }`}>
                  <StarButton condition={item.condition} favs={favs} toggle={toggleFav} onToast={onToast} />
                  <span className="text-xl w-8 text-center">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: meta.color }} className="font-semibold text-sm truncate">{item.condition}</p>
                    <span style={{ color: mapColor }} className="text-xs">{item.map}</span>
                  </div>
                  <div className="text-right shrink-0">
                    {isActive ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
                        Jetzt aktiv
                      </span>
                    ) : (
                      <>
                        <p className="text-white text-xs font-mono">{item.date} {item.timeRange}</p>
                        <p className="text-gray-500 text-xs">in {Math.floor(startsIn / 60) > 0 ? `${Math.floor(startsIn / 60)}h ` : ""}{startsIn % 60}m</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Highlight Favs */}
        {favs.length > 0 && unique.some(u => favs.includes(u.condition)) && (
          <div className="mt-4 bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-3">
            <p className="text-yellow-400 text-xs font-bold mb-1">⭐ Deine Favoriten in dieser Session:</p>
            <p className="text-white text-sm">
              {unique.filter(u => favs.includes(u.condition)).map(u => u.condition).join(" · ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Squad-Koordination ───────────────────────────────────────────────────────
function SquadView() {
    const SCRAPED_DATA = useLiveDataCtx();
  const [selectedCond, setSelectedCond] = useState("");
  const [selectedMap, setSelectedMap]   = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [note, setNote]                 = useState("");
  const [copied, setCopied]             = useState(false);
  const [customTime, setCustomTime]     = useState("");
  const [useCustom, setUseCustom]       = useState(false);

  // Pre-fill from upcoming conditions
  const quickSlots = [
    ...SCRAPED_DATA.active.map(a  => ({ ...a, label: `Jetzt aktiv` })),
    ...SCRAPED_DATA.upcoming.slice(0, 6).map(u => ({ ...u, label: `in ${u.countdownH > 0 ? u.countdownH + "h " : ""}${u.countdownM}m` })),
  ];

  const applyQuick = (item) => {
    setSelectedCond(item.condition);
    setSelectedMap(item.map);
    setSelectedTime(item.timeRange);
    setUseCustom(false);
  };

  const timeDisplay = useCustom ? customTime : selectedTime;
  const meta = selectedCond ? getMeta(selectedCond) : null;
  const mapColor = selectedMap ? (MAP_COLORS[selectedMap] || "#6b7280") : "#6b7280";

  const buildLink = () => {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    if (selectedCond) params.set("cond", selectedCond);
    if (selectedMap)  params.set("map",  selectedMap);
    if (timeDisplay)  params.set("time", timeDisplay);
    if (note.trim())  params.set("note", note.trim());
    return `${base}?${params.toString()}`;
  };

  const buildText = () => {
    const parts = [];
    if (selectedCond) parts.push(`⚔️ Condition: ${selectedCond}`);
    if (selectedMap)  parts.push(`📍 Map: ${selectedMap}`);
    if (timeDisplay)  parts.push(`🕒 Zeit: ${timeDisplay}`);
    if (note.trim())  parts.push(`💬 ${note.trim()}`);
    parts.push(`🔗 ${buildLink()}`);
    return parts.join("\n");
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-500 text-xs">Erstelle einen Squad-Treffpunkt und teile ihn per Link oder Text mit deinem Team.</p>

      {/* Quick-Pick aus echten Conditions */}
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">⚡ Schnellauswahl aus Zeitplan</p>
        <div className="flex flex-col gap-1.5">
          {quickSlots.map((item, i) => {
            const m = getMeta(item.condition);
            const isSelected = selectedCond === item.condition && selectedMap === item.map && !useCustom;
            return (
              <button key={i} onClick={() => applyQuick(item)}
                style={{ borderColor: isSelected ? m.color : "transparent" }}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-left transition-all ${
                  isSelected ? "bg-gray-800" : "bg-gray-900 hover:bg-gray-800"
                }`}>
                <span className="text-lg">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <span style={{ color: m.color }} className="text-sm font-semibold">{item.condition}</span>
                  <span style={{ color: MAP_COLORS[item.map] || "#6b7280" }} className="text-xs ml-2">{item.map}</span>
                </div>
                <span className="text-gray-500 text-xs font-mono shrink-0">{item.timeRange}</span>
                <span className="text-gray-600 text-xs shrink-0">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manuelle Eingabe */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex flex-col gap-3">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">✏️ Manuell anpassen</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-gray-600 text-xs mb-1 block">Condition</label>
            <select value={selectedCond} onChange={e => setSelectedCond(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500">
              <option value="">-- wählen --</option>
              {Object.keys(CONDITION_META).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-600 text-xs mb-1 block">Karte</label>
            <select value={selectedMap} onChange={e => setSelectedMap(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500">
              <option value="">-- wählen --</option>
              {Object.keys(MAP_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-gray-600 text-xs mb-1 block">Uhrzeit</label>
            <input type="time" value={customTime} onChange={e => { setCustomTime(e.target.value); setUseCustom(true); }}
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500" />
          </div>
          <div className="flex-1">
            <label className="text-gray-600 text-xs mb-1 block">Notiz (optional)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="z.B. Treffpunkt Turm…"
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500 placeholder-gray-700" />
          </div>
        </div>
      </div>

      {/* Vorschau */}
      {selectedCond && (
        <div style={{ borderColor: meta?.color + "55" }} className="rounded-2xl border-2 bg-gray-900 overflow-hidden">
          <div style={{ backgroundColor: meta?.color + "18" }} className="px-5 py-4 border-b border-gray-800">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">📝 Squad-Nachricht Vorschau</p>
            <div className="font-mono text-xs text-gray-300 whitespace-pre-line leading-relaxed">{buildText()}</div>
          </div>
          <div className="px-5 py-3 flex gap-2">
            <button onClick={() => handleCopy(buildText())}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                copied ? "bg-green-600 text-white" : "bg-orange-500 hover:bg-orange-400 text-white"
              }`}>
              {copied ? "✅ Kopiert!" : "📋 Text kopieren"}
            </button>
            <button onClick={() => handleCopy(buildLink())}
              className="flex-1 py-2 rounded-lg text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
              🔗 Link kopieren
            </button>
          </div>
        </div>
      )}

      {!selectedCond && (
        <div className="text-center py-6 text-gray-600">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm">Condition auswählen um einen Squad-Link zu erstellen</p>
        </div>
      )}
    </div>
  );
}

// ── Discord Webhook ─────────────────────────────────────────────────────────
function useDiscordSettings() {
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("arc_discord") || "{}"); }
    catch { return {}; }
  });
  const save = (data) => {
    setSettings(data);
    localStorage.setItem("arc_discord", JSON.stringify(data));
  };
  return [settings, save];
}

function DiscordView() {
  const [settings, saveSettings] = useDiscordSettings();
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl || "");
  const [watchedConds, setWatchedConds] = useState(settings.watchedConds || []);
  const [minutesBefore, setMinutesBefore] = useState(settings.minutesBefore || 15);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState("");
  const [sending, setSending] = useState(false);

  const toggleCond = (cond) => {
    setWatchedConds(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const handleSave = () => {
    saveSettings({ webhookUrl, watchedConds, minutesBefore });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const buildDiscordEmbed = (item, type = "test") => {
    const meta = getMeta(item?.condition || "Hidden Bunker");
    const mapColor = MAP_COLORS[item?.map || "Spaceport"] || "#6b7280";
    const colorInt = parseInt((meta.color || "#f97316").replace("#", ""), 16);
    return {
      username: "ARC Twix",
      avatar_url: "https://arcraiders.com/favicon.ico",
      embeds: [{
        title: `${meta.icon} ${type === "test" ? "[TEST] " : ""}${item?.condition || "Hidden Bunker"} startet bald!`,
        description: type === "test"
          ? "Dies ist eine Test-Nachricht von ARC Twix."
          : `Die Condition startet in **${minutesBefore} Minuten**. Bereite dich vor!`,
        color: colorInt,
        fields: [
          { name: "📍 Karte",   value: item?.map || "Spaceport",          inline: true },
          { name: "🕒 Uhrzeit", value: item?.timeRange || "11:00 – 12:00", inline: true },
        ],
        footer: { text: "ARC Twix v2.4 · arcraiders.com" },
        timestamp: new Date().toISOString(),
      }],
    };
  };

  const sendToDiscord = async (payload) => {
    if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
      setTestStatus("❌ Ungültige Webhook-URL");
      return false;
    }
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleTest = async () => {
    setSending(true);
    setTestStatus("");
    const payload = buildDiscordEmbed(null, "test");
    const ok = await sendToDiscord(payload);
    setTestStatus(ok ? "✅ Test-Nachricht gesendet!" : "❌ Fehler — URL prüfen");
    setSending(false);
  };

  const isValidUrl = webhookUrl.startsWith("https://discord.com/api/webhooks/");

  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-500 text-xs">Verbinde ARC Twix mit deinem Discord-Server. Automatische Nachrichten wenn deine Conditions bald starten.</p>

      {/* Setup-Anleitung */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-4 py-3">
        <p className="text-indigo-400 text-xs font-bold mb-2">👋 Webhook einrichten</p>
        <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
          <li>Discord → Server-Einstellungen → Integrationen → Webhooks</li>
          <li>"Neuer Webhook" → Kanal wählen → "Webhook-URL kopieren"</li>
          <li>URL hier einfügen und speichern</li>
        </ol>
      </div>

      {/* Webhook URL */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">🔗 Webhook URL</label>
        <input
          value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          className={`w-full bg-gray-900 border rounded-lg px-3 py-2 text-sm text-white outline-none placeholder-gray-600 transition-colors ${
            webhookUrl && !isValidUrl ? "border-red-500" : webhookUrl && isValidUrl ? "border-green-500" : "border-gray-700 focus:border-orange-500"
          }`}
        />
        {webhookUrl && !isValidUrl && (
          <p className="text-red-400 text-xs">❌ URL muss mit https://discord.com/api/webhooks/ beginnen</p>
        )}
        {webhookUrl && isValidUrl && (
          <p className="text-green-400 text-xs">✅ Gültige Webhook-URL</p>
        )}
      </div>

      {/* Minuten vor Start */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 block">⏰ Benachrichtigung vor Start</label>
        <div className="flex items-center gap-3">
          <input type="range" min="5" max="60" step="5" value={minutesBefore}
            onChange={e => setMinutesBefore(Number(e.target.value))}
            className="flex-1 accent-indigo-500" />
          <span className="text-indigo-400 font-bold w-16 text-center">{minutesBefore} Min</span>
        </div>
        <div className="flex justify-between text-gray-600 text-xs mt-1">
          <span>5 Min</span><span>30 Min</span><span>60 Min</span>
        </div>
      </div>

      {/* Conditions auswählen */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 block">⚡ Conditions überwachen</label>
        <p className="text-gray-600 text-xs mb-2">Nur für ausgewählte Conditions wird eine Discord-Nachricht gesendet.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.keys(CONDITION_META).map(cond => {
            const m = getMeta(cond);
            const isWatched = watchedConds.includes(cond);
            return (
              <button key={cond} onClick={() => toggleCond(cond)}
                style={{ borderColor: isWatched ? m.color : "transparent", backgroundColor: isWatched ? m.color + "18" : "" }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 bg-gray-900 hover:bg-gray-800 transition-all text-left">
                <span className="text-base">{m.icon}</span>
                <span style={{ color: isWatched ? m.color : "#6b7280" }} className="text-xs font-semibold leading-tight">{cond}</span>
                {isWatched && <span className="ml-auto text-xs">✓</span>}
              </button>
            );
          })}
        </div>
        <button onClick={() => setWatchedConds(watchedConds.length === Object.keys(CONDITION_META).length ? [] : Object.keys(CONDITION_META))}
          className="mt-2 text-xs text-gray-500 hover:text-gray-300 underline">
          {watchedConds.length === Object.keys(CONDITION_META).length ? "Alle abwählen" : "Alle auswählen"}
        </button>
      </div>

      {/* Aktions-Buttons */}
      <div className="flex gap-2">
        <button onClick={handleSave}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            saved ? "bg-green-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
          }`}>
          {saved ? "✅ Gespeichert" : "💾 Einstellungen speichern"}
        </button>
        <button onClick={handleTest} disabled={!isValidUrl || sending}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {sending ? "⏳ Sende..." : "🧪 Test senden"}
        </button>
      </div>

      {testStatus && (
        <p className={`text-sm text-center font-semibold ${
          testStatus.startsWith("✅") ? "text-green-400" : "text-red-400"
        }`}>{testStatus}</p>
      )}

      {/* Status-Übersicht */}
      {settings.webhookUrl && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-gray-400 text-xs font-bold mb-2">📊 Aktuelle Konfiguration</p>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Webhook</span>
              <span className="text-green-400">✅ Verbunden</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Benachrichtigung</span>
              <span className="text-white">{settings.minutesBefore || 15} Min vor Start</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Überwachte Conditions</span>
              <span className="text-white">{(settings.watchedConds || []).length} ausgewählt</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Spieler-Notizen ────────────────────────────────────────────────────────
const NOTE_TAGS = ["Allgemein", "Strategie", "Loot", "Bug", "Squad", "Map"];

function useNotes() {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("arc_notes") || "[]"); }
    catch { return []; }
  });
  const add = (note) => {
    const next = [{ ...note, id: Date.now(), createdAt: new Date().toLocaleString("de-DE") }, ...notes];
    setNotes(next);
    localStorage.setItem("arc_notes", JSON.stringify(next));
  };
  const remove = (id) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    localStorage.setItem("arc_notes", JSON.stringify(next));
  };
  const update = (id, text) => {
    const next = notes.map(n => n.id === id ? { ...n, text, updatedAt: new Date().toLocaleString("de-DE") } : n);
    setNotes(next);
    localStorage.setItem("arc_notes", JSON.stringify(next));
  };
  return [notes, add, remove, update];
}

function NotesView() {
  const [notes, addNote, removeNote, updateNote] = useNotes();
  const [text, setText] = useState("");
  const [tag, setTag] = useState("Allgemein");
  const [linkedCond, setLinkedCond] = useState("");
  const [linkedMap, setLinkedMap] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [search, setSearch] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    addNote({ text: text.trim(), tag, condition: linkedCond, map: linkedMap });
    setText("");
    setLinkedCond("");
    setLinkedMap("");
  };

  const handleEdit = (note) => {
    setEditId(note.id);
    setEditText(note.text);
  };

  const handleEditSave = (id) => {
    updateNote(id, editText);
    setEditId(null);
  };

  const TAG_COLORS = {
    "Allgemein": "#6b7280",
    "Strategie": "#f97316",
    "Loot":      "#22c55e",
    "Bug":       "#ef4444",
    "Squad":     "#8b5cf6",
    "Map":       "#3b82f6",
  };

  const filtered = notes.filter(n =>
    (filterTag === "all" || n.tag === filterTag) &&
    (search === "" || n.text.toLowerCase().includes(search.toLowerCase()) ||
      (n.condition || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-500 text-xs">Private Notizen zu Maps, Conditions und Strategien. Alles lokal gespeichert.</p>

      {/* Neue Notiz */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex flex-col gap-3">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">✏️ Neue Notiz</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Notiz eingeben… (z.B. 'Bei Matriarch immer links flanken')"
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500 placeholder-gray-600 resize-none"
        />
        <div className="grid grid-cols-2 gap-2">
          {/* Tag */}
          <div>
            <label className="text-gray-600 text-xs mb-1 block">Kategorie</label>
            <select value={tag} onChange={e => setTag(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500">
              {NOTE_TAGS.map(tagName => <option key={tagName} value={tagName}>{tagName}</option>)}
            </select>
          </div>
          {/* Condition */}
          <div>
            <label className="text-gray-600 text-xs mb-1 block">Condition (optional)</label>
            <select value={linkedCond} onChange={e => setLinkedCond(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500">
              <option value="">— keine —</option>
              {Object.keys(CONDITION_META).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Map */}
          <div>
            <label className="text-gray-600 text-xs mb-1 block">Karte (optional)</label>
            <select value={linkedMap} onChange={e => setLinkedMap(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500">
              <option value="">— keine —</option>
              {Object.keys(MAP_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleAdd} disabled={!text.trim()}
              className="w-full py-2 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              + Hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Suche */}
      {notes.length > 0 && (
        <div className="flex flex-col gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Notizen durchsuchen…"
            className="flex-1 min-w-0 bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500 placeholder-gray-600" />
          <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500">
            <option value="all">Alle Kategorien</option>
            {NOTE_TAGS.map(tagName => <option key={tagName} value={tagName}>{tagName}</option>)}
          </select>
        </div>
      )}

      {/* Notizen-Liste */}
      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm">{notes.length === 0 ? "Noch keine Notizen. Erste Notiz oben erstellen!" : "Keine Notizen für diesen Filter."}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map(note => {
          const tagColor = TAG_COLORS[note.tag] || "#6b7280";
          const condMeta = note.condition ? getMeta(note.condition) : null;
          const mapColor = note.map ? (MAP_COLORS[note.map] || "#6b7280") : null;
          const isEditing = editId === note.id;
          return (
            <div key={note.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 flex-1">
                  <span style={{ backgroundColor: tagColor + "22", color: tagColor, borderColor: tagColor + "44" }}
                    className="text-xs font-semibold px-2 py-0.5 rounded-full border">{note.tag}</span>
                  {condMeta && (
                    <span style={{ backgroundColor: condMeta.color + "18", color: condMeta.color }}
                      className="text-xs px-2 py-0.5 rounded-full">{condMeta.icon} {note.condition}</span>
                  )}
                  {mapColor && (
                    <span style={{ color: mapColor }} className="text-xs px-2 py-0.5">📍 {note.map}</span>
                  )}
                </div>
                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => isEditing ? handleEditSave(note.id) : handleEdit(note)}
                    className="text-xs text-gray-500 hover:text-orange-400 px-1.5 py-0.5 rounded transition-colors">
                    {isEditing ? "✅" : "✏️"}
                  </button>
                  <button onClick={() => removeNote(note.id)}
                    className="text-xs text-gray-600 hover:text-red-400 px-1.5 py-0.5 rounded transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
              {isEditing ? (
                <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={2} autoFocus
                  className="w-full bg-gray-800 border border-orange-500 text-white text-sm rounded-lg px-3 py-2 outline-none resize-none" />
              ) : (
                <p className="text-gray-300 text-sm leading-relaxed">{note.text}</p>
              )}
              <p className="text-gray-700 text-xs">
                {note.updatedAt ? `Bearbeitet: ${note.updatedAt}` : `Erstellt: ${note.createdAt}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Condition-Häufigkeitsanalyse ──────────────────────────────────────────────
function StatsView() {
  const allData = [...HISTORY_DATA, ...SCRAPED_DATA.active, ...SCRAPED_DATA.upcoming];

  // Condition frequency
  const condCount = {};
  allData.forEach(item => {
    condCount[item.condition] = (condCount[item.condition] || 0) + 1;
  });
  const condSorted = Object.entries(condCount).sort((a, b) => b[1] - a[1]);
  const maxCondCount = condSorted[0]?.[1] || 1;

  // Map frequency
  const mapCount = {};
  allData.forEach(item => {
    mapCount[item.map] = (mapCount[item.map] || 0) + 1;
  });
  const mapSorted = Object.entries(mapCount).sort((a, b) => b[1] - a[1]);
  const maxMapCount = mapSorted[0]?.[1] || 1;

  // Peak hours from history
  const hourCount = {};
  HISTORY_DATA.forEach(item => {
    const hour = item.timeRange.split(":")[0];
    hourCount[hour] = (hourCount[hour] || 0) + 1;
  });
  const hourSorted = Object.entries(hourCount).sort((a, b) => Number(a[0]) - Number(b[0]));
  const maxHourCount = Math.max(...Object.values(hourCount), 1);

  // Today vs Yesterday
  const todayCount = HISTORY_DATA.filter(h => h.date === "Heute").length;
  const yesterdayCount = HISTORY_DATA.filter(h => h.date === "Gestern").length;
  const totalTracked = allData.length;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-gray-500 text-xs">Analyse der Condition-Häufigkeit basierend auf Verlauf (heute & gestern) plus aktuelle Daten.</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Getrackte Events", value: totalTracked, color: "#f97316" },
          { label: "Heute gelaufen",   value: todayCount,   color: "#22c55e" },
          { label: "Gestern",          value: yesterdayCount, color: "#3b82f6" },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p style={{ color: s.color }} className="text-2xl font-bold">{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Condition Frequency */}
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">⚡ Häufigste Conditions</p>
        <div className="flex flex-col gap-2">
          {condSorted.map(([cond, count], i) => {
            const meta = getMeta(cond);
            const pct = Math.round((count / maxCondCount) * 100);
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            return (
              <div key={cond} className="flex items-center gap-3">
                <span className="text-xs w-6 text-center text-gray-500 shrink-0">{medal}</span>
                <span className="text-base shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span style={{ color: meta.color }} className="text-xs font-semibold truncate">{cond}</span>
                    <span className="text-gray-500 text-xs ml-2 shrink-0">{count}x</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div style={{ width: `${pct}%`, backgroundColor: meta.color }}
                      className="h-1.5 rounded-full transition-all duration-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Frequency */}
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">🗺️ Aktivste Karten</p>
        <div className="flex flex-col gap-2">
          {mapSorted.map(([map, count], i) => {
            const color = MAP_COLORS[map] || "#6b7280";
            const info  = MAP_INFO[map] || { icon: "🗺️" };
            const pct   = Math.round((count / maxMapCount) * 100);
            return (
              <div key={map} className="flex items-center gap-3">
                <span className="text-base shrink-0">{info.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span style={{ color }} className="text-xs font-semibold truncate">{map}</span>
                    <span className="text-gray-500 text-xs ml-2 shrink-0">{count} Events</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div style={{ width: `${pct}%`, backgroundColor: color }}
                      className="h-1.5 rounded-full transition-all duration-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Peak Hours */}
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">🕒 Aktivste Stunden (Verlauf)</p>
        <div className="flex items-end gap-1 h-20">
          {hourSorted.map(([hour, count]) => {
            const pct = Math.round((count / maxHourCount) * 100);
            return (
              <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative" style={{ height: "56px" }}>
                  <div
                    style={{ height: `${pct}%`, backgroundColor: "#f97316" }}
                    className="absolute bottom-0 left-0 right-0 rounded-t transition-all duration-500 opacity-80"
                  />
                </div>
                <span className="text-gray-600 text-xs">{hour}h</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fun fact */}
      {condSorted.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
          <p className="text-orange-400 text-xs font-bold mb-1">💡 Trend</p>
          <p className="text-gray-300 text-sm">
            <span style={{ color: getMeta(condSorted[0][0]).color }} className="font-semibold">{condSorted[0][0]}</span> ist die häufigste Condition mit <span className="text-white font-bold">{condSorted[0][1]} Erscheinungen</span> im Tracking-Zeitraum.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Alarm-Timer System ───────────────────────────────────────────────────────
// Zeigt ein Popup-Modal wenn eine Favoriten-Condition in X Minuten startet.
// Nutzt notifSettings.minutesBefore als Schwellwert.

function AlarmPopup({ alarm, onDismiss, soundEnabled }) {
  const meta = getMeta(alarm.condition);
  const mapColor = MAP_COLORS[alarm.map] || "#6b7280";
  const [secs, setSecs] = useState(alarm.secsUntil);

  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const countdownStr = h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;

  // Pulsing ring animation
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onDismiss}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: "#111827",
          border: `2px solid ${meta.color}`,
          borderRadius: 24,
          padding: "28px 28px 20px",
          maxWidth: 360,
          width: "90%",
          boxShadow: `0 0 60px ${meta.color}44, 0 8px 40px #000a`,
          animation: "alarmPop 0.3s cubic-bezier(.34,1.56,.64,1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow bg */}
        <div style={{ position: "absolute", inset: 0, backgroundColor: meta.color, opacity: 0.06, borderRadius: 24, pointerEvents: "none" }} />

        {/* Pulsing ring */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", border: `2px solid ${meta.color}`, opacity: 0.2, animation: "alarmRing 1.5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: -60, right: -60, width: 160, height: 160, borderRadius: "50%", border: `1px solid ${meta.color}`, opacity: 0.1, animation: "alarmRing 1.5s ease-in-out infinite 0.3s" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 40, lineHeight: 1 }}>{meta.icon}</span>
            <div>
              <p style={{ color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>⏰ Alarm</p>
              <p style={{ color: meta.color, fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>{alarm.condition}</p>
            </div>
          </div>
          <button onClick={onDismiss} style={{ color: "#4b5563", background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "2px 6px", borderRadius: 8 }}>×</button>
        </div>

        {/* Countdown */}
        <div style={{ backgroundColor: "#1f2937", borderRadius: 16, padding: "14px 20px", marginBottom: 16, textAlign: "center", position: "relative" }}>
          <p style={{ color: "#6b7280", fontSize: 11, marginBottom: 4 }}>Startet in</p>
          <p style={{ color: secs < 120 ? "#ef4444" : meta.color, fontSize: 32, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.05em", lineHeight: 1 }}>{countdownStr}</p>
          {secs < 120 && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4, fontWeight: 600 }}>🚨 Gleich!</p>}
        </div>

        {/* Map + Time */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, position: "relative" }}>
          <span style={{ backgroundColor: mapColor + "22", color: mapColor, border: `1px solid ${mapColor}55`, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
            📍 {alarm.map}
          </span>
          <span style={{ color: "#9ca3af", fontSize: 12, fontFamily: "monospace" }}>{alarm.timeRange}</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          <button
            onClick={() => { if (soundEnabled) playAlarmSound("alert"); }}
            style={{ flex: 1, padding: "10px", borderRadius: 12, border: "2px solid #374151", background: "#1f2937", color: "#d1d5db", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            🔔 Sound
          </button>
          <button
            onClick={onDismiss}
            style={{ flex: 2, padding: "10px", borderRadius: 12, border: "none", background: meta.color, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            ✓ Verstanden!
          </button>
        </div>

        <style>{`
          @keyframes alarmPop { from { opacity:0; transform: scale(0.85); } to { opacity:1; transform: scale(1); } }
          @keyframes alarmRing { 0%,100% { transform: scale(1); opacity:0.2; } 50% { transform: scale(1.15); opacity:0.35; } }
        `}</style>
      </div>
    </div>
  );
}

function useAlarmTimer({ favs, liveData, notifSettings, soundEnabled, addToast }) {
  const [alarm, setAlarm] = useState(null);
  const firedRef = useRef(new Set());

  useEffect(() => {
    const check = () => {
      if (!notifSettings.enabled && !notifSettings.alarmPopup) return; // respect settings
      const threshold = (notifSettings.minutesBefore || 15) * 60; // seconds
      const upcoming = liveData.upcoming;

      for (const item of upcoming) {
        const conditionOk = notifSettings.favsOnly ? favs.includes(item.condition) : true;
        if (!conditionOk) continue;

        const secsUntil = item.countdownH * 3600 + item.countdownM * 60;
        const key = `${item.condition}|${item.date}|${item.timeRange}`;

        if (secsUntil <= threshold && secsUntil > 0 && !firedRef.current.has(key)) {
          firedRef.current.add(key);
          setAlarm({ ...item, secsUntil });
          if (soundEnabled) playAlarmSound("alert");
          addToast(`⏰ Alarm: ${item.condition} startet in ${notifSettings.minutesBefore || 15} Min!`, "fav", 5000);
          break; // show one at a time
        }
      }
    };

    check(); // immediate
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, [favs, liveData, notifSettings, soundEnabled, addToast]);

  const dismiss = useCallback(() => setAlarm(null), []);
  return [alarm, dismiss];
}

// ── Condition-Verlauf ────────────────────────────────────────────────────────
function HistoryView({ favs, toggleFav, onToast }) {
  const [dayFilter, setDayFilter] = useState("all");
  const [condFilter, setCondFilter] = useState("all");

  const days = ["all", "Heute", "Gestern"];
  const allConds = ["all", ...Object.keys(CONDITION_META)];

  const filtered = HISTORY_DATA.filter(h =>
    (dayFilter === "all" || h.date === dayFilter) &&
    (condFilter === "all" || h.condition === condFilter)
  );

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-500 text-xs">Vergangene Map Conditions — heute & gestern. Zeigt was bereits gelaufen ist.</p>

      {/* Mini-Filter */}
      <div className="flex flex-col gap-2">
        <select value={dayFilter} onChange={e => setDayFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
          {days.map(d => <option key={d} value={d}>{d === "all" ? "📅 Alle Tage" : d}</option>)}
        </select>
        <select value={condFilter} onChange={e => setCondFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
          {allConds.map(c => <option key={c} value={c}>{c === "all" ? "⚡ Alle Conditions" : c}</option>)}
        </select>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-gray-500 text-sm">Keine Einträge für diesen Filter.</p>
      )}

      {["Heute", "Gestern"].map(day => {
        if (!grouped[day]) return null;
        return (
          <div key={day}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{day}</span>
              <span className="flex-1 h-px bg-gray-800"></span>
              <span className="text-gray-600 text-xs">{grouped[day].length} Conditions</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {grouped[day].map((item, i) => {
                const meta = getMeta(item.condition);
                const mapColor = MAP_COLORS[item.map] || "#6b7280";
                const isFav = favs.includes(item.condition);
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors ${
                    isFav ? "border-yellow-400/30 bg-yellow-400/5" : "border-gray-800 bg-gray-900/60"
                  }`}>
                    <StarButton condition={item.condition} favs={favs} toggle={toggleFav} onToast={onToast} />
                    <span className="text-base w-7 text-center opacity-60">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: meta.color }} className="font-semibold text-sm truncate opacity-80">{item.condition}</p>
                      <span style={{ color: mapColor }} className="text-xs opacity-70">{item.map}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-gray-500 text-xs font-mono">{item.timeRange}</p>
                      <span className="text-gray-600 text-xs">abgelaufen</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Persönlicher Zeitplan ───────────────────────────────────────────────────
function NextChanceView({ favs, toggleFav, onToast }) {
  const SCRAPED_DATA = useLiveDataCtx(); // live data context
    // For each condition, find the next upcoming slot
  const allConditions = Object.keys(CONDITION_META);

  const schedule = allConditions.map(condition => {
    const next = SCRAPED_DATA.upcoming.find(u => u.condition === condition)
               || SCRAPED_DATA.active.find(a => a.condition === condition);
    const isActive = SCRAPED_DATA.active.some(a => a.condition === condition);
    return { condition, next, isActive };
  }).sort((a, b) => {
    // active first, then by countdown
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    const secsA = a.next ? (a.next.countdownH || 0) * 3600 + (a.next.countdownM || 0) * 60 : 99999;
    const secsB = b.next ? (b.next.countdownH || 0) * 3600 + (b.next.countdownM || 0) * 60 : 99999;
    return secsA - secsB;
  });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-gray-500 text-xs mb-2">Nächste Chance für jede Condition — sortiert nach Verfügbarkeit. ⭐ Favoriten werden zuerst hervorgehoben.</p>
      {schedule.map(({ condition, next, isActive }) => {
        const meta = getMeta(condition);
        const isFav = favs.includes(condition);
        const mapColor = next ? (MAP_COLORS[next.map] || "#6b7280") : "#6b7280";
        return (
          <div
            key={condition}
            style={{ borderColor: isFav ? "#facc15" : "transparent" }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${
              isActive ? "bg-green-950/40" : "bg-gray-900 hover:bg-gray-800"
            }`}
          >
            <StarButton condition={condition} favs={favs} toggle={toggleFav} onToast={onToast} />
            <span className="text-xl w-8 text-center">{meta.icon}</span>
            <div className="flex-1 min-w-0">
              <p style={{ color: meta.color }} className="font-semibold text-sm truncate">{condition}</p>
              {next ? (
                <span style={{ color: mapColor }} className="text-xs">{next.map}</span>
              ) : (
                <span className="text-gray-600 text-xs">Nicht geplant</span>
              )}
            </div>
            <div className="text-right shrink-0">
              {isActive ? (
                <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
                  Jetzt aktiv
                </span>
              ) : next ? (
                <>
                  <p className="text-white text-xs font-mono">{next.date} {next.timeRange}</p>
                  <p className="text-gray-400 text-xs">in {next.countdownH > 0 ? `${next.countdownH}h ` : ""}{next.countdownM}m</p>
                </>
              ) : (
                <span className="text-gray-600 text-xs">–</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Mehrsprachigkeit ─────────────────────────────────────────────────────
const TRANSLATIONS = {
  de: {
    appName: "ARC Twix",
    tagline: "Map Conditions",
    tabMain: "📋 Übersicht",
    tabSchedule: "🗓️ Mein Zeitplan",
    tabHistory: "📜 Verlauf",
    tabMaps: "🗺️ Karten",
    tabLoot: "🎁 Loot-Guide",
    tabLoadout: "🎒 Loadout",
    tabSession: "⏱️ Session",
    tabSquad: "👥 Squad",
    tabDiscord: "🤖 Discord",
    tabNotes: "📝 Notizen",
      tabWeek: "📅 Woche",
    tabStats: "📊 Stats",
    activeNow: "Jetzt Aktiv",
    comingUp: "Bald Verfügbar",
    refreshed: "Aktualisiert",
    refresh: "🔄 Refresh",
    allMaps: "🗺️ Alle Karten",
    allConditions: "⚡ Alle Bedingungen",
    noActive: "Keine aktiven Bedingungen für diesen Filter.",
    noUpcoming: "Keine bevorstehenden Bedingungen für diesen Filter.",
    favorites: "Favorit",
    favoritesPlural: "Favoriten",
    live: "LIVE",
    footer: "Daten von arcraiders.com/de/map-conditions · ARC Twix",
  },
  en: {
    appName: "ARC Twix",
    tagline: "Map Conditions",
    tabMain: "📋 Overview",
    tabSchedule: "🗓️ My Schedule",
    tabHistory: "📜 History",
    tabMaps: "🗺️ Maps",
    tabLoot: "🎁 Loot Guide",
    tabLoadout: "🎒 Loadout",
    tabSession: "⏱️ Session",
    tabSquad: "👥 Squad",
    tabDiscord: "🤖 Discord",
    tabNotes: "📝 Notes",
      tabWeek: "📅 Week",
    tabStats: "📊 Stats",
    activeNow: "Active Now",
    comingUp: "Coming Up",
    refreshed: "Updated",
    refresh: "🔄 Refresh",
    allMaps: "🗺️ All Maps",
    allConditions: "⚡ All Conditions",
    noActive: "No active conditions for this filter.",
    noUpcoming: "No upcoming conditions for this filter.",
    favorites: "Favorite",
    favoritesPlural: "Favorites",
    live: "LIVE",
    footer: "Data from arcraiders.com/map-conditions · ARC Twix",
  },
};



// Global lang state — readable anywhere
let _globalT = TRANSLATIONS.de;

function useLang() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("arc_lang") || "de"; }
    catch { return "de"; }
  });
  const toggle = () => {
    setLang(l => {
      const next = l === "de" ? "en" : "de";
      localStorage.setItem("arc_lang", next);
      return next;
    });
  };
  const t = TRANSLATIONS[lang] || TRANSLATIONS.de;
  _globalT = t; // keep global in sync
  return [lang, toggle, t];
}

// ── Dark/Light Mode Hook ──────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("arc_theme") !== "light"; }
    catch { return true; }
  });
  const toggle = () => {
    setDark(d => {
      localStorage.setItem("arc_theme", d ? "light" : "dark");
      return !d;
    });
  };
  return [dark, toggle];
}

export default function App() {
  const { installPrompt, installed: pwaInstalled, triggerInstall } = usePWA();
  const [lang, toggleLang, t] = useLang();
    const [toasts, addToast, removeToast] = useToast();
  _globalT = t;
  const [dark, toggleTheme] = useTheme();
  const [favs, toggleFav] = useFavorites();
  const [notifSettings, updateNotif] = useNotifSettings();
    const { liveData, fetchStatus, lastFetch, refetch } = useLiveData(addToast);
  const notifiedRef = useRef(new Set());
  const [lastRefresh, setLastRefresh] = useState(new Date());
    const [soundEnabled, setSoundEnabled] = useState(() => {
      try { return localStorage.getItem("arc_sound") !== "off"; } catch { return true; }
    });
    const toggleSound = () => setSoundEnabled(s => {
      const next = !s;
      localStorage.setItem("arc_sound", next ? "on" : "off");
      if (next) playAlarmSound("fav");
      return next;
    });
  const [activeTab, setActiveTab] = useState("main");
  const [alarm, dismissAlarm] = useAlarmTimer({ favs, liveData, notifSettings, soundEnabled, addToast }); // "main" | "schedule"
  const [filter, setFilter] = useState("all");
  const [mapFilter, setMapFilter] = useState("all");

  const refresh = useCallback(() => {
      setLastRefresh(new Date());
      addToast("Daten aktualisiert 🔄", "success", 2500);
    }, [addToast]);

  // ── Notification watcher: fires 15 min before a fav condition starts ────────
  useEffect(() => {
    requestNotifPermission();
    const check = setInterval(() => {
      const allUpcoming = liveData.upcoming;
      allUpcoming.forEach(item => {
        if (!favs.includes(item.condition)) return;
        const key = `${item.condition}|${item.date}|${item.timeRange}`;
        if (notifiedRef.current.has(key)) return;
        const totalSecs = item.countdownH * 3600 + item.countdownM * 60;
        // fire when ≤ 15 min remaining
        if (totalSecs <= 15 * 60 && totalSecs > 0) {
          sendNotification(
            `⭐ ${item.condition} startet bald!`,
            `📍 ${item.map} · ${item.date} ${item.timeRange}`
          );
          const m = getMeta(item.condition);
            addToast(`${m.icon} ${item.condition} startet in <15 Min! 📍 ${item.map}`, "fav", 7000);
            if (soundEnabled) playAlarmSound("alert");
            notifiedRef.current.add(key);
        }
      });
    }, 30000); // check every 30 s
    return () => clearInterval(check);
  }, [favs]);

  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const maps = ["all", ...Object.keys(MAP_COLORS)];
  const conditions = ["all", ...Object.keys(CONDITION_META)];

  const [searchQuery, setSearchQuery] = useState("");
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (i) =>
      !searchQuery ||
      i.condition.toLowerCase().includes(searchLower) ||
      i.map.toLowerCase().includes(searchLower);

    const filteredActive = liveData.active.filter(i =>
    (mapFilter === "all" || i.map === mapFilter) &&
    (filter === "all" || i.condition === filter)
  );

  const filteredUpcoming = liveData.upcoming.filter(i =>
    (mapFilter === "all" || i.map === mapFilter) &&
    (filter === "all" || i.condition === filter)
  );

  // Apply theme classes to root
  const bg      = dark ? "bg-gray-950"  : "bg-gray-100";
  const surface = dark ? "bg-gray-900"  : "bg-white";
  const border  = dark ? "border-gray-800" : "border-gray-200";
  const text    = dark ? "text-white"   : "text-gray-900";
  const subtext = dark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen ${bg} ${text} font-sans transition-colors duration-300`}>
      {alarm && <AlarmPopup alarm={alarm} onDismiss={dismissAlarm} soundEnabled={soundEnabled} />}
      <ToastContainer toasts={toasts} remove={removeToast} />
        <LiveDataContext.Provider value={liveData}>
        {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* ARC Twix Logo */}
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
              <h1 className="font-bold text-lg text-white leading-none">ARC Twix <span className="text-orange-400 text-xs font-semibold">v2.4</span></h1>
              
              </div>
              <p className="text-orange-400 text-xs font-semibold tracking-widest uppercase">{t.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {favs.length > 0 && (
            <span className="bg-yellow-400/10 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-400/30">
              ⭐ {favs.length} {favs.length > 1 ? t.favoritesPlural : t.favorites}
            </span>
          )}
          <PWAInstallButton installPrompt={installPrompt} installed={pwaInstalled} triggerInstall={triggerInstall} />
            <LiveStatusBadge fetchStatus={fetchStatus} lastFetch={lastFetch} />
            <span className="text-gray-500 text-xs">Aktualisiert: {lastRefresh.toLocaleTimeString("de-DE")}</span>
          <button
            onClick={refresh}
            className="bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={toggleLang}
                title="Sprache wechseln"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border-2 border-gray-700 bg-gray-900 text-gray-300 hover:text-white hover:border-gray-500 transition-all"
              >{lang === "de" ? "🇩🇪 DE" : "🇬🇧 EN"}</button>
              <button
                onClick={toggleSound}
              title={soundEnabled ? "Sound deaktivieren" : "Sound aktivieren"}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition-all ${
                soundEnabled
                  ? "border-orange-500 bg-orange-500/10 text-orange-400"
                  : "border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300"
              }`}
            >{soundEnabled ? "🔔 Sound AN" : "🔇 Sound AUS"}</button>
              <button
                onClick={toggleTheme}
                title={dark ? "Light Mode" : "Dark Mode"}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border-2 border-gray-700 bg-gray-900 text-gray-300 hover:text-white hover:border-gray-500 transition-all"
              >{dark ? "☀️ Light" : "🌙 Dark"}</button>
            
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-gray-800 bg-gray-950 sticky top-[73px] z-10">
        <div className="max-w-3xl mx-auto px-2 pt-2 flex flex-wrap gap-1 pb-0">
          {[
            { id: "main",     label: t.tabMain },
            { id: "schedule", label: t.tabSchedule },
            { id: "history",  label: t.tabHistory },
            { id: "maps",     label: t.tabMaps },
            { id: "loot",     label: t.tabLoot },
            { id: "loadout",  label: t.tabLoadout },
            { id: "session",  label: t.tabSession },
            { id: "squad",    label: t.tabSquad },
            { id: "discord",  label: t.tabDiscord },
            { id: "notes",    label: t.tabNotes },
            { id: "week",     label: t.tabWeek },
              { id: "stats",    label: t.tabStats },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-400 bg-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Main Tab content */}
        {/* 🔍 Suchleiste */}
          {activeTab === "main" && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Condition oder Karte suchen…"
                className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-xl pl-9 pr-9 py-2.5 outline-none focus:border-orange-500 placeholder-gray-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-lg leading-none"
                >×</button>
              )}
            </div>
          )}

          {/* ⚡ Map-Filter Toggle-Buttons */}
        <div className="flex flex-col gap-3">
          {/* Map-Filter */}
          <div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-2">🗺️ Karte</p>
            <div className="flex flex-wrap gap-1.5">
              {maps.map(m => {
                const col = MAP_COLORS[m];
                const isAll = m === "all";
                const active = mapFilter === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMapFilter(m)}
                    style={active && !isAll ? { borderColor: col, backgroundColor: col + "22", color: col } : {}}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all whitespace-nowrap ${
                      active
                        ? isAll ? "border-orange-500 bg-orange-500/15 text-orange-400" : ""
                        : "border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {isAll ? "🗺️ Alle" : `${MAP_INFO[m]?.icon || "📍"} ${m}`}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Condition-Filter */}
          <div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-2">⚡ Condition</p>
            <div className="flex flex-wrap gap-1.5">
              {conditions.map(c => {
                const meta = getMeta(c);
                const isAll = c === "all";
                const active = filter === c;
                return (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    style={active && !isAll ? { borderColor: meta.color, backgroundColor: meta.color + "22", color: meta.color } : {}}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all whitespace-nowrap ${
                      active
                        ? isAll ? "border-orange-500 bg-orange-500/15 text-orange-400" : ""
                        : "border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {!isAll && <span>{meta.icon}</span>}
                    {isAll ? "⚡ Alle" : c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {activeTab === "main" && <>
        {/* Active Now */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <h2 className="text-green-400 font-bold text-sm uppercase tracking-widest">Jetzt Aktiv</h2>
            <span className="bg-green-400/10 text-green-400 text-xs px-2 py-0.5 rounded-full">{filteredActive.length}</span>
          </div>
          {filteredActive.length === 0
            ? <p className="text-gray-500 text-sm">Keine aktiven Bedingungen für diesen Filter.</p>
            : <div className="grid gap-3 sm:grid-cols-2">
                {filteredActive.map((item, i) => <ActiveCard key={i} item={item} favs={favs} toggleFav={toggleFav} onToast={addToast} />)}
              </div>
          }
        </section>

        {/* Coming Up */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-400 text-sm">⏳</span>
            <h2 className="text-orange-400 font-bold text-sm uppercase tracking-widest">Bald Verfügbar</h2>
            <span className="bg-orange-400/10 text-orange-400 text-xs px-2 py-0.5 rounded-full">{filteredUpcoming.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {filteredUpcoming.length === 0
              ? <p className="text-gray-500 text-sm">{t.noUpcoming}</p>
              : filteredUpcoming.map((item, i) => <UpcomingRow key={i} item={item} index={i} favs={favs} toggleFav={toggleFav} onToast={addToast} />)
            }
          </div>
        </section>

        </>
        }
        {/* Schedule Tab */}
        {activeTab === "schedule" && (
            <NextChanceView favs={favs} toggleFav={toggleFav} onToast={addToast} />
          )}

        {activeTab === "history" && <HistoryView favs={favs} toggleFav={toggleFav} onToast={addToast} />}
        {activeTab === "maps" && <MapsView favs={favs} toggleFav={toggleFav} onToast={addToast} />}
        {activeTab === "loot" && <LootGuideView />}
        {activeTab === "loadout" && <LoadoutView />}
        {activeTab === "session" && <SessionPlannerView favs={favs} toggleFav={toggleFav} onToast={addToast} />}
        {activeTab === "squad" && <SquadView />}
        {activeTab === "discord" && <DiscordView />}
        {activeTab === "notes" && <NotesView />}
        {activeTab === "week" && <WeekView favs={favs} toggleFav={toggleFav} onToast={addToast} />}
          {activeTab === "stats" && <StatsView />}

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs">Daten von arcraiders.com/de/map-conditions · ARC Twix v2.4 · {fetchStatus === "live" ? "Live-Daten" : "Fallback-Daten"}</p>
      </div>
    </LiveDataContext.Provider>
    </div>
  );
}
