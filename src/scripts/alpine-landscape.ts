import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

export function buildAlpineLandscape(scene:THREE.Scene,world:THREE.Group,camera:THREE.PerspectiveCamera){
  camera.fov=42;
  camera.updateProjectionMatrix();
  const noise=new ImprovedNoise();
  const sample=(x:number,z:number)=>noise.noise(x,z,12.7);
  const peaks=[[-28,-35,22,19],[-13,-26,25,18],[0,-41,33,22],[13,-30,24,19],[28,-43,28,24],[-36,-58,30,26],[33,-63,33,28]];
  const elevation=(x:number,z:number)=>{
    let mountain=0;
    for(const [px,pz,height,radius] of peaks){const dx=x-px,dz=z-pz;const angle=Math.atan2(dz,dx);const distance=Math.hypot(dx,dz);const jaggedRadius=radius*(1+.13*Math.cos(angle*5+.3)+.07*Math.sin(angle*9));const shape=Math.max(0,1-distance/jaggedRadius);mountain=Math.max(mountain,height*Math.pow(shape,1.18));}
    const rugged=(sample(x*.17,z*.17)*2.6+sample(x*.5,z*.5)*.8+sample(x*1.35,z*1.35)*.25)*Math.min(1,mountain*.3);
    const foothills=Math.max(0,Math.abs(x)-7)*.12+(sample(x*.055,z*.055)+.6)*1.2;
    let y=Math.max(foothills,mountain+rugged);
    const lakeAngle=Math.atan2((z-5)/8.8,x/10);
    const lakeDistance=Math.hypot(x/10,(z-5)/8.8)/(1+.14*Math.sin(lakeAngle*3+.5)+.08*Math.cos(lakeAngle*5));
    if(lakeDistance<1.2)y=Math.min(y,-.45+Math.max(0,lakeDistance-.7)*4.5);
    return y;
  };
  const terrainGeometry=new THREE.PlaneGeometry(100,110,260,250);terrainGeometry.rotateX(-Math.PI/2);terrainGeometry.translate(0,0,-30);
  const position=terrainGeometry.getAttribute('position');
  for(let i=0;i<position.count;i++)position.setY(i,elevation(position.getX(i),position.getZ(i)));
  terrainGeometry.computeVertexNormals();const normals=terrainGeometry.getAttribute('normal');
  const colors=[];const rock=new THREE.Color('#6c7977'),grass=new THREE.Color('#3c5544'),snow=new THREE.Color('#e8eee7'),soil=new THREE.Color('#8b8973');
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i);const n=sample(x*.35,z*.35);const slope=normals.getY(i);const c=grass.clone().lerp(soil,Math.max(0,Math.min(1,(y-2)/6)));
    if(y>6)c.lerp(rock,Math.min(1,(y-6)/5));
    const snowLine=15+n*2.2;const snowMix=Math.max(0,Math.min(1,(y-snowLine)/3.5))*Math.max(.12,Math.min(1,(slope-.4)*2.3));c.lerp(snow,snowMix);c.multiplyScalar(.9+n*.07);colors.push(c.r,c.g,c.b);
  }
  terrainGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const terrainMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true});
  const terrain=new THREE.Mesh(terrainGeometry,terrainMaterial);world.add(terrain);
  const waterMaterial=new THREE.MeshStandardMaterial({color:'#427f83',metalness:.35,roughness:.25,transparent:true,opacity:.92});
  const waterGeometry=new THREE.CircleGeometry(1,100);waterGeometry.rotateX(-Math.PI/2);waterGeometry.scale(9.1,1,7.6);waterGeometry.translate(0,.12,5);
  const waterPositions=waterGeometry.getAttribute('position');
  for(let i=1;i<waterPositions.count;i++){const x=waterPositions.getX(i),z=waterPositions.getZ(i)-5;const angle=Math.atan2(z/7.6,x/9.1);const shoreline=1+.14*Math.sin(angle*3+.5)+.08*Math.cos(angle*5);waterPositions.setX(i,x*shoreline);waterPositions.setZ(i,5+z*shoreline);}
  waterGeometry.computeVertexNormals();
  waterMaterial.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 waterPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nwaterPosition=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 waterPosition;').replace('#include <color_fragment>','#include <color_fragment>\nfloat ripple=sin(waterPosition.x*19.+waterPosition.z*31.)*sin(waterPosition.z*12.);diffuseColor.rgb*=.8+ripple*.035+smoothstep(-3.,12.,waterPosition.z)*.3;');
  };
  const water=new THREE.Mesh(waterGeometry,waterMaterial);world.add(water);
  const treeMaterial=new THREE.MeshStandardMaterial({color:'#193b2b',roughness:1});const treeGeometry=new THREE.ConeGeometry(.36,2.1,5);treeGeometry.translate(0,1.02,0);
  const trees=new THREE.InstancedMesh(treeGeometry,treeMaterial,500);const dummy=new THREE.Object3D();let count=0;let seed=732;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<1600&&count<500;i++){const x=(random()-.5)*65,z=-15+random()*38,y=elevation(x,z);if(y>.6&&y<6&&Math.hypot(x/11,(z-5)/9.5)>1){dummy.position.set(x,y,z);const scale=.45+random()*.6;dummy.scale.set(scale,scale*(.9+random()*.3),scale);dummy.rotation.y=random()*Math.PI;dummy.updateMatrix();trees.setMatrixAt(count++,dummy.matrix);}}
  trees.count=count;world.add(trees);
  const mistMaterial=new THREE.MeshBasicMaterial({color:'#a5c0ba',transparent:true,opacity:.035,side:THREE.DoubleSide,depthWrite:false});
  const mist=new THREE.Mesh(new THREE.PlaneGeometry(85,13),mistMaterial);mist.position.set(0,4,-18);world.add(mist);
  scene.fog=new THREE.FogExp2('#a6bfba',.0085);scene.environmentIntensity=.12;
  scene.children.forEach(object=>{if(object instanceof THREE.AmbientLight)object.intensity=.55;});
  const sun=scene.children.find(object=>object instanceof THREE.DirectionalLight) as THREE.DirectionalLight;sun.position.set(-30,45,20);sun.intensity=2.5;sun.color.set('#fff0ce');
  const fill=scene.children.filter(object=>object instanceof THREE.DirectionalLight)[1] as THREE.DirectionalLight;fill.intensity=.5;fill.color.set('#b6d1e1');
  const fog=scene.fog as THREE.FogExp2;
  const update=(time:number,variant:number,pointer:THREE.Vector2)=>{
    const wide=camera.aspect<.8;
    camera.position.set((wide?3:0)+pointer.x*.6,wide?17:15,wide?53:45);camera.lookAt(0,6,-20);
    terrainMaterial.color.set(['#ffffff','#f1d4b5','#d6e9fa'][variant]);sun.color.set(['#fff0ce','#ffd4a2','#e2edff'][variant]);fog.color.set(['#a6bfba','#bebba6','#a2bccd'][variant]);waterMaterial.color.set(['#427f83','#617f7a','#497a94'][variant]);
    water.position.y=Math.sin(time*.6)*.012;
  };
  return update;
}
