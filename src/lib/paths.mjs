/** @param {string} path @param {string} base */
export function withBase(path, base = '/') {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
