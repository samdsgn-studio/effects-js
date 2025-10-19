# Effects.js — Guida rapida integrazione Webflow

## 1️⃣ Effetto Scramble (testo glitch)
**Attiva con:**
- `class="glitch"` **oppure**
- `data-effect="scramble"`

> Il testo si “scrambla” al passaggio del mouse.  
> Funziona anche senza ScrambleTextPlugin (fallback incluso).

**Esempio:**
```html
<h3 class="glitch">Testo animato</h3>
```

---

## 2️⃣ Effetto Split + Counter
**Contenitore principale:**  
`class="split"`

**Attributi opzionali sul contenitore:**
- `data-delay="0.3"` → ritardo avvio animazione (sec)

**Attributi per numeri animati:**
- `data-count="1500"` → valore finale
- `data-decimals="1"` → cifre decimali
- `data-duration="1.6"` → durata in secondi
- `data-delay="0.4"` → ritardo solo per quel numero

**Esempio:**
```html
<div class="split">
  <p>+<span data-count="2500" data-duration="1.4"></span> clienti soddisfatti</p>
</div>
```

---

## 3️⃣ Effetto Mask Image (rivelazione)
**Classe:**  
`class="img-reveal"`

> Rivela immagini con clip-path e animazione allo scroll.

**Esempio:**
```html
<div class="img-reveal">
  <img src="immagine.jpg" alt="">
</div>
```

---

## 🔧 Requisiti librerie
- GSAP (già incluso in Webflow)
- ScrollTrigger  
- SplitText *(opzionale)*  
- ScrambleTextPlugin *(opzionale)*

---

© SR Designs — Effects.js
