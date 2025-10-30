// ======= INIZIO LOADER LIBRERIE =======
// Le librerie GSAP sono già caricate da Webflow, quindi non serve ricaricarle.
window.__EFFECTS_LIBS_READY__ = Promise.resolve();
// ======= FINE LOADER LIBRERIE =======

// ======= INIZIO SCRAMBLE =======
document.addEventListener("DOMContentLoaded", function () {
  (window.__EFFECTS_LIBS_READY__ || Promise.resolve()).then(function () {
    const CHARS = "0123456789!@#$%^&*";
    function fallbackScramble(el, finalText, durMs = 600, revealDelayMs = 200) {
      let start = null, raf;
      const len = finalText.length;
      const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];
      const tick = (ts) => {
        if (start === null) start = ts;
        const t = ts - start - revealDelayMs;
        const p = Math.max(0, Math.min(1, t / durMs));
        let out = "";
        for (let i = 0; i < len; i++) {
          const thresh = i / Math.max(1, len - 1);
          out += (p >= thresh ? finalText[i] : rand());
        }
        el.textContent = out;
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      el._scrambleCancel && el._scrambleCancel();
      raf = requestAnimationFrame(tick);
      el._scrambleCancel = () => cancelAnimationFrame(raf);
    }

    // registra i plugin se presenti
    if (window.gsap && window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);

    const glitchTexts = document.querySelectorAll('.glitch, [data-effect="scramble"]');
    glitchTexts.forEach(el => {
      const originalText = el.textContent;

      el.addEventListener("mouseenter", () => {
        if (window.ScrambleTextPlugin) {
          gsap.to(el, {
            duration: 0.6,
            scrambleText: {
              text: originalText,
              chars: CHARS,
              revealDelay: 0.2,
              speed: 0.3
            },
            ease: "none"
          });
        } else {
          fallbackScramble(el, originalText, 600, 200);
        }
      });

      el.addEventListener("mouseleave", () => {
        if (window.ScrambleTextPlugin) {
          gsap.to(el, {
            duration: 0.4,
            scrambleText: { text: originalText, chars: CHARS, speed: 0.4 },
            ease: "none"
          });
        } else {
          el._scrambleCancel && el._scrambleCancel();
          el.textContent = originalText;
        }
      });
    });
  });
});
// ======= FINE SCRAMBLE =======







