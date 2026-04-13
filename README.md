# Synology NAS Monitoring Card

A Home Assistant Lovelace custom card for Synology NAS devices — built on top of the official [Synology DSM Integration](https://www.home-assistant.io/integrations/synology_dsm/).

**Zero-config auto-discovery.** Add the card, pick your NAS from the dropdown, done. Drives, M.2 slots, and volumes are detected automatically.

> **Note:** This card was created with the help of AI (Claude by Anthropic).

---

## Features

- **Auto-discovery** — finds all Synology NAS devices in your HA instance, auto-detects drive bays, M.2 NVMe slots, and volumes
- **Multi-NAS support** — dropdown picker in the editor when you have multiple NAS appliances
- **System gauges** — CPU, RAM, and temperature with color-coded thresholds and correct arc rendering
- **Drive bay overview** — status, SMART, temperature, bad sector & remaining life warnings; hot spare drives shown distinctly
- **Volume storage bars** — usage percentage, free space, avg/max disk temperatures, RAID type badge
- **Network throughput** — download/upload speed display
- **Memory details** — total, available, cached
- **Security Advisor** — clickable items that expand to show the actual status value
- **Issue details** — "Issue Detected" badge is clickable, expands to list all detected problems
- **Notify HA** — one-click button inside the issues panel sends a persistent HA notification with the full issue list
- **DSM web link** — configurable button to open the Synology DSM web interface
- **Power controls** — optional reboot button, locked by default (requires unlock + double confirmation)
- **Uptime display** — shows last boot date/time with timezone and computed uptime (e.g. "3w 2d 14h 22m")
- **DSM update banner** — shown when a new DSM version is available
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
| `show_security` | boolean | `true` | Show Security Advisor section |
| `show_power` | boolean | `false` | Show reboot button (locked by default, requires double confirmation) |
| `show_network` | boolean | `true` | Show network throughput |
| `show_memory` | boolean | `true` | Show memory details |

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
