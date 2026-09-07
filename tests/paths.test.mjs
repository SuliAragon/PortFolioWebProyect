import test from 'node:test';
import assert from 'node:assert/strict';
import { withBase } from '../src/lib/paths.mjs';

test('las rutas conservan el prefijo del repositorio de GitHub Pages', () => {
  assert.equal(withBase('/pelago/', '/portfolio/'), '/portfolio/pelago/');
  assert.equal(withBase('/', '/portfolio/'), '/portfolio/');
  assert.equal(withBase('/cv-jesus-aragon.pdf', '/portfolio/'), '/portfolio/cv-jesus-aragon.pdf');
  assert.equal(withBase('/pelago/', '/'), '/pelago/');
});