// ======= INIZIO SPLIT + COUNTER =======
window.addEventListener("load", () => {
  (window.__EFFECTS_LIBS_READY__ || Promise.resolve()).then(function () {
    if (!window.gsap) { console.error("GSAP not loaded"); return; }
    if (window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); } else { console.error("ScrollTrigger not loaded"); return; }
    if (window.SplitText && gsap.registerPlugin) { try { gsap.registerPlugin(SplitText); } catch(_){} }

    ScrollTrigger.config({ ignoreMobileResize: true });

    // helpers
    const MIN_DURATION_MS = 1300;
    const MAX_DURATION_MS = 1800;
    const MS_PER_UNIT     = 8;
    const easeOutCubic    = t => 1 - Math.pow(1 - t, 3);
    const fmt = (v, d) => Number(v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

    function normalizeCounters(rootEl) {
      if (!rootEl.hasAttribute("data-count")) return;
      const span = document.createElement("span");
      span.setAttribute("data-count", rootEl.getAttribute("data-count"));
      ["data-duration","data-decimals","data-delay"].forEach(attr => {
        if (rootEl.hasAttribute(attr)) span.setAttribute(attr, rootEl.getAttribute(attr));
      });
      while (rootEl.firstChild) rootEl.removeChild(rootEl.firstChild);
      rootEl.appendChild(span);
      rootEl.removeAttribute("data-count");
      rootEl.removeAttribute("data-duration");
      rootEl.removeAttribute("data-decimals");
      rootEl.removeAttribute("data-delay");
    }

    const counterNodes = (root) => Array.from(root.querySelectorAll("[data-count]"));
    const prime = (el) => {
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10) || 0;
      el.textContent = fmt(0, decimals);
    };

    function makeCounterTween(el) {
      const rawStr  = (el.getAttribute("data-count") || "").replace(/[\s,]/g, "");
      const target  = parseFloat(rawStr);
      if (!Number.isFinite(target)) return null;
      const abs      = Math.abs(target);
      const sign     = target >= 0 ? 1 : -1;
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10) || 0;
      const delaySec = parseFloat(el.getAttribute("data-delay") || "0") || 0;
      const custom   = parseFloat(el.getAttribute("data-duration"));
      const durMs    = Math.max(MIN_DURATION_MS, Math.min(MAX_DURATION_MS, Number.isFinite(custom) ? custom * 1000 : abs * MS_PER_UNIT));
      const state = { v: 0 };
      const tw = gsap.fromTo(state, { v: 0 }, {
        v: sign * abs,
        duration: durMs / 1000,
        ease: (t) => easeOutCubic(t),
        onStart: () => { state.v = 0; el.textContent = fmt(0, decimals); },
        onUpdate: () => { el.textContent = fmt(state.v, decimals); },
        onComplete: () => { el.textContent = fmt(sign * abs, decimals); }
      });
      if (delaySec > 0) tw.delay(delaySec);
      return tw;
    }

    const build = (el) => {
      el._st && el._st.kill();
      el._tl && el._tl.kill();
      el._split && el._split.revert && el._split.revert();
      normalizeCounters(el);
      // Modalità di funzionamento
      const playAtPageLoad = el.hasAttribute('load');              // attributo vuoto: <div class="split" load>
      const dataLoadAttr    = el.getAttribute('data-load');        // "1", "0" o null
      const onceOnScroll    = dataLoadAttr === '1';                // entra una volta, poi resta
      const normalMode      = !onceOnScroll && (dataLoadAttr === null || dataLoadAttr === '0');
      const startDelayAttr = el.getAttribute("delay") ?? el.getAttribute("data-delay");
      const START_DELAY = Number.parseFloat(startDelayAttr);
      const splitStartAt = (Number.isFinite(START_DELAY) && START_DELAY >= 0) ? START_DELAY : 0;
      // Leggi un'eventuale padding della maschera dalle attributi dell'elemento
      const maskPadAttr = el.getAttribute("mask-padding");
      const maskPad = (maskPadAttr && maskPadAttr.trim() !== "") ? maskPadAttr : null;
      if (window.SplitText) {
        el._split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
        if (maskPad) {
          gsap.set(el._split.lines, { y: 80, autoAlpha: 0, willChange: "transform,opacity", paddingBottom: maskPad });
        } else {
          gsap.set(el._split.lines, { y: 80, autoAlpha: 0, willChange: "transform,opacity" });
        }
      }
      const counters = counterNodes(el);
      counters.forEach(prime);
      const tl = gsap.timeline({ paused: true });
      if (el._split) {
        tl.to(el._split.lines, { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.08, ease: "power4.out", overwrite: "auto" }, splitStartAt);
      }
      counters.forEach(node => {
        const tw = makeCounterTween(node);
        if (tw) tl.add(tw, splitStartAt);
      });
      el._tl = tl;
      // Se era già stato riprodotto in questa sessione, porta subito la timeline allo stato finale (evita flicker su rebuild)
      const alreadyPlayed = (onceOnScroll && el.dataset.splitOncePlayed === '1') || (playAtPageLoad && el.dataset.splitLoadPlayed === '1');
      if (alreadyPlayed) {
        el._tl.progress(1);
      }

      // Caso: attributo "load" (vuoto) → avvia al caricamento pagina una sola volta
      if (playAtPageLoad && el.dataset.splitLoadPlayed !== '1') {
        const startDelayAttr = el.getAttribute("delay") ?? el.getAttribute("data-delay");
        const START_DELAY = Number.parseFloat(startDelayAttr);
        if (Number.isFinite(START_DELAY) && START_DELAY > 0) {
          gsap.delayedCall(START_DELAY, () => {
            el._tl.play(0);
            el.dataset.splitLoadPlayed = '1';
          });
        } else {
          el._tl.play(0);
          el.dataset.splitLoadPlayed = '1';
        }
      }
      let active = false;
      el._st = ScrollTrigger.create({
        trigger: el,
        start: "top 98%",
        end: "bottom 0%",
        onToggle: self => {
          // Modalità load (attributo vuoto): lo ScrollTrigger resta inerte
          if (playAtPageLoad) return;

          // Modalità onceOnScroll: riproduci solo al primo ingresso, poi non resettare più
          if (onceOnScroll) {
            if (el.dataset.splitOncePlayed === '1') {
              // già riprodotto: non fare nulla su enter/leave
              return;
            }
            if (self.isActive && !active) {
              el._tl.restart(true);
              active = true;
              el.dataset.splitOncePlayed = '1';
            }
            // non fare nulla su uscita, lascia visibile
            return;
          }

          // Modalità normale
          if (self.isActive && !active) { el._tl.restart(true); active = true; }
          if (!self.isActive && active) { el._tl.pause(0); active = false; }
        }
      });
    };

    const els = gsap.utils.toArray('.split');

    // Apply optional group stagger if wrapper has data-split-stagger
    els.forEach((el, i) => {
      const parentGroup = el.closest('[data-split-stagger]');
      if (parentGroup) {
        const baseDelay = parseFloat(el.getAttribute('data-delay') || '0') || 0;
        const groupStagger = parseFloat(parentGroup.getAttribute('data-split-stagger')) || 0;
        el.setAttribute('data-delay', (baseDelay + i * groupStagger).toFixed(2));
      }
      build(el);
    });
    let t, lastW = window.innerWidth;
    const rebuildAll = () => { els.forEach(build); ScrollTrigger.refresh(); };
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const w = window.innerWidth;
        if (Math.abs(w - lastW) > 30) { lastW = w; rebuildAll(); }
      }, 150);
    };
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", () => { lastW = window.innerWidth; rebuildAll(); }, { passive: true });
    ScrollTrigger.refresh();
  });
});

