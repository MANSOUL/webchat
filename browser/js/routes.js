import { map, addClass } from './common.js';

const routes = {
  routes: {},
  willChangeCallbacks: [],
  add(path, handler) {
    this.routes[path] = handler;
  },

  goto(path) {
    window.location.hash = path;
  },

  trigger(hash) {
    this.triggerWillChange();
    map(document.querySelectorAll('.page'), function hiddenAllPage($ele) {
      addClass($ele, 'page--hidden');
    });
    const route = this.routes[hash.slice(1)];
    route && route();
  },

  triggerWillChange() {
    map(this.willChangeCallbacks, function loopChangeCallbacks(cb) {
      cb && cb();
    });
  },

  willChange(fn) {
    if (typeof fn !== 'function') return;
    let index = this.willChangeCallbacks.push(fn) - 1;
    return () => {
      this.willChangeCallbacks[index] = null;
    }
  }
};

window.addEventListener('hashchange', function handleHashChange(e) {
  routes.trigger(window.location.hash);
});

window.document.addEventListener('DOMContentLoaded', function handleDOMContentLoaded() {
  if (!window.location.hash) {
    routes.goto('/');
  }
  else {
    routes.trigger(window.location.hash);
  }
});

export default routes;