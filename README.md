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

## Known limitations

- **Expansion units (DX517, DX1215, DX1222 etc.) are not represented on the chassis SVG.** If your NAS has an expansion bay unit attached, the card still draws only the main chassis and its bays. Drives in the expansion unit appear in the underlying entities (and contribute to volumes), but they are *not* drawn as additional bays on the front panel. Properly handling expansion units would require entity discovery that distinguishes "main NAS drive #N" from "expansion drive #N", plus rendering a second chassis panel beneath the main one — neither is implemented yet. PRs welcome.
- **Per-model layout fidelity isn't guaranteed.** Drive bay arrangements (`SYNOLOGY_PANEL_DEFS`) were initially generated and are only verified for a handful of models. If your model renders with the wrong orientation or bay count, open an issue with a photo of the front face and ideally a PR updating the panel definition.
- **Rack-mount (RS) models** are supported only via generic-bay fallbacks; the chassis aesthetic targets desktop DS-series boxes. Rack-mount-shaped chassis (wide, shallow, horizontal-mounted drives) need their own renderer path.

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

### v0.12.3
- **Critical fix: stray backticks in a CSS comment broke the JS template literal**, which made the whole card fail to parse (`Uncaught SyntaxError: Unexpected identifier 'top'`) and Lovelace showed "Configuration error". The CSS is emitted from inside a JS backtick-delimited template literal, so backticks inside CSS comments end the string prematurely. Removed.

### v0.12.2
- **Bay alarm now checks the right entity domain.** The new "drive has problem" detection in v0.12.0 was using `_e` (sensor.*) for the `exceeded_max_bad_sectors` / `below_min_remaining_life` lookups, but those are `binary_sensor.*` entities — `_b`. Fixed.

### v0.12.1
- **Chassis fills full card width** — the 720 px cap from v0.10.1 is gone. To keep the lock / reboot overlay buttons proportional at any width, the chassis frame is now a CSS container, and the buttons size/space themselves off the chassis width with `cqi` units (clamped 22–44 px tall).
- **Lock and reboot buttons now properly centred** — switched the buttons from `inline-flex` to `display: grid; place-items: center`, which places the SVG icon dead-centre regardless of the glyph's bounding box. No more "reboot looks higher than lock".
- **LED segment volume bar reverted** to the plain status-coloured progress bar (the LED look turned out to be harder to read, not better).
- **Font sizes snapped to a single scale** — `.7 / .75 / .8 / .85 / .9 / 1 / 1.2 em`. Removed the .78, .82, .72, 1.1, 1.3 values that were drifting on their own. Visual weight across the card is now consistent.

### v0.12.0
- **Alarm bays light up on the chassis.** When a drive has a real problem (status not normal, SMART failure, exceeded bad sectors, or below min remaining life) its bay door now gets a static red outline and a faint red fill tint — the chassis itself signals which bay is the problem, no need to scroll to the issues panel. Static colour, no animation.
- **Volume bar redrawn as an LED segment strip.** Instead of a plain coloured bar, the volume usage is now shown as a row of discrete "lit" LED cells inside a dark frame, with a subtle top specular highlight. Matches the chassis aesthetic.
- **Known limitations section added to the README**, calling out expansion-unit support, per-model layout fidelity, and rack-mount renderer caveats.

### v0.11.1
- **Power-overlay buttons now sit on the chassis header band**, not above it. The overlay was positioned relative to the section (which has section padding-top), so it floated in the gap above the SVG; wrapping the SVG + overlay in an inner `front-panel-frame` makes the overlay anchor to the SVG top instead.

### v0.11.0
- **Drive bays redrawn as actual bay doors** — gone is the bright green/red bordered UI grid; bays are now matte black plastic doors with a subtle top-edge highlight, a tiny status LED at the top-right (instead of a big ✓/✗ glyph), and a finger-pull groove at the bottom front, matching the real DS1821+ chassis.
- **Status conveyed by a tiny LED + thin temp strip** — no more colouring the whole bay frame red/orange when a drive is warm; the door stays dark and a thin coloured strip lights up along its bottom edge. Reads like an indicator light on a real chassis.
- **Capacity / temperature label restyled** — smaller, less shouty, temperature centred just above the finger-pull rather than crowding the bottom-left corner.

### v0.10.1
- **Header pills truly identical** — `Open DSM` and `Healthy` now share one shared box-model rule (same height 26 px, same padding, radius, line-height, flex centring); they render as a matched pair regardless of emoji metrics.
- **Power-button icons swapped from emoji to inline SVG** — lock/unlock, reboot and shutdown glyphs now render uniformly across browsers and OSes instead of relying on the platform emoji font.
- **Chassis header taller and overlay buttons bigger** — header band bumped to fit 24 px-tall buttons cleanly on both wide and narrow cards; brand and LEDs re-centred in the new band.
- **Chassis capped at 720 px wide** — wider than the original 520 px cap (so it actually fills typical dashboard columns), but no longer scales to absurd widths on huge screens, which kept making the HTML overlay buttons look tiny against the chassis.
- **Security "All passed" banner removed** — when all checks are safe the section now just shows the five green tiles; the redundant green banner above them is gone.