// ======= INIZIO SPLIT HOVER (versione slide-in-bottom) =======
(function(){
  /**
   * Questo sostituisce il vecchio effetto split-hover basato su SplitText
   * con un effetto puramente CSS: al passaggio del mouse il testo sale e
   * mostra il contenuto di data-hover dal basso.
   *
   * Markup generato automaticamente per ogni nodo con
   *   [data-split-hover] o [data-effect="split-hover"]
   *
   * <span class="slide-in-bottom" tabindex="0">
   *   <span class="slide-in-bottom__inner" data-hover="Testo hover">Testo base</span>
   * </span>
   */
  function injectStyle(){
    // usa lo stesso data-attr del vecchio effetto per evitare doppie iniezioni
    if (document.querySelector('style[data-split-hover-style]')) return;
    const st = document.createElement('style');
    st.setAttribute('data-split-hover-style', 'true');
    st.textContent = `
.slide-in-bottom{position:relative;display:inline-block;white-space:nowrap;overflow:hidden}
.slide-in-bottom__inner{position:relative;display:inline-block;transition:transform .3s;transform:translate3d(0,0,0)}
.slide-in-bottom__inner::before{content:attr(data-hover);position:absolute;left:0;top:100%;transform:translate3d(0,0,0)}
.slide-in-bottom:hover .slide-in-bottom__inner, .slide-in-bottom:focus-visible .slide-in-bottom__inner{transform:translateY(-100%)}
`;
    document.head.appendChild(st);
  }

  function build(el){
    if (el._splitHoverInit === '1') return; // evita doppio init
    el._splitHoverInit = '1';

    // Testo base e testo hover
    const baseText = el.textContent.trim();
    const hoverText = el.getAttribute('data-hover') || el.getAttribute('data-alt') || el.getAttribute('aria-label') || baseText;

    // Evita di ricreare se già strutturato
    if (el.querySelector('.slide-in-bottom')) return;

    // Crea struttura
    const outer = document.createElement('span');
    outer.className = 'slide-in-bottom';
    outer.setAttribute('tabindex', '0');

    const inner = document.createElement('span');
    inner.className = 'slide-in-bottom__inner';
    inner.setAttribute('data-hover', hoverText);

    // Sposta tutti i child esistenti dentro inner per preservare eventuale markup
    while (el.firstChild) inner.appendChild(el.firstChild);

    outer.appendChild(inner);
    el.appendChild(outer);
  }

  function init(){
    injectStyle();
    const nodes = document.querySelectorAll('[data-split-hover], [data-effect="split-hover"]');
    nodes.forEach(build);
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('webflow:load', init);
})();
// ======= FINE SPLIT HOVER =======



// ======= INIZIO EFFETTO MASK IMAGE =======
window.addEventListener("load", () => {
  (window.__EFFECTS_LIBS_READY__ || Promise.resolve()).then(function () {
    if (!window.gsap) { console.error("GSAP not loaded"); return; }
    if (window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); } else { console.error("ScrollTrigger not loaded"); return; }

    // Stato iniziale per-element: se già in viewport al load, lascialo rivelato, altrimenti nascondi
    const imgRevealEls = gsap.utils.toArray('.img-reveal');
    imgRevealEls.forEach((el) => {
      // will-change per prestazioni
      gsap.set(el, { willChange: 'clip-path, opacity, transform' });
      const isLoad = el.hasAttribute('data-load') || el.hasAttribute('load');
      if (isLoad) {
        // per gli elementi che partiranno al load, imposta stato nascosto per animazione pulita
        gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 0, y: 60 });
        return;
      }
      // se è già (anche solo un po') in viewport al load, mostrala per evitare flicker
      if (ScrollTrigger.isInViewport(el, 0.01)) {
        gsap.set(el, { clipPath: 'inset(0% 0% 0% 0%)', autoAlpha: 1, y: 0 });
        el.dataset.imgRevealPrimed = '1';
      } else {
        gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 0, y: 60 });
      }
    });

    // Debounced refresh per gestire layout shift (immagini, font, ecc.)
    let __imgRevealRT__;
    const imgRevealSafeRefresh = () => {
      clearTimeout(__imgRevealRT__);
      __imgRevealRT__ = setTimeout(() => ScrollTrigger.refresh(), 120);
    };

    // Osserva cambi dimensione degli elementi e delle immagini interne
    try {
      if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(() => imgRevealSafeRefresh());
        imgRevealEls.forEach(el => {
          ro.observe(el);
          // osserva anche immagini figlie
          el.querySelectorAll('img, video, picture, source').forEach(node => {
            try { ro.observe(node); } catch(_){}
          });
        });
      }
    } catch(_) {}

    // Rinfresca anche quando le immagini completano il caricamento
    imgRevealEls.forEach(el => {
      el.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', imgRevealSafeRefresh, { once: true });
          img.addEventListener('error', imgRevealSafeRefresh, { once: true });
        }
      });
    });

    // Animazione immediata per gli elementi che richiedono avvio al load
    const loadNodes = gsap.utils.toArray('.img-reveal').filter(el => el.hasAttribute('data-load') || el.hasAttribute('load'));
    loadNodes.forEach((el) => {
      const delayAttr = el.getAttribute('data-delay') || el.getAttribute('delay');
      const delay = parseFloat(delayAttr) || 0;
      const repeatAttr = el.getAttribute('data-repeat') || el.getAttribute('repeat');
      let repeat = 0;
      if (repeatAttr) {
        const v = String(repeatAttr).trim().toLowerCase();
        repeat = (v === 'infinite') ? -1 : (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : 0);
      }
      const repeatDelayAttr = el.getAttribute('data-repeat-delay') || el.getAttribute('repeat-delay');
      const repeatDelay = parseFloat(repeatDelayAttr) || 0;
      const yoyo = el.hasAttribute('data-yoyo') || el.hasAttribute('yoyo');

      gsap.to(el, {
        clipPath: 'inset(0% 0% 0% 0%)',
        autoAlpha: 1,
        y: 0,
        duration: 1.6,
        ease: 'power4.out',
        delay,
        repeat,
        repeatDelay,
        yoyo
      });
      el.dataset.imgRevealDone = '1';
    });

    // Animazione batch
    ScrollTrigger.batch(".img-reveal", {
      start: "top 90%",
      end: "bottom 0%",
      onEnter: (batch) => {
        const nodes = batch.filter(el => el.dataset.imgRevealDone !== '1' && !(el.hasAttribute('data-load') || el.hasAttribute('load')));
        if (!nodes.length) return;
        nodes.forEach((el, i) => {
          if (el.dataset.imgRevealPrimed === '1') return; // già visibile, evita nuova animazione
          const delayAttr = el.getAttribute('data-delay') || el.getAttribute('delay');
          const delay = parseFloat(delayAttr) || (i * 0.25);
          const repeatAttr = el.getAttribute('data-repeat') || el.getAttribute('repeat');
          let repeat = 0;
          if (repeatAttr) {
            const v = String(repeatAttr).trim().toLowerCase();
            repeat = (v === 'infinite') ? -1 : (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : 0);
          }
          const repeatDelayAttr = el.getAttribute('data-repeat-delay') || el.getAttribute('repeat-delay');
          const repeatDelay = parseFloat(repeatDelayAttr) || 0;
          const yoyo = el.hasAttribute('data-yoyo') || el.hasAttribute('yoyo');

          gsap.to(el, {
            clipPath: 'inset(0% 0% 0% 0%)',
            autoAlpha: 1,
            y: 0,
            duration: 1.6,
            ease: 'power4.out',
            delay,
            repeat,
            repeatDelay,
            yoyo,
            immediateRender: false
          });
        });
      },
      onEnterBack: (batch) => {
        const nodes = batch.filter(el => el.dataset.imgRevealDone !== '1' && !(el.hasAttribute('data-load') || el.hasAttribute('load')));
        if (!nodes.length) return;
        nodes.forEach((el, i) => {
          if (el.dataset.imgRevealPrimed === '1') return;
          const delayAttr = el.getAttribute('data-delay') || el.getAttribute('delay');
          const delay = parseFloat(delayAttr) || (i * 0.25);
          const repeatAttr = el.getAttribute('data-repeat') || el.getAttribute('repeat');
          let repeat = 0;
          if (repeatAttr) {
            const v = String(repeatAttr).trim().toLowerCase();
            repeat = (v === 'infinite') ? -1 : (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : 0);
          }
          const repeatDelayAttr = el.getAttribute('data-repeat-delay') || el.getAttribute('repeat-delay');
          const repeatDelay = parseFloat(repeatDelayAttr) || 0;
          const yoyo = el.hasAttribute('data-yoyo') || el.hasAttribute('yoyo');

          gsap.to(el, {
            clipPath: 'inset(0% 0% 0% 0%)',
            autoAlpha: 1,
            y: 0,
            duration: 1.6,
            ease: 'power4.out',
            delay,
            repeat,
            repeatDelay,
            yoyo,
            immediateRender: false
          });
        });
      },
      onLeave: (batch) => {
        const nodes = batch.filter(el => !(el.hasAttribute('data-load') || el.hasAttribute('load')));
        if (!nodes.length) return;
        gsap.set(nodes, { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 0, y: 60 });
      },
      onLeaveBack: (batch) => {
        const nodes = batch.filter(el => !(el.hasAttribute('data-load') || el.hasAttribute('load')));
        if (!nodes.length) return;
        gsap.set(nodes, { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 0, y: 60 });
      }
    });

    ScrollTrigger.refresh();
  });
});
// ======= FINE EFFETTO MASK IMAGE =======



