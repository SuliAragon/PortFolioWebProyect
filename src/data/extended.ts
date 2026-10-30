export const extendedBusinesses = [
  { slug:'aguja',name:'Aguja',short:'Estudio de tatuajes',color:'#d74532',scene:'extended',category:'Negocios · Tatuajes',title:'Aguja — Historias a flor de piel.',description:'Estudio de tatuajes de autor: artistas, estilos, flash y preparación de una idea.' },
  { slug:'portal',name:'Portal',short:'Inmobiliaria',color:'#388581',scene:'extended',category:'Negocios · Vivienda',title:'Portal — Encuentra tu siguiente capítulo.',description:'Inmobiliaria de barrio con catálogo filtrable y comparador de viviendas.' },
  { slug:'tierra',name:'Tierra',short:'Taller de cerámica',color:'#ae6346',scene:'extended',category:'Negocios · Cerámica',title:'Tierra — Algo hecho por ti.',description:'Cerámica artesanal, piezas de autor y talleres para volver a crear con las manos.' },
  { slug:'ambar',name:'Ámbar',short:'Autoescuela',color:'#ffb435',scene:'extended',category:'Negocios · Formación',title:'Ámbar — El siguiente paso lo conduces tú.',description:'Autoescuela conceptual con mini test, formación paso a paso y configurador de prácticas.' },
  { slug:'rehabita',name:'Rehabita',short:'Reformas e interiorismo',color:'#766682',scene:'extended',category:'Negocios · Reformas',title:'Rehabita — Tu casa tiene otra vida.',description:'Reformas con proceso claro, comparación de ambientes y estimador de presupuesto.' },
  { slug:'margen',name:'Margen',short:'Librería independiente',color:'#842e3f',scene:'extended',category:'Negocios · Libros',title:'Margen — Siempre cabe otra historia.',description:'Una librería para perderse entre estanterías, encontrar lecturas y compartirlas.' },
  { slug:'nudo',name:'Nudo',short:'Bodas y celebraciones',color:'#c37f69',scene:'extended',category:'Negocios · Eventos',title:'Nudo — Un día muy vuestro.',description:'Organización de bodas con programa, propuesta de celebración y planificador de mesas.' },
  { slug:'veta',name:'Veta',short:'Muebles a medida',color:'#97784e',scene:'extended',category:'Negocios · Mobiliario',title:'Veta — Diseñado para quedarse.',description:'Muebles de líneas serenas, materiales honestos y un aparador configurable a tu medida.' },
] as const;

export const homes = [
  {id:'patio',name:'Un patio para empezar',area:'Centro',price:218000,metres:78,rooms:2,tag:'Patio privado',image:'home',description:'Bajo luminoso con patio interior, cocina abierta y dos dormitorios. Una planta cómoda para vivir sin escaleras.'},
  {id:'luz',name:'La luz de cada mañana',area:'Bahía',price:285000,metres:105,rooms:3,tag:'Terraza',image:'kitchen',description:'Tercera planta con ascensor, salón abierto y una terraza de 12 m². Espacio para una mesa de trabajo y para crecer.'},
  {id:'refugio',name:'Tu pequeño refugio',area:'Centro',price:169000,metres:54,rooms:1,tag:'Reformado',image:'wood',description:'Un dormitorio, distribución aprovechada y una zona de estar tranquila. Una primera casa con pocas complicaciones.'},
  {id:'horizonte',name:'Sitio para todos',area:'Bahía',price:339000,metres:128,rooms:4,tag:'Garaje incluido',image:'home',description:'Cuatro dormitorios, dos baños y garaje. Estancias independientes para compartir casa conservando tu propio espacio.'},
] as const;
export const workshops = [
  {id:'torno',name:'Tu primer torno',date:'Sábado · 14 noviembre',time:'10:00—12:30',price:58,places:6,description:'Centrar, levantar y dar forma. Una introducción guiada al torno; no necesitas experiencia.'},
  {id:'mesa',name:'Una taza, tuya',date:'Domingo · 22 noviembre',time:'11:00—13:00',price:42,places:8,description:'Modelado manual, texturas y un objeto cotidiano con tu propia huella.'},
  {id:'esmalte',name:'Color sobre barro',date:'Sábado · 28 noviembre',time:'10:30—12:30',price:38,places:5,description:'Explora pinceladas y capas sobre una pieza ya cocida. Nosotros nos encargamos de la segunda cocción.'},
] as const;
export const books = [
  {id:'orilla',title:'La otra orilla',author:'Clara del Río',genre:'novela',mood:'calma',length:'larga',price:19.9,color:'#8a4640',note:'Una casa junto al agua, una carta sin abrir y una familia que aprende a escucharse.'},
  {id:'mapas',title:'Mapas para perderse',author:'Mateo Valdés',genre:'ensayo',mood:'curiosidad',length:'corta',price:17.5,color:'#426366',note:'Pequeños ensayos sobre caminar, observar y descubrir historias donde parecía no haber nada.'},
  {id:'lumbre',title:'Lumbre pequeña',author:'Inés Alba',genre:'poesia',mood:'calma',length:'corta',price:14,color:'#c58b40',note:'Poemas sobre lo cotidiano: las manos, la cocina y esa luz que entra a última hora.'},
  {id:'puerta',title:'La puerta azul',author:'Leo Montes',genre:'novela',mood:'aventura',length:'larga',price:21,color:'#36517c',note:'Un viaje que comienza con una llave equivocada y termina cambiando todas las preguntas.'},
  {id:'cosas',title:'Las cosas que miramos',author:'Ada Costa',genre:'ensayo',mood:'curiosidad',length:'larga',price:22,color:'#71694c',note:'Una invitación a pensar cómo los objetos y los lugares moldean nuestra forma de vivir.'},
  {id:'camino',title:'Un camino de vuelta',author:'Nora Sierra',genre:'novela',mood:'aventura',length:'corta',price:16.5,color:'#a8604c',note:'Una estación, dos desconocidos y una decisión que no puede esperar al siguiente tren.'},
] as const;
export const questions = [
  {question:'En una señal circular con borde rojo, el diseño suele comunicar…',answers:['Una prohibición o restricción','Una recomendación turística','Una zona de aparcamiento'],correct:0,explanation:'El borde rojo y la forma circular se utilizan para prohibiciones y restricciones. La señal concreta determina qué limita.'},
  {question:'Antes de iniciar una maniobra, el hábito más seguro es…',answers:['Señalizar y moverse inmediatamente','Observar, señalizar y ejecutar cuando sea seguro','Confiar solo en el sensor del coche'],correct:1,explanation:'Comprobar el entorno y los ángulos muertos, comunicar la intención y confirmar que puedes maniobrar forma parte de una conducción responsable.'},
  {question:'Si el cansancio afecta a tu atención, lo adecuado es…',answers:['Subir la música','Acelerar para llegar antes','Detenerte en un lugar seguro y descansar'],correct:2,explanation:'La fatiga reduce la capacidad de reacción. La pausa y el descanso son la respuesta, no la música ni la velocidad.'},
] as const;
