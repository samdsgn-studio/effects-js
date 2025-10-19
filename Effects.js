// ======= INIZIO SCRAMBLE =======
document.addEventListener("DOMContentLoaded", function () {
  if (window.gsap && window.ScrambleTextPlugin) {
    gsap.registerPlugin(ScrambleTextPlugin);
  } else {
    console.warn("GSAP/ScrambleTextPlugin non trovati: includi prima gsap.min.js e ScrambleTextPlugin.min.js");
    return;
  }
  const glitchTexts = document.querySelectorAll('.glitch, [data-effect="scramble"]');

  glitchTexts.forEach(el => {
    const originalText = el.textContent;

    el.addEventListener("mouseenter", () => {
      gsap.to(el, {
        duration: 0.6,
        scrambleText: {
          text: originalText,
          chars: "0123456789!@#$%^&*",
          revealDelay: 0.2,
          speed: 0.3
        },
        ease: "none"
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        duration: 0.4,
        scrambleText: {
          text: originalText,
          chars: "0123456789!@#$%^&*",
          speed: 0.4
        },
        ease: "none"
      });
    });
  });
});

// ======= FINE SCRAMBLE =======







// ======= INIZIO SPLIT + COUNTER =======
window.addEventListener("load", () => {
  if (!window.gsap) { console.error("GSAP not loaded"); return; }
  if (window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); } else { console.error("ScrollTrigger not loaded"); return; }
  if (window.SplitText && gsap.registerPlugin) { try { gsap.registerPlugin(SplitText); } catch(_){} }

  ScrollTrigger.config({ ignoreMobileResize: true });

  // helpers
  const MIN_DURATION_MS = 1300;
  const MAX_DURATION_MS = 1800;
  const MS_PER_UNIT     = 8;
  const easeOutCubic    = t => 1 - Math.pow(1 - t, 3);
  const fmt = (v, d) => Number(v).toLocaleString(undefined, {
    minimumFractionDigits: d, maximumFractionDigits: d
  });

  // If .split ROOT has data-count, replace its entire contents with a counter span
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

  // Only descendants are counter targets
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
    const durMs    = Math.max(MIN_DURATION_MS,
                        Math.min(MAX_DURATION_MS,
                          Number.isFinite(custom) ? custom * 1000 : abs * MS_PER_UNIT));

    const state = { v: 0 };
    const tw = gsap.fromTo(
      state,
      { v: 0 },
      {
        v: sign * abs,
        duration: durMs / 1000,
        ease: (t) => easeOutCubic(t),
        onStart: () => { state.v = 0; el.textContent = fmt(0, decimals); },
        onUpdate: () => { el.textContent = fmt(state.v, decimals); },
        onComplete: () => { el.textContent = fmt(sign * abs, decimals); }
      }
    );
    if (delaySec > 0) tw.delay(delaySec);
    return tw;
  }

  const build = (el) => {
    // cleanup
    el._st && el._st.kill();
    el._tl && el._tl.kill();
    el._split && el._split.revert && el._split.revert();

    // If the .split root has data-count, replace its placeholder content with a span
    normalizeCounters(el);

    // block-level start delay (seconds) via delay="" or data-delay=""
    const startDelayAttr = el.getAttribute("delay") ?? el.getAttribute("data-delay");
    const START_DELAY = Number.parseFloat(startDelayAttr);
    const splitStartAt = (Number.isFinite(START_DELAY) && START_DELAY >= 0) ? START_DELAY : 0;

    // Split into lines
    if (window.SplitText) {
      el._split = SplitText.create(el, { type: "lines", mask: "lines" });
      gsap.set(el._split.lines, { y: 80, autoAlpha: 0, willChange: "transform,opacity" });
    }

    // Counters (descendants only)
    const counters = counterNodes(el);
    counters.forEach(prime);

    // Master timeline
    const tl = gsap.timeline({ paused: true });

    // 1) Split animation
    if (el._split) {
      tl.to(el._split.lines, {
        y: 0,
        autoAlpha: 1,
        duration: 1.2,
        stagger: 0.08,
        ease: "power4.out",
        overwrite: "auto"
      }, splitStartAt);
    }

    // 2) Counters alongside the split
    counters.forEach(node => {
      const tw = makeCounterTween(node);
      if (tw) tl.add(tw, splitStartAt);
    });

    el._tl = tl;

    // ScrollTrigger control
    let active = false;
    el._st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      end: "bottom 10%",
      onToggle: self => {
        if (self.isActive && !active) { el._tl.restart(true); active = true; }
        if (!self.isActive && active) { el._tl.pause(0); active = false; }
      }
    });
  };

  const els = gsap.utils.toArray(".split");
  els.forEach(build);

  // Rebuild on meaningful width changes
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
// ======= FINE SPLIT + COUNTER =======