// ======= INIZIO FADE FROM TOP =======
(function(){
  function initFadeFromTop(){
    if (!window.gsap) { console.error("GSAP not loaded for fade-from-top"); return; }
    const nodes = document.querySelectorAll('.fade-from-top');
    nodes.forEach(el => {
      if (el.dataset.fadeTopInit === '1') return; // evita doppi init
      el.dataset.fadeTopInit = '1';

      const delayAttr = el.getAttribute('delay') ?? el.getAttribute('data-delay');
      const delay = parseFloat(delayAttr) || 0;

      // Animazione con GSAP.from per garantire visibilità in Designer e Canvas
      gsap.from(el, {
        yPercent: -100,
        autoAlpha: 0,
        duration: 1.2,
        ease: 'power4.out',
        delay: delay,
        overwrite: 'auto'
      });
    });
  }

  // esponi opzionalmente per debug/manual re-run
  window.initFadeFromTop = initFadeFromTop;

  // esegui su più eventi per supporto Designer/Preview
  document.addEventListener('DOMContentLoaded', initFadeFromTop);
  window.addEventListener('load', initFadeFromTop);
  document.addEventListener('webflow:load', initFadeFromTop);
})();
// ======= FINE FADE FROM TOP =======


// ======= INIZIO ANIMATE LINE =======
// ======= INIZIO ANIMATE LINE =======
(function(){
  function initAnimateLine(){
    if (document.querySelector('style[data-animate-line]')) return; // evita doppio inserimento
    const style = document.createElement('style');
    style.setAttribute('data-animate-line', 'true');
    style.textContent = `
:root {
  --animate-line-speed: 0.3s;
  --animate-line-ease: cubic-bezier(0.165, 0.84, 0.44, 1);
}

/* Container should not force single-line */
.animate-line {
  display: inline !important;
  position: relative;
  color: inherit;
  max-width: 100%;
  flex: 0 0 auto;
}

/* Inner text wrapper */
.animate-line > .animate-line__text,
.animate-line > .animate-line__text.animate-line__text {
  display: inline !important;
  position: relative;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  white-space: normal; /* allow wrapping across multiple rows */
  padding: 0 !important;
  margin: 0 !important;
  float: none !important;
  align-self: auto !important;
  flex: 0 0 auto !important;
}

/* Fallback single-underline (kept for one-line titles) */
.animate-line > .animate-line__text::after {
  pointer-events: none;
  background-color: currentColor;
  content: "";
  height: 1.5px;
  position: absolute;
  left: auto;
  right: 0%;
  bottom: 0%;
  width: 0%;
  transition: width var(--animate-line-speed) var(--animate-line-ease);
}

/* Disable fallback when we split into multiple lines */
.animate-line.animate-line--split > .animate-line__text::after { display: none !important; }

/* Per-line spans generated by SplitText */
.aline-line { /* each visual line */
  display: inline-block; /* size to the line width only */
  position: relative;
  vertical-align: baseline;
  white-space: normal;
}

.aline-line::after {
  content: "";
  pointer-events: none;
  position: absolute;
  left: auto;
  right: 0%;
  bottom: 0;
  height: 1.5px;
  width: 0%;
  background-color: currentColor;
  transition: width var(--animate-line-speed) var(--animate-line-ease);
}

/* Hover expands underline on each line */
.animate-line:hover .aline-line::after {
  width: 100%;
  right: auto;
  left: 0%;
}
`;
    document.head.appendChild(style);
    // Ensure underline applies only to text, not container padding
    document.querySelectorAll('.animate-line').forEach(node => {
      if (!node.querySelector('.animate-line__text')) {
        const span = document.createElement('span');
        span.className = 'animate-line__text';
        while (node.firstChild) {
          span.appendChild(node.firstChild);
        }
        node.appendChild(span);
      }
    });

    // Split per visual lines so multi-row titles animate each line underline
    const splitPerLine = (root) => {
      const textSpan = root.querySelector('.animate-line__text');
      if (!textSpan || root.dataset.alineSplit === '1') return;
      if (!window.SplitText) return; // gracefully skip if plugin missing
      try { if (gsap.registerPlugin) gsap.registerPlugin(SplitText); } catch(_){}
      try {
        const s = SplitText.create(textSpan, { type: 'lines', linesClass: 'aline-line' });
        if (s && s.lines && s.lines.length > 1) {
          root.classList.add('animate-line--split');
        }
        root.dataset.alineSplit = '1';
      } catch(_){}
    };

    document.querySelectorAll('.animate-line').forEach(splitPerLine);

    // Observe future DOM changes to wrap any newly added .animate-line elements
    try {
      const wrapNode = (node) => {
        if (!(node instanceof Element)) return;
        if (node.matches && node.matches('.animate-line')) {
          if (!node.querySelector('.animate-line__text')) {
            const span = document.createElement('span');
            span.className = 'animate-line__text';
            while (node.firstChild) span.appendChild(node.firstChild);
            node.appendChild(span);
          }
          splitPerLine(node);
        }
        node.querySelectorAll && node.querySelectorAll('.animate-line').forEach(el => {
          if (!el.querySelector('.animate-line__text')) {
            const span = document.createElement('span');
            span.className = 'animate-line__text';
            while (el.firstChild) span.appendChild(el.firstChild);
            el.appendChild(span);
          }
          splitPerLine(el);
        });
      };
      const mo = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          m.addedNodes && m.addedNodes.forEach(wrapNode);
          if (m.type === 'attributes' && m.target && m.target.matches && m.target.matches('.animate-line')) {
            wrapNode(m.target);
          }
        });
      });
      mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    } catch(_) {}
  }

  document.addEventListener('DOMContentLoaded', initAnimateLine);
  window.addEventListener('load', initAnimateLine);
})();
// ======= FINE ANIMATE LINE =======


