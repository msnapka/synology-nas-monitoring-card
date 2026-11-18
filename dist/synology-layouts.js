/**
 * Front-panel geometry registry.
 * IMPORTANT: layout entries below are verified bay-count/layout schematics, not pixel-traced CAD.
 * Use `geometryStatus: 'schematic'` until a model-specific manufacturer front image has been traced.
 * Never describe a schematic as a dimensionally exact rendering.
 */
const row = (x, y, w, h, gap, count, start = 1) => Array.from({length: count}, (_,i) => ({x:x+i*(w+gap),y,w,h,type:'hdd',slot:start+i}));
const desktop = (model, bays, cols, trayW, trayH, gap, m2Slots = 0) => {
  const rows = Math.ceil(bays/cols), trayGap = gap;
  const totalW = cols*trayW+(cols-1)*trayGap;
  const totalH = rows*trayH+(rows-1)*trayGap;
  const vw = totalW+32, vh = totalH+24;
  const drives = Array.from({length:bays},(_,i)=>({
    x:16+(i%cols)*(trayW+trayGap), y:12+Math.floor(i/cols)*(trayH+trayGap),
    w:trayW,h:trayH,type:'hdd',slot:i+1,
  }));
  return Object.freeze({label:model,vw,vh,drives,m2_max:m2Slots,extras:[],geometryStatus:'schematic',geometrySource:null});
};
const rack = (model,bays,cols=12) => {
  const w=30,h=46,g=2,rows=Math.ceil(bays/cols),totalW=cols*w+(cols-1)*g,totalH=rows*h+(rows-1)*g;
  return Object.freeze({label:model,vw:totalW+20,vh:totalH+16,drives:Array.from({length:bays},(_,i)=>({x:10+(i%cols)*(w+g),y:8+Math.floor(i/cols)*(h+g),w,h,type:'hdd',slot:i+1})),m2_max:0,extras:[],geometryStatus:'schematic',geometrySource:null});
};

export const SYNOLOGY_PANEL_DEFS = Object.freeze({
  // Common desktop chassis: visualized as front-facing trays; physical dimensions are not claimed.
  'DS120j': desktop('DS120j',1,1,58,78,4), 'DS124': desktop('DS124',1,1,58,78,4),
  'DS223': desktop('DS223',2,2,54,80,4), 'DS223j': desktop('DS223j',2,2,54,80,4),
  'DS220+': desktop('DS220+',2,2,54,80,4), 'DS224+': desktop('DS224+',2,2,54,80,4),
  'DS723+': desktop('DS723+',2,2,54,80,4,2), 'DS725+': desktop('DS725+',2,2,54,80,4,2),
  'DS423': desktop('DS423',4,4,47,80,3), 'DS423+': desktop('DS423+',4,4,47,80,3),
  'DS425+': desktop('DS425+',4,4,47,80,3), 'DS925+': desktop('DS925+',4,4,47,80,3,2),
  'DS418': desktop('DS418',4,4,47,80,3), 'DS418play': desktop('DS418play',4,4,47,80,3),
  'DS420+': desktop('DS420+',4,4,47,80,3,2), 'DS920+': desktop('DS920+',4,4,47,80,3,2),
  'DS923+': desktop('DS923+',4,4,47,80,3,2), 'DS1520+': desktop('DS1520+',5,5,45,80,3),
  'DS1522+': desktop('DS1522+',5,5,45,80,3,2), 'DS1525+': desktop('DS1525+',5,5,45,80,3,2),
  'DS620slim': desktop('DS620slim',6,6,40,72,3), 'DS1621+': desktop('DS1621+',6,6,44,80,3,2),
  'DS1621xs+': desktop('DS1621xs+',6,6,44,80,3), 'DS1019+': desktop('DS1019+',5,5,45,80,3),
  'DS1819+': desktop('DS1819+',8,8,43,80,3), 'DS1821+': desktop('DS1821+',8,8,43,84,3,2),
  'DS1823xs+': desktop('DS1823xs+',8,8,43,84,3,2), 'DS1825+': desktop('DS1825+',8,8,43,84,3,2),
  'DS2419+': desktop('DS2419+',12,6,42,76,3), 'DS2419+II': desktop('DS2419+II',12,6,42,76,3),
  'DS2422+': desktop('DS2422+',12,6,42,76,3), 'DS3622xs+': desktop('DS3622xs+',12,6,42,76,3),
  'RS422+': rack('RS422+',4,4), 'RS822+': rack('RS822+',4,4), 'RS1221+': rack('RS1221+',8,8),
  'RS2421+': rack('RS2421+',12,12), 'RS2423+': rack('RS2423+',12,12),
  'RS3621xs+': rack('RS3621xs+',12,12), 'RS4021xs+': rack('RS4021xs+',16,16),
  'FS2500': rack('FS2500',12,12), 'FS3400': rack('FS3400',24,12), 'FS3410': rack('FS3410',24,12),
  'FS3420': rack('FS3420',24,12), 'FS3600': rack('FS3600',24,12), 'FS6400': rack('FS6400',24,12),
  'SA6400': rack('SA6400',12,12), 'HD6500': rack('HD6500',60,12),
});

export function generateDynamicPanelDef(model, detectedBayCount = 0) {
  const known = model && SYNOLOGY_PANEL_DEFS[model];
  if (known) return known;
  const count = Math.max(0, Math.min(120, Number(detectedBayCount) || 0));
  const cols = count <= 2 ? Math.max(1,count) : count <= 6 ? count : count <= 12 ? 6 : 12;
  const w = cols > 8 ? 30 : cols > 4 ? 40 : 47, h = cols > 8 ? 46 : 75, gap=3;
  const rows = Math.ceil(count/cols), totalW=cols*w+(cols-1)*gap;
  const vw=Math.max(100,totalW+24), vh=rows*h+Math.max(0,rows-1)*gap+16;
  const drives=Array.from({length:count},(_,i)=>({x:(vw-totalW)/2+(i%cols)*(w+gap),y:8+Math.floor(i/cols)*(h+gap),w,h,type:'hdd',slot:i+1}));
  return {label:model||`NAS (${count}-Bay)`,vw,vh,drives,m2_max:0,extras:[],geometryStatus:'generic-fallback',geometrySource:null};
}
