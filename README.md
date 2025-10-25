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
Usa la classe `.split` per animare il testo dividendolo in linee, lettere o parole, con supporto al contatore numerico.

**Classe:**  
- `.split` → applica l’effetto di divisione e animazione del testo.  

**Attributi principali:**  
- `mask-padding` → aggiunge spazio sotto le linee per evitare il taglio di lettere come “g” o “p”.  
  Esempio: mask-padding="0.18em"  
- `data-repeat` → quante volte ripetere l’animazione (`3`, `infinite`, ecc.).  
  Esempio: data-repeat="3"  
- `data-repeat-delay` → pausa tra una ripetizione e la successiva.  
  Esempio: data-repeat-delay="0.5"  
- `data-yoyo` → fa muovere l’animazione avanti e indietro.  
  Esempio: data-yoyo  
- `data-load` → fa partire l’animazione al caricamento della pagina.  
  Esempio: data-load  
- `data-delay` → ritarda l’avvio dell’effetto (in secondi).  
  Esempio: data-delay="0.8"  
- `data-count` → imposta il valore finale del contatore.  
  Esempio: data-count="150"  

**In breve:**  
- Usa `.split` su testi o numeri che vuoi animare.  
- Aggiungi attributi per modificare comportamento, ripetizioni, ritardi o avvio.  
- Se non aggiungi `data-repeat`, l’effetto parte ogni volta che entra nel viewport.

---

## 3️⃣ Effetto Mask Image  
**Descrizione:**  
Applica una maschera animata su un’immagine per effetti visivi dinamici.

**Uso:**  
Includi `img-reveal` e utilizza `applyMask(imageElement, maskElement)`.

**Esempio:**  
```html
<img id="image" src="photo.jpg" />
<div id="mask"></div>
<script src="img-reveal"></script>
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

---

## 6️⃣ Effetto Animate Line
**Descrizione:**  
Aggiunge una linea animata sotto il testo quando viene passato con il cursore. Ideale per link o testi evidenziati.

**Uso:**  
Aggiungi la classe `.animate-line` a un elemento inline o a un link (`<a>`). Lo script applica automaticamente lo stile e l’animazione.

**Personalizzazione:**  
Puoi modificare velocità ed easing tramite variabili CSS:
- `--animate-line-speed`: imposta la durata dell’animazione (default `0.3s`)
- `--animate-line-ease`: imposta la curva di easing (default `cubic-bezier(0.165, 0.84, 0.44, 1)`)

**Esempio:**  
```html
<a href="#" class="animate-line">Hover Me</a>
<script src="animate-line.js"></script>
```

© Sam Dsgn — Effects.js