### v0.10.0
- **Power controls live on the chassis** — the lock + reboot (+ optional shutdown) buttons are now rendered at the top-center of the SVG front panel, exactly where the physical power button sits on the real DS1821+. Card footer is gone.
- **Chassis header redesigned** — "Synology" wordmark at top-left, indicator LEDs (STATUS / DISK / LAN) immediately to its right, clear power-button zone in the center; when no power controls are enabled the chassis draws a faint power-button outline instead. Header band height bumped to fit real-size buttons.
- **Drive temperature sparklines anchored to a fixed 15–50 °C range** — half-degree drift no longer becomes a misleading visual spike; values are clamped to the box so out-of-range readings stay inside the slot.
- **Security Advisor no longer needs to be expanded** — when all checks are safe, the green summary banner is shown together with the actual tiles inline (the toggle is gone — five items don't deserve a click).
- **Volume "details" toggle removed** — the panel never had anything useful to show (the volume status entity exposes nothing the collapsed card doesn't already display), so the expand chevron is dropped.
- **Header pill sizing matched** — "Open DSM" and "Healthy" badges now share the same height, font size and corner radius so the header reads as a pair of equal pills, not a small link next to a big badge.

### v0.9.2
- **Front panel fills the card width** — removed the leftover 520px max-width cap on the SVG chassis; the panel now scales to the full card width while preserving aspect ratio.

### v0.9.1
- **DS1821+ / DS1823xs+ / DS2422+ layout fix** — these chassis are actually single-row landscape boxes (e.g. 8 bays in one horizontal row), not the 2×4 / 2×6 portrait tower the previous release drew. Panel definitions updated to match the real product face; generic 8/12-bay fallbacks updated likewise.

### v0.9.0
- **Open DSM moved to header** — the "Open DSM" link sits in the top-right of the card next to the health status badge, where it's actually expected; removed from the footer to avoid duplication
- **Chassis frame redesigned** — the SVG front panel now reads as a real NAS box: a top header band with the "Synology" wordmark and three status LEDs (PWR / STAT / DISK; the STAT LED reflects the worst current issue severity), a subtle gradient on the chassis body, and a bottom band with the model label
- **Security Advisor no longer shows ghost tiles** — when the overall summary is "All security checks passed", expanding only shows tiles that actually have data (no more confusing `—` placeholders for attributes the integration didn't expose); shows the count of present checks in the summary line
- **Security Advisor empty-state** — when *no* security attributes are exposed at all (Security Advisor never run in DSM), the section shows a single explanatory row instead of six dashed tiles
- **Memory rows readable across width** — added a dotted leader between each label and value and capped the row width, so on wide cards the eye can still track which value belongs to which label

### v0.8.0
- **Auto-detect DSM URL** — the "Open DSM" link now auto-resolves from the HA device registry's `configuration_url` if no `dsm_url` is set in the card config
- **DS1821+ realistic 2×4 layout** — drive bays rendered in the actual tower arrangement (2 rows × 4 columns, portrait-ish panel) instead of a single 1×8 strip; other multi-row models updated to match
- **Removed chassis noise** — LEDs, USB ports and power buttons are no longer drawn; the panel shows only what matters (drive bays)
- **M.2 fully integrated** — M.2 slots render inside the same chassis as HDD bays with tight 8px spacing and the same tray styling; no more separate panel look
- **Redesigned slot UX** — at-a-glance layout: slot # top-left, SMART ✓/✗ glyph top-right, capacity centred and prominent, 24h temperature sparkline in the middle-bottom, colour-coded temperature label at the bottom; empty bays show a dimmed "Empty" label; hot-spare bays show a blue "SPARE" banner
- **Multiple clickable regions per bay** — SMART glyph, temperature/sparkline area and the slot body are each wrapped in their own `<g data-entity>` group and open the matching HA more-info dialog (SMART status, temperature entity, drive status entity)
- **Security section redesign** — collapses to a single green "All security checks passed" row when everything is safe; when issues exist, only the problematic tiles are shown prominently with a "N passed" chip to reveal the safe ones; click any tile to open the security status entity

### v0.7.0
- **SVG slot redesign** — slot number top-left (bold, readable), SMART LED top-right with `S` label, capacity centred, sparkline in the lower 40% of the tray (no overlap), temperature bottom-left coloured green / orange / red matching the border
- **M.2 in same chassis** — single chassis rectangle with divider line and "M.2 NVMe" label; M.2 tiles are 60px tall; labels read `M.2#1` / `M.2#2`
- **Empty M.2 slots** shown as placeholder trays via `m2_max` in panel definitions (DS1821+, DS920+, DS923+, DS723+, DS1522+, DS1621+, DS1823xs+)
- **Memory section** switched to a single-column list with zebra striping — no more confusing 2-column scatter
- **Uptime** moved to its own non-bold line directly below the DSM version
- **Open DSM link** promoted from footer to the header row next to the DSM version — always visible

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
