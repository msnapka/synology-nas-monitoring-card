/**
 * Synology NAS Monitoring Card — Custom Lovelace Card for Home Assistant
 * Visualizes Synology NAS status using the native Synology DSM integration.
 * Created with the help of AI (Claude by Anthropic).
 * @version 0.4.0
 * @license MIT
 */

const CARD_VERSION = "0.4.0";

console.info(
  `%c SYNOLOGY-NAS-CARD %c v${CARD_VERSION} `,
  "color: white; background: #1a73e8; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
  "color: #1a73e8; background: #e8f0fe; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);

/* ═══════════════════════════════════════════════════════════════
   i18n — auto-detected from browser language (cs / en)
   ═══════════════════════════════════════════════════════════════ */

const _LANG = (navigator.language || "en").toLowerCase().startsWith("cs") ? "cs" : "en";

const T = {
  en: {
    healthy: "Healthy",
    issue_detected: "Issue Detected",
    cpu: "CPU Load",
    load_avg: "Load avg",
    ram: "RAM",
    temp: "Temp",
    drive_bays: "Drive Bays",
    volumes: "Volumes",
    memory: "Memory",
    security: "Security Advisor",
    last_boot: "Last boot:",
    uptime: "Uptime:",
    open_dsm: "Open DSM",
    reboot: "Reboot",
    shutdown: "Shutdown",
    install_update: "Install DSM update",
    notify_ha: "Notify HA",
    bad_sectors: "Bad sectors",
    low_life: "Low life",
    hot_spare: "Hot Spare",
    empty: "Empty",
    normal: "Normal",
    bay: "Bay",
    m2: "M.2",
    used: "used",
    free: "free",
    avg: "Avg",
    max: "Max",
    size: "Size",
    total: "Total",
    available: "Available",
    cached: "Cached",
    swap_total: "Swap total",
    swap_used: "Swap used",
    sec_malware: "Malware",
    sec_network: "Network",
    sec_security: "Security",
    sec_system: "System",
    sec_updates: "Updates",
    sec_users: "Users",
    confirm_reboot_1: "Are you sure you want to reboot this NAS?",
    confirm_reboot_2: "This will reboot the NAS and interrupt all running services. Confirm again to proceed.",
    confirm_shutdown_1: "Are you sure you want to shut down this NAS?",
    confirm_shutdown_2: "This will power off the NAS and interrupt all running services. Confirm again to proceed.",
    confirm_update: "Install the available DSM update now? This will reboot the NAS.",
    notif_title: "Synology NAS Issues",
    notif_sent: "HA notification sent \u2713",
    raid: "RAID",
    no_nas: "No Synology NAS found",
    custom_prefix: "Custom prefix\u2026",
    auto_detected: "Auto-detected",
    hdd_bays: "HDD bays",
    m2_slots: "M.2 slots",
    no_detected: "No drives/volumes found for prefix",
    details: "Details",
    no_attrs: "No extra attributes",
    front_panel: "Front Panel",
  },
  cs: {
    healthy: "V po\u0159\u00e1dku",
    issue_detected: "Probl\u00e9m detekovan",
    cpu: "Z\u00e1t\u011b\u017e CPU",
    load_avg: "Load avg",
    ram: "RAM",
    temp: "Teplota",
    drive_bays: "Disky",
    volumes: "Svazky",
    memory: "Pam\u011b\u0165",
    security: "Bezpe\u010dnostn\u00ed poradce",
    last_boot: "Posledn\u00ed start:",
    uptime: "Provoz:",
    open_dsm: "Otev\u0159\u00edt DSM",
    reboot: "Restartovat",
    shutdown: "Vypnout",
    install_update: "Nainstalovat update DSM",
    notify_ha: "Notifikovat HA",
    bad_sectors: "\u0160patn\u00e9 sektory",
    low_life: "N\u00edzk\u00e1 \u017eivotn.",
    hot_spare: "Hot Spare",
    empty: "Pr\u00e1zdn\u00e9",
    normal: "Norm\u00e1ln\u00ed",
    bay: "Slot",
    m2: "M.2",
    used: "obsazeno",
    free: "voln\u00e9",
    avg: "Pr\u016fm",
    max: "Max",
    size: "Velikost",
    total: "Celkem",
    available: "Dostupn\u00e1",
    cached: "Cache",
    swap_total: "Swap celkem",
    swap_used: "Swap obsazeno",
    sec_malware: "Malware",
    sec_network: "S\u00ed\u0165",
    sec_security: "Zabezpe\u010den\u00ed",
    sec_system: "Syst\u00e9m",
    sec_updates: "Aktualizace",
    sec_users: "U\u017eivatel\u00e9",
    confirm_reboot_1: "Opravdu restartovat NAS?",
    confirm_reboot_2: "NAS se restartuje a p\u0159eru\u0161\u00ed v\u0161echny b\u011b\u017e\u00edc\u00ed slu\u017eby. Potvrdte znovu.",
    confirm_shutdown_1: "Opravdu vypnout NAS?",
    confirm_shutdown_2: "NAS se vypne a p\u0159eru\u0161\u00ed v\u0161echny b\u011b\u017e\u00edc\u00ed slu\u017eby. Potvrdte znovu.",
    confirm_update: "Nainstalovat dostupn\u00fd update DSM? NAS se restartuje.",
    notif_title: "Probl\u00e9my Synology NAS",
    notif_sent: "HA notifikace odesl\u00e1na \u2713",
    raid: "RAID",
    no_nas: "\u017d\u00e1dn\u00fd Synology NAS nenalezen",
    custom_prefix: "Vlastn\u00ed prefix\u2026",
    auto_detected: "Automaticky nalezeno",
    hdd_bays: "HDD slot\u016f",
    m2_slots: "M.2 slot\u016f",
    no_detected: "Nenalezeny disky/svazky pro prefix",
    details: "Detaily",
    no_attrs: "Žádné další atributy",
    front_panel: "Přední panel",
  },
}[_LANG];

/* ═══════════════════════════════════════════════════════════════
   Shared helpers
   ═══════════════════════════════════════════════════════════════ */

function discoverPrefixes(hass) {
  const out = new Set();
  const sfx = "_cpu_utilization_total";
  for (const eid of Object.keys(hass.states)) {
    if (eid.startsWith("sensor.") && eid.endsWith(sfx)) {
      out.add(eid.slice(7, -sfx.length));
    }
  }
  return [...out].sort();
}

function detectDriveSlots(hass, pfx) {
  const ids = [];
  for (let i = 1; i <= 24; i++) {
    if (hass.states[`sensor.${pfx}_drive_${i}_status`]) ids.push(i);
  }
  return ids;
}

function detectM2Slots(hass, pfx) {
  const ids = [];
  for (let i = 1; i <= 8; i++) {
    if (hass.states[`sensor.${pfx}_m_2_drive_${i}_status`]) ids.push(i);
  }
  return ids;
}

function detectVolumes(hass, pfx) {
  const ids = [];
  for (let i = 1; i <= 16; i++) {
    if (hass.states[`sensor.${pfx}_volume_${i}_volume_used`]) ids.push(i);
  }
  return ids;
}

/* Known Synology models → CPU core count.
   Used as a best-effort auto-detect when the card is added.
   Users can override via the editor. */
const SYNOLOGY_CORES = {
  // Plus / Value (2-bay)
  "DS220+": 2, "DS224+": 2, "DS223": 2, "DS223j": 2, "DS120j": 2, "DS124": 2,
  "DS720+": 2, "DS723+": 2, "DS423+": 2, "DS423": 4, "DS224": 2,
  // Plus (4-bay)
  "DS418": 4, "DS418play": 2, "DS420+": 2, "DS420j": 4, "DS423+": 2,
  "DS920+": 4, "DS923+": 4, "DS1019+": 4, "DS1522+": 4,
  // Plus (6-bay)
  "DS1618+": 4, "DS1621+": 4, "DS1621xs+": 4, "DS1622xs+": 4,
  // Plus (8-bay)
  "DS1819+": 4, "DS1821+": 4, "DS1823xs+": 8,
  // XS / XS+
  "DS2419+": 4, "DS2422+": 4, "DS3617xs": 4, "DS3617xsII": 8,
  "DS3622xs+": 12, "DS3018xs": 4, "DS2419+II": 4,
  // Rack
  "RS1221+": 4, "RS1221RP+": 4, "RS1619xs+": 4, "RS2421+": 4, "RS2421RP+": 4,
  "RS2423+": 4, "RS2423RP+": 4, "RS3621xs+": 8, "RS3621RPxs": 8, "RS4021xs+": 8,
  "RS422+": 2, "RS822+": 2, "RS820+": 4, "RS1619xs+": 4, "RS3618xs": 4,
  // Flashstation
  "FS2500": 8, "FS3400": 8, "FS3600": 12, "FS6400": 16, "FS3410": 8, "FS6410": 16,
};

/* ═══════════════════════════════════════════════════════════════
   Synology front-panel definitions — modular, data-only.
   Each entry describes the visual layout of the NAS front face.

   Structure of one definition:
   {
     label : string          — model name shown as caption
     vw    : number          — SVG viewBox width
     vh    : number          — SVG viewBox height
     chassis: {rx, fill, stroke}  — optional chassis override
     drives: Array of {
       x, y, w, h  — slot bounding box (px inside viewBox)
       type        — "hdd" | "m2"
       slot        — 1-based drive index (matches entity _drive_N_ / _m_2_drive_N_)
     }
     extras: Array of {
       type   — "power" | "usb" | "led" | "label"
       x, y   — centre or top-left
       r?     — radius (for circles)
       w?, h? — width/height (for rects)
       text?  — label string
     }
   }

   To add a new NAS model, just add an entry here.
   The generic renderer (_frontPanel) works with any definition.
   ═══════════════════════════════════════════════════════════════ */

function _makeHddRow(startX, y, w, h, gap, count, startSlot) {
  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * (w + gap), y, w, h,
    type: "hdd", slot: startSlot + i,
  }));
}

