/**
 * Small debounce helper that returns a debounced function and a cancel function.
 * We use it for autosave.
 */
export function debounce(fn, wait = 300) {
  let t = null;
  function debounced(...args) {
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      t = null;
      fn(...args);
    }, wait);
  }
  debounced.cancel = () => {
    if (t) clearTimeout(t);
    t = null;
  };
  return debounced;
}
