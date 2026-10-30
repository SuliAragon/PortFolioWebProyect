# Jesús Aragón · 22 formas de ver la web

Portfolio estático en **Astro + TypeScript**. 22 páginas independientes, accesibles desde un índice lateral permanente. La portada es el currículum de Jesús Aragón Monzón. La colección incluye once experiencias creativas con Three.js y diez webs de negocios realizadas con HTML, CSS y JavaScript, sin escenas 3D ni descargas de Three.js en esas páginas.

| Página | Concepto | Escena |
| --- | --- | --- |
| `/` | Currículum profesional | Escultura de bandas entrelazadas |
| `/pelago/` | Océano y experiencias | Océano procedural mediante shader |
| `/forma/` | Estudio de arquitectura | Maqueta volumétrica con patios |
| `/orbita/` | Observatorio espacial | Sistema solar: ocho planetas, Sol, asteroides y selección interactiva |
| `/pulso/` | Cultura electrónica | Ondas tridimensionales + sintetizador |
| `/bruma/` | Perfumería de autor | Frasco de cristal y tres fragancias |
| `/umbral/` | Galería de arte | Tres esculturas seleccionables |
| `/miga/` | Obrador de masa madre | Mostrador de hogaza, trenzado y barra |
| `/cota/` | Exploración de montaña | Cordillera alpina, nieve, bosque y lago |
| `/nexo/` | Inteligencia y datos | Mesa interactiva de fuentes, red y perspectivas |
| `/terminal/` | Consola interactiva | Núcleo de datos que responde a comandos, temas e historial |
| `/crudo/` | Taller brutalista | Prototipo 3D desmontable con estructura, explosión y tensión |
| `/sobremesa/` | Cafetería | Carta con tres categorías y horarios |
| `/savia/` | Peluquería | Servicios y preparación de cita |
| `/kilometro/` | Estación de servicio | Gráfica de carretera y calculadora de repostaje |
| `/salitre/` | Restaurante | Carta mediterránea y preparación de mesa |
| `/tallo/` | Floristería | Ramos de temporada y selección de recogida |
| `/radial/` | Taller de bicicletas | Revisiones, tarifas y preparación de visita |
| `/casa-calma/` | Hotel boutique | Habitaciones y estimador de estancia por fechas |
| `/compania/` | Clínica veterinaria | Cuidados, preguntas frecuentes y preparación de consulta |
| `/bloque/` | Gimnasio | Horarios filtrables por día y sesión de prueba |
| `/la-huerta/` | Tienda de proximidad | Cesta interactiva con cantidades y total |

## Uso local

Requiere Node.js 24 (se incluye `.nvmrc`).

```sh
npm ci
npm run dev
```

Abrir la dirección local que indique Astro. Para generar y comprobar el sitio:

```sh
npm run check
npm run build
npm test
npm run preview
```

`npm test` comprueba el resultado de la compilación, por lo que debe ejecutarse después de `npm run build`.

## Publicar gratis en GitHub Pages

1. Crear un repositorio público en GitHub y subir los archivos del proyecto a la rama `main`. No subir `node_modules`, `.astro` ni `dist`.
2. En el repositorio, abrir **Settings → Pages → Build and deployment → Source** y seleccionar **GitHub Actions**.
3. Ejecutar **Actions → Publicar portfolio en GitHub Pages → Run workflow**, o subir un cambio a `main`.
4. Al terminar, GitHub mostrará la URL pública en **Settings → Pages**.

El flujo `.github/workflows/deploy.yml` instala las dependencias, comprueba tipos, compila, verifica las 22 páginas y publica la carpeta `dist`. La URL y el prefijo del repositorio se obtienen automáticamente de GitHub Pages; funciona tanto en `usuario.github.io` como en `usuario.github.io/nombre-del-repositorio/`.

Para comprobar localmente un despliegue dentro de una subcarpeta:

```sh
BASE_PATH=/portfolio/ npm run build
BASE_PATH=/portfolio/ npm test
BASE_PATH=/portfolio/ npm run preview
```

Documentación oficial: [Astro en GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).

## Editar el contenido

