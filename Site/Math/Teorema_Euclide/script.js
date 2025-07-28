document.addEventListener("DOMContentLoaded", () => {
  // Menu mobile
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("show");
      const bars = menuToggle.querySelectorAll(".bar");
      bars[0].classList.toggle("rotate-45");
      bars[1].classList.toggle("opacity-0");
      bars[2].classList.toggle("rotate-neg-45");
    });
  }

  // Navigazione
  const navLinks = document.querySelectorAll("nav a");
  const sections = document.querySelectorAll("main section");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Rimuove la classe active da tutti i link e le sezioni
      navLinks.forEach((l) => l.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active-section"));

      // Aggiunge la classe active al link cliccato
      this.classList.add("active");

      // Mostra la sezione corrispondente
      const targetId = this.getAttribute("href").substring(1);
      document.getElementById(targetId).classList.add("active-section");

      // Chiude il menu mobile se aperto
      if (navMenu.classList.contains("show")) {
        navMenu.classList.remove("show");
        const bars = menuToggle.querySelectorAll(".bar");
        bars[0].classList.remove("rotate-45");
        bars[1].classList.remove("opacity-0");
        bars[2].classList.remove("rotate-neg-45");
      }

      // Scroll to section con offset per header fisso
      const headerOffset = 180; // Altezza dell'header + nav + un po' di spazio
      const elementPosition = document
        .getElementById(targetId)
        .getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    });
  });

  // Gestione del ridimensionamento dei canvas
  function resizeCanvases() {
    const canvases = document.querySelectorAll("canvas");
    canvases.forEach((canvas) => {
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      const originalWidth = Number.parseInt(canvas.getAttribute("width"));
      const originalHeight = Number.parseInt(canvas.getAttribute("height"));

      if (containerWidth < originalWidth) {
        const scale = containerWidth / originalWidth;
        canvas.style.width = containerWidth + "px";
        canvas.style.height = originalHeight * scale + "px";
      } else {
        canvas.style.width = "";
        canvas.style.height = "";
      }
    });
  }

  // Ridimensiona i canvas al caricamento e al ridimensionamento della finestra
  resizeCanvases();
  window.addEventListener("resize", resizeCanvases);

  // Disegna il triangolo introduttivo
  drawIntroTriangle();

  // Inizializza le demo interattive
  initFirstTheoremDemo();
  initSecondTheoremDemo();

  // Gestione degli esercizi
  setupExercises();
});

// Funzione per disegnare il triangolo introduttivo
function drawIntroTriangle() {
  const canvas = document.getElementById("intro-triangle");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Pulisce il canvas
  ctx.clearRect(0, 0, width, height);

  // Imposta lo stile
  ctx.lineWidth = 2;
  ctx.font = "16px Georgia";

  // Coordinate del triangolo
  const ax = 50;
  const ay = height - 50;
  const bx = width - 50;
  const by = height - 50;
  const cx = 150;
  const cy = 50;

  // Calcola il punto H (piede dell'altezza)
  const hx =
    ax +
    ((bx - ax) * ((cx - ax) * (bx - ax) + (cy - ay) * (by - ay))) /
      (Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
  const hy =
    ay +
    ((by - ay) * ((cx - ax) * (bx - ax) + (cy - ay) * (by - ay))) /
      (Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));

  // Disegna il triangolo
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.strokeStyle = "#0D5EAF";
  ctx.stroke();
  ctx.fillStyle = "rgba(13, 94, 175, 0.1)";
  ctx.fill();

  // Disegna l'angolo retto
  const squareSize = 20;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + squareSize, cy);
  ctx.lineTo(cx + squareSize, cy + squareSize);
  ctx.strokeStyle = "#A45A52";
  ctx.stroke();

  // Disegna l'altezza
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(hx, hy);
  ctx.setLineDash([5, 3]);
  ctx.strokeStyle = "#708238";
  ctx.stroke();
  ctx.setLineDash([]);

  // Disegna le proiezioni
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(hx, hy);
  ctx.strokeStyle = "#D4AF37";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(bx, by);
  ctx.strokeStyle = "#D4AF37";
  ctx.stroke();

  // Etichette
  ctx.fillStyle = "#2C3E50";
  ctx.fillText("A", ax - 15, ay + 5);
  ctx.fillText("B", bx + 10, by + 5);
  ctx.fillText("C", cx - 15, cy - 10);
  ctx.fillText("H", hx + 10, hy + 5);

  // Etichette dei lati
  ctx.fillText("c (ipotenusa)", (ax + bx) / 2, ay + 25);
  ctx.fillText("a", (ax + cx) / 2 - 20, (ay + cy) / 2);
  ctx.fillText("b", (bx + cx) / 2 + 20, (by + cy) / 2);
  ctx.fillText("h", (cx + hx) / 2 + 10, (cy + hy) / 2);
  ctx.fillText("p", (ax + hx) / 2, ay + 25);
  ctx.fillText("q", (hx + bx) / 2, by + 25);
}

