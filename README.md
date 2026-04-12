# Synology NAS Card

A Home Assistant Lovelace custom card for Synology NAS devices — built on top of the official [Synology DSM Integration](https://www.home-assistant.io/integrations/synology_dsm/).

No direct API access, no extra configuration. Just add the card, enter your entity prefix, and go.

> **Note:** This card was created with the help of AI (Claude by Anthropic).

---

## Features

- **System gauges** — CPU, RAM, and temperature with color-coded thresholds
- **Drive bay overview** — status, SMART, temperature, bad sector & remaining life warnings for every HDD and M.2 NVMe slot
- **Volume storage bars** — usage percentage, free space, avg/max disk temperatures
- **Network throughput** — download/upload speed display
- **Memory details** — total, available, cached, swap
- **Security Advisor** — malware, network, security settings, system check, updates, user info status
- **Power controls** — reboot and shutdown buttons with confirmation dialogs
- **DSM update banner** — shown when a new DSM version is available
- **Built-in visual editor** — full card configuration without writing YAML
- **Fully theme-aware** — respects your HA light/dark theme colors
- **Responsive** — works on desktop and mobile

---

## Supported Devices

Any Synology NAS supported by the [Synology DSM integration](https://www.home-assistant.io/integrations/synology_dsm/), including:

| Series | Examples |
|--------|---------|
| Plus   | DS1821+, DS1621+, DS920+, DS723+, DS224+ |
| Value  | DS223, DS423 |
| XS     | DS3622xs+, RS1221+ |

Just adjust the `drives`, `m2_drives`, and `volumes` count in the card config to match your hardware.

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
   - **Repository:** `https://github.com/YOUR_USERNAME/synology-nas-card`
   - **Category:** `Dashboard`
4. Click **Add**, search for **Synology NAS Card** and install
5. Reload the browser (`Ctrl+Shift+R`)

---

## Manual Installation

1. Download `synology-nas-card.js` from the [latest release](https://github.com/YOUR_USERNAME/synology-nas-card/releases/latest)
2. Copy to `/config/www/synology-nas-card.js`
3. Add the resource in HA under **Settings → Dashboards → Resources**:
   - URL: `/local/synology-nas-card.js`
   - Type: `JavaScript module`
4. Reload the browser

---

## Usage

Add via the dashboard UI editor — search for **Synology NAS Card** — or manually:

```yaml
type: custom:synology-nas-card
entity_prefix: synology_ds1821
name: Synology DS1821+
drives: 8
m2_drives: 1
volumes: 1
show_security: true
show_power: true
show_network: true
show_memory: true
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity_prefix` | string | **required** | Common prefix of your Synology entities (e.g. `synology_ds1821`) |
| `name` | string | `Synology NAS` | Display name shown in the card header |
| `drives` | number | `8` | Number of HDD bays |
| `m2_drives` | number | `0` | Number of M.2 NVMe cache drives |
| `volumes` | number | `1` | Number of storage volumes |
| `show_security` | boolean | `true` | Show Security Advisor section |
| `show_power` | boolean | `true` | Show Reboot/Shutdown buttons |
| `show_network` | boolean | `true` | Show network throughput |
| `show_memory` | boolean | `true` | Show memory details |

### Finding Your Entity Prefix

Go to **Settings → Devices & Services → Synology DSM → your device → Entities**.

Look at any entity ID, e.g. `sensor.synology_ds1821_temperature`.

The prefix is everything between `sensor.` and `_temperature` → `synology_ds1821`.

---

## Troubleshooting

### Card not loading
- Open browser console (`F12`) and check for errors
- Verify the resource URL is correct:
  - HACS: `/hacsfiles/synology-nas-card/synology-nas-card.js`
  - Manual: `/local/synology-nas-card.js`
- Hard refresh (`Ctrl+Shift+R`)

### Drives show as "Empty"
- The entity for that drive bay doesn't exist or is unavailable — the bay is physically empty

### Security checks all show ⚠️
- Make sure `binary_sensor.<prefix>_security_status` is enabled
- Run Security Advisor in DSM at least once to populate the attributes

### Power buttons don't work
- Verify `button.<prefix>_reboot` and `button.<prefix>_shutdown` entities exist
- The integration user must have admin privileges

---

## Changelog

### v0.1.0
- Initial release
- Drive bay visualization with SMART, temperature, bad sectors, remaining life
- M.2 NVMe cache drive support
- Volume storage bars with free space calculation
- CPU / RAM / Temperature gauges
- Network throughput display
- Memory details section
- Security Advisor status grid
- Power controls with confirmation
- DSM update detection
- Built-in visual card editor
- Responsive design

---

## License

MIT — see [LICENSE](LICENSE) for details.
