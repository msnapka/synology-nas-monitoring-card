# Synology NAS Monitoring Card

A Home Assistant Lovelace custom card for Synology NAS devices — built on top of the official [Synology DSM Integration](https://www.home-assistant.io/integrations/synology_dsm/).

**Zero-config auto-discovery.** Add the card, pick your NAS from the dropdown, done. Drives, M.2 slots, and volumes are detected automatically.

> **Note:** This card was created with the help of AI (Claude by Anthropic).

---

## Features

- **Auto-discovery** — finds all Synology NAS devices in your HA instance, auto-detects drive bays, M.2 NVMe slots, volumes, and CPU core count from the NAS model
- **Multi-NAS support** — dropdown picker in the editor when you have multiple NAS appliances
- **System gauges** — CPU load (15-min load average), RAM usage, and temperature with configurable color-coded thresholds
- **Load average row** — 1-min / 5-min / 15-min load averages under the gauges with `/ cores` context
- **Sparklines** — 24-hour history mini-charts under the CPU / RAM / temperature gauges
- **Trend arrow** — ↑ / ↓ / → next to temperature based on recent history
- **Clickable history** — click any gauge, drive, volume, memory item or header badge to open the HA more-info dialog with the history graph
- **Drive bay overview** — status, SMART, temperature, bad sector & remaining life warnings; hot spare drives shown distinctly
- **Inline details** — each drive bay and volume can be expanded in-card to show the raw entity attributes (SMART details, RAID layout, etc.)
- **Volume storage bars** — usage percentage, free space, avg/max disk temperatures, RAID type badge
- **Memory details** — total, available, cached and optional swap total/used (rounded to whole MB)
- **Security Advisor** — clickable items that expand to show the actual status value (state persists across refreshes)
- **Issue panel** — "Issue Detected" badge is clickable, expands to a severity-colored list (critical / warning / info) of all detected problems
- **Notify HA** — one-click button inside the issues panel sends a persistent HA notification with the full issue list
- **DSM web link** — configurable button to open the Synology DSM web interface
- **Power controls** — optional reboot and shutdown buttons, locked by default (requires unlock + double confirmation)
- **DSM update install** — when an update is available, the update badge is clickable and (after confirmation) triggers `update.install` on the DSM update entity
- **Uptime display** — shows last boot date/time with timezone and computed uptime (e.g. "3w 2d 14h 22m")
- **DSM update banner** — shown when a new DSM version is available
- **Configurable thresholds** — CPU load, RAM, temperature and drive temperature thresholds exposed in the editor
- **Compact mode** — tighter layout for dense dashboards
- **Hide empty bays** — optionally hide unused drive / M.2 slots from the grid
- **Built-in visual editor** — full card configuration without writing YAML
- **Localization** — UI automatically switches between English and Czech based on your browser language
- **Fully theme-aware** — respects your HA light/dark theme colors
- **Responsive** — works on desktop and mobile, optimized for narrow columns

---

## Supported Devices

Any Synology NAS supported by the [Synology DSM integration](https://www.home-assistant.io/integrations/synology_dsm/), including:

| Series | Examples |
|--------|---------|
| Plus   | DS1821+, DS1621+, DS920+, DS723+, DS224+ |
| Value  | DS223, DS423 |
| XS     | DS3622xs+, RS1221+ |

Drive bays, M.2 slots, and volumes are auto-detected from your entities — no manual counting needed.

---

## Requirements

- Home Assistant with the **Synology DSM Integration** configured
- The NAS must appear under **Settings → Devices & Services → Synology DSM**
- Admin-level user required for the integration

---

## Installation via HACS

1. Open **HACS** → **Frontend**
2. Click **⋮** → **Custom repositories**
3. Add:
   - **Repository:** `https://github.com/msnapka/synology-nas-monitoring-card`
   - **Category:** `Dashboard`
4. Click **Add**, search for **Synology NAS Card** and install
5. Reload the browser (`Ctrl+Shift+R`)

---

## Manual Installation

1. Download `synology-nas-card.js` from the [latest release](https://github.com/msnapka/synology-nas-monitoring-card/releases/latest)
2. Copy to `/config/www/synology-nas-card.js`
3. Add the resource in HA under **Settings → Dashboards → Resources**:
   - URL: `/local/synology-nas-card.js`
   - Type: `JavaScript module`
4. Reload the browser

---

## Usage

Add via the dashboard UI editor — search for **Synology NAS Card**. The editor auto-discovers your NAS devices.

Or manually in YAML:

```yaml
type: custom:synology-nas-card
entity_prefix: synology_nas
dsm_url: https://192.168.1.100:5001
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity_prefix` | string | **required** | Common prefix of your Synology entities (auto-discovered in editor) |
| `name` | string | *auto* | Display name shown in the card header (auto-derived from prefix if empty) |
| `dsm_url` | string | — | URL to the Synology DSM web interface (shows "Open DSM" link) |
| `cpu_cores` | number | `4` | Number of CPU cores — used as the max value for the load-average gauge. Auto-detected from the NAS model when the card is added. |
| `show_security` | boolean | `true` | Show Security Advisor section |
| `show_memory` | boolean | `true` | Show memory details |
| `show_power` | boolean | `false` | Show reboot button (locked by default, requires double confirmation) |
| `show_shutdown` | boolean | `false` | Also show the shutdown button (requires `show_power: true`) |
| `compact_mode` | boolean | `false` | Denser layout — tighter padding, smaller gauges and fonts |
| `hide_empty_bays` | boolean | `false` | Hide drive / M.2 slots that report no disk installed |
| `thresholds.cpu_yellow` | number | — | CPU warn threshold as load-per-core (e.g. `0.70`). Leave empty for auto. |
| `thresholds.cpu_red` | number | — | CPU critical threshold as load-per-core (e.g. `1.00`). Leave empty for auto. |
| `thresholds.ram_yellow` | number | `70` | RAM warn threshold (%) |
| `thresholds.ram_red` | number | `90` | RAM critical threshold (%) |
| `thresholds.temp_yellow` | number | `55` | System temperature warn threshold (°C) |
| `thresholds.temp_red` | number | `70` | System temperature critical threshold (°C) |
| `thresholds.drive_temp_warn` | number | `50` | Per-drive temperature warn threshold (°C) |

### Finding Your Entity Prefix

The editor auto-discovers all Synology NAS prefixes. If you need to find it manually:

Go to **Settings → Devices & Services → Synology DSM → your device → Entities**.

Look at any entity ID, e.g. `sensor.synology_nas_temperature`.

The prefix is everything between `sensor.` and `_temperature` → `synology_nas`.

---

## Troubleshooting

### Card not loading
- Open browser console (`F12`) and check for errors
- Verify the resource URL is correct:
  - HACS: `/hacsfiles/synology-nas-monitoring-card/synology-nas-card.js`
  - Manual: `/local/synology-nas-card.js`
- Hard refresh (`Ctrl+Shift+R`)

### No drives detected
- Check that drive entities exist: `sensor.<prefix>_drive_1_status`
- Ensure the Synology DSM integration is fully loaded

### Hot spare drives show as "Not_use"
- The card recognizes `not_used`, `not_use`, `hotspare`, `hot_spare`, and `nondisk` statuses and labels them as "Hot Spare" with distinct amber styling

### Security checks all show ⚠️
- Make sure `binary_sensor.<prefix>_security_status` is enabled
- Run Security Advisor in DSM at least once to populate the attributes
- Click on any security item to see the actual status value

### Power button doesn't appear
- Power controls are hidden by default (`show_power: false`) — enable them in the editor
- When enabled, you must click the 🔒 lock icon first, then confirm twice

### RAID type not shown on volumes
- RAID type is read from the `device_type` / `raid_type` attribute of the volume status entity
- If your DSM integration version doesn't expose this attribute, the badge is simply hidden

---

## Changelog

### v0.6.0
- **SVG front panel** — visual chassis view of the NAS front face with colour-coded drive bays; replaces the old text grid by default. Slot border = temperature status, tray fill = drive status, LED = SMART status. Auto-detected from NAS model (DS1821+, DS920+, DS1621+, DS2422+, RS3621xs+, …); falls back to a generic N-bay layout for unknown models
- **SYNOLOGY_PANEL_DEFS** — modular, data-only panel definitions. Adding a new NAS model requires only a single object entry in the source — no renderer changes needed
- **M.2 NVMe slots in panel** — dynamically appended below the chassis in the SVG; no panel definition changes required
- **Drive display mode** — two independent editor checkboxes: *SVG front-panel view* (default on) and *text grid* (default off). Both can be shown simultaneously
- **Per-drive temperature sparklines** — 24h temperature history embedded directly in each SVG slot (same history API as the NAS temperature gauge)
- **Drive capacity in SVG** — capacity label (e.g. `4.0T`, `960G`) shown centred in each drive tray
- **Drive capacity in text grid** — appended to the bay label (e.g. `Slot 1  4.0 TB`)
- **Drive model in expanded view** — model name (`drive_model` attribute) shown prominently at the top of the ▼ expand panel
- **Hot spare colour changed to blue** — was amber/orange (looked like a warning); now blue to indicate a reserved standby drive
- **Fix: expand duplicity** — the ▼ inline panel no longer repeats SMART / temperature already shown in the bay header
- **Fix: Security Advisor "unknown"** — missing attributes now show `—` instead of the literal word "unknown"

### v0.4.0
- **CPU gauge reworked** — now shows `cpu_load_average_15_min` instead of the instantaneous `cpu_utilization_total` (which was effectively random with the 15-minute Synology DSM polling interval)
- **Load average row** — compact 1m / 5m / 15m values shown under the gauges, with `/ cores` context
- **CPU cores config** — new `cpu_cores` option (default 4), auto-detected from the NAS model when the card is added or the NAS is switched in the editor (DS1821+ → 4, DS3622xs+ → 12, FS6400 → 16, …)
- **Clickable history** — gauges, drive bays, volumes, memory items, DSM update badge, last boot and the Security Advisor title now open the Home Assistant more-info dialog with the history graph
- **Security toggle persists** — clicking a Security Advisor item now keeps the detail open across re-renders (was resetting on every state update)
- **Network section removed** — the download/upload throughput values are stale at the 15-minute polling interval and were misleading
- **Decimal-place cleanup** — MB/s and GB/s shown as integers, TB values always to 2 decimal places, memory values rounded to whole MB
- **Sparklines** — 24h history mini-chart under CPU / RAM / temperature gauges, fetched via the HA history websocket API
- **Temperature trend arrow** — ↑ / ↓ / → next to the temperature value based on the last 15 minutes of history
- **Drive / volume inline expand** — new ▼ button on each drive bay and volume card reveals the raw entity attributes (SMART details, RAID layout, etc.) inline, without leaving the card
- **Issue severity** — detected issues are now classified as `critical` / `warning` / `info` and colour-coded in the issues panel; the status badge reflects the worst severity
- **CPU overload as issue** — sustained 15-min load average above the configured CPU threshold (default 1.0 per core) is reported as an issue
- **Memory swap** — swap total / used are shown in the memory section when the entities are available
- **DSM update as info issue + install action** — when an update is available, the update badge is clickable and (after confirmation) triggers the DSM `update.install` service
- **Shutdown button** — optional shutdown button next to Reboot, hidden by default, locked behind the same double-confirmation as Reboot (`show_shutdown`)
- **Compact mode** — `compact_mode` option tightens padding, shrinks gauges and reduces font sizes for dense dashboards
- **Hide empty bays** — `hide_empty_bays` option removes unused drive / M.2 slots from the grid
- **Configurable thresholds** — CPU load, RAM, temperature and drive temperature thresholds are now configurable via the new *Advanced thresholds* section in the editor

### v0.3.0
- **Localization (i18n)** — UI language auto-detected from browser; English and Czech supported
- **RAID type badge** — each volume now shows its RAID type (SHR, RAID 5, etc.) when available from the entity attributes
- **Notify HA** — "🔔 Notify HA" button inside the expanded issues panel sends a persistent HA notification with the full issue list
- **Timezone in boot time** — last boot timestamp now includes the local timezone abbreviation (e.g. "13. 04. 2026 08:30 CEST")
- **Responsive improvements** — better layout on narrow columns and very small screens; gauges, drives, and security grid reflow gracefully; volume details stack on mobile

### v0.2.0
- **Auto-discovery** — drives, M.2 slots, and volumes detected automatically from entities
- **Multi-NAS support** — editor dropdown when multiple NAS devices are found
- **Fixed gauge arcs** — gauges now correctly reflect actual percentage values
- **Hot spare support** — drives with `not_used`/`hotspare` status shown distinctly
- **Clickable issues** — "Issue Detected" badge expands to show all detected problems
- **Clickable security** — Security Advisor items expand to show actual status values
- **DSM web link** — configurable "Open DSM" button in card footer
- **Uptime display** — computed from last boot, compact format (e.g. "1w 6d 20h 4m")
- **Fixed "DSM DSM"** — redundant DSM prefix stripped from version display
- **Power controls reworked** — hidden by default, locked behind toggle + double confirmation, shutdown removed
- **Generic defaults** — no hardcoded DS1821+ references, card name auto-derived from prefix
- **Simplified editor** — NAS picker dropdown, DSM URL field, no manual drive/volume counts

### v0.1.0
- Initial release

---

## License

MIT — see [LICENSE](LICENSE) for details.
