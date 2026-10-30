export function renovationEstimate(area:number, level:'essential'|'complete'|'premium') {
  if (!Number.isFinite(area) || area < 5 || area > 250) throw new RangeError('La superficie debe estar entre 5 y 250 m².');
  const rate = {essential:450,complete:750,premium:1100}[level];
  if (!rate) throw new RangeError('Selecciona un alcance válido.');
  const base=area*rate;
  return {min:Math.round(base*.9),max:Math.round(base*1.15)};
}
export function furniturePrice(width:number, finish:'oak'|'walnut'|'sage', legs:boolean) {
  if (!Number.isFinite(width) || width<100 || width>220) throw new RangeError('Ancho fuera de rango.');
  const extra={oak:0,walnut:120,sage:65}[finish];
  if (extra===undefined) throw new RangeError('Acabado desconocido.');
  return 490+(width-100)*3+extra+(legs?45:0);
}
export function drivingPrice(lessons:number) {
  if (!Number.isInteger(lessons)||lessons<5||lessons>40) throw new RangeError('Elige entre 5 y 40 prácticas.');
  return 149+lessons*32;
}
export function canSeat(assignments:Record<string,string>,guest:string,table:string,capacity=4) {
  return table==='pending'||Object.entries(assignments).filter(([id,value])=>id!==guest&&value===table).length<capacity;
}
