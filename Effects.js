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
      let active = false;
      el._st = ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        end: "bottom 0%",
        onToggle: self => {
          if (self.isActive && !active) { el._tl.restart(true); active = true; }
          if (!self.isActive && active) { el._tl.pause(0); active = false; }
        }
      });
    };

    const els = gsap.utils.toArray(".split");
    els.forEach(build);
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
// ======= FINE SPLIT + COUNTER =======


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
      start: "top 85%",
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

.animate-line {
  display: inline-block !important;
  position: relative;
  overflow-x: hidden;
  color: inherit;
  width: max-content;
  max-width: 100%;
  padding: 0 !important;
  flex: 0 0 auto;
}

@supports not (width: max-content) {
  .animate-line { display: inline !important; }
}

.animate-line::after {
  pointer-events: none;
  background-color: currentColor;
  content: "";
  height: 1.5px;
  position: absolute;
  left: auto;
  top: auto;
  right: 0%;
  bottom: 0%;
  width: 0%;
  transition: width var(--animate-line-speed) var(--animate-line-ease);
}

.animate-line:hover::after {
  width: 100%;
  right: auto;
  left: 0%;
}
    `;
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', initAnimateLine);
  window.addEventListener('load', initAnimateLine);
})();
// ======= FINE ANIMATE LINE =======


// ======= INIZIO FADE IN =======
(function(){
  function parseDistance(el) {
    // 1) attributo esplicito
    const raw = (el.getAttribute('data-distance') || el.getAttribute('distance') || '').trim();
    if (raw) {
      // se termina con unità note, usalo così com'è; se è solo numero, interpreta come percentuale
      const hasUnit = /(%|px|rem|vh|vw)$/i.test(raw);
      const v = parseFloat(raw);
      if (!Number.isNaN(v)) return hasUnit ? raw : `${v}%`;
      return raw; // fallback, nel dubbio usa stringa così com'è
    }
    // 2) default 5% come richiesto
    return '5%';
  }

  function getDirection(el) {
    // booleani: data-bottom/top/left/right (o senza data-)
    if (el.hasAttribute('data-top')   || el.hasAttribute('top'))    return 'top';
    if (el.hasAttribute('data-left')  || el.hasAttribute('left'))   return 'left';
    if (el.hasAttribute('data-right') || el.hasAttribute('right'))  return 'right';
    // default: bottom
    return 'bottom';
  }

  function makeFromVars(el) {
    const dir = getDirection(el);
    const dist = parseDistance(el);
    const isPercent = /%$/.test(dist);
    const n = parseFloat(dist);

    // Se %: usa xPercent/yPercent; se unità assolute: x/y
    if (dir === 'left')  return isPercent ? { xPercent: -Math.abs(n), autoAlpha: 0 } : { x: `-${Math.abs(n)}${isPercent ? '%' : dist.replace(String(n), '') || 'px'}`, autoAlpha: 0 };
    if (dir === 'right') return isPercent ? { xPercent:  Math.abs(n), autoAlpha: 0 } : { x:  `${Math.abs(n)}${isPercent ? '%' : dist.replace(String(n), '') || 'px'}`, autoAlpha: 0 };
    if (dir === 'top')   return isPercent ? { yPercent: -Math.abs(n), autoAlpha: 0 } : { y: `-${Math.abs(n)}${isPercent ? '%' : dist.replace(String(n), '') || 'px'}`, autoAlpha: 0 };
    // bottom (default)
    return isPercent ? { yPercent:  Math.abs(n), autoAlpha: 0 } : { y:  `${Math.abs(n)}${isPercent ? '%' : dist.replace(String(n), '') || 'px'}`, autoAlpha: 0 };
  }

  function initFadeIn(){
    if (!window.gsap) { console.error("GSAP not loaded for fade-in"); return; }
    const hasST = !!window.ScrollTrigger;
    if (hasST && gsap.registerPlugin) {
      try { gsap.registerPlugin(ScrollTrigger); } catch(_) {}
    }

    const nodes = (gsap.utils ? gsap.utils.toArray('.fade-in') : Array.from(document.querySelectorAll('.fade-in')));
    nodes.forEach(el => {
      if (el.dataset.fadeInInit === '1') return;
      el.dataset.fadeInInit = '1';

      // Attributi opzionali
      const delayAttr    = el.getAttribute('data-delay')    ?? el.getAttribute('delay');
      const durAttr      = el.getAttribute('data-duration') ?? el.getAttribute('duration');
      const easeAttr     = el.getAttribute('data-ease')     ?? el.getAttribute('ease');
      const startAttr    = el.getAttribute('data-start')    ?? 'top 15%';
      const onceAttr     = el.getAttribute('data-once'); // default true se mancante

      const delay   = parseFloat(delayAttr) || 0;
      const duration = Number.isFinite(parseFloat(durAttr)) ? parseFloat(durAttr) : 1.6;
      const ease    = (easeAttr && easeAttr.trim()) || 'power4.out';
      const once    = (onceAttr == null) ? true : (String(onceAttr).toLowerCase() !== 'false');

      // Hint prestazioni
      gsap.set(el, { willChange: 'transform,opacity' });

      const fromVars = makeFromVars(el);

      const animate = () => {
        gsap.fromTo(
          el,
          fromVars,
          {
            autoAlpha: 1,
            xPercent: (fromVars.xPercent != null) ? 0 : undefined,
            yPercent: (fromVars.yPercent != null) ? 0 : undefined,
            x:        (fromVars.x != null) ? 0 : undefined,
            y:        (fromVars.y != null) ? 0 : undefined,
            duration,
            ease,
            delay,
            overwrite: 'auto',
            immediateRender: false
          }
        );
      };

      if (hasST) {
        ScrollTrigger.create({
          trigger: el,
          start: startAttr,
          once,
          onEnter: animate,
          toggleActions: once ? 'play none none none' : 'play none none reverse'
        });
      } else {
        // Fallback: anima subito senza ScrollTrigger
        animate();
      }
    });
  }

  // esponi per debug/manual re-run
  window.initFadeIn = initFadeIn;

  // esegui su più eventi per supporto Designer/Preview
  document.addEventListener('DOMContentLoaded', initFadeIn);
  window.addEventListener('load', initFadeIn);
  document.addEventListener('webflow:load', initFadeIn);
})();
// ======= FINE FADE IN =======