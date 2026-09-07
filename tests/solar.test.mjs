import test from 'node:test';
import assert from 'node:assert/strict';
import { planets } from '../src/data/solar.mjs';
test('Órbita contiene los ocho planetas ordenados y órbitas que no se solapan',()=>{
  assert.deepEqual(planets.map(p=>p.name),['Mercurio','Venus','Tierra','Marte','Júpiter','Saturno','Urano','Neptuno']);
  for(let i=1;i<planets.length;i++) assert.ok(planets[i].distance-planets[i].size>planets[i-1].distance+planets[i-1].size);
  assert.equal(planets.find(p=>p.name==='Saturno').rings,true);
});
