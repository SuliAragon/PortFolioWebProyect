import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve('dist');
const businessSlugs=['sobremesa','savia','kilometro','salitre','tallo','radial','casa-calma','compania','bloque','la-huerta'];
const slugs=['','pelago','forma','orbita','pulso','bruma','umbral','miga','cota','nexo','terminal','crudo',...businessSlugs];
test('las 22 landings estáticas permiten navegar a todas las demás y descargar el CV',()=>{
  const pages=slugs.map(slug=>resolve(root,slug,'index.html'));
  assert.equal(pages.filter(existsSync).length,22,'Deben existir 22 páginas HTML independientes');
  for(const page of pages){
    const html=readFileSync(page,'utf8');
    assert.equal((html.match(/class="project-link/g)||[]).length,22,`${page}: el menú debe enlazar 22 landings`);
    assert.equal((html.match(/aria-current="page"/g)||[]).length,1,`${page}: debe existir una única página seleccionada`);
    assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,`${page}: debe existir un título principal`);
    if (businessSlugs.some(slug=>page===resolve(root,slug,'index.html'))) {
      assert.doesNotMatch(html,/data-scene=|<canvas|three-world/,`${page}: los negocios no deben utilizar Three.js`);
      for(const [,src] of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
        const base=process.env.BASE_PATH || '/';
        assert.ok(existsSync(resolve(root,src.slice(base.length))),`${page}: falta imagen local ${src}`);
      }
    } else assert.match(html,/data-scene=/,`${page}: falta la escena original de Three.js`);
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
