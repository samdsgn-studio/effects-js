(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ThemeToggle = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULTS = {
    storageKey: 'theme',
    respectSystem: true,
    darkClass: 'dark',
    toggleSelector: '#theme-toggle',
    lottieSelector: '.darklight-lottie',
    progress: { light: 0, dark: 50 },
    reduceMotion: false,
    lottieMaxTries: 80,
    lottieInterval: 100
  };

  let _opts = null;

  const extend = (a, b) => Object.assign(a, b);

  const getSavedMode = () => {
    let saved = null;
    try { saved = localStorage.getItem(_opts.storageKey); } catch(e) {}
    if (saved === 'light' || saved === 'dark') return saved;
    if (_opts.respectSystem && window.matchMedia) {
      try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch(e) {}
    }
    return 'light';
  };

  const setAriaPressed = (mode) => {
    let nodes = [];
    try { nodes = document.querySelectorAll(_opts.toggleSelector); } catch(e) {}
    nodes.forEach(n => n.setAttribute('aria-pressed', mode === 'dark'));
  };

  const setRootClass = (mode) => {
    const el = document.documentElement;
    if (!el) return;
    el.classList.toggle(_opts.darkClass, mode === 'dark');
  };

  const saveMode = (mode) => {
    try { localStorage.setItem(_opts.storageKey, mode); } catch(e) {}
  };

  // ---------- LOTTIE HELPERS (Webflow) ----------
  const _lottieClassOnly = (sel) => sel.startsWith('.') ? sel.slice(1) : sel;

  const getWebflowLottieInstances = () => {
    let mod = null;
    try { if (typeof Webflow !== 'undefined' && Webflow.require) mod = Webflow.require('lottie'); } catch(e) {}
    if (!mod || !mod.lottie || !mod.lottie.instances) return [];
    const cls = _lottieClassOnly(_opts.lottieSelector);
    return (mod.lottie.instances || []).filter(inst => inst && inst.wrapper && inst.wrapper.classList && inst.wrapper.classList.contains(cls));
  };

  const frameFor = (percent, inst) => Math.round((inst.totalFrames || 0) * (percent / 100));

  const lottieSetProgress = (percent) => {
    const list = getWebflowLottieInstances();
    list.forEach(inst => {
      if (!inst || !inst.totalFrames) return;
      try { inst.goToAndStop(frameFor(percent, inst), true); } catch(e) {}
    });
  };

  const lottiePlay = (fromPercent, toPercent) => {
    const list = getWebflowLottieInstances();
    list.forEach(inst => {
      if (!inst || !inst.totalFrames) return;
      const seg = [frameFor(fromPercent, inst), frameFor(toPercent, inst)];
      try { inst.playSegments(seg, true); }
      catch(e){ try { inst.goToAndStop(seg[1], true); } catch(_) {} }
    });
  };

  const waitAndSyncLottie = (percent) => {
    let tries = 0;
    const iv = setInterval(() => {
      const list = getWebflowLottieInstances();
      if (list.length && list[0].totalFrames) {
        lottieSetProgress(percent);
        clearInterval(iv);
      }
      if (++tries > _opts.lottieMaxTries) clearInterval(iv);
    }, _opts.lottieInterval);
  };

  // -------------- API PUBBLICA --------------
  const api = {
    init(options){
      _opts = extend(extend({}, DEFAULTS), options || {});

      const current = getSavedMode();
      setRootClass(current);
      setAriaPressed(current);

      // Sync Lottie allo stato iniziale
      waitAndSyncLottie(current === 'dark' ? _opts.progress.dark : _opts.progress.light);

      // Bind dei toggle button
      let nodes = [];
      try { nodes = document.querySelectorAll(_opts.toggleSelector); } catch(e) {}
      nodes.forEach(n => n.addEventListener('click', () => api.toggle({ animate: true })));

      // Eventuale reazione al cambio di sistema (se l'utente NON ha scelto manualmente)
      if (_opts.respectSystem && window.matchMedia) {
        try {
          const mq = window.matchMedia('(prefers-color-scheme: dark)');
          if (mq && mq.addEventListener) {
            mq.addEventListener('change', (e) => {
              const saved = localStorage.getItem(_opts.storageKey);
              if (saved === 'light' || saved === 'dark') return; // prevale scelta utente
              api.setMode(e.matches ? 'dark' : 'light', { animate: false });
            });
          }
        } catch(e) {}
      }
    },

    setMode(mode, opts){
      if (mode !== 'light' && mode !== 'dark') return;
      const animate = opts && opts.animate;
      const isDark = document.documentElement.classList.contains(_opts.darkClass);

      if (animate && !_opts.reduceMotion) {
        lottiePlay(isDark ? _opts.progress.dark : _opts.progress.light,
                   mode === 'dark' ? _opts.progress.dark : _opts.progress.light);
      } else {
        lottieSetProgress(mode === 'dark' ? _opts.progress.dark : _opts.progress.light);
      }

      setRootClass(mode);
      setAriaPressed(mode);
      saveMode(mode);

      try { window.dispatchEvent(new CustomEvent('themechange', { detail: { mode } })); } catch(e) {}
    },

    toggle(opts){
      const next = document.documentElement.classList.contains(_opts.darkClass) ? 'light' : 'dark';
      this.setMode(next, Object.assign({ animate: true }, opts || {}));
    },

    resyncLottie(){
      const mode = document.documentElement.classList.contains(_opts.darkClass) ? 'dark' : 'light';
      lottieSetProgress(mode === 'dark' ? _opts.progress.dark : _opts.progress.light);
    }
  };

  return api;
}));