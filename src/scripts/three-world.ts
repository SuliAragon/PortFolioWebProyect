import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { SceneKind } from '../data/projects';
import { buildSolarSystem } from './solar-system';
import { buildAlpineLandscape } from './alpine-landscape';

export function createScene(host: HTMLElement, kind: SceneKind) {
  const canvas = host.querySelector('canvas')!;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(0, 0, 8);
  const world = new THREE.Group();
  scene.add(world);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xffffff, 1.25));
  const key = new THREE.DirectionalLight(0xfff1da, 4);
  key.position.set(3, 5, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 2);
  fill.position.set(-4, 1, -2);
  scene.add(fill);
  const makeMaterial = (color: THREE.ColorRepresentation, roughness = .35, metalness = .1) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const addMesh = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = world) => {
    const mesh = new THREE.Mesh(geometry, material);
    parent.add(mesh);
    return mesh;
  };
  let variant = Number(document.querySelector('[data-variant][aria-pressed="true"]')?.getAttribute('data-variant') || 0);
  let intensity = Number((document.querySelector('[data-scene-range]') as HTMLInputElement | null)?.value || .7);
  let animation: (time: number) => void = () => {};
  const extraCleanups: (() => void)[] = [];
  const pointer = new THREE.Vector2();
  const target = new THREE.Vector2();

  if (kind === 'cv') {
    const copper = new THREE.MeshPhysicalMaterial({ color: '#e46b36', roughness: .24, metalness: .5, clearcoat: .45 });
    const sculpture = addMesh(new THREE.TorusKnotGeometry(1.16, .37, 200, 36, 2, 3), copper);
    sculpture.rotation.set(.45, .1, -.45);
    const orbit = addMesh(new THREE.TorusGeometry(1.95, .008, 8, 160), makeMaterial('#acb19c', .8));
    orbit.rotation.set(1.3, .2, -.35);
    const floor = addMesh(new THREE.CircleGeometry(1.85, 80), new THREE.MeshBasicMaterial({ color: '#8e957e', transparent: true, opacity: .07, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.75;
    camera.position.set(0, .25, 7.9);
    animation = t => { sculpture.rotation.y = t * .13 + pointer.x * .25; sculpture.rotation.x = .45 + pointer.y * .12; sculpture.position.y = Math.sin(t * .65) * .07; orbit.rotation.z = -.35 + t * .025; };
  }

  if (kind === 'ocean') {
    const oceanMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uAspect: { value: 1 }, uPower: { value: .7 }, uPointer: { value: pointer } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime; uniform float uAspect; uniform float uPower; uniform vec2 uPointer;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
        float height(vec2 p){float t=uTime*.28;float h=0.;float a=.45;for(int i=0;i<5;i++){h+=a*sin(p.x*1.2+t)*cos(p.y*.8+t*.7)+a*.9*noise(p*1.5+t*.2);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.42;}return h*(.45+uPower*.45);}
        void main(){
          vec2 uv=vUv;float horizon=.89;float depth=max(.004,horizon-uv.y);
          vec2 p=vec2((uv.x-.5)*uAspect,1.)/depth;p.x+=uPointer.x*.12;p.y+=uTime*.065;
          float e=.017;float h=height(p);vec3 n=normalize(vec3((h-height(p+vec2(e,0.)))/e,1.5,(h-height(p+vec2(0.,e)))/e));
          vec3 light=normalize(vec3(.7,1.,.9));vec3 view=normalize(vec3(0.,.4,1.));
          float diffuse=max(dot(n,light),0.);float spec=pow(max(dot(reflect(-light,n),view),0.),55.);
          vec3 deep=vec3(.017,.13,.20);vec3 teal=vec3(.09,.36,.41);vec3 col=mix(deep,teal,diffuse*.82);
          col+=vec3(.9,.91,.69)*spec*.95;col+=pow(max(n.y,0.),7.)*vec3(.07,.16,.16);
          float distanceFade=exp(-depth*18.);col=mix(col,vec3(.39,.57,.58),distanceFade);
          if(uv.y>horizon){col=mix(vec3(.39,.57,.58),vec3(.09,.28,.39),(uv.y-horizon)/.11);}
          col*=.85+.15*uv.x;gl_FragColor=vec4(col,1.);
        }`,
    });
    addMesh(new THREE.PlaneGeometry(2, 2), oceanMaterial);
    animation = t => { oceanMaterial.uniforms.uTime.value = t; oceanMaterial.uniforms.uAspect.value = host.clientWidth / host.clientHeight; oceanMaterial.uniforms.uPower.value = intensity; };
  }

  if (kind === 'architecture') {
    const stone = makeMaterial('#d6cbb7', .9, .02);
    const white = makeMaterial('#f1eee2', .85);
    const dark = makeMaterial('#474c40', .7);
    const base = addMesh(new THREE.BoxGeometry(4.8, .16, 3.8), makeMaterial('#c3c3ad', .95));
    base.position.y = -1.15;
    const block = (x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material) => { const m=addMesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); return m; };
    block(-.9,.02,.25,1.2,2.2,1.6,stone);
    block(.55,-.4,.4,1.3,1.35,1.65,white);
    block(.35,.58,-.7,1.6,3.3,.75,stone);
    block(-.95,1.2,-.5,1.35,.18,2.4,white);
    block(.55,.35,.35,1.65,.16,2.15,white);
    block(1.7,-.9,.25,.3,.45,2.6,stone);
    for (let i=0;i<7;i++) block(-1.31+i*.14,-.2,1.065,.048,1.5,.045,dark);
    for (let i=0;i<6;i++) block(.05+i*.2,-.38,1.25,.08,.97,.07,stone);
    block(.54,-.36,1.20,1.18,1.1,.05,dark);
    for(let i=0;i<4;i++) block(.6,-1.01+i*.055,1.42-i*.14,1.25,.12,.6-i*.12,white);
    const tree = new THREE.Group(); world.add(tree); tree.position.set(-1.7,-1.1,-.8);
    const trunk = addMesh(new THREE.CylinderGeometry(.025,.035,1,8),dark,tree); trunk.position.y=.5;
    const crown = addMesh(new THREE.IcosahedronGeometry(.42,1),makeMaterial('#73826a',.9),tree); crown.position.y=1.05; crown.scale.set(.85,1.3,.85);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(base.geometry),new THREE.LineBasicMaterial({color:'#9caa8f',transparent:true,opacity:.5}));edges.position.copy(base.position);world.add(edges);
    world.rotation.y = -.45;
    camera.position.set(6,4.2,7);camera.lookAt(0,.1,0);
    animation = t => { world.rotation.y = -.45 + Math.sin(t*.09)*.15+pointer.x*.17; };
  }

  if (kind === 'space') {
    const solar = buildSolarSystem(scene, world, camera, renderer, host);
    animation = t => solar.update(t, intensity);
    extraCleanups.push(solar.dispose);
  }

  if (kind === 'music') {
    scene.environmentIntensity=.25;
    const rings:THREE.Mesh[]=[];
    for(let i=0;i<30;i++) {
      const mat=new THREE.MeshBasicMaterial({color:'#d6ff52',transparent:true,opacity:.2+(i/30)*.8});
      const ring=addMesh(new THREE.TorusGeometry(.7+i*.036,.009,5,150),mat);
      ring.position.z=(i-15)*.105;rings.push(ring);
    }
    world.rotation.set(.6,.8,.2);camera.position.z=6.6;
    animation=t=>{rings.forEach((ring,i)=>{const s=1+Math.sin(t*(.8+intensity*.3)+i*.26)*(.06+intensity*.035);ring.scale.set(s,s,1);ring.rotation.x=Math.sin(t*.4+i*.05)*.2;});world.rotation.y=.8+Math.sin(t*.2)*.25+pointer.x*.3;world.rotation.z=t*.035;};
  }

  if (kind === 'perfume') {
    const glass = new THREE.MeshPhysicalMaterial({color:'#b79ac5',roughness:.12,metalness:.05,transmission:.6,thickness:.9,ior:1.45,clearcoat:1,transparent:true,opacity:.95});
    const points=[new THREE.Vector2(0,-1.25),new THREE.Vector2(.66,-1.25),new THREE.Vector2(.77,-1.12),new THREE.Vector2(.8,-.95),new THREE.Vector2(.8,.05),new THREE.Vector2(.72,.35),new THREE.Vector2(.28,.6),new THREE.Vector2(.25,.72)];
    addMesh(new THREE.LatheGeometry(points,80),glass);
    const liquid=addMesh(new THREE.CylinderGeometry(.66,.66,1.12,64),new THREE.MeshPhysicalMaterial({color:'#9f7daa',roughness:.18,metalness:.05,transparent:true,opacity:.32}));liquid.position.y=-.56;
    const neck=addMesh(new THREE.CylinderGeometry(.27,.27,.24,40),makeMaterial('#b69b83',.25,.8));neck.position.y=.72;
    const cap=addMesh(new THREE.SphereGeometry(.4,48,32),makeMaterial('#6a526b',.22,.3));cap.position.y=1.1;
    const label=addMesh(new THREE.PlaneGeometry(.84,.58),makeMaterial('#e9dfdc',.95));label.position.set(0,-.45,.802);
    const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=256;
    const ctx=labelCanvas.getContext('2d')!;ctx.fillStyle='#eee4e0';ctx.fillRect(0,0,512,256);ctx.textAlign='center';ctx.fillStyle='#665469';ctx.font='54px Georgia';ctx.fillText('bruma.',256,110);ctx.font='16px sans-serif';ctx.fillText('E A U   D E   M É M O I R E',256,159);ctx.font='13px sans-serif';ctx.fillText('50 ML',256,200);
    const texture=new THREE.CanvasTexture(labelCanvas);texture.colorSpace=THREE.SRGBColorSpace;(label.material as THREE.MeshStandardMaterial).map=texture;
    const pedestal=addMesh(new THREE.CylinderGeometry(1.4,1.48,.17,80),makeMaterial('#d4c5d6',.85));pedestal.position.y=-1.36;
    world.rotation.y=-.18;camera.position.set(0,.15,7);camera.lookAt(0,0,0);
    animation=t=>{world.rotation.y=-.18+Math.sin(t*.22)*.2+pointer.x*.2;glass.color.set(['#b79ac5','#dfb27e','#93b09a'][variant]);(liquid.material as THREE.MeshPhysicalMaterial).color.set(['#9f7daa','#bd8c4e','#718f77'][variant]);};
  }

  if (kind === 'art') {
    const chrome=new THREE.MeshPhysicalMaterial({color:'#bfc9ca',roughness:.2,metalness:1,clearcoat:.4});
    const forms=[new THREE.TorusKnotGeometry(1.2,.4,210,36,3,2),new THREE.IcosahedronGeometry(1.6,1),new THREE.TorusKnotGeometry(1.1,.27,200,32,2,5)];
    const sculptures=forms.map(g=>addMesh(g,chrome));world.rotation.set(.3,.1,-.3);camera.position.z=7.3;
    animation=t=>{sculptures.forEach((m,i)=>m.visible=i===variant);world.rotation.y=t*.14+pointer.x*.25;world.rotation.x=.3+Math.sin(t*.17)*.2;world.position.y=Math.sin(t*.3)*.12;};
  }

  if (kind === 'bread') {
    const breadMat=makeMaterial('#b86420',.78,.02);
    breadMat.onBeforeCompile = shader => {
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBread;').replace('#include <begin_vertex>','#include <begin_vertex>\nvBread = position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vBread;').replace('#include <color_fragment>',`#include <color_fragment>\nfloat grain=fract(sin(dot(vBread,vec3(124.2,367.7,76.2)))*43758.);float toast=.8+.2*sin(vBread.x*12.+vBread.y*9.);diffuseColor.rgb*=toast*(.87+grain*.22);`);
    };
    const bread=addMesh(new THREE.TorusKnotGeometry(1.04,.36,210,32,2,3),breadMat);bread.scale.set(1.08,1.1,.63);bread.rotation.set(.15,0,-.35);
    const random=seeded(32); const sesameMat=makeMaterial('#f4d7a1',.95);
    const geometry=bread.geometry;const positions=geometry.getAttribute('position');const normals=geometry.getAttribute('normal');
    const seeds=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,4),sesameMat,240);const dummy=new THREE.Object3D();
    for(let i=0;i<240;i++){const n=Math.floor(random()*positions.count);dummy.position.fromBufferAttribute(positions,n);const normal=new THREE.Vector3().fromBufferAttribute(normals,n);dummy.position.addScaledVector(normal,.016);dummy.scale.set(.019,.038,.012);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);dummy.rotateZ(random()*Math.PI);dummy.updateMatrix();seeds.setMatrixAt(i,dummy.matrix);}bread.add(seeds);
    bread.scale.multiplyScalar(.74);
    const loafGeometry=new THREE.SphereGeometry(1,64,40);
    const loafPosition=loafGeometry.getAttribute('position');
    for(let i=0;i<loafPosition.count;i++){const x=loafPosition.getX(i),y=loafPosition.getY(i),z=loafPosition.getZ(i);const rough=1+Math.sin(x*28+y*13)*Math.sin(z*25)*.012;loafPosition.setXYZ(i,x*rough,y*rough,z*rough);}
    loafGeometry.computeVertexNormals();
    const loaf=addMesh(loafGeometry,breadMat);loaf.position.set(-2.55,-.05,0);loaf.scale.set(1.1,.87,.64);loaf.rotation.z=-.12;
    const flour=makeMaterial('#f4d6a1',.95);
    for(let i=0;i<4;i++){const path=[];for(let j=0;j<=20;j++){const y=-.42+j*.042,x=-.46+i*.3+y*.28;path.push(new THREE.Vector3(x,y,Math.sqrt(Math.max(.05,1-x*x-y*y))+.017));}addMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path),24,.027,7,false),flour,loaf);}
    const baguette=addMesh(new THREE.CapsuleGeometry(.38,1.62,14,32),breadMat);baguette.position.set(2.7,0,0);baguette.rotation.z=-.5;baguette.scale.z=.85;
    for(let i=0;i<5;i++){const score=addMesh(new THREE.CapsuleGeometry(.028,.38,5,12),flour,baguette);score.position.set(0,-.75+i*.37,.36);score.rotation.z=.7;}
    const board=addMesh(new THREE.BoxGeometry(8.7,.07,3.5),makeMaterial('#ca8f43',.95));board.position.set(.15,0,-.9);board.rotation.x=Math.PI/2;
    camera.position.set(0,0,7.7);
    animation=t=>{world.scale.setScalar(Math.min(1.4,camera.aspect*.48));world.rotation.y=pointer.x*.045;bread.rotation.z=-.35+Math.sin(t*.18)*.035;loaf.rotation.z=-.12+Math.sin(t*.15)*.015;};
  }

  if (kind === 'mountain') {
    const updateLandscape = buildAlpineLandscape(scene, world, camera);
    renderer.toneMappingExposure = .95;
    animation = t => updateLandscape(t, variant, pointer);
  }

  if (kind === 'ai') {
    const random=seeded(72);const points:THREE.Vector3[]=[];const blue=makeMaterial('#5d8fe8',.25,.35);
    for(let i=0;i<74;i++){const angle=random()*Math.PI*2;const phi=Math.acos(2*random()-1);const r=i<48?1.65:.9;points.push(new THREE.Vector3(r*Math.sin(phi)*Math.cos(angle),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(angle)));}
    const nodes=new THREE.InstancedMesh(new THREE.SphereGeometry(.041,12,10),blue,points.length);const dummy=new THREE.Object3D();points.forEach((p,i)=>{dummy.position.copy(p);dummy.scale.setScalar(i%7===0?1.7:1);dummy.updateMatrix();nodes.setMatrixAt(i,dummy.matrix);});world.add(nodes);
    const lines=[];for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)if(points[i].distanceTo(points[j])<.88)lines.push(...points[i].toArray(),...points[j].toArray());
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));const lineMat=new THREE.LineBasicMaterial({color:'#8faee6',transparent:true,opacity:.48});world.add(new THREE.LineSegments(g,lineMat));
    const core=addMesh(new THREE.IcosahedronGeometry(.38,1),new THREE.MeshPhysicalMaterial({color:'#7faaf2',metalness:.2,roughness:.15,transmission:.45,thickness:.5}));
    camera.position.z=6.8;
    animation=t=>{world.rotation.y=t*.1+pointer.x*.2;world.rotation.x=.2+Math.sin(t*.15)*.12;core.rotation.y=-t*.3;core.scale.setScalar(1+Math.sin(t*.9)*.07);blue.color.set(['#5d8fe8','#8274d2','#329c9a'][variant]);lineMat.color.set(['#8faee6','#aba0df','#78bfbe'][variant]);};
  }

  if (kind === 'architecture') {
    renderer.toneMappingExposure = .85;
    scene.environmentIntensity = .3;
    scene.children.forEach(object => { if (object instanceof THREE.AmbientLight) object.intensity = .4; });
    key.intensity = 2.6;
    key.position.set(-4, 7, 5);
    fill.intensity = .35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: .1, far: 30 });
    key.shadow.bias = -.0003;
    key.shadow.normalBias = .025;
    world.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; } });
  }

  let disposed=false;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused=document.querySelector('[data-motion]')?.getAttribute('aria-pressed') === 'true' || reduced.matches;
  let visible=true;
  let time=0;
  let last=0;
  const draw=(timestamp:number)=>{
    if(disposed)return;
    const delta=last?Math.min((timestamp-last)/1000,.04):0;last=timestamp;time+=delta;
    pointer.lerp(target,.045);animation(time);renderer.render(scene,camera);
  };
  const run=()=>{
    renderer.setAnimationLoop(null);last=0;
    if(!paused&&visible&&!document.hidden)renderer.setAnimationLoop(draw);
    else {animation(time);renderer.render(scene,camera);}
  };
  const resize=()=>{const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();animation(time);renderer.render(scene,camera);};
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;run();});intersection.observe(host);
  const onPointer=(event:PointerEvent)=>{const bounds=host.getBoundingClientRect();target.set(((event.clientX-bounds.left)/bounds.width-.5)*2,-((event.clientY-bounds.top)/bounds.height-.5)*2);};
  const onLeave=()=>target.set(0,0);
  host.addEventListener('pointermove',onPointer,{passive:true});host.addEventListener('pointerleave',onLeave);
  const onMotion=(event:Event)=>{paused=(event as CustomEvent<boolean>).detail;run();};
  const onVariant=(event:Event)=>{variant=(event as CustomEvent<number>).detail;animation(time);renderer.render(scene,camera);};
  const onIntensity=(event:Event)=>{intensity=(event as CustomEvent<number>).detail;animation(time);renderer.render(scene,camera);};
  const onVisibility=()=>run();
  document.addEventListener('scene:motion',onMotion);document.addEventListener('scene:variant',onVariant);document.addEventListener('scene:intensity',onIntensity);document.addEventListener('visibilitychange',onVisibility);
  const onReduced=()=>{paused=reduced.matches;run();};reduced.addEventListener('change',onReduced);
  const onLost=(event:Event)=>{event.preventDefault();renderer.setAnimationLoop(null);host.classList.remove('is-ready');};
  const onRestored=()=>{host.classList.add('is-ready');resize();run();};canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestored);
  resize();host.classList.add('is-ready');run();
  const dispose=()=>{if(disposed)return;disposed=true;extraCleanups.forEach(cleanup=>cleanup());renderer.setAnimationLoop(null);intersection.disconnect();resizeObserver.disconnect();host.removeEventListener('pointermove',onPointer);host.removeEventListener('pointerleave',onLeave);document.removeEventListener('scene:motion',onMotion);document.removeEventListener('scene:variant',onVariant);document.removeEventListener('scene:intensity',onIntensity);document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onReduced);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);const materials=new Set<THREE.Material>();const geometries=new Set<THREE.BufferGeometry>();scene.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.geometry)geometries.add(mesh.geometry);if(mesh.material)(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(material=>materials.add(material));if(object instanceof THREE.InstancedMesh)object.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>{const map=(m as THREE.MeshStandardMaterial).map;if(map)map.dispose();m.dispose();});environment.dispose();renderer.dispose();};
  window.addEventListener('pagehide',event=>{if(!event.persisted)dispose();else renderer.setAnimationLoop(null);});
  window.addEventListener('pageshow',event=>{if(event.persisted)run();});
}

function seeded(seed:number){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
