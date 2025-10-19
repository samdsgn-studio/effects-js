// ======= INIZIO SCRAMBLE =======
document.addEventListener("DOMContentLoaded", function () {

  // ✅ Registra il plugin se disponibile
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
