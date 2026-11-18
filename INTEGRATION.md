# Integration into `synology-nas-card.js`

The uploaded card is currently a classic single-file script (no imports). The hardware KB is authored as ES modules. To use it directly, load the card as an ES module in your Home Assistant Lovelace resource, or bundle the modules into the card build.

## 1. Add imports at the top of the card

```js
import {
  SYNOLOGY_CORES,
  SYNOLOGY_PANEL_DEFS,
  generateDynamicPanelDef,
  findPanelDef,
  detectCoresFromModel,
  getSynologyHardware,
} from './synology-hardware-utils.js';
```

## 2. Remove the old hardware-specific block

Remove from `/* Known Synology models → CPU core count. */` through the old `detectCoresFromModel()` function, including:
- old `SYNOLOGY_CORES`
- old `_makeHddRow`
- old `SYNOLOGY_PANEL_DEFS`
- old `generateDynamicPanelDef`
- old `findPanelDef`
- old `detectCoresFromModel`

Keep all other card code unchanged.

## 3. Recommended model handling in `_render()`

Replace the model/panel section with:

```js
const _marker = `sensor.${p}_cpu_utilization_total`;
const _entReg = this._hass?.entities?.[_marker];
const _device = _entReg?.device_id ? this._hass?.devices?.[_entReg.device_id] : null;
const nasModelRaw = _device?.model?.trim() || '';
const nasHardware = getSynologyHardware(nasModelRaw);
const nasModel = nasHardware?.model || nasModelRaw;
const _autoDsmUrl = _device?.configuration_url || '';
const dsmUrl = this._config.dsm_url || _autoDsmUrl || '';
const panelDef = this._config.show_drive_panel
  ? findPanelDef(nasModel, driveSlots.length)
  : null;
```

The existing `_frontPanel()` call can remain unchanged.

## 4. Important geometry limitation

The supplied file contains no manufacturer front-panel images, CAD drawings, or model-specific measured faceplate dimensions. Therefore the included panel registry uses explicit model/bay layouts marked `geometryStatus: 'schematic'`; it is not honest to call those pixel-accurate physical front panels. Unknown models use `generic-fallback`. Exact tracing requires one reference image/drawing per chassis (front-on, no perspective) and model-specific calibration.

## 5. Loading

For development, put all three `.js` modules next to the card source. If your HACS distribution expects one resource file, use your project bundler to bundle `synology-nas-card.js` and these modules into the published card artifact. Do not add each ES module as an independent Lovelace resource and assume load order.
