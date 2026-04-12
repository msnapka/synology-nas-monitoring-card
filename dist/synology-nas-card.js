/**
 * Synology NAS Monitoring Card — Custom Lovelace Card for Home Assistant
 * Visualizes Synology NAS status using the native Synology DSM integration.
 * Created with the help of AI (Claude by Anthropic).
 * @version 0.1.0
 * @license MIT
 */
const CARD_VERSION = "0.1.0";
console.info(
  `%c SYNOLOGY-NAS-CARD %c v${CARD_VERSION} `,
  "color: white; background: #1a73e8; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
  "color: #1a73e8; background: #e8f0fe; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);

class SynologyNasCard extends HTMLElement {
  static getConfigElement() { return document.createElement("synology-nas-card-editor"); }
  static getStubConfig() {
    return { entity_prefix: "synology_ds1821", name: "Synology DS1821+", drives: 8, m2_drives: 1, volumes: 1, show_security: true, show_power: true, show_network: true, show_memory: true };
  }
  constructor() { super(); this.attachShadow({ mode: "open" }); this._config = {}; this._hass = null; }
  set hass(hass) { this._hass = hass; this._render(); }
  setConfig(config) {
    if (!config.entity_prefix) throw new Error("Please define entity_prefix");
    this._config = { name: config.name || "Synology NAS", entity_prefix: config.entity_prefix, drives: config.drives ?? 8, m2_drives: config.m2_drives ?? 0, volumes: config.volumes ?? 1, show_security: config.show_security !== false, show_power: config.show_power !== false, show_network: config.show_network !== false, show_memory: config.show_memory !== false };
    this._render();
  }
  getCardSize() { return 8; }
  _s(id) { return this._hass?.states[id]?.state; }
  _a(id, attr) { return this._hass?.states[id]?.attributes?.[attr]; }
  _e(s) { return `sensor.${this._config.entity_prefix}_${s}`; }
  _b(s) { return `binary_sensor.${this._config.entity_prefix}_${s}`; }
  _n(id) { const v = this._s(id); return (v === undefined || v === "unknown" || v === "unavailable") ? null : parseFloat(v); }
  _fmtBytes(k) { if (k == null) return "—"; const n = parseFloat(k); if (isNaN(n)) return "—"; if (n > 1e6) return (n/1e6).toFixed(1)+" GB/s"; if (n > 1e3) return (n/1e3).toFixed(1)+" MB/s"; return n.toFixed(0)+" KB/s"; }

  _gauge(value, max, label, unit, thr) {
    if (value === null) return `<div class="gauge"><div class="gauge-label">${label}</div><div class="gauge-value">—</div></div>`;
    const pct = Math.min(value / max, 1), angle = pct * 180;
    let color = "var(--success-color, #4caf50)";
    if (thr) { if (value >= thr.red) color = "var(--error-color, #f44336)"; else if (value >= thr.yellow) color = "var(--warning-color, #ff9800)"; }
    const rad = (angle - 90) * (Math.PI / 180), x = 50 + 40 * Math.cos(rad), y = 50 + 40 * Math.sin(rad), la = angle > 180 ? 1 : 0;
    return `<div class="gauge"><svg viewBox="0 0 100 60" class="gauge-svg"><path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--divider-color, #e0e0e0)" stroke-width="6" stroke-linecap="round"/>${pct > 0 ? `<path d="M 10 50 A 40 40 0 ${la} 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>` : ""}</svg><div class="gauge-value">${Math.round(value)}${unit}</div><div class="gauge-label">${label}</div></div>`;
  }

  _driveBay(i, isM2) {
    const pfx = isM2 ? "m_2_drive" : "drive";
    const status = this._s(this._e(`${pfx}_${i}_status`));
    const smart = this._s(this._e(`${pfx}_${i}_status_smart`));
    const temp = this._n(this._e(`${pfx}_${i}_temperature`));
    const badSec = this._s(this._b(`${pfx}_${i}_exceeded_max_bad_sectors`));
    const remLife = this._s(this._b(`${pfx}_${i}_below_min_remaining_life`));
    const isOk = status === "normal", isNA = !status || status === "unavailable";
    const lbl = isM2 ? `M.2 #${i}` : `Bay ${i}`, icon = isM2 ? "⚡" : "💾";
    let sColor = "var(--success-color, #4caf50)", sTxt = status || "—";
    if (isNA) { sColor = "var(--disabled-text-color, #999)"; sTxt = "Empty"; }
    else if (!isOk) sColor = "var(--error-color, #f44336)";
    const w = []; if (badSec === "on") w.push("⚠️ Bad sectors"); if (remLife === "on") w.push("⚠️ Low life");
    return `<div class="drive-bay ${isNA ? "empty" : ""} ${!isOk && !isNA ? "warning" : ""}"><div class="drive-icon">${icon}</div><div class="drive-info"><div class="drive-label">${lbl}</div><div class="drive-status" style="color:${sColor}">${sTxt}</div>${temp !== null ? `<div class="drive-temp">${temp}°C</div>` : ""}${smart && smart !== "unknown" ? `<div class="drive-smart">SMART: ${smart}</div>` : ""}${w.length ? `<div class="drive-warnings">${w.join(" ")}</div>` : ""}</div></div>`;
  }

  _volume(i) {
    const pct = this._n(this._e(`volume_${i}_volume_used`));
    const usedTB = this._n(this._e(`volume_${i}_used_space`));
    const totalTB = this._n(this._e(`volume_${i}_total_size`));
    const status = this._s(this._e(`volume_${i}_status`));
    const avgT = this._n(this._e(`volume_${i}_average_disk_temp`));
    const maxT = this._n(this._e(`volume_${i}_maximum_disk_temp`));
    const freeGB = (totalTB != null && usedTB != null) ? ((totalTB - usedTB) * 1024).toFixed(0) : "—";
    let bc = "var(--success-color, #4caf50)"; if (pct != null) { if (pct >= 90) bc = "var(--error-color, #f44336)"; else if (pct >= 75) bc = "var(--warning-color, #ff9800)"; }
    return `<div class="volume-card"><div class="volume-header"><span class="volume-title">📦 Volume ${i}</span><span class="volume-status">${status||"—"}</span></div><div class="volume-bar-container"><div class="volume-bar" style="width:${pct??0}%;background:${bc}"></div></div><div class="volume-details"><span>${pct!=null?pct+"%":"—"} used</span><span>${usedTB??"—"} / ${totalTB??"—"} TB</span><span>${freeGB} GB free</span></div>${avgT!=null||maxT!=null?`<div class="volume-temps">${avgT!=null?`<span>Avg: ${avgT}°C</span>`:""}${maxT!=null?`<span>Max: ${maxT}°C</span>`:""}</div>`:""}</div>`;
  }

  _security() {
    const entity = this._b("security_status");
    const attrs = this._hass?.states[entity]?.attributes || {};
    const checks = [{key:"malware",label:"Malware",icon:"🛡️"},{key:"network",label:"Network",icon:"🌐"},{key:"securitySetting",label:"Security",icon:"🔒"},{key:"systemCheck",label:"System",icon:"🔍"},{key:"update",label:"Updates",icon:"📦"},{key:"userInfo",label:"Users",icon:"👤"}];
    return `<div class="section"><div class="section-title">🛡️ Security Advisor</div><div class="security-grid">${checks.map(c=>{const v=attrs[c.key],safe=v==="safe";return `<div class="security-item ${safe?"safe":"warn"}"><span class="security-icon">${c.icon}</span><span class="security-label">${c.label}</span><span class="security-status">${safe?"✅":v?"⚠️":"—"}</span></div>`}).join("")}</div></div>`;
  }

  _render() {
    if (!this._hass || !this._config.entity_prefix) return;
    const p = this._config.entity_prefix;
    const cpu = this._n(this._e("cpu_utilization_total"));
    const mem = this._n(this._e("memory_usage_real"));
    const temp = this._n(this._e("temperature"));
    const dl = this._s(this._e("download_throughput"));
    const ul = this._s(this._e("upload_throughput"));
    const lastBoot = this._s(this._e("last_boot"));
    const dsmV = this._a(`update.${p}_dsm_update`,"installed_version");
    const dsmL = this._a(`update.${p}_dsm_update`,"latest_version");
    const sec = this._s(this._b("security_status"));
    const healthy = sec !== "off";
    const hasUpd = dsmV && dsmL && dsmV !== dsmL;

    let drives = ""; for (let i=1;i<=this._config.drives;i++) drives += this._driveBay(i,false);
    for (let i=1;i<=this._config.m2_drives;i++) drives += this._driveBay(i,true);
    let vols = ""; for (let i=1;i<=this._config.volumes;i++) vols += this._volume(i);

    let memHtml = "";
    if (this._config.show_memory) {
      const mA = this._s(this._e("memory_available_real")), mT = this._s(this._e("memory_total_real")), mC = this._s(this._e("memory_cached")), mS = this._s(this._e("memory_size"));
      memHtml = `<div class="section"><div class="section-title">🧠 Memory</div><div class="info-grid">${mS?`<div class="info-item"><span class="info-label">Size</span><span class="info-value">${mS} MB</span></div>`:""}${mT?`<div class="info-item"><span class="info-label">Total</span><span class="info-value">${mT} MB</span></div>`:""}${mA?`<div class="info-item"><span class="info-label">Available</span><span class="info-value">${mA} MB</span></div>`:""}${mC?`<div class="info-item"><span class="info-label">Cached</span><span class="info-value">${mC} MB</span></div>`:""}</div></div>`;
    }

    this.shadowRoot.innerHTML = `<style>${this._css()}</style><ha-card>
      <div class="card-header"><div class="header-top"><span class="nas-name">${this._config.name}</span><span class="overall-status ${healthy?"healthy":"issue"}">${healthy?"🟢 Healthy":"🔴 Issue Detected"}</span></div><div class="header-sub">${dsmV?`DSM ${dsmV}`:""}${hasUpd?`<span class="update-badge">⬆️ ${dsmL}</span>`:""}${lastBoot?`<span class="last-boot">Boot: ${new Date(lastBoot).toLocaleString()}</span>`:""}</div></div>
      <div class="gauges-row">${this._gauge(cpu,100,"CPU","%",{yellow:60,red:85})}${this._gauge(mem,100,"RAM","%",{yellow:70,red:90})}${this._gauge(temp,80,"Temp","°C",{yellow:55,red:70})}</div>
      ${this._config.show_network?`<div class="section"><div class="section-title">🌐 Network</div><div class="network-row"><div class="network-item"><span class="net-label">↓ Download</span><span class="net-value">${this._fmtBytes(dl)}</span></div><div class="network-item"><span class="net-label">↑ Upload</span><span class="net-value">${this._fmtBytes(ul)}</span></div></div></div>`:""}
      <div class="section"><div class="section-title">💾 Drive Bays</div><div class="drives-grid">${drives}</div></div>
      <div class="section"><div class="section-title">📦 Volumes</div>${vols}</div>
      ${memHtml}
      ${this._config.show_security?this._security():""}
      ${this._config.show_power?`<div class="power-controls"><button class="power-btn reboot" id="btn-reboot">🔄 Reboot</button><button class="power-btn shutdown" id="btn-shutdown">⏻ Shutdown</button></div>`:""}
    </ha-card>`;

    const rb = this.shadowRoot.getElementById("btn-reboot");
    const sb = this.shadowRoot.getElementById("btn-shutdown");
    if (rb) rb.onclick = () => { if (confirm("Opravdu restartovat NAS?")) this._hass.callService("button","press",{entity_id:`button.${p}_reboot`}); };
    if (sb) sb.onclick = () => { if (confirm("Opravdu vypnout NAS?")) this._hass.callService("button","press",{entity_id:`button.${p}_shutdown`}); };
  }

  _css() {
    return `:host{--card-padding:16px}ha-card{padding:var(--card-padding);overflow:hidden}.card-header{margin-bottom:16px}.header-top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}.nas-name{font-size:1.3em;font-weight:700;color:var(--primary-text-color)}.overall-status{font-size:.9em;font-weight:600;padding:4px 10px;border-radius:12px}.overall-status.healthy{background:color-mix(in srgb,var(--success-color,#4caf50) 15%,transparent);color:var(--success-color,#4caf50)}.overall-status.issue{background:color-mix(in srgb,var(--error-color,#f44336) 15%,transparent);color:var(--error-color,#f44336)}.header-sub{margin-top:4px;font-size:.8em;color:var(--secondary-text-color);display:flex;flex-wrap:wrap;gap:12px}.update-badge{background:var(--warning-color,#ff9800);color:#fff;padding:1px 8px;border-radius:8px;font-size:.85em}.gauges-row{display:flex;justify-content:space-around;margin:16px 0}.gauge{text-align:center;flex:1}.gauge-svg{width:90px;height:54px}.gauge-value{font-size:1.1em;font-weight:700;margin-top:-4px;color:var(--primary-text-color)}.gauge-label{font-size:.75em;color:var(--secondary-text-color);margin-top:2px}.section{margin-top:16px;padding-top:12px;border-top:1px solid var(--divider-color,#e0e0e0)}.section-title{font-size:.9em;font-weight:600;margin-bottom:10px;color:var(--primary-text-color)}.network-row{display:flex;gap:16px}.network-item{flex:1;display:flex;flex-direction:column;align-items:center;padding:8px;background:var(--card-background-color,#fff);border-radius:8px;border:1px solid var(--divider-color,#e0e0e0)}.net-label{font-size:.75em;color:var(--secondary-text-color)}.net-value{font-size:1.05em;font-weight:600;color:var(--primary-text-color)}.drives-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}.drive-bay{display:flex;gap:8px;padding:8px;border-radius:8px;border:1px solid var(--divider-color,#e0e0e0);background:var(--card-background-color,#fff);transition:border-color .2s}.drive-bay.empty{opacity:.4}.drive-bay.warning{border-color:var(--error-color,#f44336)}.drive-icon{font-size:1.4em;line-height:1;margin-top:2px}.drive-info{flex:1;min-width:0}.drive-label{font-size:.8em;font-weight:600;color:var(--primary-text-color)}.drive-status{font-size:.75em;font-weight:600;text-transform:capitalize}.drive-temp,.drive-smart{font-size:.7em;color:var(--secondary-text-color)}.drive-warnings{font-size:.7em;color:var(--error-color,#f44336);margin-top:2px}.volume-card{padding:10px;border-radius:8px;border:1px solid var(--divider-color,#e0e0e0);background:var(--card-background-color,#fff);margin-bottom:8px}.volume-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.volume-title{font-weight:600;font-size:.85em;color:var(--primary-text-color)}.volume-status{font-size:.75em;color:var(--secondary-text-color);text-transform:capitalize}.volume-bar-container{height:8px;background:var(--divider-color,#e0e0e0);border-radius:4px;overflow:hidden}.volume-bar{height:100%;border-radius:4px;transition:width .5s ease}.volume-details{display:flex;justify-content:space-between;margin-top:6px;font-size:.75em;color:var(--secondary-text-color)}.volume-temps{display:flex;gap:16px;margin-top:4px;font-size:.7em;color:var(--secondary-text-color)}.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.info-item{display:flex;justify-content:space-between;padding:4px 8px;font-size:.8em}.info-label{color:var(--secondary-text-color)}.info-value{font-weight:600;color:var(--primary-text-color)}.security-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.security-item{display:flex;align-items:center;gap:4px;padding:6px 8px;border-radius:6px;font-size:.75em;border:1px solid var(--divider-color,#e0e0e0)}.security-item.safe{background:color-mix(in srgb,var(--success-color,#4caf50) 8%,transparent)}.security-item.warn{background:color-mix(in srgb,var(--warning-color,#ff9800) 10%,transparent)}.security-icon{font-size:1em}.security-label{flex:1;color:var(--primary-text-color)}.security-status{font-size:1em}.power-controls{display:flex;gap:12px;margin-top:16px;padding-top:12px;border-top:1px solid var(--divider-color,#e0e0e0)}.power-btn{flex:1;padding:8px;border:none;border-radius:8px;font-size:.85em;font-weight:600;cursor:pointer;transition:opacity .2s}.power-btn:hover{opacity:.8}.power-btn.reboot{background:color-mix(in srgb,var(--warning-color,#ff9800) 15%,transparent);color:var(--warning-color,#ff9800)}.power-btn.shutdown{background:color-mix(in srgb,var(--error-color,#f44336) 15%,transparent);color:var(--error-color,#f44336)}@media(max-width:400px){.gauges-row{flex-direction:column;align-items:center;gap:8px}.drives-grid{grid-template-columns:1fr 1fr}.security-grid{grid-template-columns:1fr 1fr}.info-grid{grid-template-columns:1fr}}`;
  }
}

class SynologyNasCardEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({mode:"open"}); this._config = {}; }
  set hass(h) { this._hass = h; }
  setConfig(c) { this._config = {...c}; this._render(); }
  _render() {
    this.shadowRoot.innerHTML = `<style>.editor{padding:16px}.editor label{display:block;margin:8px 0 4px;font-weight:600;font-size:.9em}.editor input,.editor select{width:100%;padding:8px;border:1px solid var(--divider-color,#ccc);border-radius:6px;box-sizing:border-box;font-size:.9em}.editor .row{display:flex;gap:12px}.editor .row>div{flex:1}.editor .check{display:flex;align-items:center;gap:8px;margin:6px 0}.editor .check input{width:auto}</style>
    <div class="editor">
      <label>Entity Prefix</label><input type="text" id="entity_prefix" value="${this._config.entity_prefix||""}" placeholder="synology_ds1821"><small>Common prefix of your Synology entities</small>
      <label>Card Name</label><input type="text" id="name" value="${this._config.name||""}">
      <div class="row"><div><label>HDD Drives</label><input type="number" id="drives" min="0" max="24" value="${this._config.drives??8}"></div><div><label>M.2 Drives</label><input type="number" id="m2_drives" min="0" max="4" value="${this._config.m2_drives??0}"></div><div><label>Volumes</label><input type="number" id="volumes" min="0" max="10" value="${this._config.volumes??1}"></div></div>
      <div class="check"><input type="checkbox" id="show_security" ${this._config.show_security!==false?"checked":""}><label for="show_security">Show Security Advisor</label></div>
      <div class="check"><input type="checkbox" id="show_power" ${this._config.show_power!==false?"checked":""}><label for="show_power">Show Power Controls</label></div>
      <div class="check"><input type="checkbox" id="show_network" ${this._config.show_network!==false?"checked":""}><label for="show_network">Show Network</label></div>
      <div class="check"><input type="checkbox" id="show_memory" ${this._config.show_memory!==false?"checked":""}><label for="show_memory">Show Memory Details</label></div>
    </div>`;
    ["entity_prefix","name","drives","m2_drives","volumes"].forEach(id=>{this.shadowRoot.getElementById(id)?.addEventListener("input",e=>{this._config={...this._config,[id]:["drives","m2_drives","volumes"].includes(id)?parseInt(e.target.value)||0:e.target.value};this._fire();});});
    ["show_security","show_power","show_network","show_memory"].forEach(id=>{this.shadowRoot.getElementById(id)?.addEventListener("change",e=>{this._config={...this._config,[id]:e.target.checked};this._fire();});});
  }
  _fire() { this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:true,composed:true})); }
}

customElements.define("synology-nas-card", SynologyNasCard);
customElements.define("synology-nas-card-editor", SynologyNasCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({ type:"synology-nas-card", name:"Synology NAS Monitoring Card", description:"Custom card for Synology NAS monitoring via the Synology DSM integration", preview:true, documentationURL:"https://github.com/msnapka/synology-nas-monitoring-card" });