// ======= INIZIO FADE IN =======
(function(){
  function getDir(el){
    if (el.hasAttribute('data-bottom') || el.hasAttribute('bottom')) return 'bottom';
    if (el.hasAttribute('data-left')   || el.hasAttribute('left'))   return 'left';
    if (el.hasAttribute('data-right')  || el.hasAttribute('right'))  return 'right';
    // default: come "fade-from-top"
    return 'top';
  }

  function primeHidden(el){
    const isOverlay = el.hasAttribute('data-overlay') || el.closest('[data-overlay]') || el.querySelector('[data-overlay]');
    const blendNode = el.matches('[data-blend]') ? el : el.querySelector('[data-blend]');
    const isBlend = !!blendNode;

    if (isOverlay) {
      // Overlay: no transform, only opacity; ensure on top immediately
      const overlayNode = el;
      gsap.set(overlayNode, { zIndex: 5 });
      gsap.set(el, { autoAlpha: 0 });
      return;
    }

    // For blend: keep the element visible and prepare the blend child to fade via filter
    if (isBlend) {
      // prime the blend child filter; keep wrapper visible to preserve blending
      gsap.set(blendNode, { filter: 'brightness(0)' });
      // Also prime movement like normal so the wrapper can animate position
      const dir = getDir(el);
      const base = { autoAlpha: 1, willChange: 'transform,opacity,filter' };
      if (dir === 'left')  { gsap.set(el, { ...base, xPercent: -20 }); return; }
      if (dir === 'right') { gsap.set(el, { ...base, xPercent:  20 }); return; }
      if (dir === 'bottom'){ gsap.set(el, { ...base, yPercent:  20 }); return; }
      gsap.set(el, { ...base, yPercent: -20 });
      return;
    }

    // Default prime (no overlay/blend)
    const dir = getDir(el);
    const base = { autoAlpha: 0, willChange: 'transform,opacity' };
    if (dir === 'left')  { gsap.set(el, { ...base, xPercent: -20 }); return; }
    if (dir === 'right') { gsap.set(el, { ...base, xPercent:  20 }); return; }
    if (dir === 'bottom'){ gsap.set(el, { ...base, yPercent:  20 }); return; }
    gsap.set(el, { ...base, yPercent: -20 });
  }

  function primeShown(el){
    const isOverlay = el.hasAttribute('data-overlay') || el.closest('[data-overlay]') || el.querySelector('[data-overlay]');
    const blendNode = el.matches('[data-blend]') ? el : el.querySelector('[data-blend]');
    const isBlend = !!blendNode;

    if (isOverlay) {
      const overlayNode = el;
      gsap.set(overlayNode, { zIndex: 5 });
      gsap.set(el, { autoAlpha: 1 });
      return;
    }

    if (isBlend) {
      // If already in viewport, show fully and reset filter
      gsap.set(blendNode, { filter: 'none' });
      gsap.set(el, { autoAlpha: 1, xPercent: 0, yPercent: 0, willChange: 'transform,opacity,filter' });
      gsap.set(blendNode, { mixBlendMode: 'difference' });
      return;
    }

    gsap.set(el, { autoAlpha: 1, xPercent: 0, yPercent: 0, willChange: 'transform,opacity' });
  }

  function animateToVisible(el, extraDelay = 0){
    const isOverlay = el.hasAttribute('data-overlay') || el.closest('[data-overlay]') || el.querySelector('[data-overlay]');
    const blendNode = el.matches('[data-blend]') ? el : el.querySelector('[data-blend]');
    const isBlend = !!blendNode;

    const delayAttr = el.getAttribute('data-delay') || el.getAttribute('delay');
    const delay = (parseFloat(delayAttr) || 0) + (extraDelay || 0);

    if (isOverlay) {
      // Overlay: fade only opacity on the element itself, no transform
      gsap.to(el, {
        autoAlpha: 1,
        duration: 1.7,
        ease: 'power4.out',
        delay,
        overwrite: 'auto',
        immediateRender: false
      });
      return;
    }

    if (isBlend) {
      // Blend: animate the blend child via filter while running normal movement on the wrapper
      gsap.fromTo(blendNode, { filter: 'brightness(0)' }, {
        filter: 'brightness(1)',
        duration: 1.7,
        ease: 'power4.out',
        delay,
        overwrite: 'auto',
        immediateRender: false,
        onComplete: () => {
          gsap.set(blendNode, { filter: 'none' });
          gsap.set(blendNode, { mixBlendMode: 'difference' });
        }
      });
      // proceed with movement on the element (no opacity fade needed, keep autoAlpha:1)
      const dir = getDir(el);
      gsap.to(el, {
        autoAlpha: 1,
        xPercent: 0,
        yPercent: 0,
        duration: 1.7,
        ease: 'power4.out',
        delay,
        overwrite: 'auto',
        immediateRender: false
      });
      return;
    }

    // Default behavior
    const dir = getDir(el);
    gsap.to(el, {
      autoAlpha: 1,
      xPercent: 0,
      yPercent: 0,
      duration: 1.7,
      ease: 'power4.out',
      delay,
      overwrite: 'auto',
      immediateRender: false
    });
  }

  window.addEventListener("load", () => {
    (window.__EFFECTS_LIBS_READY__ || Promise.resolve()).then(function () {
      if (!window.gsap) { console.error("GSAP not loaded for fade-in"); return; }
      if (!window.ScrollTrigger) { console.error("ScrollTrigger not loaded for fade-in"); return; }
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.config({ ignoreMobileResize: true });

      // Stato iniziale per-element: se già in viewport al load, lascialo rivelato, altrimenti nascondi
      const fadeEls = gsap.utils.toArray('.fade-in');
      fadeEls.forEach((el) => {
        // se ha attributo load, verrà animato subito dopo il priming: in ogni caso prime come nascosto
        const isLoad = el.hasAttribute('data-load') || el.hasAttribute('load');
        if (isLoad) {
          primeHidden(el);
          return;
        }

        if (ScrollTrigger.isInViewport(el, 0.01)) {
          // già (anche solo un po') in viewport: mostrato per evitare flicker
          primeShown(el);
          el.dataset.fadeInPrimed = '1';
        } else {
          primeHidden(el);
        }
      });

      // Animazione immediata per gli elementi che richiedono avvio al load
      const loadNodes = fadeEls.filter(el => el.hasAttribute('data-load') || el.hasAttribute('load'));
      loadNodes.forEach((el, i) => {
        // Stagger configurabile per gli elementi che partono al load
        const staggerAttr = el.getAttribute('data-stagger') || el.getAttribute('stagger');
        const stagger = Number.isFinite(parseFloat(staggerAttr)) ? parseFloat(staggerAttr) : 0.25; // default 0.25s
        animateToVisible(el, i * stagger);
        el.dataset.fadeInDone = '1';
      });

      // Animazione batch con stesso trigger pattern di img-reveal
      ScrollTrigger.batch(".fade-in", {
        start: "top 95%",
        end: "bottom top",
        onEnter: (batch) => {
          const nodes = batch.filter(el => el.dataset.fadeInDone !== '1' && !(el.hasAttribute('data-load') || el.hasAttribute('load')));
          if (!nodes.length) return;
          nodes.forEach((el, i) => {
            if (el.dataset.fadeInPrimed === '1') return; // già visibile, evita nuova animazione
            const perItemDelay = i * 0.25;
            animateToVisible(el, perItemDelay);
          });
        },
        onEnterBack: (batch) => {
          const nodes = batch.filter(el => el.dataset.fadeInDone !== '1' && !(el.hasAttribute('data-load') || el.hasAttribute('load')));
          if (!nodes.length) return;
          nodes.forEach((el, i) => {
            if (el.dataset.fadeInPrimed === '1') return;
            const perItemDelay = i * 0.25;
            animateToVisible(el, perItemDelay);
          });
        },
        onLeave: (batch) => {
          const nodes = batch.filter(el => !(el.hasAttribute('data-load') || el.hasAttribute('load')));
          if (!nodes.length) return;
          nodes.forEach(primeHidden);
        },
        onLeaveBack: (batch) => {
          const nodes = batch.filter(el => !(el.hasAttribute('data-load') || el.hasAttribute('load')));
          if (!nodes.length) return;
          nodes.forEach(primeHidden);
        }
      });

      ScrollTrigger.refresh();
    });
  });
})();
// ======= FINE FADE IN =======