const SYNOLOGY_PANEL_DEFS = {
  /* ── 2-bay desktop ── */
  "DS224+": { label: "DS224+",   vw: 120, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 4, 2, 1),
    extras: [{ type:"power", x:99, y:25, r:5 }, { type:"led", x:99, y:42, r:3 }, { type:"usb", x:93, y:55, w:12, h:8 }] },
  "DS223":  { label: "DS223",    vw: 120, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 4, 2, 1),
    extras: [{ type:"power", x:99, y:25, r:5 }, { type:"led", x:99, y:42, r:3 }] },
  "DS723+": { label: "DS723+",   vw: 120, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 4, 2, 1),
    extras: [{ type:"power", x:99, y:25, r:5 }, { type:"led", x:99, y:42, r:3 }, { type:"usb", x:93, y:55, w:12, h:8 }] },

  /* ── 4-bay desktop ── */
  "DS920+": { label: "DS920+",   vw: 200, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 3, 4, 1),
    extras: [{ type:"power", x:180, y:25, r:5 }, { type:"led", x:180, y:42, r:3 }, { type:"usb", x:174, y:55, w:12, h:8 }] },
  "DS923+": { label: "DS923+",   vw: 200, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 3, 4, 1),
    extras: [{ type:"power", x:180, y:25, r:5 }, { type:"led", x:180, y:42, r:3 }, { type:"usb", x:174, y:55, w:12, h:8 }] },
  "DS423+": { label: "DS423+",   vw: 200, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 3, 4, 1),
    extras: [{ type:"power", x:180, y:25, r:5 }, { type:"led", x:180, y:42, r:3 }] },
  "DS1019+":{ label: "DS1019+",  vw: 200, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 3, 4, 1),
    extras: [{ type:"power", x:180, y:25, r:5 }, { type:"led", x:180, y:42, r:3 }] },

  /* ── 5-bay desktop ── */
  "DS1522+": { label: "DS1522+", vw: 244, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 3, 5, 1),
    extras: [{ type:"power", x:224, y:25, r:5 }, { type:"led", x:224, y:42, r:3 }] },

  /* ── 6-bay desktop ── */
  "DS1621+": { label: "DS1621+", vw: 286, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 3, 6, 1),
    extras: [{ type:"power", x:268, y:25, r:5 }, { type:"led", x:268, y:42, r:3 }, { type:"usb", x:262, y:55, w:12, h:8 }] },
  "DS1621xs+":{ label: "DS1621xs+", vw: 286, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 3, 6, 1),
    extras: [{ type:"power", x:268, y:25, r:5 }, { type:"led", x:268, y:42, r:3 }] },

  /* ── 8-bay desktop (DS1821+, flagship) ── */
  "DS1821+": { label: "DS1821+", vw: 368, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 3, 8, 1),
    extras: [
      { type:"power",  x:350, y:22, r:6 },
      { type:"led",    x:350, y:40, r:3 },
      { type:"usb",    x:344, y:52, w:12, h:8 },
      { type:"led",    x:350, y:68, r:3, role:"status" },
    ] },
  "DS1823xs+":{ label: "DS1823xs+", vw: 368, vh: 90,
    drives: _makeHddRow(4, 5, 38, 80, 3, 8, 1),
    extras: [{ type:"power", x:350, y:22, r:6 }, { type:"led", x:350, y:40, r:3 }, { type:"usb", x:344, y:52, w:12, h:8 }] },

  /* ── 12-bay desktop ── */
  "DS2422+": { label: "DS2422+", vw: 284, vh: 180,
    // 2 rows of 6
    drives: [
      ..._makeHddRow(4, 5,  26, 80, 2, 6, 1),
      ..._makeHddRow(4, 92, 26, 80, 2, 6, 7),
    ],
    extras: [{ type:"power", x:266, y:22, r:6 }, { type:"led", x:266, y:40, r:3 }] },

  /* ── Rack 4U 12-bay ── */
  "RS3621xs+": { label: "RS3621xs+", vw: 400, vh: 60,
    drives: _makeHddRow(4, 5, 26, 50, 2, 12, 1),
    extras: [{ type:"power", x:382, y:15, r:5 }, { type:"led", x:382, y:35, r:3 }] },

  /* ── Generic fallbacks (used when model not in list) ── */
  "_generic_2": { label: "NAS (2-bay)",  vw: 120, vh: 90, drives: _makeHddRow(4, 5, 38, 80, 4, 2, 1), extras: [] },
  "_generic_4": { label: "NAS (4-bay)",  vw: 200, vh: 90, drives: _makeHddRow(4, 5, 38, 80, 3, 4, 1), extras: [] },
  "_generic_6": { label: "NAS (6-bay)",  vw: 286, vh: 90, drives: _makeHddRow(4, 5, 38, 80, 3, 6, 1), extras: [] },
  "_generic_8": { label: "NAS (8-bay)",  vw: 368, vh: 90, drives: _makeHddRow(4, 5, 38, 80, 3, 8, 1), extras: [] },
  "_generic_12":{ label: "NAS (12-bay)", vw: 284, vh: 180, drives: [..._makeHddRow(4,5,26,80,2,6,1),..._makeHddRow(4,92,26,80,2,6,7)], extras: [] },
};

/* Return the best panel definition for a model + detected bay counts.
   Priority: exact model match → generic by HDD bay count → null */
function findPanelDef(model, hddCount) {
  if (model && SYNOLOGY_PANEL_DEFS[model])           return SYNOLOGY_PANEL_DEFS[model];
  const trimmed = (model || "").trim();
  if (trimmed && SYNOLOGY_PANEL_DEFS[trimmed])        return SYNOLOGY_PANEL_DEFS[trimmed];
  if (hddCount <= 2)  return SYNOLOGY_PANEL_DEFS["_generic_2"];
  if (hddCount <= 4)  return SYNOLOGY_PANEL_DEFS["_generic_4"];
  if (hddCount <= 6)  return SYNOLOGY_PANEL_DEFS["_generic_6"];
  if (hddCount <= 8)  return SYNOLOGY_PANEL_DEFS["_generic_8"];
  if (hddCount <= 12) return SYNOLOGY_PANEL_DEFS["_generic_12"];
  return null;
}

function detectCoresFromModel(hass, prefix) {
  try {
    const marker = `sensor.${prefix}_cpu_utilization_total`;
    const entReg = hass?.entities?.[marker];
    const devId  = entReg?.device_id;
    const device = devId ? hass?.devices?.[devId] : null;
    const model  = device?.model || "";
    if (!model) return null;
    // Exact match
    if (SYNOLOGY_CORES[model]) return SYNOLOGY_CORES[model];
    // Trim trailing whitespace/variants
    const trimmed = model.trim();
    if (SYNOLOGY_CORES[trimmed]) return SYNOLOGY_CORES[trimmed];
    return null;
  } catch (_) {
    return null;
  }
}

function prettyName(pfx) {
  const m = pfx.match(/synology[_\s]*((?:ds|rs|fs|sa|dvr|uc)\d{3,5})/i);
  if (m) return `Synology ${m[1].toUpperCase()}+`;
  return pfx.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtUptime(bootIso) {
  if (!bootIso) return null;
  const d = new Date(bootIso);
  if (isNaN(d)) return null;
  let diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 0) diff = 0;
  const y  = Math.floor(diff / 31536000); diff %= 31536000;
  const w  = Math.floor(diff / 604800);   diff %= 604800;
  const dd = Math.floor(diff / 86400);    diff %= 86400;
  const h  = Math.floor(diff / 3600);     diff %= 3600;
  const mm = Math.floor(diff / 60);
  const parts = [];
  if (y)  parts.push(`${y}y`);
  if (w)  parts.push(`${w}w`);
  if (dd) parts.push(`${dd}d`);
  if (h)  parts.push(`${h}h`);
  parts.push(`${mm}m`);
  return parts.join(" ");
}

