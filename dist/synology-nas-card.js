/**
 * Synology NAS Monitoring Card — Custom Lovelace Card for Home Assistant
 * Visualizes Synology NAS status using the native Synology DSM integration.
 * Created with the help of AI (Claude by Anthropic).
 * @version 0.3.0
 * @license MIT
 */

const CARD_VERSION = "0.3.0";

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
    cpu: "CPU",
    ram: "RAM",
    temp: "Temp",
    network: "Network",
    download: "↓ Download",
    upload: "↑ Upload",
    drive_bays: "Drive Bays",
    volumes: "Volumes",
    memory: "Memory",
    security: "Security Advisor",
    last_boot: "Last boot:",
    uptime: "Uptime:",
    open_dsm: "Open DSM",
    reboot: "Reboot",
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
    sec_malware: "Malware",
    sec_network: "Network",
    sec_security: "Security",
    sec_system: "System",
    sec_updates: "Updates",
    sec_users: "Users",
    confirm_reboot_1: "Are you sure you want to reboot this NAS?",
    confirm_reboot_2: "This will reboot the NAS and interrupt all running services. Confirm again to proceed.",
    notif_title: "Synology NAS Issues",
    notif_sent: "HA notification sent \u2713",
    raid: "RAID",
    no_nas: "No Synology NAS found",
    custom_prefix: "Custom prefix\u2026",
    auto_detected: "Auto-detected",
    hdd_bays: "HDD bays",
    m2_slots: "M.2 slots",
    no_detected: "No drives/volumes found for prefix",
  },
  cs: {
    healthy: "V po\u0159\u00e1dku",
    issue_detected: "Probl\u00e9m detekovan",
    cpu: "CPU",
    ram: "RAM",
    temp: "Teplota",
    network: "S\u00ed\u0165",
    download: "\u2193 Stahov\u00e1n\u00ed",
    upload: "\u2191 Nahr\u00e1v\u00e1n\u00ed",
    drive_bays: "Disky",
    volumes: "Svazky",
    memory: "Pam\u011b\u0165",
    security: "Bezpe\u010dnostn\u00ed poradce",
    last_boot: "Posledn\u00ed start:",
    uptime: "Provoz:",
    open_dsm: "Otev\u0159\u00edt DSM",
    reboot: "Restartovat",
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
    sec_malware: "Malware",
    sec_network: "S\u00ed\u0165",
    sec_security: "Zabezpe\u010den\u00ed",
    sec_system: "Syst\u00e9m",
    sec_updates: "Aktualizace",
    sec_users: "U\u017eivatel\u00e9",
    confirm_reboot_1: "Opravdu restartovat NAS?",
    confirm_reboot_2: "NAS se restartuje a p\u0159eru\u0161\u00ed v\u0161echny b\u011b\u017e\u00edc\u00ed slu\u017eby. Potvrdte znovu.",
    notif_title: "Probl\u00e9my Synology NAS",
    notif_sent: "HA notifikace odesl\u00e1na \u2713",
    raid: "RAID",
    no_nas: "\u017d\u00e1dn\u00fd Synology NAS nenalezen",
    custom_prefix: "Vlastn\u00ed prefix\u2026",
    auto_detected: "Automaticky nalezeno",
    hdd_bays: "HDD slot\u016f",
    m2_slots: "M.2 slot\u016f",
    no_detected: "Nenalezeny disky/svazky pro prefix",
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
    return {
      entity_prefix: p[0] || "",
      name: "",
      show_security: true,
      show_power: false,
      show_network: true,
      show_memory: true,
      dsm_url: "",
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
  }

  connectedCallback() {
    this._uptimeInterval = setInterval(() => this._render(), 60000);
  }

  disconnectedCallback() {
    if (this._uptimeInterval) clearInterval(this._uptimeInterval);
  }

  set hass(h) {
    this._hass = h;
    this._render();
  }

  setConfig(cfg) {
    if (!cfg.entity_prefix) throw new Error("Please define entity_prefix");
    this._config = {
      entity_prefix: cfg.entity_prefix,
      name: cfg.name || "",
      show_security: cfg.show_security !== false,
      show_power: cfg.show_power === true,
      show_network: cfg.show_network !== false,
      show_memory: cfg.show_memory !== false,
      dsm_url: cfg.dsm_url || "",
    };
    this._render();
  }

  getCardSize() { return 8; }

  /* ── state shortcuts ── */
  _s(id)       { return this._hass?.states[id]?.state; }
  _a(id, attr) { return this._hass?.states[id]?.attributes?.[attr]; }
  _e(s)        { return `sensor.${this._config.entity_prefix}_${s}`; }
  _b(s)        { return `binary_sensor.${this._config.entity_prefix}_${s}`; }
  _n(id) {
    const v = this._s(id);
    return (v == null || v === "unknown" || v === "unavailable") ? null : parseFloat(v);
  }
  _fmtBytes(k) {
    if (k == null) return "\u2014";
    const n = parseFloat(k);
    if (isNaN(n)) return "\u2014";
    if (n > 1e6) return (n / 1e6).toFixed(1) + " GB/s";
    if (n > 1e3) return (n / 1e3).toFixed(1) + " MB/s";
    return n.toFixed(0) + " KB/s";
  }

  /* ── gauge ── */
  _gauge(value, max, label, unit, thr) {
    if (value === null) {
      return `<div class="gauge">
        <svg viewBox="0 0 100 60" class="gauge-svg">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--divider-color,#333)" stroke-width="6" stroke-linecap="round"/>
        </svg>
        <div class="gauge-value">\u2014</div>
        <div class="gauge-label">${label}</div>
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

    return `<div class="gauge">
      <svg viewBox="0 0 100 60" class="gauge-svg">
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--divider-color,#333)" stroke-width="6" stroke-linecap="round"/>
        ${pct > 0.005 ? `<path d="M 10 50 A 40 40 0 ${la} 1 ${ex} ${ey}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>` : ""}
      </svg>
      <div class="gauge-value">${Math.round(value)}${unit}</div>
      <div class="gauge-label">${label}</div>
    </div>`;
  }

  /* ── drive bay ── */
  _driveBay(i, isM2) {
    const pfx    = isM2 ? "m_2_drive" : "drive";
    const status = this._s(this._e(`${pfx}_${i}_status`));
    const smart  = this._s(this._e(`${pfx}_${i}_status_smart`));
    const temp   = this._n(this._e(`${pfx}_${i}_temperature`));
    const badSec = this._s(this._b(`${pfx}_${i}_exceeded_max_bad_sectors`));
    const remLife= this._s(this._b(`${pfx}_${i}_below_min_remaining_life`));

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

    return `<div class="drive-bay ${cssClass}">
      <div class="drive-icon">${icon}</div>
      <div class="drive-info">
        <div class="drive-label">${lbl}</div>
        <div class="drive-status" style="color:${sColor}">${sTxt}</div>
        ${temp !== null ? `<div class="drive-temp">${temp}\u00b0C</div>` : ""}
        ${smart && smart !== "unknown" && smart !== "unavailable" ? `<div class="drive-smart">SMART: ${smart}</div>` : ""}
        ${w.length ? `<div class="drive-warnings">${w.join(" ")}</div>` : ""}
      </div>
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
    const pct     = this._n(this._e(`volume_${i}_volume_used`));
    const usedTB  = this._n(this._e(`volume_${i}_used_space`));
    const totalTB = this._n(this._e(`volume_${i}_total_size`));
    const status  = this._s(this._e(`volume_${i}_status`));
    const avgT    = this._n(this._e(`volume_${i}_average_disk_temp`));
    const maxT    = this._n(this._e(`volume_${i}_maximum_disk_temp`));
    const raid    = this._raidType(i);
    const freeGB  = (totalTB != null && usedTB != null)
      ? ((totalTB - usedTB) * 1024).toFixed(0)
      : "\u2014";

    let bc = "var(--success-color,#4caf50)";
    if (pct != null) {
      if (pct >= 90)      bc = "var(--error-color,#f44336)";
      else if (pct >= 75) bc = "var(--warning-color,#ff9800)";
    }

    return `<div class="volume-card">
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
        <span>${usedTB ?? "\u2014"} / ${totalTB ?? "\u2014"} TB</span>
        <span>${freeGB} GB ${T.free}</span>
      </div>
      ${avgT != null || maxT != null ? `
      <div class="volume-temps">
        ${avgT != null ? `<span>${T.avg}: ${avgT}\u00b0C</span>` : ""}
        ${maxT != null ? `<span>${T.max}: ${maxT}\u00b0C</span>` : ""}
      </div>` : ""}
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
      const val  = v || "unknown";
      let emoji  = "\u2014";
      if (safe)                              emoji = "\u2705";
      else if (v === "danger")               emoji = "\ud83d\udd34";
      else if (v === "outOfDate")            emoji = "\u2b06\ufe0f";
      else if (v === "risk" || v === "info") emoji = "\u26a0\ufe0f";
      else if (v)                            emoji = "\u26a0\ufe0f";

      return `<div class="security-item ${safe ? "safe" : (v ? "warn" : "")}" data-sec-key="${c.key}">
        <span class="security-icon">${c.icon}</span>
        <span class="security-label">${c.label}</span>
        <span class="security-badge">${emoji}</span>
        <div class="security-detail">${val}</div>
      </div>`;
    }).join("");

    return `<div class="section">
      <div class="section-title">\ud83d\udee1\ufe0f ${T.security}</div>
      <div class="security-grid">${items}</div>
    </div>`;
  }

  /* ── collect issues ── */
  _collectIssues() {
    const issues = [];
    const p = this._config.entity_prefix;

    // Security
    const secEntity = this._b("security_status");
    const secAttrs  = this._hass?.states[secEntity]?.attributes || {};
    const skipKeys  = new Set(["friendly_name","device_class","icon","attribution"]);
    for (const [k, v] of Object.entries(secAttrs)) {
      if (typeof v === "string" && v !== "safe" && !skipKeys.has(k)) {
        issues.push(`Security \u2014 ${k}: ${v}`);
      }
    }

    // Drives
    const okDriveStates = new Set([
      "normal","initialized","not_used","not_use",
      "hotspare","hot_spare","nondisk","unknown","unavailable",
    ]);
    for (const i of detectDriveSlots(this._hass, p)) {
      const st = (this._s(this._e(`drive_${i}_status`)) || "").toLowerCase();
      if (st && !okDriveStates.has(st)) issues.push(`Drive Bay ${i}: status "${st}"`);
      if (this._s(this._b(`drive_${i}_exceeded_max_bad_sectors`)) === "on")
        issues.push(`Drive Bay ${i}: exceeded max bad sectors`);
      if (this._s(this._b(`drive_${i}_below_min_remaining_life`)) === "on")
        issues.push(`Drive Bay ${i}: below min remaining life`);
    }

    // M.2
    for (const i of detectM2Slots(this._hass, p)) {
      const st = (this._s(this._e(`m_2_drive_${i}_status`)) || "").toLowerCase();
      if (st && !okDriveStates.has(st)) issues.push(`M.2 #${i}: status "${st}"`);
    }

    // Volumes
    for (const i of detectVolumes(this._hass, p)) {
      const pct = this._n(this._e(`volume_${i}_volume_used`));
      if (pct !== null && pct >= 90) issues.push(`Volume ${i}: ${pct}% used`);
      const vs = (this._s(this._e(`volume_${i}_status`)) || "").toLowerCase();
      if (vs && !["normal","unknown","unavailable"].includes(vs))
        issues.push(`Volume ${i}: status "${vs}"`);
    }

    // Temperature
    const sysTemp = this._n(this._e("temperature"));
    if (sysTemp !== null && sysTemp >= 60) issues.push(`System temperature: ${sysTemp}\u00b0C`);

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

    const cpu      = this._n(this._e("cpu_utilization_total"));
    const mem      = this._n(this._e("memory_usage_real"));
    const temp     = this._n(this._e("temperature"));
    const dl       = this._s(this._e("download_throughput"));
    const ul       = this._s(this._e("upload_throughput"));
    const lastBoot = this._s(this._e("last_boot"));
    const dsmV     = this._a(`update.${p}_dsm_update`, "installed_version");
    const dsmL     = this._a(`update.${p}_dsm_update`, "latest_version");

    const issues  = this._collectIssues();
    const healthy = issues.length === 0;
    const hasUpd  = dsmV && dsmL && dsmV !== dsmL;

    const dsmDisplay = dsmV ? dsmV.replace(/^DSM\s+/i, "") : "";
    const dsmLatest  = dsmL ? dsmL.replace(/^DSM\s+/i, "") : "";
    const cardName   = this._config.name || prettyName(p);
    const uptime     = fmtUptime(lastBoot);
    const bootStr    = fmtBootDate(lastBoot);

    // Drive HTML
    let drivesHtml = "";
    for (const i of driveSlots) drivesHtml += this._driveBay(i, false);
    for (const i of m2Slots)    drivesHtml += this._driveBay(i, true);

    // Volume HTML
    let volsHtml = "";
    for (const i of volSlots) volsHtml += this._volume(i);

    // Memory HTML
    let memHtml = "";
    if (this._config.show_memory) {
      const mA = this._s(this._e("memory_available_real"));
      const mT = this._s(this._e("memory_total_real"));
      const mC = this._s(this._e("memory_cached"));
      const mS = this._s(this._e("memory_size"));
      if (mA || mT || mC || mS) {
        memHtml = `<div class="section">
          <div class="section-title">\ud83e\udde0 ${T.memory}</div>
          <div class="info-grid">
            ${mS ? `<div class="info-item"><span class="info-label">${T.size}</span><span class="info-value">${mS} MB</span></div>` : ""}
            ${mT ? `<div class="info-item"><span class="info-label">${T.total}</span><span class="info-value">${mT} MB</span></div>` : ""}
            ${mA ? `<div class="info-item"><span class="info-label">${T.available}</span><span class="info-value">${mA} MB</span></div>` : ""}
            ${mC ? `<div class="info-item"><span class="info-label">${T.cached}</span><span class="info-value">${mC} MB</span></div>` : ""}
          </div>
        </div>`;
      }
    }

    // Issues panel
    const issuesPanel = issues.length ? `
      <div class="issues-panel ${this._issuesOpen ? "open" : ""}">
        <div class="issues-list">
          ${issues.map((iss) => `<div class="issue-row">\u26a0\ufe0f ${iss}</div>`).join("")}
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
      </div>`);
    }
    const footerHtml = footerItems.length
      ? `<div class="card-footer">${footerItems.join("")}</div>`
      : "";

    /* ── Assemble ── */
    this.shadowRoot.innerHTML = `<style>${this._css()}</style>
    <ha-card>
      <div class="card-header">
        <div class="header-top">
          <span class="nas-name">${cardName}</span>
          <span class="overall-status ${healthy ? "healthy" : "issue"}" id="status-badge">
            ${healthy ? `\ud83d\udfe2 ${T.healthy}` : `\ud83d\udd34 ${T.issue_detected}`}
            ${!healthy ? `<span class="expand-hint">${this._issuesOpen ? "\u25b2" : "\u25bc"}</span>` : ""}
          </span>
        </div>
        ${issuesPanel}
        <div class="header-sub">
          ${dsmDisplay ? `<span class="dsm-ver">DSM ${dsmDisplay}</span>` : ""}
          ${hasUpd ? `<span class="update-badge">\u2b06\ufe0f ${dsmLatest}</span>` : ""}
        </div>
        ${bootStr ? `
        <div class="header-sub boot-line">
          <span class="last-boot">${T.last_boot} ${bootStr}</span>
          ${uptime ? `<span class="uptime">${T.uptime} ${uptime}</span>` : ""}
        </div>` : ""}
      </div>

      <div class="gauges-row">
        ${this._gauge(cpu,  100, T.cpu,  "%",  { yellow: 60, red: 85 })}
        ${this._gauge(mem,  100, T.ram,  "%",  { yellow: 70, red: 90 })}
        ${this._gauge(temp,  80, T.temp, "\u00b0C", { yellow: 55, red: 70 })}
      </div>

      ${this._config.show_network ? `
      <div class="section">
        <div class="section-title">\ud83c\udf10 ${T.network}</div>
        <div class="network-row">
          <div class="network-item">
            <span class="net-label">${T.download}</span>
            <span class="net-value">${this._fmtBytes(dl)}</span>
          </div>
          <div class="network-item">
            <span class="net-label">${T.upload}</span>
            <span class="net-value">${this._fmtBytes(ul)}</span>
          </div>
        </div>
      </div>` : ""}

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
    if (badge && !healthy) {
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
          message: issues.map((iss) => `\u2022 ${iss}`).join("\n"),
          notification_id: `synology_nas_issues_${this._config.entity_prefix}`,
        });
        this._notifFeedback = true;
        this._render();
        setTimeout(() => { this._notifFeedback = false; }, 3000);
      });
    }

    // Security item click → show detail
    this.shadowRoot.querySelectorAll(".security-item").forEach((el) => {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => {
        el.querySelector(".security-detail")?.classList.toggle("show");
      });
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
  }

  /* ═══════════════════════════════════════════════════════════════
     CSS
     ═══════════════════════════════════════════════════════════════ */
  _css() {
    return `