// ======= INIZIO FADE IN (SYNC) =======
(function(){
  function getDir(el){
    if (el.hasAttribute('data-bottom') || el.hasAttribute('bottom')) return 'bottom';
    if (el.hasAttribute('data-left')   || el.hasAttribute('left'))   return 'left';
    if (el.hasAttribute('data-right')  || el.hasAttribute('right'))  return 'right';
    return 'top';
  }

  function primeHidden(el){
    const isOverlay = el.hasAttribute('data-overlay') || el.closest('[data-overlay]') || el.querySelector('[data-overlay]');
    const blendNode = el.matches('[data-blend]') ? el : el.querySelector('[data-blend]');
    const isBlend = !!blendNode;

    if (isOverlay) {
      const overlayNode = el;
      gsap.set(overlayNode, { zIndex: 5 });
      gsap.set(el, { autoAlpha: 0 });
      return;
    }

    if (isBlend) {
      gsap.set(blendNode, { filter: 'brightness(0)' });
      const dir = getDir(el);
      const base = { autoAlpha: 1, willChange: 'transform,opacity,filter' };
      if (dir === 'left')  { gsap.set(el, { ...base, xPercent: -20 }); return; }
      if (dir === 'right') { gsap.set(el, { ...base, xPercent:  20 }); return; }
      if (dir === 'bottom'){ gsap.set(el, { ...base, yPercent:  20 }); return; }
      gsap.set(el, { ...base, yPercent: -20 });
      return;
    }

    const dir = getDir(el);
    const base = { autoAlpha: 0, willChange: 'transform,opacity' };
    if (dir === 'left')  { gsap.set(el, { ...base, xPercent: -20 }); return; }
    if (dir === 'right') { gsap.set(el, { ...base, xPercent:  20 }); return; }
    if (dir === 'bottom'){ gsap.set(el, { ...base, yPercent:  20 }); return; }
    gsap.set(el, { ...base, yPercent: -20 });
  }

  function primeShown(el){
    const isOverlay = el.hasAttribute('data-overlay') || el.closest('[data-overlay]') || el.querySelector('[data-overlay]');
    const blendNode = el.matches('[data-blend]') ? el : el.querySelector('[data-blend]');
    const isBlend = !!blendNode;

    if (isOverlay) {
      const overlayNode = el;
      gsap.set(overlayNode, { zIndex: 5 });
      gsap.set(el, { autoAlpha: 1 });
      return;
    }

    if (isBlend) {
      gsap.set(blendNode, { filter: 'none' });
      gsap.set(el, { autoAlpha: 1, xPercent: 0, yPercent: 0, willChange: 'transform,opacity,filter' });
      gsap.set(blendNode, { mixBlendMode: 'difference' });
      return;
    }

    gsap.set(el, { autoAlpha: 1, xPercent: 0, yPercent: 0, willChange: 'transform,opacity' });
  }

  function animateToVisible(el, extraDelay = 0){
    const isOverlay = el.hasAttribute('data-overlay') || el.closest('[data-overlay]') || el.querySelector('[data-overlay]');
    const blendNode = el.matches('[data-blend]') ? el : el.querySelector('[data-blend]');
    const isBlend = !!blendNode;

    const delayAttr = el.getAttribute('data-delay') || el.getAttribute('delay');
    const delay = (parseFloat(delayAttr) || 0) + (extraDelay || 0);

    if (isOverlay) {
      gsap.to(el, {
        autoAlpha: 1,
        duration: 1.7,
        ease: 'power4.out',
        delay,
        overwrite: 'auto',
        immediateRender: false
      });
      return;
    }

    if (isBlend) {
      gsap.fromTo(blendNode, { filter: 'brightness(0)' }, {
        filter: 'brightness(1)',
        duration: 1.7,
        ease: 'power4.out',
        delay,
        overwrite: 'auto',
        immediateRender: false,
        onComplete: () => {
          gsap.set(blendNode, { filter: 'none' });
          gsap.set(blendNode, { mixBlendMode: 'difference' });
        }
      });
      gsap.to(el, {
        autoAlpha: 1,
        xPercent: 0,
        yPercent: 0,
        duration: 1.7,
        ease: 'power4.out',
        delay,
        overwrite: 'auto',
        immediateRender: false
      });
      return;
    }

    gsap.to(el, {
      autoAlpha: 1,
      xPercent: 0,
      yPercent: 0,
      duration: 1.7,
      ease: 'power4.out',
      delay,
      overwrite: 'auto',
      immediateRender: false
    });
  }

  // Helpers per la sincronizzazione a righe (A1+B1, A2+B2, ...)
  function getSyncedRowIndex(el){
    const group = el.closest('[data-sync-seq]');
    if (!group) return null;
    const ownCol = el.getAttribute('data-col') || el.getAttribute('data-column');
    const parentWithCol = ownCol ? null : el.closest('[data-col], [data-column]');
    const col = ownCol || (parentWithCol ? (parentWithCol.getAttribute('data-col') || parentWithCol.getAttribute('data-column')) : null);
    if (!col) return null;
    const colNodes = Array.from(group.querySelectorAll('.fade-in-sync'))
      .filter(n => {
        const nOwnCol = n.getAttribute('data-col') || n.getAttribute('data-column');
        const nParentWithCol = nOwnCol ? null : n.closest('[data-col], [data-column]');
        const nCol = nOwnCol || (nParentWithCol ? (nParentWithCol.getAttribute('data-col') || nParentWithCol.getAttribute('data-column')) : null);
        return nCol === col && !(n.hasAttribute('data-load') || n.hasAttribute('load'));
      });
    const idx = colNodes.indexOf(el);
    return (idx >= 0) ? idx : null;
  }

  function getGroupStagger(el){
    const group = el.closest('[data-sync-seq]');
    if (!group) return 0.25;
    const attr = group.getAttribute('data-stagger') || group.getAttribute('stagger');
    const v = parseFloat(attr);
    return Number.isFinite(v) ? v : 0.25;
  }

  window.addEventListener("load", () => {
    (window.__EFFECTS_LIBS_READY__ || Promise.resolve()).then(function () {
      if (!window.gsap) { console.error("GSAP not loaded for fade-in-sync"); return; }
      if (!window.ScrollTrigger) { console.error("ScrollTrigger not loaded for fade-in-sync"); return; }
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.config({ ignoreMobileResize: true });

      const fadeEls = gsap.utils.toArray('.fade-in-sync');
      fadeEls.forEach((el) => {
        const isLoad = el.hasAttribute('data-load') || el.hasAttribute('load');
        if (isLoad) { primeHidden(el); return; }
        if (ScrollTrigger.isInViewport(el, 0.01)) {
          primeShown(el);
          el.dataset.fadeInPrimed = '1';
        } else {
          primeHidden(el);
        }
      });

      // Load immediato (senza sincronizzazione per righe)
      const loadNodes = fadeEls.filter(el => el.hasAttribute('data-load') || el.hasAttribute('load'));
      loadNodes.forEach((el, i) => {
        // Stagger configurabile per gli elementi che partono al load
        const staggerAttr = el.getAttribute('data-stagger') || el.getAttribute('stagger');
        const stagger = Number.isFinite(parseFloat(staggerAttr)) ? parseFloat(staggerAttr) : 0.25; // default 0.25s
        animateToVisible(el, i * stagger);
        el.dataset.fadeInDone = '1';
      });

      // Batch con sincronizzazione per righe quando presente data-sync-seq
      ScrollTrigger.batch(".fade-in-sync", {
        start: "top 95%",
        end: "bottom top",
        onEnter: (batch) => {
          const nodes = batch.filter(el => el.dataset.fadeInDone !== '1' && !(el.hasAttribute('data-load') || el.hasAttribute('load')));
          if (!nodes.length) return;
          nodes.forEach((el, i) => {
            if (el.dataset.fadeInPrimed === '1') return;
            const rowIndex = getSyncedRowIndex(el);
            const perItemDelay = (rowIndex !== null) ? rowIndex * getGroupStagger(el) : (i * 0.25);
            animateToVisible(el, perItemDelay);
          });
        },
        onEnterBack: (batch) => {
          const nodes = batch.filter(el => el.dataset.fadeInDone !== '1' && !(el.hasAttribute('data-load') || el.hasAttribute('load')));
          if (!nodes.length) return;
          nodes.forEach((el, i) => {
            if (el.dataset.fadeInPrimed === '1') return;
            const rowIndex = getSyncedRowIndex(el);
            const perItemDelay = (rowIndex !== null) ? rowIndex * getGroupStagger(el) : (i * 0.25);
            animateToVisible(el, perItemDelay);
          });
        },
        onLeave: (batch) => {
          const nodes = batch.filter(el => !(el.hasAttribute('data-load') || el.hasAttribute('load')));
          if (!nodes.length) return;
          nodes.forEach(primeHidden);
        },
        onLeaveBack: (batch) => {
          const nodes = batch.filter(el => !(el.hasAttribute('data-load') || el.hasAttribute('load')));
          if (!nodes.length) return;
          nodes.forEach(primeHidden);
        }
      });

      ScrollTrigger.refresh();
    });
  });
})();
// ======= FINE FADE IN (SYNC) =======