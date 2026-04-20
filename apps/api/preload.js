// Patches express app.router getter before any module loads it.
// NestJS platform-express calls app.router in isMiddlewareApplied,
// which throws in Express 4. This makes it return _router instead.
const Module = require('module');
const _load = Module._load;
Module._load = function (id, ...rest) {
  const mod = _load.call(this, id, ...rest);
  if (
    mod &&
    typeof mod === 'function' &&
    mod.application &&
    !mod.__tf_patched
  ) {
    const desc = Object.getOwnPropertyDescriptor(mod.application, 'router');
    if (desc && typeof desc.get === 'function') {
      Object.defineProperty(mod.application, 'router', {
        get() { return this._router; },
        configurable: true,
      });
      mod.__tf_patched = true;
    }
  }
  return mod;
};
