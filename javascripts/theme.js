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

  var DENSITY_KEY = 'glassfluid:density';

  function storedDensity() {
    try {
      return window.localStorage.getItem(DENSITY_KEY) === 'compact' ? 'compact' : 'comfortable';
    } catch (e) {
      return 'comfortable';
    }
  }

  function apply() {
    root.setAttribute('data-gf-theme', effectiveTheme());
    root.setAttribute('data-gf-density', storedDensity());
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
  var DENSITY_ICONS = {
    comfortable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    compact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 5h16M4 9.5h16M4 14h16M4 18.5h16"/></svg>'
  };
  var LABELS = {
    fr: {toDark: 'Passer en mode sombre', toLight: 'Passer en mode clair', toCompact: 'Affichage compact', toComfortable: 'Affichage confortable'},
    en: {toDark: 'Switch to dark mode', toLight: 'Switch to light mode', toCompact: 'Compact display', toComfortable: 'Comfortable display'}
  };

  function labels() {
    var lang = (root.getAttribute('lang') || 'en').slice(0, 2);
    return LABELS[lang] || LABELS.en;
  }

  var toggles = [];
  var densityToggles = [];

  function updateToggle() {
    var dark = effectiveTheme() === 'dark';
    var label = dark ? labels().toLight : labels().toDark;
    toggles.forEach(function (toggle) {
      toggle.innerHTML = dark ? ICONS.light : ICONS.dark;
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('title', label);
    });
    // The icon shows the density the button switches to.
    var compact = storedDensity() === 'compact';
    var densityLabel = compact ? labels().toComfortable : labels().toCompact;
    densityToggles.forEach(function (toggle) {
      toggle.innerHTML = compact ? DENSITY_ICONS.comfortable : DENSITY_ICONS.compact;
      toggle.setAttribute('aria-label', densityLabel);
      toggle.setAttribute('title', densityLabel);
      toggle.setAttribute('aria-pressed', compact ? 'true' : 'false');
    });
  }

  function onDensityToggle() {
    try {
      window.localStorage.setItem(DENSITY_KEY, storedDensity() === 'compact' ? 'comfortable' : 'compact');
    } catch (e) { /* storage unavailable */ }
    apply();
    updateToggle();
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
      var density = document.createElement('button');
      density.type = 'button';
      density.className = 'gf-theme-toggle gf-density-toggle';
      density.addEventListener('click', onDensityToggle);
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'gf-theme-toggle';
      toggle.addEventListener('click', onToggle);
      container.insertBefore(toggle, container.firstChild);
      container.insertBefore(density, toggle);
      toggles.push(toggle);
      densityToggles.push(density);
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

  // Drop the "Updated by" lead-in so journal headers read "Name · time".
  function trimJournalHeaders(root) {
    root.querySelectorAll('.journal-info a.user').forEach(function (user) {
      var node = user.previousSibling;
      while (node) {
        var previous = node.previousSibling;
        if (node.nodeType === 3) { node.remove(); }
        node = previous;
      }
    });
  }

  function watchJournals() {
    var history = document.getElementById('history');
    if (!history) { return; }
    trimJournalHeaders(history);
    new MutationObserver(function () { trimJournalHeaders(history); })
      .observe(history, {childList: true, subtree: true});
  }

  document.addEventListener('DOMContentLoaded', function () {
    addToggles();
    watchScroll();
    watchJournals();
  });
})();
