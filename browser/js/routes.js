import { map, addClass } from './common.js';

const routes = {
  routes: {},

  add(path, handler) {
    this.routes[path] = handler;
  },

  goto(path) {
    window.location.hash = path;
  },

  trigger(hash) {
    map(document.querySelectorAll('.page'), function hiddenAllPage($ele) {
      addClass($ele, 'page--hidden');
    });
    const route = this.routes[hash.slice(1)];
    route && route();
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