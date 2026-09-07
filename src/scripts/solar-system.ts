import * as THREE from 'three';
import { planets } from '../data/solar.mjs';

export function buildSolarSystem(scene:THREE.Scene,world:THREE.Group,camera:THREE.PerspectiveCamera,renderer:THREE.WebGLRenderer,host:HTMLElement){
  scene.environmentIntensity=.15;
  scene.children.forEach(object=>{if(object instanceof THREE.Light)object.intensity=.3;});
  const sunlight=new THREE.PointLight('#ffe1a5',4,0,0);scene.add(sunlight);
  const sun=new THREE.Mesh(new THREE.SphereGeometry(1.12,64,40),new THREE.MeshBasicMaterial({color:'#ffb52f'}));world.add(sun);
  const sunMat=sun.material;
  sunMat.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 solarPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nsolarPosition=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 solarPosition;').replace('#include <color_fragment>',`#include <color_fragment>\nfloat heat=sin(solarPosition.x*22.+sin(solarPosition.z*35.))*sin(solarPosition.y*29.+sin(solarPosition.x*17.));diffuseColor.rgb=mix(vec3(1.,.32,.025),vec3(1.,.83,.23),.6+heat*.3);`);
  };
  const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const ctx=glowCanvas.getContext('2d')!;const gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(255,180,55,1)');gradient.addColorStop(.25,'rgba(255,139,32,.7)');gradient.addColorStop(.5,'rgba(245,107,20,.14)');gradient.addColorStop(1,'rgba(230,70,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const glowTexture=new THREE.CanvasTexture(glowCanvas);const glowMaterial=new THREE.SpriteMaterial({map:glowTexture,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});const glow=new THREE.Sprite(glowMaterial);glow.scale.set(7,7,1);world.add(glow);
  const planetMeshes:THREE.Mesh[]=[];
  const orbitLines:THREE.Line[]=[];
  const labels:HTMLSpanElement[]=[];
  const labelLayer=document.createElement('div');labelLayer.className='solar-labels';labelLayer.setAttribute('aria-hidden','true');host.append(labelLayer);
  planets.forEach((planet,index)=>{
    const material=new THREE.MeshStandardMaterial({color:planet.color,roughness:.86,metalness:.02});
    material.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 planetPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nplanetPosition=normal;');
      const surface=index===2?`float continents=sin(planetPosition.x*13.+sin(planetPosition.y*9.))*sin(planetPosition.z*9.+planetPosition.y*5.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.18,.38,.19),smoothstep(.12,.25,continents));float cloud=sin(planetPosition.y*31.+sin(planetPosition.x*20.))*sin(planetPosition.z*23.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.87,.92,.91),smoothstep(.55,.85,cloud)*.7);`:index>=4?`float band=sin(planetPosition.y*35.+sin(planetPosition.x*8.)*.7);diffuseColor.rgb*=.78+.22*band;`:`float craters=sin(planetPosition.x*42.)*sin(planetPosition.y*38.)*sin(planetPosition.z*30.);diffuseColor.rgb*=.8+craters*.17;`;
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 planetPosition;').replace('#include <color_fragment>','#include <color_fragment>\n'+surface);
    };
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(planet.size,48,32),material);mesh.userData.planetIndex=index;world.add(mesh);planetMeshes.push(mesh);
    const orbitPoints=Array.from({length:181},(_,i)=>new THREE.Vector3(Math.cos(i/180*Math.PI*2)*planet.distance,0,Math.sin(i/180*Math.PI*2)*planet.distance));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints),new THREE.LineBasicMaterial({color:'#7385a6',transparent:true,opacity:.22}));world.add(line);orbitLines.push(line);
    if(planet.rings){[1.4,1.62,1.94].forEach((scale,i)=>{const ring=new THREE.Mesh(new THREE.RingGeometry(planet.size*scale,planet.size*(scale+.19),100),new THREE.MeshStandardMaterial({color:['#b0a38d','#d8c8a2','#998d78'][i],side:THREE.DoubleSide,transparent:true,opacity:.7,roughness:1}));ring.rotation.x=-Math.PI/2+.33;ring.rotation.y=.16;mesh.add(ring);});}
    if(index===2){const moon=new THREE.Mesh(new THREE.SphereGeometry(.075,16,12),new THREE.MeshStandardMaterial({color:'#c5c3bd',roughness:1}));moon.position.set(.5,.12,0);mesh.add(moon);}
    const label=document.createElement('span');label.textContent=planet.name;label.className='solar-planet-label';labelLayer.append(label);labels.push(label);
  });
  const random=seeded(521);const rockGeometry=new THREE.IcosahedronGeometry(1,0);const rocks=new THREE.InstancedMesh(rockGeometry,new THREE.MeshStandardMaterial({color:'#938f84',roughness:1}),600);const dummy=new THREE.Object3D();for(let i=0;i<600;i++){const angle=random()*Math.PI*2;const radius=5.8+random()*.55;dummy.position.set(Math.cos(angle)*radius,(random()-.5)*.2,Math.sin(angle)*radius);dummy.scale.setScalar(.012+random()*.024);dummy.rotation.set(random()*3,random()*3,0);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);}world.add(rocks);
  const starPositions=[];for(let i=0;i<1500;i++)starPositions.push((random()-.5)*100,(random()-.5)*65,-15-random()*45);const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));scene.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:'#cbdafa',size:.055,transparent:true,opacity:.8})));
  let focus=Number(document.querySelector('[data-planet][aria-pressed="true"]')?.getAttribute('data-planet') ?? -1);let latestTime=0;let latestSpeed=.5;
  const focusPosition=new THREE.Vector3();const projected=new THREE.Vector3();
  const update=(time:number,speed:number)=>{
    latestTime=time;latestSpeed=speed;
    sun.rotation.y=time*.09;
    planetMeshes.forEach((mesh,i)=>{const p=planets[i];const angle=p.phase+time*p.speed*speed;mesh.position.set(Math.cos(angle)*p.distance,0,Math.sin(angle)*p.distance);mesh.rotation.y=time*.17;});
    if(focus>=0){focusPosition.copy(planetMeshes[focus].position);const distance=Math.max(2.6,planets[focus].size*7);camera.position.copy(focusPosition).add(new THREE.Vector3(distance*.3,distance*.55,distance));camera.lookAt(focusPosition);}
    else{const distance=Math.max(30,43/camera.aspect);camera.position.set(0,distance*.68,distance*.82);camera.lookAt(0,0,0);}
    camera.updateMatrixWorld();world.updateMatrixWorld(true);
    labels.forEach((label,i)=>{projected.copy(planetMeshes[i].position).project(camera);const show=(focus<0||focus===i)&&Math.abs(projected.x)<.95&&Math.abs(projected.y)<.95;label.hidden=!show;if(show){label.style.left=`${(projected.x*.5+.5)*100}%`;label.style.top=`${(-projected.y*.5+.5)*100}%`;label.classList.toggle('is-focused',focus===i);}});
    orbitLines.forEach((line,i)=>{(line.material as THREE.LineBasicMaterial).opacity=focus<0?.22:i===focus?.5:.055;});
  };
  const onFocus=(event:Event)=>{focus=(event as CustomEvent<number>).detail;update(latestTime,latestSpeed);renderer.render(scene,camera);};
  document.addEventListener('scene:planet',onFocus);
  const raycaster=new THREE.Raycaster();
  const onClick=(event:MouseEvent)=>{const r=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-r.left)/r.width*2-1,-((event.clientY-r.top)/r.height)*2+1),camera);const hit=raycaster.intersectObjects(planetMeshes,false)[0];if(hit){const index=hit.object.userData.planetIndex;document.querySelector<HTMLButtonElement>(`[data-planet="${index}"]`)?.click();}};
  host.addEventListener('click',onClick);
  return {update,dispose:()=>{document.removeEventListener('scene:planet',onFocus);host.removeEventListener('click',onClick);glowTexture.dispose();glowMaterial.dispose();labelLayer.remove();}};
}
function seeded(seed:number){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
