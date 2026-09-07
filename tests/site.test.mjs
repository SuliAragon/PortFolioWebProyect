import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve('dist');
const slugs=['','pelago','forma','orbita','pulso','bruma','umbral','miga','cota','nexo'];
test('las diez landings estáticas permiten navegar a todas las demás y descargar el CV',()=>{
  const pages=slugs.map(slug=>resolve(root,slug,'index.html'));
  assert.equal(pages.filter(existsSync).length,10,'Deben existir diez páginas HTML independientes');
  for(const page of pages){
    const html=readFileSync(page,'utf8');
    assert.equal((html.match(/class="project-link/g)||[]).length,10,`${page}: el menú debe enlazar diez landings`);
    assert.equal((html.match(/aria-current="page"/g)||[]).length,1,`${page}: debe existir una única página seleccionada`);
    assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,`${page}: debe existir un título principal`);
    assert.match(html,/data-scene=/,`${page}: falta la escena de Three.js`);
    const base=process.env.BASE_PATH || '/';
    for(const slug of slugs){
      const href=`${base.replace(/\/$/,'')}/${slug ? `${slug}/` : ''}`;
      assert.ok(html.includes(`href="${href}"`),`${page}: falta ruta ${href}`);
    }
    for(const [,target] of html.matchAll(/href="#([^"\s]+)"/g)) assert.ok(html.includes(`id="${target}"`),`${page}: ancla rota #${target}`);
  }
  const home=readFileSync(pages[0],'utf8');
  for(const term of ['ALTEN Spain','Xebia','Airbus','Big Data','Matrícula de Honor','j.aragonmonzon@gmail.com']) assert.ok(home.includes(term),`Falta información del CV: ${term}`);
  assert.ok(readFileSync(resolve(root,'cv-jesus-aragon.pdf')).subarray(0,5).toString()==='%PDF-');
  assert.ok(readdirSync(resolve(root,'_astro')).some(name=>name.includes('three-world')&&name.endsWith('.js')),'Three.js debe cargarse en un módulo separado');
});