function fmtBootDate(bootIso) {
  if (!bootIso) return "";
  const d = new Date(bootIso);
  if (isNaN(d)) return "";
  return (
    d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Card
   ═══════════════════════════════════════════════════════════════ */

class SynologyNasCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("synology-nas-card-editor");
  }

  static getStubConfig(hass) {
    const p = hass ? discoverPrefixes(hass) : [];
    const first = p[0] || "";
    const autoCores = first && hass ? detectCoresFromModel(hass, first) : null;
    return {
      entity_prefix: first,
      name: "",
      show_security: true,
      show_power: false,
      show_shutdown: false,
      show_memory: true,
      show_front_panel: true,
      compact_mode: false,
      hide_empty_bays: false,
      dsm_url: "",
      cpu_cores: autoCores || 4,
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._issuesOpen = false;
    this._powerUnlocked = false;
    this._notifFeedback = false;
    this._uptimeInterval = null;
    this._openSecKeys = new Set();
    this._openDrives = new Set();   // drive bay keys with inline expand open
    this._openVolumes = new Set();  // volume ids with inline expand open
    this._history = {};             // entity_id -> [{t: ms, v: number}, ...]
    this._historyFetching = false;
    this._historyLastFetch = 0;
    this._historyInterval = null;
  }

  connectedCallback() {
    this._uptimeInterval = setInterval(() => this._render(), 60000);
    // Refetch history every 10 minutes
    this._historyInterval = setInterval(() => this._fetchHistory(true), 10 * 60 * 1000);
  }

  disconnectedCallback() {
    if (this._uptimeInterval) clearInterval(this._uptimeInterval);
    if (this._historyInterval) clearInterval(this._historyInterval);
  }

  set hass(h) {
    const firstBoot = !this._hass;
    this._hass = h;
    // Migration: on first hass, if user config has no explicit cpu_cores, try to auto-detect from device model
    if (firstBoot && this._config?.entity_prefix && !this._config._coresAutoDetected) {
      const auto = detectCoresFromModel(h, this._config.entity_prefix);
      if (auto && (!this._config.cpu_cores || this._config.cpu_cores === 4)) {
        this._config.cpu_cores = auto;
      }
      this._config._coresAutoDetected = true;
    }
    // Fetch history on first hass (after a small delay to avoid blocking initial render)
    if (firstBoot && this._config?.entity_prefix) {
      setTimeout(() => this._fetchHistory(false), 100);
    }
    this._render();
  }

  /* ── history fetch (24h) for sparklines and trend arrows ── */
  async _fetchHistory(force) {
    if (!this._hass || !this._config?.entity_prefix) return;
    if (this._historyFetching) return;
    if (!force && Date.now() - this._historyLastFetch < 5 * 60 * 1000) return;
    this._historyFetching = true;
    const p = this._config.entity_prefix;
    const entities = [
      this._e("cpu_load_average_15_min"),
      this._e("memory_usage_real"),
      this._e("temperature"),
    ];
    try {
      const start = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const res = await this._hass.callWS({
        type: "history/history_during_period",
        start_time: start,
        entity_ids: entities,
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      });
      const next = {};
      for (const eid of entities) {
        const arr = res?.[eid] || [];
        next[eid] = arr
          .map((p) => {
            const v = parseFloat(p.s);
            const t = p.lu ? p.lu * 1000 : (p.last_updated ? new Date(p.last_updated).getTime() : null);
            return (isNaN(v) || t == null) ? null : { t, v };
          })
          .filter(Boolean);
      }
      this._history = next;
      this._historyLastFetch = Date.now();
      this._render();
    } catch (err) {
      console.warn("[synology-nas-card] history fetch failed:", err);
    } finally {
      this._historyFetching = false;
    }
  }

  /* ── sparkline SVG from a history series ── */
  _sparkline(entityId, color) {
    const pts = this._history?.[entityId];
    if (!pts || pts.length < 2) return "";
    const w = 90, h = 14;
    const vs = pts.map((p) => p.v);
    let min = Math.min(...vs), max = Math.max(...vs);
    if (max - min < 0.01) { max = min + 1; }
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const span = Math.max(1, t1 - t0);
    const path = pts.map((p, i) => {
      const x = ((p.t - t0) / span) * w;
      const y = h - ((p.v - min) / (max - min)) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
    return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <path d="${path}" fill="none" stroke="${color}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
  }

  /* ── trend arrow: compare current value against ~15 min ago ── */
  _trendArrow(entityId, currentValue, minDelta = 1) {
    const pts = this._history?.[entityId];
    if (!pts || pts.length < 2 || currentValue == null) return "";
    const cutoff = Date.now() - 15 * 60 * 1000;
    // find the closest point at or before cutoff
    let ref = null;
    for (let i = pts.length - 1; i >= 0; i--) {
      if (pts[i].t <= cutoff) { ref = pts[i]; break; }
    }
    if (!ref) ref = pts[0];
    const diff = currentValue - ref.v;
    if (Math.abs(diff) < minDelta) return `<span class="trend trend-flat">\u2192</span>`;
    if (diff > 0) return `<span class="trend trend-up">\u2191</span>`;
    return `<span class="trend trend-down">\u2193</span>`;
  }

  setConfig(cfg) {
    if (!cfg.entity_prefix) throw new Error("Please define entity_prefix");
    this._config = {
      entity_prefix: cfg.entity_prefix,
      name: cfg.name || "",
      show_security: cfg.show_security !== false,
      show_power: cfg.show_power === true,
      show_shutdown: cfg.show_shutdown === true,
      show_memory: cfg.show_memory !== false,
      show_front_panel: cfg.show_front_panel !== false,
      compact_mode: cfg.compact_mode === true,
      hide_empty_bays: cfg.hide_empty_bays === true,
      dsm_url: cfg.dsm_url || "",
      cpu_cores: Math.max(1, parseInt(cfg.cpu_cores, 10) || 4),
      thresholds: {
        cpu_yellow: this._num(cfg.thresholds?.cpu_yellow, null),
        cpu_red:    this._num(cfg.thresholds?.cpu_red,    null),
        ram_yellow: this._num(cfg.thresholds?.ram_yellow, 70),
        ram_red:    this._num(cfg.thresholds?.ram_red,    90),
        temp_yellow: this._num(cfg.thresholds?.temp_yellow, 55),
        temp_red:   this._num(cfg.thresholds?.temp_red,   70),
        drive_temp_warn: this._num(cfg.thresholds?.drive_temp_warn, 50),
      },
    };
    this._render();
  }

  getCardSize() { return 8; }

  /* ── state shortcuts ── */
  _s(id)       { return this._hass?.states[id]?.state; }
  _a(id, attr) { return this._hass?.states[id]?.attributes?.[attr]; }
  _num(v, fb)  { const n = parseFloat(v); return isNaN(n) ? fb : n; }
  _e(s)        { return `sensor.${this._config.entity_prefix}_${s}`; }
  _b(s)        { return `binary_sensor.${this._config.entity_prefix}_${s}`; }
  _n(id) {
    const v = this._s(id);
    return (v == null || v === "unknown" || v === "unavailable") ? null : parseFloat(v);
  }
  /* ── HA more-info dialog ── */
  _moreInfo(entityId) {
    if (!entityId) return;
    if (!this._hass?.states[entityId]) return;
    const ev = new Event("hass-more-info", { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
  }

  _bindMoreInfo(el, entityId) {
    if (!el || !entityId || !this._hass?.states[entityId]) return;
    el.classList.add("clickable");
    el.setAttribute("title", entityId);
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      this._moreInfo(entityId);
    });
  }

  /* ── gauge ── */
  _gauge(value, max, label, unit, thr, decimals = 0, entityId = "", extra = "") {
    const ds = entityId ? ` data-entity="${entityId}"` : "";
    if (value === null) {
      return `<div class="gauge"${ds}>
        <svg viewBox="0 0 100 60" class="gauge-svg">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--divider-color,#333)" stroke-width="6" stroke-linecap="round"/>
        </svg>
        <div class="gauge-value">\u2014</div>
        <div class="gauge-label">${label}</div>
        ${extra}
      </div>`;
    }
    const pct = Math.max(0, Math.min(value / max, 1));
    let color = "var(--success-color,#4caf50)";
    if (thr) {
      if (value >= thr.red)         color = "var(--error-color,#f44336)";
      else if (value >= thr.yellow) color = "var(--warning-color,#ff9800)";
    }
    /* Semi-circle: left=(10,50) right=(90,50) r=40, sweep clockwise.
       theta = PI * pct  →  x = 50 - 40*cos(theta),  y = 50 - 40*sin(theta) */
    const theta = Math.PI * pct;
    const ex = (50 - 40 * Math.cos(theta)).toFixed(2);
    const ey = (50 - 40 * Math.sin(theta)).toFixed(2);
    const la = pct > 0.5 ? 1 : 0;

    return `<div class="gauge"${ds}>
      <svg viewBox="0 0 100 60" class="gauge-svg">
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--divider-color,#333)" stroke-width="6" stroke-linecap="round"/>
        ${pct > 0.005 ? `<path d="M 10 50 A 40 40 0 ${la} 1 ${ex} ${ey}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>` : ""}
      </svg>
      <div class="gauge-value">${decimals > 0 ? value.toFixed(decimals) : Math.round(value)}${unit}</div>
      <div class="gauge-label">${label}</div>
      ${extra}
    </div>`;
  }

  /* ── drive bay ── */
  _driveBay(i, isM2) {
    const pfx    = isM2 ? "m_2_drive" : "drive";
    const statusId = this._e(`${pfx}_${i}_status`);
    const status = this._s(statusId);
    const smart  = this._s(this._e(`${pfx}_${i}_status_smart`));
    const temp   = this._n(this._e(`${pfx}_${i}_temperature`));
    const badSec = this._s(this._b(`${pfx}_${i}_exceeded_max_bad_sectors`));
    const remLife= this._s(this._b(`${pfx}_${i}_below_min_remaining_life`));
    const stAttrs= this._hass?.states[statusId]?.attributes || {};
    const key    = `${pfx}_${i}`;
    const isOpen = this._openDrives?.has(key);

    const lbl  = isM2 ? `${T.m2} #${i}` : `${T.bay} ${i}`;
    const icon = isM2 ? "\u26a1" : "\ud83d\udcbe";
    const isNA = !status || status === "unavailable" || status === "unknown";
    const norm = (status || "").toLowerCase();
    const isHotSpare = ["not_used","not_use","hotspare","hot_spare","nondisk"].includes(norm);
    const isOk = ["normal","initialized"].includes(norm);

    let sColor, sTxt, cssClass;
    if (isNA) {
      sColor = "var(--disabled-text-color,#666)"; sTxt = T.empty;     cssClass = "empty";
    } else if (isHotSpare) {
      sColor = "var(--warning-color,#ff9800)";    sTxt = T.hot_spare; cssClass = "hotspare";
    } else if (isOk) {
      sColor = "var(--success-color,#4caf50)";    sTxt = T.normal;    cssClass = "";
    } else {
      sColor = "var(--error-color,#f44336)";      sTxt = status;      cssClass = "warning";
    }

    const w = [];
    if (badSec === "on") w.push(`\u26a0\ufe0f ${T.bad_sectors}`);
    if (remLife === "on") w.push(`\u26a0\ufe0f ${T.low_life}`);

    // Build extra attributes for expanded view
    // Skip internal HA meta-keys AND anything already shown in the bay header
    const skipAttrs = new Set([
      "friendly_name","icon","attribution","device_class","state_class","unit_of_measurement",
      // already shown in header
      "smart_status","smart_status_short","temperature",
    ]);
    const extraRows = Object.entries(stAttrs)
      .filter(([k, v]) => !skipAttrs.has(k) && v !== null && v !== "")
      .map(([k, v]) => {
        const label = k.replace(/_/g, " ");
        return `<div class="expand-row"><span class="expand-key">${label}</span><span class="expand-val">${typeof v === "object" ? JSON.stringify(v) : v}</span></div>`;
      })
      .join("");

    return `<div class="drive-bay ${cssClass} ${isOpen ? "open" : ""}" data-drive-key="${key}">
      <div class="drive-bay-head" data-entity="${statusId}">
        <div class="drive-icon">${icon}</div>
        <div class="drive-info">
          <div class="drive-label">${lbl}</div>
          <div class="drive-status" style="color:${sColor}">${sTxt}</div>
          ${temp !== null ? `<div class="drive-temp">${temp}\u00b0C</div>` : ""}
          ${smart && smart !== "unknown" && smart !== "unavailable" ? `<div class="drive-smart">SMART: ${smart}</div>` : ""}
          ${w.length ? `<div class="drive-warnings">${w.join(" ")}</div>` : ""}
        </div>
      </div>
      ${!isNA ? `<button class="expand-toggle" data-expand-drive="${key}" title="${T.details}">${isOpen ? "\u25b2" : "\u25bc"}</button>` : ""}
      ${isOpen && !isNA ? `<div class="drive-expand">
        ${extraRows || `<div class="expand-row"><span class="expand-key" style="opacity:.5">\u2014 ${T.no_attrs} \u2014</span></div>`}
      </div>` : ""}
    </div>`;
  }

  /* ── RAID type helper ──
     Tries several attribute names used across DSM integration versions. */
  _raidType(i) {
    const sid   = this._e(`volume_${i}_status`);
    const attrs = this._hass?.states[sid]?.attributes || {};
    const raw   = attrs.device_type || attrs.raid_type || attrs.fs_type || null;
    if (!raw) return null;
    return raw.replace(/_/g, " ").toUpperCase();
  }

  /* ── volume ── */
  _volume(i) {
    const usedId  = this._e(`volume_${i}_volume_used`);
    const statusId= this._e(`volume_${i}_status`);
    const pct     = this._n(usedId);
    const usedTB  = this._n(this._e(`volume_${i}_used_space`));
    const totalTB = this._n(this._e(`volume_${i}_total_size`));
    const status  = this._s(statusId);
    const avgT    = this._n(this._e(`volume_${i}_average_disk_temp`));
    const maxT    = this._n(this._e(`volume_${i}_maximum_disk_temp`));
    const raid    = this._raidType(i);
    const freeGB  = (totalTB != null && usedTB != null)
      ? ((totalTB - usedTB) * 1024).toFixed(0)
      : "\u2014";
    const isOpen  = this._openVolumes?.has(i);
    const stAttrs = this._hass?.states[statusId]?.attributes || {};

    let bc = "var(--success-color,#4caf50)";
    if (pct != null) {
      if (pct >= 90)      bc = "var(--error-color,#f44336)";
      else if (pct >= 75) bc = "var(--warning-color,#ff9800)";
    }

    const skipAttrs = new Set([
      "friendly_name","icon","attribution","device_class","state_class","unit_of_measurement",
    ]);
    const extraRows = Object.entries(stAttrs)
      .filter(([k, v]) => !skipAttrs.has(k) && v !== null && v !== "")
      .map(([k, v]) => `<div class="expand-row"><span class="expand-key">${k}</span><span class="expand-val">${typeof v === "object" ? JSON.stringify(v) : v}</span></div>`)
      .join("");

    return `<div class="volume-card ${isOpen ? "open" : ""}" data-volume-id="${i}">
      <div class="volume-body" data-entity="${usedId}">
        <div class="volume-header">
          <span class="volume-title">\ud83d\udce6 Volume ${i}</span>
          <div class="volume-badges">
            ${raid ? `<span class="raid-badge">${T.raid}: ${raid}</span>` : ""}
            <span class="volume-status">${status || "\u2014"}</span>
          </div>
        </div>
        <div class="volume-bar-container">
          <div class="volume-bar" style="width:${pct ?? 0}%;background:${bc}"></div>
        </div>
        <div class="volume-details">
          <span>${pct != null ? pct + "%" : "\u2014"} ${T.used}</span>
          <span>${usedTB != null ? usedTB.toFixed(2) : "\u2014"} / ${totalTB != null ? totalTB.toFixed(2) : "\u2014"} TB</span>
          <span>${freeGB} GB ${T.free}</span>
        </div>
        ${avgT != null || maxT != null ? `
        <div class="volume-temps">
          ${avgT != null ? `<span>${T.avg}: ${avgT}\u00b0C</span>` : ""}
          ${maxT != null ? `<span>${T.max}: ${maxT}\u00b0C</span>` : ""}
        </div>` : ""}
      </div>
      <button class="expand-toggle" data-expand-volume="${i}" title="${T.details}">${isOpen ? "\u25b2" : "\u25bc"}</button>
      ${isOpen ? `<div class="volume-expand">
        ${extraRows || `<div class="expand-row"><span class="expand-key">\u2014</span></div>`}
      </div>` : ""}
    </div>`;
  }

  /* ── front panel SVG ── */
  _frontPanel(panelDef, hddSlots, m2Slots) {
    const { vw, vh, drives, extras = [] } = panelDef;

    // Status colour per drive slot (both HDD and M.2)
    const slotColor = (type, slot) => {
      const pfx  = type === "m2" ? "m_2_drive" : "drive";
      const sid  = this._e(`${pfx}_${slot}_status`);
      const stat = (this._s(sid) || "").toLowerCase();
      if (!stat || stat === "unavailable" || stat === "unknown") return null; // empty/unknown → no tray
      if (["not_used","not_use","hotspare","hot_spare","nondisk"].includes(stat))
        return { tray:"#1e1a0a", led:"#ff9800" };
      if (["normal","initialized"].includes(stat))
        return { tray:"#0a1a0a", led:"#4caf50" };
      return { tray:"#1a0a0a", led:"#f44336" };
    };

    const slotTemp = (type, slot) => {
      const pfx = type === "m2" ? "m_2_drive" : "drive";
      return this._n(this._e(`${pfx}_${slot}_temperature`));
    };

    const slotEntityId = (type, slot) => {
      const pfx = type === "m2" ? "m_2_drive" : "drive";
      return this._e(`${pfx}_${slot}_status`);
    };

    // ── Render drive slots ──
    const driveSvg = drives.map(({ x, y, w, h, type, slot }) => {
      const colors = slotColor(type, slot);
      const temp   = slotTemp(type, slot);
      const eid    = slotEntityId(type, slot);
      const isEmpty = !colors;

      // Temperature bar: bottom 4px, colour from cold→hot (blue→orange)
      let tempBar = "";
      if (temp !== null && !isEmpty) {
        const pct  = Math.min(100, Math.max(0, (temp - 20) / 50 * 100)); // 20→70°C range
        const bclr = temp >= 55 ? "#f44336" : temp >= 40 ? "#ff9800" : "#2196f3";
        const bw   = (w - 4) * pct / 100;
        tempBar = bw > 0
          ? `<rect x="${x + 2}" y="${y + h - 6}" width="${bw.toFixed(1)}" height="4" rx="1" fill="${bclr}" opacity="0.8"/>`
          : "";
      }

      // Drive tray (only when occupied)
      const tray = isEmpty
        ? `<rect x="${x+2}" y="${y+2}" width="${w-4}" height="${h-4}" rx="2" fill="#0d0d0d" opacity="0.4"/>`
        : `<rect x="${x+2}" y="${y+2}" width="${w-4}" height="${h-4}" rx="2" fill="${colors.tray}"/>`;

      // LED indicator
      const led = isEmpty
        ? `<circle cx="${x + w/2}" cy="${y+9}" r="2" fill="#1a1a1a"/>`
        : `<circle cx="${x + w/2}" cy="${y+9}" r="2.5" fill="${colors.led}"/>`;

      // Slot label
      const lbl = `<text x="${x+w/2}" y="${y+h-10}" text-anchor="middle" font-size="6.5" fill="${isEmpty ? "#2a2a2a" : "#555"}" font-family="sans-serif">${slot}</text>`;

      // Temperature text
      const tmpTxt = (temp !== null && !isEmpty)
        ? `<text x="${x+w/2}" y="${y+h-3}" text-anchor="middle" font-size="5.5" fill="#666" font-family="sans-serif">${temp}°</text>`
        : "";

      // M.2 badge
      const m2badge = type === "m2"
        ? `<text x="${x+w/2}" y="${y+h-18}" text-anchor="middle" font-size="5" fill="#555" font-family="sans-serif">M.2</text>`
        : "";

      // Handle bar at bottom of tray
      const handle = isEmpty ? "" : `<rect x="${x+4}" y="${y+h-13}" width="${w-8}" height="2.5" rx="1.2" fill="#333"/>`;

      // Clickable overlay
      const clickAttr = eid ? ` data-entity="${eid}" style="cursor:pointer"` : "";

      return `<g class="fp-slot" data-fp-slot="${slot}" data-fp-type="${type}"${clickAttr}>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#111" stroke="#252525" stroke-width="0.8"/>
        ${tray}${led}${handle}${lbl}${tempBar}${tmpTxt}${m2badge}
      </g>`;
    }).join("");

    // ── Render extras (power button, USB, status LEDs) ──
    const extraSvg = extras.map(({ type, x, y, r, w: ew, h: eh, text }) => {
      if (type === "power")
        return `<circle cx="${x}" cy="${y}" r="${r||6}" fill="#1a1a1a" stroke="#333" stroke-width="1"/>
                <circle cx="${x}" cy="${y}" r="${(r||6)-2}" fill="#222"/>
                <text x="${x}" y="${y+3}" text-anchor="middle" font-size="6" fill="#444" font-family="sans-serif">⏻</text>`;
      if (type === "usb")
        return `<rect x="${x}" y="${y}" width="${ew||12}" height="${eh||8}" rx="2" fill="#0a0a0a" stroke="#333" stroke-width="0.8"/>
                <rect x="${x+2}" y="${y+2}" width="${(ew||12)-4}" height="${(eh||8)-4}" rx="1" fill="#111"/>`;
      if (type === "led") {
        // Main status LED — colour from overall card status
        const ledCol = "#4caf50"; // TODO: could reflect overall NAS status
        return `<circle cx="${x}" cy="${y}" r="${r||3}" fill="${ledCol}" opacity="0.85"/>
                <circle cx="${x}" cy="${y}" r="${(r||3)+1}" fill="none" stroke="${ledCol}" stroke-width="0.5" opacity="0.3"/>`;
      }
      if (type === "label")
        return `<text x="${x}" y="${y}" text-anchor="middle" font-size="6" fill="#555" font-family="sans-serif">${text||""}</text>`;
      return "";
    }).join("");

    // ── Model label ──
    const modelLabel = `<text x="${vw-4}" y="${vh-4}" text-anchor="end" font-size="6.5" fill="#333" font-family="sans-serif" font-weight="600">${panelDef.label}</text>`;

    return `<div class="section front-panel-section">
      <div class="section-title">\ud83d\udda5\ufe0f ${T.front_panel}</div>
      <div class="front-panel-wrap">
        <svg class="front-panel-svg" viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${panelDef.label} front panel">
          <!-- Chassis -->
          <rect x="0" y="0" width="${vw}" height="${vh}" rx="6"
            fill="#141414" stroke="#2e2e2e" stroke-width="1"/>
          <!-- Ventilation slots (right side texture) -->
          ${Array.from({length:4},(_,i)=>
            `<line x1="${vw-8}" y1="${8+i*7}" x2="${vw-4}" y2="${8+i*7}" stroke="#1f1f1f" stroke-width="1" stroke-linecap="round"/>`
          ).join("")}
          ${driveSvg}
          ${extraSvg}
          ${modelLabel}
        </svg>
      </div>
    </div>`;
  }

  /* ── security ── */
  _security() {
    const entity = this._b("security_status");
    const attrs  = this._hass?.states[entity]?.attributes || {};
    const checks = [
      { key: "malware",         label: T.sec_malware,  icon: "\ud83d\udee1\ufe0f" },
      { key: "network",         label: T.sec_network,  icon: "\ud83c\udf10" },
      { key: "securitySetting", label: T.sec_security, icon: "\ud83d\udd12" },
      { key: "systemCheck",     label: T.sec_system,   icon: "\ud83d\udd0d" },
      { key: "update",          label: T.sec_updates,  icon: "\ud83d\udce6" },
      { key: "userInfo",        label: T.sec_users,    icon: "\ud83d\udc64" },
    ];

    const items = checks.map((c) => {
      const v    = attrs[c.key];
      const safe = v === "safe";
      // If attribute is missing entirely (entity not yet populated), show neutral state
      const missing = v === undefined || v === null;
      const val  = missing ? "\u2014" : v;
      let emoji  = "\u2014";
      if (safe)                              emoji = "\u2705";
      else if (v === "danger")               emoji = "\ud83d\udd34";
      else if (v === "outOfDate")            emoji = "\u2b06\ufe0f";
      else if (v === "risk" || v === "info") emoji = "\u26a0\ufe0f";
      else if (!missing)                     emoji = "\u26a0\ufe0f";

      const isOpen = this._openSecKeys?.has(c.key);
      return `<div class="security-item ${safe ? "safe" : (v && !missing ? "warn" : "")}" data-sec-key="${c.key}">
        <span class="security-icon">${c.icon}</span>
        <span class="security-label">${c.label}</span>
        <span class="security-badge">${emoji}</span>
        <div class="security-detail${isOpen ? " show" : ""}">${val}</div>
      </div>`;
    }).join("");

    return `<div class="section">
      <div class="section-title" data-entity="${this._b("security_status")}">\ud83d\udee1\ufe0f ${T.security}</div>
      <div class="security-grid">${items}</div>
    </div>`;
  }

  /* ── collect issues (with severity) ── */
  _collectIssues() {
    const issues = [];
    const p = this._config.entity_prefix;
    const thr = this._config.thresholds || {};

    const push = (severity, text) => issues.push({ severity, text });

    // Security
    const secEntity = this._b("security_status");
    const secAttrs  = this._hass?.states[secEntity]?.attributes || {};
    const skipKeys  = new Set(["friendly_name","device_class","icon","attribution"]);
    for (const [k, v] of Object.entries(secAttrs)) {
      if (typeof v === "string" && v !== "safe" && !skipKeys.has(k)) {
        const sev = (v === "danger") ? "critical" : (v === "outOfDate" ? "info" : "warning");
        push(sev, `Security \u2014 ${k}: ${v}`);
      }
    }

    // Drives
    const okDriveStates = new Set([
      "normal","initialized","not_used","not_use",
      "hotspare","hot_spare","nondisk","unknown","unavailable",
    ]);
    for (const i of detectDriveSlots(this._hass, p)) {
      const st = (this._s(this._e(`drive_${i}_status`)) || "").toLowerCase();
      if (st && !okDriveStates.has(st)) push("critical", `Drive Bay ${i}: status "${st}"`);
      if (this._s(this._b(`drive_${i}_exceeded_max_bad_sectors`)) === "on")
        push("critical", `Drive Bay ${i}: exceeded max bad sectors`);
      if (this._s(this._b(`drive_${i}_below_min_remaining_life`)) === "on")
        push("critical", `Drive Bay ${i}: below min remaining life`);
      const dt = this._n(this._e(`drive_${i}_temperature`));
      if (dt !== null && thr.drive_temp_warn != null && dt >= thr.drive_temp_warn)
        push("warning", `Drive Bay ${i}: ${dt}\u00b0C`);
    }

    // M.2
    for (const i of detectM2Slots(this._hass, p)) {
      const st = (this._s(this._e(`m_2_drive_${i}_status`)) || "").toLowerCase();
      if (st && !okDriveStates.has(st)) push("critical", `M.2 #${i}: status "${st}"`);
    }

    // Volumes
    for (const i of detectVolumes(this._hass, p)) {
      const pct = this._n(this._e(`volume_${i}_volume_used`));
      if (pct !== null && pct >= 95)      push("critical", `Volume ${i}: ${pct}% used`);
      else if (pct !== null && pct >= 90) push("warning",  `Volume ${i}: ${pct}% used`);
      const vs = (this._s(this._e(`volume_${i}_status`)) || "").toLowerCase();
      if (vs && !["normal","unknown","unavailable"].includes(vs))
        push("critical", `Volume ${i}: status "${vs}"`);
    }

    // Temperature
    const sysTemp = this._n(this._e("temperature"));
    const tRed    = thr.temp_red    ?? 70;
    const tYellow = thr.temp_yellow ?? 55;
    if (sysTemp !== null && sysTemp >= tRed)         push("critical", `System temperature: ${sysTemp}\u00b0C`);
    else if (sysTemp !== null && sysTemp >= tYellow) push("warning",  `System temperature: ${sysTemp}\u00b0C`);

    // CPU load overload (15-min average vs. core count)
    const cores  = this._config.cpu_cores || 4;
    const load15 = this._n(this._e("cpu_load_average_15_min"));
    if (load15 !== null) {
      if (load15 >= cores * 1.5) push("critical", `CPU overloaded: ${load15.toFixed(2)} / ${cores} cores (15m)`);
      else if (load15 >= cores)  push("warning",  `CPU high load: ${load15.toFixed(2)} / ${cores} cores (15m)`);
    }

    // DSM update available → info
    const dsmV = this._a(`update.${p}_dsm_update`, "installed_version");
    const dsmL = this._a(`update.${p}_dsm_update`, "latest_version");
    if (dsmV && dsmL && dsmV !== dsmL) push("info", `DSM update available: ${dsmL}`);

    return issues;
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  _render() {
    if (!this._hass || !this._config.entity_prefix) return;
    const p = this._config.entity_prefix;

    const driveSlots = detectDriveSlots(this._hass, p);
    const m2Slots    = detectM2Slots(this._hass, p);
    const volSlots   = detectVolumes(this._hass, p);

    // Resolve NAS model for front panel
    const _marker  = `sensor.${p}_cpu_utilization_total`;
    const _entReg  = this._hass?.entities?.[_marker];
    const _device  = _entReg?.device_id ? this._hass?.devices?.[_entReg.device_id] : null;
    const nasModel = _device?.model?.trim() || "";
    const panelDef = this._config.show_front_panel
      ? findPanelDef(nasModel, driveSlots.length)
      : null;

    const cores    = this._config.cpu_cores || 4;
    const load1    = this._n(this._e("cpu_load_average_1_min"));
    const load5    = this._n(this._e("cpu_load_average_5_min"));
    const load15   = this._n(this._e("cpu_load_average_15_min"));
    const mem      = this._n(this._e("memory_usage_real"));
    const temp     = this._n(this._e("temperature"));
    const lastBoot = this._s(this._e("last_boot"));
    const dsmV     = this._a(`update.${p}_dsm_update`, "installed_version");
    const dsmL     = this._a(`update.${p}_dsm_update`, "latest_version");

    const issues  = this._collectIssues();
    const nCritical = issues.filter((x) => x.severity === "critical").length;
    const nWarning  = issues.filter((x) => x.severity === "warning").length;
    const nInfo     = issues.filter((x) => x.severity === "info").length;
    const worst   = nCritical ? "critical" : nWarning ? "warning" : nInfo ? "info" : "ok";
    const healthy = nCritical === 0 && nWarning === 0; // info alone = still healthy
    const hasUpd  = dsmV && dsmL && dsmV !== dsmL;

    const dsmDisplay = dsmV ? dsmV.replace(/^DSM\s+/i, "") : "";
    const dsmLatest  = dsmL ? dsmL.replace(/^DSM\s+/i, "") : "";
    const cardName   = this._config.name || prettyName(p);
    const uptime     = fmtUptime(lastBoot);
    const bootStr    = fmtBootDate(lastBoot);

    // Drive HTML (optionally hide empty bays)
    const isEmpty = (pfx, i) => {
      const s = this._s(this._e(`${pfx}_${i}_status`));
      return !s || s === "unavailable" || s === "unknown";
    };
    let drivesHtml = "";
    for (const i of driveSlots) {
      if (this._config.hide_empty_bays && isEmpty("drive", i)) continue;
      drivesHtml += this._driveBay(i, false);
    }
    for (const i of m2Slots) {
      if (this._config.hide_empty_bays && isEmpty("m_2_drive", i)) continue;
      drivesHtml += this._driveBay(i, true);
    }

    // Volume HTML
    let volsHtml = "";
    for (const i of volSlots) volsHtml += this._volume(i);

    // Memory HTML
    let memHtml = "";
    if (this._config.show_memory) {
      const mA  = this._n(this._e("memory_available_real"));
      const mT  = this._n(this._e("memory_total_real"));
      const mC  = this._n(this._e("memory_cached"));
      const mS  = this._n(this._e("memory_size"));
      const mSA = this._n(this._e("memory_available_swap"));
      const mST = this._n(this._e("memory_total_swap"));
      const swapUsed = (mST !== null && mSA !== null) ? Math.max(0, mST - mSA) : null;
      const swapPct  = (mST !== null && mST > 0 && swapUsed !== null) ? (swapUsed / mST * 100) : null;
      if (mA !== null || mT !== null || mC !== null || mS !== null || mST !== null) {
        memHtml = `<div class="section">
          <div class="section-title">\ud83e\udde0 ${T.memory}</div>
          <div class="info-grid">
            ${mS !== null ? `<div class="info-item" data-entity="${this._e("memory_size")}"><span class="info-label">${T.size}</span><span class="info-value">${Math.round(mS)} MB</span></div>` : ""}
            ${mT !== null ? `<div class="info-item" data-entity="${this._e("memory_total_real")}"><span class="info-label">${T.total}</span><span class="info-value">${Math.round(mT)} MB</span></div>` : ""}
            ${mA !== null ? `<div class="info-item" data-entity="${this._e("memory_available_real")}"><span class="info-label">${T.available}</span><span class="info-value">${Math.round(mA)} MB</span></div>` : ""}
            ${mC !== null ? `<div class="info-item" data-entity="${this._e("memory_cached")}"><span class="info-label">${T.cached}</span><span class="info-value">${Math.round(mC)} MB</span></div>` : ""}
            ${mST !== null ? `<div class="info-item" data-entity="${this._e("memory_total_swap")}"><span class="info-label">${T.swap_total}</span><span class="info-value">${Math.round(mST)} MB</span></div>` : ""}
            ${swapUsed !== null ? `<div class="info-item" data-entity="${this._e("memory_available_swap")}"><span class="info-label">${T.swap_used}</span><span class="info-value">${Math.round(swapUsed)} MB${swapPct !== null ? ` (${swapPct.toFixed(0)}%)` : ""}</span></div>` : ""}
          </div>
        </div>`;
      }
    }

    // Issues panel (sorted by severity: critical → warning → info)
    const sevOrder = { critical: 0, warning: 1, info: 2 };
    const sevIcon  = { critical: "\ud83d\udd34", warning: "\u26a0\ufe0f", info: "\u2139\ufe0f" };
    const sortedIssues = [...issues].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
    const issuesPanel = issues.length ? `
      <div class="issues-panel ${this._issuesOpen ? "open" : ""}">
        <div class="issues-list">
          ${sortedIssues.map((iss) => `<div class="issue-row issue-${iss.severity}">${sevIcon[iss.severity]} ${iss.text}</div>`).join("")}
          <div class="issues-actions">
            <button class="notify-btn ${this._notifFeedback ? "sent" : ""}" id="btn-notify-ha">
              ${this._notifFeedback ? T.notif_sent : `\ud83d\udd14 ${T.notify_ha}`}
            </button>
          </div>
        </div>
      </div>` : "";

    // Footer
    const footerItems = [];
    if (this._config.dsm_url) {
      footerItems.push(
        `<a href="${this._config.dsm_url}" target="_blank" rel="noopener noreferrer" class="dsm-link">\ud83c\udf10 ${T.open_dsm}</a>`
      );
    }
    if (this._config.show_power) {
      footerItems.push(`<div class="power-row">
        <button class="power-lock-btn ${this._powerUnlocked ? "unlocked" : ""}" id="btn-power-lock"
          title="${this._powerUnlocked ? "Lock" : "Unlock"} power controls">
          ${this._powerUnlocked ? "\ud83d\udd13" : "\ud83d\udd12"}
        </button>
        <button class="power-btn reboot ${this._powerUnlocked ? "" : "locked"}"
          id="btn-reboot" ${this._powerUnlocked ? "" : "disabled"}>
          \ud83d\udd04 ${T.reboot}
        </button>
        ${this._config.show_shutdown ? `
        <button class="power-btn shutdown ${this._powerUnlocked ? "" : "locked"}"
          id="btn-shutdown" ${this._powerUnlocked ? "" : "disabled"}>
          \u23fb ${T.shutdown}
        </button>` : ""}
      </div>`);
    }
    const footerHtml = footerItems.length
      ? `<div class="card-footer">${footerItems.join("")}</div>`
      : "";

    /* ── Assemble ── */
    this.shadowRoot.innerHTML = `<style>${this._css()}</style>
    <ha-card class="${this._config.compact_mode ? "compact" : ""}">
      <div class="card-header">
        <div class="header-top">
          <span class="nas-name">${cardName}</span>
          <span class="overall-status status-${worst}" id="status-badge">
            ${worst === "ok"       ? `\ud83d\udfe2 ${T.healthy}`
              : worst === "info"   ? `\u2139\ufe0f ${nInfo} info`
              : worst === "warning"? `\u26a0\ufe0f ${nCritical + nWarning} ${T.issue_detected}`
              :                      `\ud83d\udd34 ${nCritical} ${T.issue_detected}`}
            ${issues.length ? `<span class="expand-hint">${this._issuesOpen ? "\u25b2" : "\u25bc"}</span>` : ""}
          </span>
        </div>
        ${issuesPanel}
        <div class="header-sub">
          ${dsmDisplay ? `<span class="dsm-ver" data-entity="update.${p}_dsm_update">DSM ${dsmDisplay}</span>` : ""}
          ${hasUpd ? `<button class="update-badge" id="btn-install-update" title="${T.install_update}">\u2b06\ufe0f ${dsmLatest}</button>` : ""}
        </div>
        ${bootStr ? `
        <div class="header-sub boot-line" data-entity="${this._e("last_boot")}">
          <span class="last-boot">${T.last_boot} ${bootStr}</span>
          ${uptime ? `<span class="uptime">${T.uptime} ${uptime}</span>` : ""}
        </div>` : ""}
      </div>

      <div class="gauges-row">
        ${this._gauge(load15, cores, T.cpu, "",
          { yellow: this._config.thresholds.cpu_yellow ?? cores * 0.7,
            red:    this._config.thresholds.cpu_red    ?? cores * 1.0 },
          2, this._e("cpu_load_average_15_min"),
          this._sparkline(this._e("cpu_load_average_15_min"), "var(--primary-color,#03a9f4)"))}
        ${this._gauge(mem, 100, T.ram, "%",
          { yellow: this._config.thresholds.ram_yellow ?? 70,
            red:    this._config.thresholds.ram_red    ?? 90 },
          0, this._e("memory_usage_real"),
          this._sparkline(this._e("memory_usage_real"), "var(--accent-color,#ff4081)"))}
        ${this._gauge(temp, 80,
          `${T.temp} ${this._trendArrow(this._e("temperature"), temp, 1)}`,
          "\u00b0C",
          { yellow: this._config.thresholds.temp_yellow ?? 55,
            red:    this._config.thresholds.temp_red    ?? 70 },
          0, this._e("temperature"),
          this._sparkline(this._e("temperature"), "var(--warning-color,#ff9800)"))}
      </div>
      ${(load1 !== null || load5 !== null || load15 !== null) ? `
      <div class="load-row">
        <span class="load-label">${T.load_avg}:</span>
        <span class="load-item"><span class="load-key">1m</span> ${load1 !== null ? load1.toFixed(2) : "\u2014"}</span>
        <span class="load-item"><span class="load-key">5m</span> ${load5 !== null ? load5.toFixed(2) : "\u2014"}</span>
        <span class="load-item"><span class="load-key">15m</span> ${load15 !== null ? load15.toFixed(2) : "\u2014"}</span>
        <span class="load-cores">/ ${cores}</span>
      </div>` : ""}

      ${panelDef ? this._frontPanel(panelDef, driveSlots, m2Slots) : ""}

      ${drivesHtml ? `
      <div class="section">
        <div class="section-title">\ud83d\udcbe ${T.drive_bays}</div>
        <div class="drives-grid">${drivesHtml}</div>
      </div>` : ""}

      ${volsHtml ? `
      <div class="section">
        <div class="section-title">\ud83d\udce6 ${T.volumes}</div>
        ${volsHtml}
      </div>` : ""}

      ${memHtml}
      ${this._config.show_security ? this._security() : ""}
      ${footerHtml}
    </ha-card>`;

    /* ── Event bindings ── */

    // Issues badge toggle
    const badge = this.shadowRoot.getElementById("status-badge");
    if (badge && issues.length) {
      badge.style.cursor = "pointer";
      badge.addEventListener("click", () => {
        this._issuesOpen = !this._issuesOpen;
        this._render();
      });
    }

    // Notify HA button
    const notifyBtn = this.shadowRoot.getElementById("btn-notify-ha");
    if (notifyBtn) {
      notifyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._hass.callService("persistent_notification", "create", {
          title: T.notif_title,
          message: sortedIssues.map((iss) => `${sevIcon[iss.severity]} ${iss.text}`).join("\n"),
          notification_id: `synology_nas_issues_${this._config.entity_prefix}`,
        });
        this._notifFeedback = true;
        this._render();
        setTimeout(() => { this._notifFeedback = false; }, 3000);
      });
    }

    // Security item click → toggle detail (persistent across re-renders)
    this.shadowRoot.querySelectorAll(".security-item").forEach((el) => {
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = el.getAttribute("data-sec-key");
        if (!key) return;
        if (this._openSecKeys.has(key)) this._openSecKeys.delete(key);
        else this._openSecKeys.add(key);
        el.querySelector(".security-detail")?.classList.toggle("show");
      });
    });

    // Drive bay inline expand toggles
    this.shadowRoot.querySelectorAll("[data-expand-drive]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = el.getAttribute("data-expand-drive");
        if (!key) return;
        if (this._openDrives.has(key)) this._openDrives.delete(key);
        else this._openDrives.add(key);
        this._render();
      });
    });

    // Volume inline expand toggles
    this.shadowRoot.querySelectorAll("[data-expand-volume]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(el.getAttribute("data-expand-volume"), 10);
        if (isNaN(id)) return;
        if (this._openVolumes.has(id)) this._openVolumes.delete(id);
        else this._openVolumes.add(id);
        this._render();
      });
    });

    // Bind more-info on every element with data-entity
    this.shadowRoot.querySelectorAll("[data-entity]").forEach((el) => {
      const eid = el.getAttribute("data-entity");
      this._bindMoreInfo(el, eid);
    });

    // Power lock toggle
    const lockBtn = this.shadowRoot.getElementById("btn-power-lock");
    if (lockBtn) {
      lockBtn.addEventListener("click", () => {
        this._powerUnlocked = !this._powerUnlocked;
        this._render();
      });
    }

    // Reboot (double confirm)
    const rb = this.shadowRoot.getElementById("btn-reboot");
    if (rb && this._powerUnlocked) {
      rb.addEventListener("click", () => {
        if (confirm(T.confirm_reboot_1)) {
          if (confirm(T.confirm_reboot_2)) {
            this._hass.callService("button", "press", {
              entity_id: `button.${p}_reboot`,
            });
            this._powerUnlocked = false;
            this._render();
          }
        }
      });
    }

    // Shutdown (double confirm)
    const sd = this.shadowRoot.getElementById("btn-shutdown");
    if (sd && this._powerUnlocked) {
      sd.addEventListener("click", () => {
        if (confirm(T.confirm_shutdown_1)) {
          if (confirm(T.confirm_shutdown_2)) {
            this._hass.callService("button", "press", {
              entity_id: `button.${p}_shutdown`,
            });
            this._powerUnlocked = false;
            this._render();
          }
        }
      });
    }

    // Install DSM update (click on update badge → confirm → install)
    const upd = this.shadowRoot.getElementById("btn-install-update");
    if (upd) {
      upd.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(T.confirm_update)) {
          this._hass.callService("update", "install", {
            entity_id: `update.${p}_dsm_update`,
          });
        }
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     CSS
     ═══════════════════════════════════════════════════════════════ */
  _css() {
    return `
:host { --card-padding: 16px; }
ha-card { padding: var(--card-padding); overflow: hidden; }

/* Compact mode */
ha-card.compact { --card-padding: 10px; }
ha-card.compact .card-header { margin-bottom: 8px; }
ha-card.compact .gauges-row { margin: 8px 0 4px; }
ha-card.compact .gauge-svg { width: 72px; height: 44px; }
ha-card.compact .gauge-value { font-size: .95em; }
ha-card.compact .gauge-label { font-size: .7em; }
ha-card.compact .section { margin-top: 10px; padding-top: 8px; }
ha-card.compact .section-title { margin-bottom: 6px; font-size: .85em; }
ha-card.compact .drive-bay { padding: 6px; }
ha-card.compact .drive-icon { font-size: 1.2em; }
ha-card.compact .drive-label { font-size: .75em; }
ha-card.compact .drive-status { font-size: .7em; }
ha-card.compact .drive-temp, ha-card.compact .drive-smart { font-size: .65em; }
ha-card.compact .volume-card { padding: 8px; margin-bottom: 6px; }
ha-card.compact .info-item { padding: 2px 6px; font-size: .75em; }

/* Clickable → HA more-info */
.clickable { cursor: pointer; transition: opacity .15s, background .15s; }
.clickable:hover { opacity: .85; }
.gauge.clickable:hover .gauge-value { text-decoration: underline; text-decoration-style: dotted; }
.drive-bay.clickable:hover,
.drive-bay-head.clickable:hover { background: color-mix(in srgb, var(--primary-text-color) 4%, var(--card-background-color,#fff)); }
.volume-card.clickable:hover,
.volume-body.clickable:hover { background: color-mix(in srgb, var(--primary-text-color) 4%, var(--card-background-color,#fff)); }
.info-item.clickable:hover { background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); border-radius: 4px; }

/* Header */
.card-header { margin-bottom: 16px; }
.header-top {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 8px;
}
.nas-name {
  font-size: 1.3em; font-weight: 700; color: var(--primary-text-color);
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.overall-status {
  font-size: .85em; font-weight: 600; padding: 4px 12px; border-radius: 12px;
  user-select: none; transition: background .2s; white-space: nowrap; flex-shrink: 0;
}
.overall-status.status-ok {
  background: color-mix(in srgb, var(--success-color,#4caf50) 15%, transparent);
  color: var(--success-color,#4caf50);
}
.overall-status.status-info {
  background: color-mix(in srgb, var(--info-color,#03a9f4) 15%, transparent);
  color: var(--info-color,#03a9f4);
}
.overall-status.status-warning {
  background: color-mix(in srgb, var(--warning-color,#ff9800) 18%, transparent);
  color: var(--warning-color,#ff9800);
}
.overall-status.status-critical {
  background: color-mix(in srgb, var(--error-color,#f44336) 15%, transparent);
  color: var(--error-color,#f44336);
}
.overall-status.status-critical:hover,
.overall-status.status-warning:hover,
.overall-status.status-info:hover {
  filter: brightness(1.1);
}
.expand-hint { font-size: .7em; margin-left: 4px; opacity: .6; }

/* Issues panel */
.issues-panel {
  max-height: 0; overflow: hidden;
  transition: max-height .3s ease, padding .3s ease;
}
.issues-panel.open { max-height: 600px; padding: 4px 0; }
.issues-list {
  background: color-mix(in srgb, var(--primary-text-color) 4%, transparent);
  border-radius: 8px; padding: 8px 12px; margin-top: 8px;
}
.issue-row {
  font-size: .8em; color: var(--primary-text-color); padding: 3px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--divider-color,#e0e0e0) 50%, transparent);
  border-left: 3px solid transparent; padding-left: 8px; margin-left: -8px;
}
.issue-row:last-child { border-bottom: none; }
.issue-row.issue-critical { border-left-color: var(--error-color,#f44336); }
.issue-row.issue-warning  { border-left-color: var(--warning-color,#ff9800); }
.issue-row.issue-info     { border-left-color: var(--info-color,#03a9f4); }
.issues-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
.notify-btn {
  padding: 5px 12px; border: 1px solid var(--divider-color,#ccc); border-radius: 8px;
  background: transparent; font-size: .78em; cursor: pointer; font-weight: 600;
  color: var(--primary-text-color); transition: background .2s, color .2s, border-color .2s;
}
.notify-btn:hover {
  background: color-mix(in srgb, var(--primary-color,#03a9f4) 12%, transparent);
}
.notify-btn.sent {
  background: color-mix(in srgb, var(--success-color,#4caf50) 15%, transparent);
  color: var(--success-color,#4caf50); border-color: var(--success-color,#4caf50);
  cursor: default;
}

/* Header sub */
.header-sub {
  margin-top: 4px; font-size: .8em; color: var(--secondary-text-color);
  display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
}
.update-badge {
  background: var(--warning-color,#ff9800); color: #fff;
  padding: 1px 8px; border-radius: 8px; font-size: .85em;
  border: none; cursor: pointer; font-weight: 600;
  transition: filter .15s;
}
.update-badge:hover { filter: brightness(1.1); }
.boot-line { margin-top: 2px; }
.last-boot { font-size: .78em; }
.uptime { font-size: .78em; font-weight: 600; color: var(--primary-text-color); }

/* Gauges */
.gauges-row {
  display: flex; justify-content: space-around; margin: 16px 0;
  flex-wrap: wrap; gap: 8px;
}
.gauge { text-align: center; flex: 1; min-width: 80px; }
.gauge-svg { width: 90px; height: 54px; display: block; margin: 0 auto; }
.gauge-value {
  font-size: 1.1em; font-weight: 700; margin-top: -4px;
  color: var(--primary-text-color); line-height: 1.2;
}
.gauge-label { font-size: .75em; color: var(--secondary-text-color); margin-top: 2px; }
.sparkline { width: 90px; height: 14px; display: block; margin: 2px auto 0; opacity: .7; }
.trend { font-size: .85em; margin-left: 2px; }
.trend-up   { color: var(--error-color,#f44336); }
.trend-down { color: var(--success-color,#4caf50); }
.trend-flat { color: var(--secondary-text-color); opacity: .6; }

/* Load average row */
.load-row {
  display: flex; justify-content: center; align-items: center; flex-wrap: wrap;
  gap: 10px; margin: -6px 0 8px; font-size: .78em;
  color: var(--secondary-text-color);
}
.load-label { font-weight: 600; }
.load-item { display: inline-flex; align-items: baseline; gap: 3px; }
.load-key {
  font-size: .85em; opacity: .7; text-transform: uppercase;
}
.load-item { color: var(--primary-text-color); font-weight: 600; }
.load-cores { opacity: .6; font-size: .9em; }

/* Sections */
.section {
  margin-top: 16px; padding-top: 12px;
  border-top: 1px solid var(--divider-color,#e0e0e0);
}
.section-title {
  font-size: .9em; font-weight: 600; margin-bottom: 10px;
  color: var(--primary-text-color);
}

/* Drives */
.drives-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px;
}
.drive-bay {
  display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; padding: 8px;
  border-radius: 8px; border: 1px solid var(--divider-color,#e0e0e0);
  background: var(--card-background-color,#fff); transition: border-color .2s;
  align-items: start;
}
.drive-bay.empty { opacity: .35; }
.drive-bay.warning { border-color: var(--error-color,#f44336); }
.drive-bay.hotspare {
  border-color: var(--warning-color,#ff9800);
  background: color-mix(in srgb, var(--warning-color,#ff9800) 6%, transparent);
}
.drive-bay.open { border-color: var(--primary-color,#03a9f4); }
.drive-bay-head {
  display: flex; gap: 8px; min-width: 0;
}
.drive-icon { font-size: 1.4em; line-height: 1; margin-top: 2px; flex-shrink: 0; }
.drive-info { flex: 1; min-width: 0; }
.drive-label { font-size: .8em; font-weight: 600; color: var(--primary-text-color); }
.drive-status { font-size: .75em; font-weight: 600; text-transform: capitalize; }
.drive-temp, .drive-smart { font-size: .7em; color: var(--secondary-text-color); }
.drive-warnings { font-size: .7em; color: var(--error-color,#f44336); margin-top: 2px; }

/* Inline expand (drives + volumes) */
.expand-toggle {
  grid-column: 2; justify-self: end; align-self: start;
  width: 22px; height: 22px; padding: 0;
  border: 1px solid var(--divider-color,#e0e0e0); border-radius: 4px;
  background: transparent; color: var(--secondary-text-color);
  font-size: .7em; cursor: pointer; line-height: 1;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background .15s, border-color .15s, color .15s;
  flex-shrink: 0;
}
.expand-toggle:hover {
  background: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
  color: var(--primary-text-color); border-color: var(--primary-color,#03a9f4);
}
.drive-expand, .volume-expand {
  grid-column: 1 / -1;
  margin-top: 6px; padding: 6px 8px;
  background: color-mix(in srgb, var(--primary-text-color) 3%, transparent);
  border-radius: 6px; font-size: .72em;
  display: flex; flex-direction: column; gap: 3px;
  max-height: 220px; overflow-y: auto;
}
.expand-row {
  display: flex; justify-content: space-between; gap: 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--divider-color,#e0e0e0) 40%, transparent);
  padding: 2px 0;
}
.expand-row:last-child { border-bottom: none; }
.expand-key {
  color: var(--secondary-text-color); font-weight: 600;
  white-space: nowrap; text-transform: capitalize;
}
.expand-val {
  color: var(--primary-text-color); text-align: right;
  word-break: break-word; max-width: 65%;
}

/* Volumes */
.volume-card {
  position: relative;
  padding: 10px; border-radius: 8px; border: 1px solid var(--divider-color,#e0e0e0);
  background: var(--card-background-color,#fff); margin-bottom: 8px;
}
.volume-card.open { border-color: var(--primary-color,#03a9f4); }
.volume-card .expand-toggle {
  position: absolute; top: 8px; right: 8px;
  grid-column: auto; justify-self: auto;
}
.volume-body { cursor: pointer; }
.volume-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px; gap: 8px; flex-wrap: wrap;
  padding-right: 30px; /* leave room for expand toggle */
}
.volume-title { font-weight: 600; font-size: .85em; color: var(--primary-text-color); }
.volume-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.raid-badge {
  font-size: .7em; font-weight: 600; padding: 1px 7px; border-radius: 10px;
  background: color-mix(in srgb, var(--primary-color,#03a9f4) 12%, transparent);
  color: var(--primary-color,#03a9f4);
}
.volume-status { font-size: .75em; color: var(--secondary-text-color); text-transform: capitalize; }
.volume-bar-container {
  height: 8px; background: var(--divider-color,#e0e0e0);
  border-radius: 4px; overflow: hidden;
}
.volume-bar { height: 100%; border-radius: 4px; transition: width .5s ease; }
.volume-details {
  display: flex; justify-content: space-between; flex-wrap: wrap;
  margin-top: 6px; font-size: .75em; color: var(--secondary-text-color); gap: 4px;
}
.volume-temps {
  display: flex; gap: 16px; margin-top: 4px;
  font-size: .7em; color: var(--secondary-text-color);
}

/* Memory */
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.info-item { display: flex; justify-content: space-between; padding: 4px 8px; font-size: .8em; }
.info-label { color: var(--secondary-text-color); }
.info-value { font-weight: 600; color: var(--primary-text-color); }

/* Security */
.security-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.security-item {
  display: flex; align-items: center; gap: 4px; padding: 6px 8px;
  border-radius: 6px; font-size: .75em; border: 1px solid var(--divider-color,#e0e0e0);
  position: relative; flex-wrap: wrap; transition: background .2s;
}
.security-item:hover {
  background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
}
.security-item.safe {
  background: color-mix(in srgb, var(--success-color,#4caf50) 8%, transparent);
}
.security-item.warn {
  background: color-mix(in srgb, var(--warning-color,#ff9800) 10%, transparent);
}
.security-icon { font-size: 1em; }
.security-label { flex: 1; color: var(--primary-text-color); }
.security-badge { font-size: 1em; }
.security-detail {
  display: none; width: 100%; font-size: .85em; margin-top: 4px; padding: 4px 6px;
  color: var(--secondary-text-color);
  background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
  border-radius: 4px; font-style: italic;
}
.security-detail.show { display: block; }

/* Footer */
.card-footer {
  display: flex; align-items: center; gap: 12px; margin-top: 16px; padding-top: 12px;
  border-top: 1px solid var(--divider-color,#e0e0e0); flex-wrap: wrap;
}
.dsm-link {
  display: inline-flex; align-items: center; gap: 4px; padding: 6px 16px;
  border-radius: 8px; font-size: .85em; font-weight: 600;
  color: var(--primary-color,#03a9f4);
  background: color-mix(in srgb, var(--primary-color,#03a9f4) 12%, transparent);
  text-decoration: none; transition: background .2s;
}
.dsm-link:hover {
  background: color-mix(in srgb, var(--primary-color,#03a9f4) 22%, transparent);
}
.power-row { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.power-lock-btn {
  width: 32px; height: 32px; border: 1px solid var(--divider-color,#e0e0e0);
  border-radius: 6px; background: transparent; cursor: pointer;
  font-size: 1em; display: flex; align-items: center; justify-content: center;
  transition: background .2s, border-color .2s;
}
.power-lock-btn.unlocked {
  background: color-mix(in srgb, var(--warning-color,#ff9800) 15%, transparent);
  border-color: var(--warning-color,#ff9800);
}
.power-btn {
  padding: 6px 14px; border: none; border-radius: 8px; font-size: .8em;
  font-weight: 600; cursor: pointer; transition: opacity .2s;
}
.power-btn.locked { opacity: .3; cursor: not-allowed; }
.power-btn:hover:not(.locked) { opacity: .8; }
.power-btn.reboot {
  background: color-mix(in srgb, var(--warning-color,#ff9800) 15%, transparent);
  color: var(--warning-color,#ff9800);
}
.power-btn.shutdown {
  background: color-mix(in srgb, var(--error-color,#f44336) 15%, transparent);
  color: var(--error-color,#f44336);
}

/* Front Panel */
.front-panel-section { overflow: hidden; }
.front-panel-wrap {
  width: 100%; overflow-x: auto;
  border-radius: 8px;
  padding-bottom: 4px;
}
.front-panel-svg {
  display: block;
  max-width: 100%;
  height: auto;
  min-width: 120px;
  border-radius: 8px;
}
.fp-slot { transition: opacity .15s; }
.fp-slot:hover { opacity: .8; cursor: pointer; }

/* Responsive — narrow */
@media (max-width: 420px) {
  :host { --card-padding: 12px; }
  .gauges-row { gap: 4px; }
  .gauge-svg { width: 76px; height: 46px; }
  .gauge-value { font-size: 1em; }
  .drives-grid { grid-template-columns: 1fr 1fr; }
  .security-grid { grid-template-columns: 1fr 1fr; }
  .info-grid { grid-template-columns: 1fr; }
  .card-footer { flex-direction: column; align-items: stretch; }
  .power-row { margin-left: 0; justify-content: flex-end; }
  .volume-details { flex-direction: column; gap: 2px; }
  .header-top { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 300px) {
  .gauges-row { flex-direction: column; align-items: center; }
  .drives-grid { grid-template-columns: 1fr; }
  .security-grid { grid-template-columns: 1fr; }
}`;
  }
}