:host { --card-padding: 16px; }
ha-card { padding: var(--card-padding); overflow: hidden; }

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
.overall-status.healthy {
  background: color-mix(in srgb, var(--success-color,#4caf50) 15%, transparent);
  color: var(--success-color,#4caf50);
}
.overall-status.issue {
  background: color-mix(in srgb, var(--error-color,#f44336) 15%, transparent);
  color: var(--error-color,#f44336);
}
.overall-status.issue:hover {
  background: color-mix(in srgb, var(--error-color,#f44336) 25%, transparent);
}
.expand-hint { font-size: .7em; margin-left: 4px; opacity: .6; }

/* Issues panel */
.issues-panel {
  max-height: 0; overflow: hidden;
  transition: max-height .3s ease, padding .3s ease;
}
.issues-panel.open { max-height: 600px; padding: 4px 0; }
.issues-list {
  background: color-mix(in srgb, var(--error-color,#f44336) 8%, transparent);
  border-radius: 8px; padding: 8px 12px; margin-top: 8px;
}
.issue-row {
  font-size: .8em; color: var(--primary-text-color); padding: 3px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--divider-color,#e0e0e0) 50%, transparent);
}
.issue-row:last-child { border-bottom: none; }
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
}
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

/* Sections */
.section {
  margin-top: 16px; padding-top: 12px;
  border-top: 1px solid var(--divider-color,#e0e0e0);
}
.section-title {
  font-size: .9em; font-weight: 600; margin-bottom: 10px;
  color: var(--primary-text-color);
}

/* Network */
.network-row { display: flex; gap: 16px; flex-wrap: wrap; }
.network-item {
  flex: 1; min-width: 100px; display: flex; flex-direction: column; align-items: center;
  padding: 8px; background: var(--card-background-color,#fff);
  border-radius: 8px; border: 1px solid var(--divider-color,#e0e0e0);
}
.net-label { font-size: .75em; color: var(--secondary-text-color); }
.net-value { font-size: 1.05em; font-weight: 600; color: var(--primary-text-color); }

/* Drives */
.drives-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px;
}
.drive-bay {
  display: flex; gap: 8px; padding: 8px; border-radius: 8px;
  border: 1px solid var(--divider-color,#e0e0e0);
  background: var(--card-background-color,#fff); transition: border-color .2s;
}
.drive-bay.empty { opacity: .35; }
.drive-bay.warning { border-color: var(--error-color,#f44336); }
.drive-bay.hotspare {
  border-color: var(--warning-color,#ff9800);
  background: color-mix(in srgb, var(--warning-color,#ff9800) 6%, transparent);
}
.drive-icon { font-size: 1.4em; line-height: 1; margin-top: 2px; flex-shrink: 0; }
.drive-info { flex: 1; min-width: 0; }
.drive-label { font-size: .8em; font-weight: 600; color: var(--primary-text-color); }
.drive-status { font-size: .75em; font-weight: 600; text-transform: capitalize; }
.drive-temp, .drive-smart { font-size: .7em; color: var(--secondary-text-color); }
.drive-warnings { font-size: .7em; color: var(--error-color,#f44336); margin-top: 2px; }

/* Volumes */
.volume-card {
  padding: 10px; border-radius: 8px; border: 1px solid var(--divider-color,#e0e0e0);
  background: var(--card-background-color,#fff); margin-bottom: 8px;
}
.volume-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px; gap: 8px; flex-wrap: wrap;
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

    // Auto-detected summary
    let detectedHtml = "";
    if (current && this._hass) {
      const d = detectDriveSlots(this._hass, current);
      const m = detectM2Slots(this._hass, current);
      const v = detectVolumes(this._hass, current);
      if (d.length || m.length || v.length) {
        detectedHtml = `<div class="detected ok">
          \u2705 ${T.auto_detected}: ${d.length} ${T.hdd_bays}, ${m.length} ${T.m2_slots}, ${v.length} volumes
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

      <div class="check">
        <input type="checkbox" id="show_security" ${this._config.show_security !== false ? "checked" : ""}>
        <label for="show_security">Show Security Advisor</label>
      </div>
      <div class="check">
        <input type="checkbox" id="show_network" ${this._config.show_network !== false ? "checked" : ""}>
        <label for="show_network">Show Network</label>
      </div>
      <div class="check">
        <input type="checkbox" id="show_memory" ${this._config.show_memory !== false ? "checked" : ""}>
        <label for="show_memory">Show Memory Details</label>
      </div>
      <div class="check">
        <input type="checkbox" id="show_power" ${this._config.show_power === true ? "checked" : ""}>
        <label for="show_power">Show Power Controls (reboot, locked by default)</label>
      </div>
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
        this._config = { ...this._config, entity_prefix: e.target.value };
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

    ["show_security", "show_network", "show_memory", "show_power"].forEach((id) => {
      this.shadowRoot.getElementById(id)?.addEventListener("change", (e) => {
        this._config = { ...this._config, [id]: e.target.checked };
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
