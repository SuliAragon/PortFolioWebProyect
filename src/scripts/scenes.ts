import type { SceneKind } from '../data/projects';

const host = document.querySelector<HTMLElement>('[data-scene]');
if (host) {
  const observer = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    try {
      const { createScene } = await import('./three-world');
      createScene(host, host.dataset.scene as SceneKind);
    } catch (error) {
      console.warn('La escena 3D no está disponible. El contenido sigue accesible.', error);
      host.classList.add('is-fallback');
    }
  }, { rootMargin: '200px' });
  observer.observe(host);
}
