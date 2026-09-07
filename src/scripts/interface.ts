import { planets } from '../data/solar.mjs';
const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const sidebar = document.querySelector<HTMLElement>('.sidebar');
const mobile = window.matchMedia('(max-width: 800px)');
function setMenu(open: boolean) {
  if (!sidebar || !menuToggle) return;
  sidebar.classList.toggle('is-open', open);
  sidebar.inert = mobile.matches && !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  const sign = menuToggle.querySelector('span');
  if (sign) sign.textContent = open ? '−' : '＋';
}
menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobile.addEventListener('change', () => setMenu(false));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); menuToggle.focus(); } });
document.addEventListener('click', event => { const target=event.target as Node; if (mobile.matches && !sidebar?.contains(target) && !menuToggle?.contains(target)) setMenu(false); });
setMenu(false);

const motionButtons = document.querySelectorAll<HTMLButtonElement>('[data-motion]');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
function syncMotion() {
  document.documentElement.toggleAttribute('data-motion-paused', paused);
  motionButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Reanudar animación' : 'Pausar animación');
    button.textContent = button.classList.contains('motion-button') ? (paused ? '▷' : 'Ⅱ') : (paused ? 'Reanudar animación ▷' : 'Pausar animación Ⅱ');
  });
}
syncMotion();
motionButtons.forEach(button => button.addEventListener('click', () => { paused = !paused; syncMotion(); document.dispatchEvent(new CustomEvent('scene:motion', { detail: paused })); }));
reduced.addEventListener('change', () => { paused=reduced.matches;syncMotion();document.dispatchEvent(new CustomEvent('scene:motion',{detail:paused})); });

document.querySelectorAll<HTMLButtonElement>('[data-variant]').forEach(button => button.addEventListener('click', () => {
  button.closest('[role="group"]')?.querySelectorAll('button').forEach(sibling => { sibling.classList.toggle('is-selected', sibling === button); sibling.setAttribute('aria-pressed', String(sibling === button)); });
  document.dispatchEvent(new CustomEvent('scene:variant', { detail: Number(button.dataset.variant) }));
}));
document.querySelector<HTMLInputElement>('[data-scene-range]')?.addEventListener('input', event => document.dispatchEvent(new CustomEvent('scene:intensity', { detail: Number((event.target as HTMLInputElement).value) })));

const scents = [
  { name:'La hora azul', description:'La quietud de una tarde que se vuelve noche. Suave, íntima, imposible de retener.', top:'Bergamota · Hojas de violeta', heart:'Iris · Té blanco', base:'Almizcle · Madera de cedro' },
  { name:'Sol de invierno', description:'Una ventana al sur y la calidez de una casa conocida. La luz también puede guardarse.', top:'Mandarina · Pimienta rosa', heart:'Flor de azahar · Mimosa', base:'Ámbar · Sándalo' },
  { name:'Después de llover', description:'La tierra que despierta, las hojas húmedas y esa manera nueva de empezar el día.', top:'Hojas verdes · Enebro', heart:'Musgo · Lavanda', base:'Vetiver · Pachulí' },
];
function text(id:string, value:string){const element=document.getElementById(id);if(element)element.textContent=value;}
document.querySelectorAll<HTMLButtonElement>('[data-scent]').forEach(button=>button.addEventListener('click',()=>{
  const index=Number(button.dataset.scent),scent=scents[index];
  text('scent-number',`Nº 0${index+1}`);text('scent-name',scent.name);text('scent-description',scent.description);text('scent-top',scent.top);text('scent-heart',scent.heart);text('scent-base',scent.base);
  const caption=document.querySelector('.perfume-caption');if(caption){caption.querySelector('.eyebrow')!.textContent=`Nº 0${index+1} — ${scent.name.toUpperCase()}`;caption.querySelector('p')!.textContent=scent.description;}
}));
const routes=[
  'El valle tranquilo: un lago entre bosques, roca y cumbres nevadas. La escala la pone el paisaje.',
  'La línea de cresta: la luz se vuelve dorada. El relieve aparece entre sombras cálidas y horizontes abiertos.',
  'La última cumbre: el paisaje se tiñe de frío. Tonos azules para imaginar el aire limpio de la altura.',
];
document.querySelectorAll<HTMLButtonElement>('[data-route]').forEach(button=>button.addEventListener('click',()=>text('route-description',routes[Number(button.dataset.route)])));
const insights=[
  {sources:['Comentarios de usuarios','Uso de funcionalidades','Solicitudes de soporte'],title:'La fricción también es una señal.',description:'Cruzar preguntas de soporte con funciones poco utilizadas ayuda a encontrar qué parte de la experiencia necesita más claridad.'},
  {sources:['Documentación compartida','Dependencias entre tareas','Preguntas recurrentes'],title:'El conocimiento necesita circular.',description:'Las preguntas repetidas y las tareas bloqueadas pueden señalar dónde falta contexto compartido. Hacerlo visible ayuda al equipo a avanzar.'},
  {sources:['Temas publicados','Intereses de lectores','Preguntas sin respuesta'],title:'La siguiente idea ya está cerca.',description:'Relacionar lo que publicas con lo que tu audiencia pregunta permite descubrir temas que merecen una explicación más útil.'},
];
document.querySelectorAll<HTMLButtonElement>('[data-insight]').forEach(button=>button.addEventListener('click',()=>{
  const insight=insights[Number(button.dataset.insight)];const container=document.getElementById('insight-sources');if(container)container.replaceChildren(...insight.sources.map(source=>{const span=document.createElement('span');span.textContent=source;return span;}));text('insight-title',insight.title);text('insight-description',insight.description);
}));

