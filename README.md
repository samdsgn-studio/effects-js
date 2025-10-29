# effects.js — Effects Reference

Below are the 7 effects supported by `effects.js`, with concise usage notes. Keep classes and attributes exactly as listed. No HTML examples are included.

---

Name:
## 1️⃣ Effect: Scramble

**Description:**
On hover, scrambles characters then reveals the original text; uses GSAP ScrambleTextPlugin if available, otherwise a built‑in fallback.

**Classes:**
- `.glitch` → enables scramble effect
- `[data-effect="scramble"]` → alternate hook to enable scramble

**ATTRIBUTES:**
- *(none — behavior is driven by hover and plugin presence)*

---

Name:
## 2️⃣ Effect: Split + Counter

**Description:**
Splits text into lines (masked slide/fade) and runs number counters to their targets. Supports scroll, load, and once‑on‑scroll modes.

**Classes:**
- `.split` → activates line‑split animation and any internal counters

**Attributes:**
**On `.split` container**
- `load` → play once on page load (ignores scroll)
- `data-load="1"` → play once on first viewport enter, then stay visible
- `data-load="0"` *(or omitted)* → normal mode: play on enter, reset on leave
- `data-delay` / `delay` → start delay (s) applied to lines and counters
- `mask-padding` → padding-bottom applied to the line mask to avoid clipping (e.g., `8px`)

**For counters (on any descendant, or on `.split`)**
- `data-count` → target number (commas/spaces allowed)
- `data-decimals` → fixed decimal places
- `data-duration` → custom duration in seconds (clamped ~1.3–1.8s)
- `data-delay` → extra delay (s) for this counter (adds to container delay)

**For a group wrapper of multiple `.split`**
- `data-split-stagger` → adds progressive stagger to child `.split` (adds to each child’s `data-delay`)

---

Name:
## 3️⃣ Effect: Mask Image Reveal

**Description:**
Reveals elements vertically via `clip-path` with fade and slide; runs on scroll or immediately on load if specified.

**Classes:**
- `.img-reveal` → applies masked vertical reveal animation

**ATTRIBUTES:**
- `data-load` / `load` → trigger on page load instead of scroll
- `data-delay` / `delay` → delay before starting (s)
- `data-repeat` / `repeat` → number of repeats or `infinite`
- `data-repeat-delay` / `repeat-delay` → delay between repeats (s)
- `data-yoyo` / `yoyo` → ping‑pong the animation (works with repeat)

---

Name:
## 4️⃣ Effect: Fade From Top

**Description:**
One‑shot entrance: slides in from top with fade using `gsap.from`; runs on DOM ready/load/Webflow preview events (no scroll trigger).

**Classes:**
- `.fade-from-top` → enables the top‑down fade/slide entrance

**ATTRIBUTES:**
- `data-delay` / `delay` → delay before starting (s)

---

Name:
## 5️⃣ Effect: Animate Line (Underline on Hover)

**Description:**
Adds a hover underline that expands across the text; auto‑wraps content in an inner span to keep underline tight to text.

**Classes:**
- `.animate-line` → enables hover underline animation (auto-wraps inner content with `.animate-line__text`)

**Attributes:**
- *(none required — behavior is CSS‑driven; you may override via CSS vars `--animate-line-speed`, `--animate-line-ease`)*

---

Name:
## 6️⃣ Effect: Fade In

**Description:**
Scroll‑aware entrance with fade + directional slide. Supports overlay mode (opacity only) and blend mode (filter reveal), plus load‑time sequencing.

**Classes:**
- `.fade-in` → enables fade/slide entrance with ScrollTrigger

**ATTRIBUTES:**
**Timing & trigger**
- `data-load` / `load` → trigger on page load (not scroll)
- `data-delay` / `delay` → delay before starting (s)
- `data-stagger` / `stagger` → for load‑triggered groups, per‑item stagger (s)

**Direction** *(choose one; default is top)*
- `data-left` / `left` → slide in from left
- `data-right` / `right` → slide in from right
- `data-bottom` / `bottom` → slide in from bottom

**Modes**
- `data-overlay` *(on self or ancestor/descendant)* → overlay mode: opacity only (no transform), forces higher z-index
- `data-blend` *(on self or a child)* → blend mode: child fades via `filter: brightness()`; wrapper moves; ends with `mix-blend-mode: difference`

---

Name:
## 7️⃣ Effect: Fade In (Sync)

**Description:**
Like **Fade In**, but supports row‑synchronized sequencing across columns inside a grouped wrapper: items with the same row index animate together.

**Classes:**
- `.fade-in-sync` → enables synchronized fade/slide entrance

**ATTRIBUTES:**
**Timing & trigger**
- `data-load` / `load` → trigger on page load (not scroll)
- `data-delay` / `delay` → base delay (s)
- `data-stagger` / `stagger` → for load‑triggered elements, per‑item stagger (s)

**Direction** *(default top)*
- `data-left` / `left`
- `data-right` / `right`
- `data-bottom` / `bottom`

**Modes**
- `data-overlay` → overlay mode (opacity only)
- `data-blend` → blend mode (filter reveal on the blend node)

**Group sync (applied to a wrapper around the items)**
- `[data-sync-seq]` → enables row synchronization across columns
- `data-stagger` / `stagger` *(on the `[data-sync-seq]` wrapper)* → per‑row stagger (s) used for A1/B1, A2/B2 sequencing
- `data-col` / `data-column` *(on each `.fade-in-sync` or an ancestor)* → declares the column membership used to compute row indices

---

© Sam Dsgn — effects.js