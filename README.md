# Effects.js

## 1️⃣ Effetto Scramble  
**Descrizione:**  
Un effetto di animazione testo che mostra lettere casuali che si trasformano gradualmente nel testo finale.

**Uso:**  
Includi `scramble.js` nel tuo progetto e chiama la funzione `scrambleText(element, text)` passando l’elemento DOM e il testo da mostrare.

**Esempio:**  
```html
<div id="scramble"></div>
<script src="scramble.js"></script>
<script>
  const el = document.getElementById('scramble');
  scrambleText(el, 'Hello World!');
</script>
```

---

## 2️⃣ Effetto Split + Counter  
**Descrizione:**  
Divide il testo in singole lettere animate e mostra un contatore incrementale sincronizzato.

**Uso:**  
Includi `split-counter.js` e chiama `splitCounter(element, count)`.

**Esempio:**  
```html
<div id="split-counter">Count: 0</div>
<script src="split-counter.js"></script>
<script>
  const el = document.getElementById('split-counter');
  splitCounter(el, 100);
</script>
```

---

## 3️⃣ Effetto Mask Image  
**Descrizione:**  
Applica una maschera animata su un’immagine per effetti visivi dinamici.

**Uso:**  
Includi `mask-image.js` e utilizza `applyMask(imageElement, maskElement)`.

**Esempio:**  
```html
<img id="image" src="photo.jpg" />
<div id="mask"></div>
<script src="mask-image.js"></script>
<script>
  const img = document.getElementById('image');
  const mask = document.getElementById('mask');
  applyMask(img, mask);
</script>
```

---

## Requisiti librerie  
- [GSAP](https://greensock.com/gsap/) per animazioni fluide.  
- [Lottie](https://airbnb.io/lottie/#/) per animazioni vettoriali.  

---

## 4️⃣ Effetto Dark / Light Mode
**Attiva con:**
- un bottone con `id="theme-toggle"`
- una Lottie con classe `.darklight-lottie`

> Puoi includere lo script `theme-toggle.js` prima di `</body>`.  
> La preferenza del tema viene salvata automaticamente e sincronizzata con l’animazione.

**Esempio:**
```html
<button id="theme-toggle">Toggle Theme</button>
<div class="darklight-lottie"></div>
<script src="theme-toggle.js"></script>
```

---------------------------------------------------------------------------

## 5️⃣ Effetto Fade From Top
**Descrizione:**  
Anima gli elementi con la classe `.fade-from-top` facendoli apparire dall’alto con un effetto di fade-in. L’animazione sfrutta GSAP per transizioni fluide.

**Personalizzazione:**  
Puoi aggiungere un attributo opzionale `delay` o `data-delay` (in secondi) per impostare un ritardo personalizzato sull’animazione di ciascun elemento.

**Requisiti:**  
Richiede GSAP (versione 3.12 o superiore), caricata tramite CDN:
https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js


**Esempio:**  
```html
<div class="fade-from-top" delay="0.4">Testo che appare dall’alto</div>
<div class="fade-from-top" data-delay="1.2">Altro elemento con ritardo</div>
<script src="https://unpkg.com/gsap/dist/gsap.min.js"></script>
<script src="fade-from-top.js"></script>
```

© Sam Dsgn — Effects.js