const audioButton=document.querySelector<HTMLButtonElement>('#audio-toggle');
const frequency=document.querySelector<HTMLInputElement>('#frequency');
let audioContext:AudioContext|undefined;
let oscillators:OscillatorNode[]=[];
let gain:GainNode|undefined;
let playing=false;
const setAudioLabel=()=>{if(!audioButton)return;audioButton.setAttribute('aria-pressed',String(playing));audioButton.textContent=playing?'Detener sonido Ⅱ':'Activar sonido ↗';};
function stopAudio(){if(!audioContext)return;gain?.gain.setTargetAtTime(0,audioContext.currentTime,.035);oscillators.forEach(osc=>osc.stop(audioContext!.currentTime+.2));oscillators=[];playing=false;setAudioLabel();text('audio-status','Sonido detenido. Tu frecuencia sigue aquí.');}
audioButton?.addEventListener('click',async()=>{
  if(playing){stopAudio();return;}
  try {
    audioButton.disabled=true;
    audioContext ||= new AudioContext();await audioContext.resume();
    gain=audioContext.createGain();gain.gain.setValueAtTime(0,audioContext.currentTime);gain.gain.linearRampToValueAtTime(.045,audioContext.currentTime+.15);gain.connect(audioContext.destination);
    const hz=Number(frequency?.value || 110);
    oscillators=[1,1.005].map(ratio=>{const oscillator=audioContext!.createOscillator();oscillator.type='sine';oscillator.frequency.value=hz*ratio;oscillator.connect(gain!);oscillator.start();return oscillator;});
    playing=true;setAudioLabel();text('audio-status','Sonando. Mueve el control para encontrar tu frecuencia.');
  } catch { text('audio-status','No se pudo activar el audio en este navegador. Prueba de nuevo.'); }
  finally {audioButton.disabled=false;}
});
frequency?.addEventListener('input',()=>{const hz=Number(frequency.value);text('frequency-value',String(hz));oscillators.forEach((osc,i)=>osc.frequency.setTargetAtTime(hz*(i===0?1:1.005),audioContext!.currentTime,.06));document.dispatchEvent(new CustomEvent('scene:intensity',{detail:hz/110}));});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stopAudio();});
window.addEventListener('pagehide',()=>{if(playing)stopAudio();if(audioContext){void audioContext.close();audioContext=undefined;}});

// Planet controls remain available by keyboard as well as by clicking the scene.
document.querySelectorAll<HTMLButtonElement>('[data-planet]').forEach(button=>button.addEventListener('click',()=>{
  const index=Number(button.dataset.planet);
  document.querySelectorAll<HTMLButtonElement>('[data-planet]').forEach(control=>{const selected=Number(control.dataset.planet)===index;control.setAttribute('aria-pressed',String(selected));control.classList.toggle('is-selected',selected);});
  const planet=planets[index];
  text('planet-type',planet?.type || 'EL CENTRO DE TODO');
  text('planet-name',planet?.name || 'El Sol');
  text('planet-description',planet?.description || 'Una estrella, ocho planetas y un viaje que no se detiene. Selecciona un mundo para acercarte.');
  document.dispatchEvent(new CustomEvent('scene:planet',{detail:index}));
}));