- `src/components/Curriculum.astro`: currículum, experiencia, competencias y formación.
- `public/cv-jesus-aragon.pdf`: PDF original descargable, con los datos de contacto del documento proporcionado.
- `src/data/projects.ts`: nombres, rutas, metadatos y colores del índice.
- `src/components/Concepts.astro`: las once landings conceptuales.
- `src/components/Businesses.astro`, `src/data/businesses.ts`, `src/styles/businesses.css`: diez negocios, sus contenidos y sus identidades visuales.
- `src/components/BusinessBooking.astro` y `src/scripts/businesses.ts`: formularios locales, filtros, cesta y calculadoras.
- `src/lib/terminal.ts`: intérprete seguro de la consola simulada y autocompletado.
- `src/styles/global.css`: identidad de cada landing y adaptación a pantallas pequeñas.
- `src/scripts/three-world.ts`: escenas compartidas y gestión del ciclo de vida.
- `src/scripts/solar-system.ts` y `src/data/solar.mjs`: sistema solar y controles de exploración.
- `src/scripts/alpine-landscape.ts`: cordillera, vegetación, nieve y lago.
- `src/scripts/interface.ts`: menú móvil, selecciones y audio.

El currículum procede exclusivamente del PDF proporcionado. La web muestra Cádiz como ubicación y el correo como contacto; el PDF descargable conserva también su dirección y teléfono originales. No se han inventado perfiles sociales, cargos, clientes ni enlaces a repositorios.

Las marcas adicionales y su contenido son **conceptos de portfolio**, no negocios ni clientes reales. Los precios, servicios y horarios son ficticios. Los formularios preparan resúmenes en el navegador: no envían datos ni realizan reservas, pedidos o pagos. El sintetizador genera audio local; Nexo utiliza ejemplos predefinidos y no envía información ni llama a una IA. Terminal interpreta únicamente un conjunto cerrado de comandos del portfolio y no accede al equipo. No hay cookies, analítica, servidores ni servicios de pago.

## Accesibilidad y rendimiento

- HTML estático: navegación, textos y PDF funcionan sin JavaScript.
- Fuentes alojadas en el propio sitio, sin llamadas a Google Fonts.
- Las fotografías de negocios se sirven desde `public/images/business/`; no hay dependencia de un servicio de imágenes durante la visita.
- Three.js se descarga de forma diferida al aproximarse la escena al área visible.
- Solo existe un contexto WebGL por página; el renderizado se detiene fuera de pantalla y en pestañas ocultas.
- Controles de pausa, respeto de `prefers-reduced-motion` y alternativa visual cuando WebGL no está disponible.
- Sonido desactivado inicialmente; se detiene al ocultar o abandonar la página.
- Menú accesible por teclado, enlace para saltar al contenido, estado de selección y estilos de impresión del CV.

## Referencia

El [experimento compartido por Mia](https://x.com/MiaAI_lab/status/2094894089481117731) sirvió como referencia de variedad y libertad creativa. No se ha reutilizado su código ni se han copiado sus composiciones.

## Segunda edición visual

El CV, Pulso y Umbral conservan su diseño inicial. Las otras páginas usan estructuras independientes: retiro junto al océano, lámina de arquitectura, observatorio solar, editorial de perfume, escaparate de obrador, cuaderno de expedición, mesa de conexiones, consola interactiva y taller brutalista.

El sistema solar es una visualización artística: los tamaños, las distancias y las velocidades no están a escala. Puedes seleccionar un planeta con los botones o pulsar directamente sobre él, ajustar la velocidad orbital y regresar al sistema completo.

## Fotografía de los negocios

Fotografías de Unsplash, descargadas para servirlas localmente. Identificadores de origen: café `photo-1501339847302-ac426a4a7cbb`, salón `photo-1562322140-8baeececf3df`, restaurante `photo-1414235077428-338989a2e8c0`, flores `photo-1490750967868-88aa4486c946`, bicicleta `photo-1485965120184-e220f721d03e`, hotel `photo-1611892440504-42a792e24d32`, perro `photo-1552053831-71594a27632d`, gimnasio `photo-1534438327276-14e5300c3a48` y mercado `photo-1542838132-92c53300491e`.