// Funzione per inizializzare la demo del primo teorema
function initFirstTheoremDemo() {
  const canvas = document.getElementById("first-theorem-canvas");
  const sliderA = document.getElementById("cateto-a");
  const sliderB = document.getElementById("cateto-b");
  const valuesDisplay = document.getElementById("first-theorem-values");

  if (!canvas || !sliderA || !sliderB || !valuesDisplay) return;

  // Funzione per aggiornare la demo
  function updateDemo() {
    const a = Number.parseInt(sliderA.value);
    const b = Number.parseInt(sliderB.value);

    // Calcola l'ipotenusa usando il teorema di Pitagora
    const c = Math.sqrt(a * a + b * b);

    // Calcola le proiezioni dei cateti sull'ipotenusa
    const p = (a * a) / c;
    const q = (b * b) / c;

    // Aggiorna il display dei valori
    valuesDisplay.innerHTML = `
            <p><strong>Cateto a:</strong> ${a} unità</p>
            <p><strong>Cateto b:</strong> ${b} unità</p>
            <p><strong>Ipotenusa c:</strong> ${c.toFixed(2)} unità</p>
            <p><strong>Proiezione p:</strong> ${p.toFixed(2)} unità</p>
            <p><strong>Proiezione q:</strong> ${q.toFixed(2)} unità</p>
            <p><strong>Verifica primo teorema:</strong></p>
            <p>a² = ${(a * a).toFixed(2)} ≈ c·p = ${(c * p).toFixed(2)}</p>
            <p>b² = ${(b * b).toFixed(2)} ≈ c·q = ${(c * q).toFixed(2)}</p>
        `;

    // Disegna il triangolo
    drawFirstTheoremTriangle(canvas, a, b, c, p, q);
  }

  // Aggiungi event listener agli slider
  sliderA.addEventListener("input", updateDemo);
  sliderB.addEventListener("input", updateDemo);

  // Inizializza la demo
  updateDemo();
}

