import test from 'node:test';
import assert from 'node:assert/strict';
import {renovationEstimate,furniturePrice,drivingPrice,canSeat} from '../src/lib/business-tools.ts';

test('la estimación de reforma escala por superficie y rechaza medidas fuera de rango',()=>{
  assert.deepEqual(renovationEstimate(60,'complete'),{min:40500,max:51750});
  assert.deepEqual(renovationEstimate(20,'essential'),{min:8100,max:10350});
  assert.throws(()=>renovationEstimate(0,'complete'),RangeError);
  assert.throws(()=>renovationEstimate(NaN,'complete'),RangeError);
});
test('el configurador combina medidas, acabados y patas sin perder extras',()=>{
  assert.equal(furniturePrice(160,'oak',true),715);
  assert.equal(furniturePrice(220,'walnut',false),970);
  assert.equal(furniturePrice(100,'sage',true),600);
  assert.throws(()=>furniturePrice(300,'oak',true),RangeError);
});
test('las prácticas incluyen la base una sola vez',()=>{
  assert.equal(drivingPrice(5),309);assert.equal(drivingPrice(40),1429);
  assert.throws(()=>drivingPrice(5.5),RangeError);
});
test('las mesas rechazan el quinto invitado pero permiten conservar y liberar un sitio',()=>{
  const seats={a:'olivo',b:'olivo',c:'olivo',d:'olivo',e:'pending'};
  assert.equal(canSeat(seats,'e','olivo'),false);
  assert.equal(canSeat(seats,'a','olivo'),true);
  assert.equal(canSeat(seats,'a','mar'),true);
  assert.equal(canSeat(seats,'a','pending'),true);
  seats.a='mar';assert.equal(canSeat(seats,'e','olivo'),true);
});
