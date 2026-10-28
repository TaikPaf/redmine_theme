(function () {
  'use strict';

  var STORAGE_KEY = 'glassfluid:theme';
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function storedChoice() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeChoice(value) {
    try {
      if (value) {
        window.localStorage.setItem(STORAGE_KEY, value);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) { /* storage unavailable */ }
  }

  function effectiveTheme() {
    var choice = storedChoice();
    if (choice === 'light' || choice === 'dark') { return choice; }
    return media && media.matches ? 'dark' : 'light';
  }

  function apply() {
    root.setAttribute('data-gf-theme', effectiveTheme());
  }

  // Runs in <head> so the page never flashes in the wrong theme.
  apply();
  if (media && media.addEventListener) {
    media.addEventListener('change', function () { if (!storedChoice()) { apply(); updateToggle(); } });
  }

  var ICONS = {
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
  };
  var LABELS = {
    fr: {toDark: 'Passer en mode sombre', toLight: 'Passer en mode clair'},
    en: {toDark: 'Switch to dark mode', toLight: 'Switch to light mode'}
  };

  function labels() {
    var lang = (root.getAttribute('lang') || 'en').slice(0, 2);
    return LABELS[lang] || LABELS.en;
  }

  var toggles = [];

  function updateToggle() {
    var dark = effectiveTheme() === 'dark';
    var label = dark ? labels().toLight : labels().toDark;
    toggles.forEach(function (toggle) {
      toggle.innerHTML = dark ? ICONS.light : ICONS.dark;
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('title', label);
    });
  }

  function onToggle() {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    storeChoice(next === (media && media.matches ? 'dark' : 'light') ? null : next);
    if (storedChoice() === null && next !== effectiveTheme()) { storeChoice(next); }
    apply();
    updateToggle();
  }

  // One toggle in the side navigation when a plugin provides it, one in the top bar for small screens.
  function addToggles() {
    var containers = [
      document.querySelector('.gf-theme-toggle-slot'),
      document.querySelector('nav.top-menu .profile-menu') || document.querySelector('nav.top-menu')
    ];
    containers.forEach(function (container) {
      if (!container) { return; }
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'gf-theme-toggle';
      toggle.addEventListener('click', onToggle);
      container.insertBefore(toggle, container.firstChild);
      toggles.push(toggle);
    });
    updateToggle();
  }

  function watchScroll() {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(function () {
        document.body.classList.toggle('gf-compact', window.scrollY > 24);
        ticking = false;
      });
    }, {passive: true});
  }

  document.addEventListener('DOMContentLoaded', function () {
    addToggles();
    watchScroll();
  });
})();