// Funzione per disegnare il triangolo del primo teorema
function drawFirstTheoremTriangle(canvas, a, b, c, p, q) {
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Fattore di scala per adattare il triangolo al canvas
  const scale = Math.min(width / (c + 100), height / (Math.max(a, b) + 100));

  // Pulisce il canvas
  ctx.clearRect(0, 0, width, height);

  // Imposta lo stile
  ctx.lineWidth = 2;
  ctx.font = "14px Georgia";

  // Coordinate del triangolo
  const ax = width / 2 - (c * scale) / 2;
  const ay = height - 50;
  const bx = width / 2 + (c * scale) / 2;
  const by = height - 50;

  // Calcola le coordinate del punto C
  const angle = Math.atan2(a, p);
  const cx = ax + p * scale * Math.cos(angle);
  const cy = ay - p * scale * Math.sin(angle);

  // Calcola il punto H (piede dell'altezza)
  const hx = ax + p * scale;
  const hy = ay;

  // Disegna l'ipotenusa
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.strokeStyle = "#0D5EAF";
  ctx.stroke();

  // Disegna i cateti
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(cx, cy);
  ctx.strokeStyle = "#A45A52";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(bx, by);
  ctx.strokeStyle = "#A45A52";
  ctx.stroke();

  // Disegna l'altezza
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(hx, hy);
  ctx.setLineDash([5, 3]);
  ctx.strokeStyle = "#708238";
  ctx.stroke();
  ctx.setLineDash([]);

  // Disegna le proiezioni
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(hx, hy);
  ctx.strokeStyle = "#D4AF37";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(bx, by);
  ctx.strokeStyle = "#D4AF37";
  ctx.stroke();

  // Disegna l'angolo retto
  const squareSize = 15;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx - squareSize * Math.cos(angle - Math.PI / 2),
    cy + squareSize * Math.sin(angle - Math.PI / 2),
  );
  ctx.lineTo(
    cx -
      squareSize * Math.cos(angle - Math.PI / 2) +
      squareSize * Math.cos(angle),
    cy +
      squareSize * Math.sin(angle - Math.PI / 2) -
      squareSize * Math.sin(angle),
  );
  ctx.strokeStyle = "#A45A52";
  ctx.stroke();

  // Riempimento del triangolo
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(cx, cy);
  ctx.lineTo(bx, by);
  ctx.closePath();
  ctx.fillStyle = "rgba(13, 94, 175, 0.1)";
  ctx.fill();

  // Etichette
  ctx.fillStyle = "#2C3E50";
  ctx.fillText("A", ax - 15, ay + 5);
  ctx.fillText("B", bx + 10, by + 5);
  ctx.fillText("C", cx - 15, cy - 10);
  ctx.fillText("H", hx, hy + 20);

  // Etichette dei lati
  ctx.fillText(`c = ${c.toFixed(2)}`, (ax + bx) / 2, ay + 25);
  ctx.fillText(`a = ${a}`, (ax + cx) / 2 - 20, (ay + cy) / 2);
  ctx.fillText(`b = ${b}`, (bx + cx) / 2 + 20, (by + cy) / 2);
  ctx.fillText(`p = ${p.toFixed(2)}`, (ax + hx) / 2, ay + 25);
  ctx.fillText(`q = ${q.toFixed(2)}`, (hx + bx) / 2, by + 25);

  // Disegna i rettangoli per illustrare il primo teorema
  // Rettangolo a²
  ctx.beginPath();
  ctx.rect(50, 50, a * scale, a * scale);
  ctx.strokeStyle = "#A45A52";
  ctx.stroke();
  ctx.fillStyle = "rgba(164, 90, 82, 0.2)";
  ctx.fill();
  ctx.fillStyle = "#2C3E50";
  ctx.fillText(
    `a² = ${a * a}`,
    50 + (a * scale) / 2 - 30,
    50 + (a * scale) / 2,
  );

  // Rettangolo c·p
  ctx.beginPath();
  ctx.rect(50, 50 + a * scale + 20, c * scale, p * scale);
  ctx.strokeStyle = "#0D5EAF";
  ctx.stroke();
  ctx.fillStyle = "rgba(13, 94, 175, 0.2)";
  ctx.fill();
  ctx.fillStyle = "#2C3E50";
  ctx.fillText(
    `c·p = ${(c * p).toFixed(2)}`,
    50 + (c * scale) / 2 - 40,
    50 + a * scale + 20 + (p * scale) / 2,
  );

  // Aggiungi frecce per mostrare l'equivalenza
  const arrowX = 50 + a * scale + 20;
  const arrowY1 = 50 + (a * scale) / 2;
  const arrowY2 = 50 + a * scale + 20 + (p * scale) / 2;

  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY1);
  ctx.lineTo(arrowX + 30, arrowY1);
  ctx.lineTo(arrowX + 30, arrowY2);
  ctx.lineTo(arrowX, arrowY2);
  ctx.strokeStyle = "#2C3E50";
  ctx.setLineDash([5, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Aggiungi il simbolo di equivalenza
  ctx.fillText("≡", arrowX + 15, (arrowY1 + arrowY2) / 2);
}

// Funzione per inizializzare la demo del secondo teorema
function initSecondTheoremDemo() {
  const canvas = document.getElementById("second-theorem-canvas");
  const sliderA = document.getElementById("cateto-a2");
  const sliderB = document.getElementById("cateto-b2");
  const valuesDisplay = document.getElementById("second-theorem-values");

  if (!canvas || !sliderA || !sliderB || !valuesDisplay) return;

  // Funzione per aggiornare la demo
  function updateDemo() {
    const a = Number.parseInt(sliderA.value);
    const b = Number.parseInt(sliderB.value);

    // Calcola l'ipotenusa usando il teorema di Pitagora
    const c = Math.sqrt(a * a + b * b);

    // Calcola le proiezioni dei cateti sull'ipotenusa
    const p = (a * a) / c;
    const q = (b * b) / c;

    // Calcola l'altezza
    const h = (a * b) / c;

    // Aggiorna il display dei valori
    valuesDisplay.innerHTML = `
            <p><strong>Cateto a:</strong> ${a} unità</p>
            <p><strong>Cateto b:</strong> ${b} unità</p>
            <p><strong>Ipotenusa c:</strong> ${c.toFixed(2)} unità</p>
            <p><strong>Proiezione p:</strong> ${p.toFixed(2)} unità</p>
            <p><strong>Proiezione q:</strong> ${q.toFixed(2)} unità</p>
            <p><strong>Altezza h:</strong> ${h.toFixed(2)} unità</p>
            <p><strong>Verifica secondo teorema:</strong></p>
            <p>h² = ${(h * h).toFixed(2)} ≈ p·q = ${(p * q).toFixed(2)}</p>
        `;

    // Disegna il triangolo
    drawSecondTheoremTriangle(canvas, a, b, c, p, q, h);
  }

  // Aggiungi event listener agli slider
  sliderA.addEventListener("input", updateDemo);
  sliderB.addEventListener("input", updateDemo);

  // Inizializza la demo
  updateDemo();
}

// Funzione per disegnare il triangolo del secondo teorema
function drawSecondTheoremTriangle(canvas, a, b, c, p, q, h) {
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Fattore di scala per adattare il triangolo al canvas
  const scale = Math.min(width / (c + 100), height / (Math.max(a, b) + 100));

  // Pulisce il canvas
  ctx.clearRect(0, 0, width, height);

  // Imposta lo stile
  ctx.lineWidth = 2;
  ctx.font = "14px Georgia";

  // Coordinate del triangolo
  const ax = width / 2 - (c * scale) / 2;
  const ay = height - 50;
  const bx = width / 2 + (c * scale) / 2;
  const by = height - 50;

  // Calcola le coordinate del punto C
  const angle = Math.atan2(a, p);
  const cx = ax + p * scale * Math.cos(angle);
  const cy = ay - p * scale * Math.sin(angle);

  // Calcola il punto H (piede dell'altezza)
  const hx = ax + p * scale;
  const hy = ay;

  // Disegna l'ipotenusa
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.strokeStyle = "#0D5EAF";
  ctx.stroke();

  // Disegna i cateti
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(cx, cy);
  ctx.strokeStyle = "#A45A52";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(bx, by);
  ctx.strokeStyle = "#A45A52";
  ctx.stroke();

  // Disegna l'altezza
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(hx, hy);
  ctx.setLineDash([5, 3]);
  ctx.strokeStyle = "#708238";
  ctx.stroke();
  ctx.setLineDash([]);

  // Disegna le proiezioni
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(hx, hy);
  ctx.strokeStyle = "#D4AF37";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(bx, by);
  ctx.strokeStyle = "#D4AF37";
  ctx.stroke();

  // Disegna l'angolo retto
  const squareSize = 15;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx - squareSize * Math.cos(angle - Math.PI / 2),
    cy + squareSize * Math.sin(angle - Math.PI / 2),
  );
  ctx.lineTo(
    cx -
      squareSize * Math.cos(angle - Math.PI / 2) +
      squareSize * Math.cos(angle),
    cy +
      squareSize * Math.sin(angle - Math.PI / 2) -
      squareSize * Math.sin(angle),
  );
  ctx.strokeStyle = "#A45A52";
  ctx.stroke();

  // Riempimento del triangolo
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(cx, cy);
  ctx.lineTo(bx, by);
  ctx.closePath();
  ctx.fillStyle = "rgba(13, 94, 175, 0.1)";
  ctx.fill();

  // Etichette
  ctx.fillStyle = "#2C3E50";
  ctx.fillText("A", ax - 15, ay + 5);
  ctx.fillText("B", bx + 10, by + 5);
  ctx.fillText("C", cx - 15, cy - 10);
  ctx.fillText("H", hx, hy + 20);

  // Etichette dei lati
  ctx.fillText(`c = ${c.toFixed(2)}`, (ax + bx) / 2, ay + 25);
  ctx.fillText(`a = ${a}`, (ax + cx) / 2 - 20, (ay + cy) / 2);
  ctx.fillText(`b = ${b}`, (bx + cx) / 2 + 20, (by + cy) / 2);
  ctx.fillText(`h = ${h.toFixed(2)}`, (cx + hx) / 2 + 10, (cy + hy) / 2 - 10);
  ctx.fillText(`p = ${p.toFixed(2)}`, (ax + hx) / 2, ay + 25);
  ctx.fillText(`q = ${q.toFixed(2)}`, (hx + bx) / 2, by + 25);

  // Disegna i rettangoli per illustrare il secondo teorema
  // Quadrato h²
  ctx.beginPath();
  ctx.rect(50, 50, h * scale, h * scale);
  ctx.strokeStyle = "#708238";
  ctx.stroke();
  ctx.fillStyle = "rgba(112, 130, 56, 0.2)";
  ctx.fill();
  ctx.fillStyle = "#2C3E50";
  ctx.fillText(
    `h² = ${(h * h).toFixed(2)}`,
    50 + (h * scale) / 2 - 30,
    50 + (h * scale) / 2,
  );

  // Rettangolo p·q
  ctx.beginPath();
  ctx.rect(50, 50 + h * scale + 20, p * scale, q * scale);
  ctx.strokeStyle = "#0D5EAF";
  ctx.stroke();
  ctx.fillStyle = "rgba(13, 94, 175, 0.2)";
  ctx.fill();
  ctx.fillStyle = "#2C3E50";
  ctx.fillText(
    `p·q = ${(p * q).toFixed(2)}`,
    50 + (p * scale) / 2 - 30,
    50 + h * scale + 20 + (q * scale) / 2,
  );

  // Aggiungi frecce per mostrare l'equivalenza
  const arrowX = 50 + Math.max(h, p) * scale + 20;
  const arrowY1 = 50 + (h * scale) / 2;
  const arrowY2 = 50 + h * scale + 20 + (q * scale) / 2;

  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY1);
  ctx.lineTo(arrowX + 30, arrowY1);
  ctx.lineTo(arrowX + 30, arrowY2);
  ctx.lineTo(arrowX, arrowY2);
  ctx.strokeStyle = "#2C3E50";
  ctx.setLineDash([5, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Aggiungi il simbolo di equivalenza
  ctx.fillText("≡", arrowX + 15, (arrowY1 + arrowY2) / 2);
}

// Funzione per impostare gli esercizi
function setupExercises() {
  // Gestione dei pulsanti "Verifica"
  document.querySelectorAll(".check-answer").forEach((button) => {
    button.addEventListener("click", function () {
      const exerciseId = this.getAttribute("data-exercise");
      const exerciseType = this.getAttribute("data-type");
      const exercise = document.getElementById(`exercise-${exerciseId}`);
      const inputs = exercise.querySelectorAll("input");
      const feedback = exercise.querySelector(".feedback");

      if (exerciseType === "primo") {
        if (exerciseId === "1") {
          // Esercizio 1: a = 12, p = 9, calcola c
          const a = 12;
          const p = 9;
          const userAnswer = Number.parseFloat(inputs[0].value);
          const correctAnswer = (a * a) / p; // c = a²/p

          checkAnswer(userAnswer, correctAnswer, feedback);
        } else if (exerciseId === "2") {
          // Esercizio 2: c = 25, a = 20, calcola p
          const c = 25;
          const a = 20;
          const userAnswer = Number.parseFloat(inputs[0].value);
          const correctAnswer = (a * a) / c; // p = a²/c

          checkAnswer(userAnswer, correctAnswer, feedback);
        }
      } else if (exerciseType === "secondo") {
        // Esercizio 3: p = 4, q = 9, calcola h
        const p = 4;
        const q = 9;
        const userAnswer = Number.parseFloat(inputs[0].value);
        const correctAnswer = Math.sqrt(p * q); // h = √(p·q)

        checkAnswer(userAnswer, correctAnswer, feedback);
      } else if (exerciseType === "entrambi") {
        // Esercizio 4: a = 6, b = 8, calcola h
        const a = 6;
        const b = 8;
        const userAnswer = Number.parseFloat(inputs[0].value);
        const c = Math.sqrt(a * a + b * b); // c = √(a² + b²)
        const correctAnswer = (a * b) / c; // h = (a·b)/c

        checkAnswer(userAnswer, correctAnswer, feedback);
      }
    });
  });

  // Gestione dei pulsanti "Mostra Soluzione"
  document.querySelectorAll(".show-solution").forEach((button) => {
    button.addEventListener("click", function () {
      const exerciseId = this.getAttribute("data-exercise");
      const exerciseType = this.getAttribute("data-type");
      const exercise = document.getElementById(`exercise-${exerciseId}`);
      const solution = exercise.querySelector(".solution");

      if (exerciseType === "primo") {
        if (exerciseId === "1") {
          // Esercizio 1: a = 12, p = 9, calcola c
          const a = 12;
          const p = 9;
          const c = (a * a) / p;

          solution.innerHTML = `
                        <h4>Soluzione:</h4>
                        <p>Dal primo teorema di Euclide sappiamo che a² = c·p</p>
                        <p>Quindi: c = a²/p = ${a}²/${p} = ${a * a}/${p} = ${c.toFixed(2)}</p>
                        <p>L'ipotenusa c misura ${c.toFixed(2)} cm.</p>
                    `;
        } else if (exerciseId === "2") {
          // Esercizio 2: c = 25, a = 20, calcola p
          const c = 25;
          const a = 20;
          const p = (a * a) / c;

          solution.innerHTML = `
                        <h4>Soluzione:</h4>
                        <p>Dal primo teorema di Euclide sappiamo che a² = c·p</p>
                        <p>Quindi: p = a²/c = ${a}²/${c} = ${a * a}/${c} = ${p.toFixed(2)}</p>
                        <p>La proiezione p misura ${p.toFixed(2)} cm.</p>
                    `;
        }
      } else if (exerciseType === "secondo") {
        // Esercizio 3: p = 4, q = 9, calcola h
        const p = 4;
        const q = 9;
        const h = Math.sqrt(p * q);

        solution.innerHTML = `
                    <h4>Soluzione:</h4>
                    <p>Dal secondo teorema di Euclide sappiamo che h² = p·q</p>
                    <p>Quindi: h = √(p·q) = √(${p}·${q}) = √${p * q} = ${h.toFixed(2)}</p>
                    <p>L'altezza h misura ${h.toFixed(2)} cm.</p>
                `;
      } else if (exerciseType === "entrambi") {
        // Esercizio 4: a = 6, b = 8, calcola h
        const a = 6;
        const b = 8;
        const c = Math.sqrt(a * a + b * b);
        const h = (a * b) / c;

        solution.innerHTML = `
                    <h4>Soluzione:</h4>
                    <p>Prima calcoliamo l'ipotenusa c usando il teorema di Pitagora:</p>
                    <p>c = √(a² + b²) = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${a * a + b * b} = ${c.toFixed(2)}</p>
                    <p>Ora possiamo calcolare l'altezza h usando la formula h = (a·b)/c:</p>
                    <p>h = (${a}·${b})/${c.toFixed(2)} = ${a * b}/${c.toFixed(2)} = ${h.toFixed(2)}</p>
                    <p>L'altezza h misura ${h.toFixed(2)} cm.</p>
                `;
      }

      solution.style.display = "block";
    });
  });
}

// Funzione per verificare la risposta
function checkAnswer(userAnswer, correctAnswer, feedbackElement) {
  // Tolleranza per errori di arrotondamento
  const tolerance = 0.1;

  if (!isNaN(userAnswer) && Math.abs(userAnswer - correctAnswer) < tolerance) {
    feedbackElement.textContent = "Corretto! Ottimo lavoro!";
    feedbackElement.className = "feedback correct";
  } else {
    feedbackElement.textContent =
      "Risposta errata. Riprova o consulta la soluzione.";
    feedbackElement.className = "feedback incorrect";
  }
}
