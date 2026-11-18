import { SYNOLOGY_HARDWARE, normalizeSynologyModel } from './synology-hardware-data.js';
import { SYNOLOGY_PANEL_DEFS, generateDynamicPanelDef } from './synology-layouts.js';

export const SYNOLOGY_CORES = Object.freeze(Object.fromEntries(Object.entries(SYNOLOGY_HARDWARE).filter(([,v])=>v.cpu?.cores).map(([k,v])=>[k,v.cpu.cores])));
export { SYNOLOGY_PANEL_DEFS, generateDynamicPanelDef };

export function getSynologyHardware(model) {
  const key = normalizeSynologyModel(model);
  return key ? SYNOLOGY_HARDWARE[key] : null;
}
export function detectCoresFromModel(hass, prefix) {
  try {
    const marker=`sensor.${prefix}_cpu_utilization_total`;
    const devId=hass?.entities?.[marker]?.device_id;
    const model=hass?.devices?.[devId]?.model || '';
    return getSynologyHardware(model)?.cpu?.cores ?? null;
  } catch { return null; }
}
export function findPanelDef(model, detectedBayCount) {
  const key=normalizeSynologyModel(model);
  return generateDynamicPanelDef(key || model, detectedBayCount);
}
export function getModelBayCount(model) {
  return getSynologyHardware(model)?.storage?.internalBays ?? null;
}
export function getModelGeometryStatus(model) {
  const key=normalizeSynologyModel(model);
  return key && SYNOLOGY_PANEL_DEFS[key] ? SYNOLOGY_PANEL_DEFS[key].geometryStatus : 'generic-fallback';
}
export function validateHardwareRegistry() {
  const errors=[];
  for (const [model,entry] of Object.entries(SYNOLOGY_HARDWARE)) {
    if (entry.cpu?.cores && entry.cpu?.threads && entry.cpu.threads < entry.cpu.cores) errors.push(`${model}: threads < cores`);
    if (entry.storage.internalBays !== null && entry.storage.internalBays < 1) errors.push(`${model}: invalid bay count`);
    if (!entry.provenance?.cpu || !entry.provenance?.bays) errors.push(`${model}: missing provenance fields`);
  }
  return {ok:errors.length===0,modelCount:Object.keys(SYNOLOGY_HARDWARE).length,errors};
}