/* ═══════════════════════════════════════════════════════════════
   Card Editor
   ═══════════════════════════════════════════════════════════════ */

class SynologyNasCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass   = null;
  }

  set hass(h) { this._hass = h; this._render(); }
  setConfig(c) { this._config = { ...c }; this._render(); }

  _render() {
    if (!this._hass) return;
    const prefixes = discoverPrefixes(this._hass);
    const current  = this._config.entity_prefix || "";
    const isCustom = current && !prefixes.includes(current);

    const optionsHtml = prefixes.map((p) =>
      `<option value="${p}" ${p === current ? "selected" : ""}>${prettyName(p)} (${p})</option>`
    ).join("");

    // Auto-detected summary (drives / M.2 / volumes / model / cores)
    let detectedHtml = "";
    if (current && this._hass) {
      const d = detectDriveSlots(this._hass, current);
      const m = detectM2Slots(this._hass, current);
      const v = detectVolumes(this._hass, current);
      const autoCores = detectCoresFromModel(this._hass, current);
      // NAS model (from device registry) for display
      const marker = `sensor.${current}_cpu_utilization_total`;
      const entReg = this._hass.entities?.[marker];
      const device = entReg?.device_id ? this._hass.devices?.[entReg.device_id] : null;
      const model  = device?.model || "";
      if (d.length || m.length || v.length) {
        detectedHtml = `<div class="detected ok">
          \u2705 ${T.auto_detected}: ${d.length} ${T.hdd_bays}, ${m.length} ${T.m2_slots}, ${v.length} volumes${model ? ` \u2014 ${model}` : ""}${autoCores ? ` \u2014 ${autoCores} cores` : ""}
        </div>`;
      } else {
        detectedHtml = `<div class="detected warn">
          \u26a0\ufe0f ${T.no_detected} "${current}"
        </div>`;
      }
    }

    this.shadowRoot.innerHTML = `<style>
      .editor { padding: 16px; }
      .editor label {
        display: block; margin: 10px 0 4px; font-weight: 600; font-size: .9em;
        color: var(--primary-text-color);
      }
      .editor input, .editor select {
        width: 100%; padding: 8px; border: 1px solid var(--divider-color,#ccc);
        border-radius: 6px; box-sizing: border-box; font-size: .9em;
        background: var(--card-background-color,#fff); color: var(--primary-text-color);
      }
      .editor small {
        display: block; color: var(--secondary-text-color); margin-top: 2px; font-size: .78em;
      }
      .editor .check { display: flex; align-items: center; gap: 8px; margin: 6px 0; cursor: pointer; }
      .editor .check input { width: auto; cursor: pointer; }
      .editor details.adv {
        margin-top: 12px; padding: 8px 12px; border-radius: 6px;
        border: 1px solid var(--divider-color,#ccc);
      }
      .editor details.adv summary {
        cursor: pointer; font-weight: 600; font-size: .9em;
        color: var(--primary-text-color); padding: 2px 0;
      }
      .editor .thr-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px;
        margin-top: 8px;
      }
      .editor .thr-grid label { margin: 0 0 4px; font-size: .8em; font-weight: 500; }
      .editor .thr-grid input { padding: 6px; font-size: .85em; }
      .detected {
        margin-top: 8px; padding: 8px 12px; border-radius: 6px;
        font-size: .8em; color: var(--primary-text-color);
      }
      .detected.ok {
        background: color-mix(in srgb, var(--success-color,#4caf50) 10%, transparent);
      }
      .detected.warn {
        background: color-mix(in srgb, var(--warning-color,#ff9800) 10%, transparent);
      }
    </style>
    <div class="editor">
      <label>NAS</label>
      <select id="entity_prefix">
        ${prefixes.length ? "" : `<option value="">${T.no_nas}</option>`}
        ${optionsHtml}
        <option value="__custom" ${isCustom ? "selected" : ""}>${T.custom_prefix}</option>
      </select>

      <div id="custom-wrap" style="display:${isCustom ? "block" : "none"}">
        <label>Entity Prefix</label>
        <input type="text" id="custom_prefix" value="${current}" placeholder="synology_nas">
        <small>The common prefix of your Synology entities (e.g. synology_nas, synology_ds920)</small>
      </div>

      ${detectedHtml}

      <label>Card Name (optional)</label>
      <input type="text" id="name" value="${this._config.name || ""}" placeholder="Auto-detected from prefix">

      <label>DSM URL (optional)</label>
      <input type="text" id="dsm_url" value="${this._config.dsm_url || ""}" placeholder="https://192.168.1.100:5001">
      <small>Link to the Synology DSM web interface</small>

      <label>CPU cores</label>
      <input type="number" id="cpu_cores" min="1" max="64" step="1"
        value="${this._config.cpu_cores || 4}" placeholder="4">
      <small>Number of CPU cores (used as max for the load average gauge — DS1821+ = 4, DS1621+ = 4, DS920+ = 4, DS224+ = 4)</small>

      <div class="check">
        <input type="checkbox" id="show_front_panel" ${this._config.show_front_panel !== false ? "checked" : ""}>
        <label for="show_front_panel">Show Front Panel (SVG device view)</label>
      </div>
      <div class="check">
        <input type="checkbox" id="show_security" ${this._config.show_security !== false ? "checked" : ""}>
        <label for="show_security">Show Security Advisor</label>
      </div>
      <div class="check">
        <input type="checkbox" id="show_memory" ${this._config.show_memory !== false ? "checked" : ""}>
        <label for="show_memory">Show Memory Details</label>
      </div>
      <div class="check">
        <input type="checkbox" id="show_power" ${this._config.show_power === true ? "checked" : ""}>
        <label for="show_power">Show Power Controls (reboot, locked by default)</label>
      </div>
      <div class="check">
        <input type="checkbox" id="show_shutdown" ${this._config.show_shutdown === true ? "checked" : ""}>
        <label for="show_shutdown">Also show Shutdown button (requires Power Controls)</label>
      </div>
      <div class="check">
        <input type="checkbox" id="compact_mode" ${this._config.compact_mode === true ? "checked" : ""}>
        <label for="compact_mode">Compact mode (denser layout)</label>
      </div>
      <div class="check">
        <input type="checkbox" id="hide_empty_bays" ${this._config.hide_empty_bays === true ? "checked" : ""}>
        <label for="hide_empty_bays">Hide empty drive/M.2 bays</label>
      </div>

      <details class="adv">
        <summary>Advanced thresholds</summary>
        <div class="thr-grid">
          <div>
            <label>RAM warn %</label>
            <input type="number" id="thr_ram_yellow" min="1" max="100" step="1"
              value="${this._config.thresholds?.ram_yellow ?? 70}">
          </div>
          <div>
            <label>RAM critical %</label>
            <input type="number" id="thr_ram_red" min="1" max="100" step="1"
              value="${this._config.thresholds?.ram_red ?? 90}">
          </div>
          <div>
            <label>Temp warn \u00b0C</label>
            <input type="number" id="thr_temp_yellow" min="0" max="120" step="1"
              value="${this._config.thresholds?.temp_yellow ?? 55}">
          </div>
          <div>
            <label>Temp critical \u00b0C</label>
            <input type="number" id="thr_temp_red" min="0" max="120" step="1"
              value="${this._config.thresholds?.temp_red ?? 70}">
          </div>
          <div>
            <label>CPU warn (load/core)</label>
            <input type="number" id="thr_cpu_yellow" min="0" max="10" step="0.05"
              value="${this._config.thresholds?.cpu_yellow ?? ""}" placeholder="0.70">
          </div>
          <div>
            <label>CPU critical (load/core)</label>
            <input type="number" id="thr_cpu_red" min="0" max="10" step="0.05"
              value="${this._config.thresholds?.cpu_red ?? ""}" placeholder="1.00">
          </div>
          <div>
            <label>Drive temp warn \u00b0C</label>
            <input type="number" id="thr_drive_temp_warn" min="0" max="120" step="1"
              value="${this._config.thresholds?.drive_temp_warn ?? 50}">
          </div>
        </div>
      </details>
    </div>`;

    /* ── Bindings ── */
    const sel         = this.shadowRoot.getElementById("entity_prefix");
    const customWrap  = this.shadowRoot.getElementById("custom-wrap");
    const customInput = this.shadowRoot.getElementById("custom_prefix");

    sel?.addEventListener("change", (e) => {
      if (e.target.value === "__custom") {
        customWrap.style.display = "block";
        customInput?.focus();
      } else {
        customWrap.style.display = "none";
        const newPfx = e.target.value;
        const autoCores = detectCoresFromModel(this._hass, newPfx);
        this._config = {
          ...this._config,
          entity_prefix: newPfx,
          ...(autoCores ? { cpu_cores: autoCores } : {}),
        };
        this._fire();
        this._render();
      }
    });

    customInput?.addEventListener("input", (e) => {
      this._config = { ...this._config, entity_prefix: e.target.value };
      this._fire();
    });

    this.shadowRoot.getElementById("name")?.addEventListener("input", (e) => {
      this._config = { ...this._config, name: e.target.value };
      this._fire();
    });

    this.shadowRoot.getElementById("dsm_url")?.addEventListener("input", (e) => {
      this._config = { ...this._config, dsm_url: e.target.value };
      this._fire();
    });

    this.shadowRoot.getElementById("cpu_cores")?.addEventListener("input", (e) => {
      const n = parseInt(e.target.value, 10);
      this._config = { ...this._config, cpu_cores: isNaN(n) || n < 1 ? 4 : n };
      this._fire();
    });

    ["show_front_panel", "show_security", "show_memory", "show_power", "show_shutdown", "compact_mode", "hide_empty_bays"].forEach((id) => {
      this.shadowRoot.getElementById(id)?.addEventListener("change", (e) => {
        this._config = { ...this._config, [id]: e.target.checked };
        this._fire();
      });
    });

    // Threshold inputs
    const thrMap = {
      thr_ram_yellow:      "ram_yellow",
      thr_ram_red:         "ram_red",
      thr_temp_yellow:     "temp_yellow",
      thr_temp_red:        "temp_red",
      thr_cpu_yellow:      "cpu_yellow",
      thr_cpu_red:         "cpu_red",
      thr_drive_temp_warn: "drive_temp_warn",
    };
    Object.entries(thrMap).forEach(([domId, cfgKey]) => {
      this.shadowRoot.getElementById(domId)?.addEventListener("input", (e) => {
        const raw = e.target.value.trim();
        const n   = raw === "" ? null : parseFloat(raw);
        const val = (n !== null && !isNaN(n)) ? n : null;
        const prev = this._config.thresholds || {};
        this._config = {
          ...this._config,
          thresholds: { ...prev, [cfgKey]: val },
        };
        this._fire();
      });
    });
  }

  _fire() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }
}

/* ═══════════════════════════════════════════════════════════════
   Register
   ═══════════════════════════════════════════════════════════════ */

customElements.define("synology-nas-card", SynologyNasCard);
customElements.define("synology-nas-card-editor", SynologyNasCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "synology-nas-card",
  name: "Synology NAS Monitoring Card",
  description: "Auto-discovering card for Synology NAS monitoring via the Synology DSM integration",
  preview: true,
  documentationURL: "https://github.com/msnapka/synology-nas-monitoring-card",
});
