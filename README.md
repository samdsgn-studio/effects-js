# effects.js - Documentazione degli Effetti

## 1️⃣ Effetto Scramble  
**Cosa fa:**  
Scramble cambia le lettere di un testo in modo casuale, creando un effetto di "decodifica" o "digitazione".  

**Come si usa:**  
Aggiungi la classe `.scramble` a un elemento di testo.  
Puoi specificare l'attributo `data-text` per il testo finale desiderato.  

```html
<div class="scramble" data-text="Ciao Mondo!">Ciao Mondo!</div>
```

**Extra:**  
- `delay="0.5"` → ritardo prima che inizi l'effetto (in secondi)  
- `load` → parte subito al caricamento della pagina  

---

## 2️⃣ Effetto Split + Counter  
**Cosa fa:**  
Divide il testo in singoli caratteri o parole e li anima uno a uno, spesso usato per contatori o titoli dinamici.  

**Come si usa:**  
Aggiungi la classe `.split-counter` e specifica `data-type="chars"` o `data-type="words"`.  

```html
<div class="split-counter" data-type="chars">12345</div>
<div class="split-counter" data-type="words">Ciao Mondo</div>
```

---

## 3️⃣ Effetto Mask Image  
**Cosa fa:**  
Applica una maschera animata a un'immagine, creando effetti come dissolvenza o rivelazione graduale.  

**Come si usa:**  
Aggiungi la classe `.mask-image` a un elemento immagine.  

```html
<img src="immagine.jpg" class="mask-image" alt="Esempio">
```

---

## 4️⃣ Effetto Dark/Light Mode  
**Cosa fa:**  
Permette di alternare tra modalità scura e chiara con una transizione fluida.  

**Come si usa:**  
Aggiungi la classe `.dark-light-toggle` a un bottone o switch.  

```html
<button class="dark-light-toggle">Toggle Dark/Light</button>
```

---

## 5️⃣ Effetto Fade From Top  
**Cosa fa:**  
Fa comparire gli elementi scorrendo dall'alto verso la loro posizione originale con un effetto di dissolvenza.  

**Come si usa:**  
Aggiungi la classe `.fade-from-top` a un elemento.  

```html
<div class="fade-from-top">Ciao dal alto!</div>
```

---

## 6️⃣ Effetto Fade In  
**Cosa fa:**  
Fa comparire gli elementi piano piano, come se si alzassero o entrassero da un lato. È come un piccolo movimento con trasparenza.  

**Come si usa:**  
Aggiungi la classe `.fade-in` a qualsiasi elemento che vuoi far apparire con effetto dolce.  

```html
<div class="fade-in">Ciao!</div>
```

**Direzioni possibili:**  
Puoi far venire l’elemento da:  
- Sopra → `top`  
- Sotto → `bottom`  
- Sinistra → `left`  
- Destra → `right`  

```html
<div class="fade-in" top>Dal alto</div>
<div class="fade-in" bottom>Dal basso</div>
<div class="fade-in" left>Dalla sinistra</div>
<div class="fade-in" right>Dalla destra</div>
```

**Extra:**  
- `delay="0.3"` → aspetta un po’ prima di partire (in secondi)  
- `load` → parte appena la pagina si apre  

```html
<div class="fade-in" bottom delay="0.5">Con un piccolo ritardo</div>
<div class="fade-in" right load>Parte subito al caricamento</div>
```

**Cosa fa esattamente:**  
- Si sposta di **20%** nella direzione scelta  
- Dura **1.7 secondi**  
- Ha un movimento fluido (`power4.out`)  
- Parte quando l’elemento entra nello schermo (o subito se c’è `load`)  

**Suggerimento:**  
Non serve aggiungere altro: basta `.fade-in` per farlo funzionare!

---

## 7️⃣ Effetto Animate Line  
**Cosa fa:**  
Anima una linea orizzontale o verticale, spesso usata per sottolineare testi o creare separatori dinamici.  

**Come si usa:**  
Aggiungi la classe `.animate-line` a un elemento linea.  

```html
<div class="animate-line"></div>
```

---

© Sam Dsgn - Effects.js
