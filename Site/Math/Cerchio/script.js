document.addEventListener("DOMContentLoaded", function () {
  // Menu mobile toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const navItems = document.querySelectorAll(".nav-item");
  const currentSection = document.getElementById("current-section");
  const sections = document.querySelectorAll(".section");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      menuToggle.classList.toggle("open");
      navLinks.classList.toggle("active");
    });
  }

  // Chiudi il menu quando si clicca su un link
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      menuToggle.classList.remove("open");
      navLinks.classList.remove("active");
    });
  });

  // Smooth scrolling per i link di navigazione
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });

  // Evidenzia la sezione attuale durante lo scroll
  function highlightCurrentSection() {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;

      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {
        current = section.getAttribute("id");
      }
    });

    // Se siamo nella parte superiore della pagina (hero section)
    if (window.scrollY < sections[0].offsetTop - 100) {
      current = "hero";
    }

    // Aggiorna l'indicatore della sezione corrente
    if (current) {
      currentSection.textContent = `Sezione attuale: ${current.charAt(0).toUpperCase() + current.slice(1)}`;

      // Rimuovi la classe active da tutti i link
      navItems.forEach((item) => {
        item.classList.remove("active");
      });

      // Aggiungi la classe active al link corrispondente
      const activeLink = document.querySelector(
        `.nav-item[href="#${current}"]`,
      );
      if (activeLink) {
        activeLink.classList.add("active");
      }
    }
  }

  window.addEventListener("scroll", highlightCurrentSection);
  highlightCurrentSection(); // Esegui all'avvio

  // Animazione per la linea del raggio nella demo del cerchio
  const radiusLine = document.querySelector(".radius-line");
  if (radiusLine) {
    let angle = 0;
    setInterval(() => {
      angle = (angle + 1) % 360;
      radiusLine.style.transform = `rotate(${angle}deg)`;
    }, 50);
  }

  // Canvas interattivo per la demo del cerchio
  const canvas = document.getElementById("circle-canvas");
  if (canvas) {
    // Imposta le dimensioni del canvas per la risoluzione corretta
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    let radius = 50;
    let showDiameter = false;
    let showCircumference = false;
    let showChord = false;
    let showSector = false;
    let sectorAngle = Math.PI / 3; // 60 gradi in radianti

    // Slider per il raggio
    const radiusSlider = document.getElementById("radius-slider");
    const radiusValue = document.getElementById("radius-value");

    // Bottoni per mostrare/nascondere elementi
    const showDiameterBtn = document.getElementById("show-diameter");
    const showCircumferenceBtn = document.getElementById("show-circumference");
    const showChordBtn = document.getElementById("show-chord");
    const showSectorBtn = document.getElementById("show-sector");

    // Elementi per le misurazioni
    const radiusMeasurement = document.getElementById("radius-measurement");
    const diameterMeasurement = document.getElementById("diameter-measurement");
    const circumferenceMeasurement = document.getElementById(
      "circumference-measurement",
    );
    const areaMeasurement = document.getElementById("area-measurement");
    const chordMeasurement = document.getElementById("chord-measurement");
    const sectorMeasurement = document.getElementById("sector-measurement");

    // Funzione per disegnare il cerchio
    function drawCircle() {
      // Pulisci il canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Disegna una griglia leggera per riferimento
      drawGrid();

      // Disegna il cerchio
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#4361ee";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Disegna il centro
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#f72585";
      ctx.fill();

      // Disegna il raggio
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.strokeStyle = "#f72585";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Etichetta del raggio
      ctx.fillStyle = "#2b2d42";
      ctx.font = "14px Poppins";
      ctx.fillText("r", centerX + radius / 2, centerY - 10);

      // Disegna il diametro se richiesto
      if (showDiameter) {
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.strokeStyle = "#7209b7";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Etichetta del diametro
        ctx.fillStyle = "#2b2d42";
        ctx.font = "14px Poppins";
        ctx.fillText("d", centerX, centerY - 20);
      }

      // Disegna la circonferenza se richiesto
      if (showCircumference) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "#4895ef";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);

        // Etichetta della circonferenza
        ctx.fillStyle = "#2b2d42";
        ctx.font = "14px Poppins";
        ctx.fillText("C", centerX + radius + 15, centerY);
      }

      // Disegna la corda se richiesto
      if (showChord) {
        const angle = Math.PI / 4; // 45 gradi
        const x1 = centerX + radius * Math.cos(angle);
        const y1 = centerY + radius * Math.sin(angle);
        const x2 = centerX + radius * Math.cos(angle + Math.PI / 2);
        const y2 = centerY + radius * Math.sin(angle + Math.PI / 2);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "#ff8fab";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Punti finali della corda
        ctx.beginPath();
        ctx.arc(x1, y1, 3, 0, Math.PI * 2);
        ctx.arc(x2, y2, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ff8fab";
        ctx.fill();

        // Etichetta della corda
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.fillStyle = "#2b2d42";
        ctx.font = "14px Poppins";
        ctx.fillText("corda", midX, midY - 10);

        // Calcola la lunghezza della corda
        const chordLength = Math.sqrt(
          Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2),
        );
        chordMeasurement.textContent = `Corda: ${chordLength.toFixed(2)} px`;
        chordMeasurement.classList.remove("hidden");
      } else {
        chordMeasurement.classList.add("hidden");
      }

      // Disegna il settore se richiesto
      if (showSector) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, 0, sectorAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = "rgba(67, 97, 238, 0.2)";
        ctx.fill();
        ctx.strokeStyle = "#4361ee";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Linee del settore
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + radius * Math.cos(0),
          centerY + radius * Math.sin(0),
        );
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + radius * Math.cos(sectorAngle),
          centerY + radius * Math.sin(sectorAngle),
        );
        ctx.strokeStyle = "#4361ee";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Etichetta del settore
        const midAngle = sectorAngle / 2;
        const labelX = centerX + (radius / 2) * Math.cos(midAngle);
        const labelY = centerY + (radius / 2) * Math.sin(midAngle);
        ctx.fillStyle = "#2b2d42";
        ctx.font = "14px Poppins";
        ctx.fillText("settore", labelX, labelY);

        // Calcola l'area del settore
        const sectorArea = 0.5 * radius * radius * sectorAngle;
        sectorMeasurement.textContent = `Area Settore: ${sectorArea.toFixed(2)} px²`;
        sectorMeasurement.classList.remove("hidden");
      } else {
        sectorMeasurement.classList.add("hidden");
      }

      // Aggiorna le misurazioni
      updateMeasurements();
    }

    // Funzione per disegnare una griglia leggera
    function drawGrid() {
      const gridSize = 20;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
      ctx.lineWidth = 1;

      // Linee verticali
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Linee orizzontali
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Funzione per aggiornare le misurazioni
    function updateMeasurements() {
      const diameter = radius * 2;
      const circumference = 2 * Math.PI * radius;
      const area = Math.PI * radius * radius;

      radiusMeasurement.textContent = `Raggio: ${radius} px`;
      diameterMeasurement.textContent = `Diametro: ${diameter} px`;
      circumferenceMeasurement.textContent = `Circonferenza: ${circumference.toFixed(2)} px`;
      areaMeasurement.textContent = `Area: ${area.toFixed(2)} px²`;
    }

    // Event listener per lo slider del raggio
    if (radiusSlider) {
      radiusSlider.addEventListener("input", function () {
        radius = parseInt(this.value);
        radiusValue.textContent = radius;
        drawCircle();
      });
    }

    // Event listener per i bottoni
    if (showDiameterBtn) {
      showDiameterBtn.addEventListener("click", function () {
        showDiameter = !showDiameter;
        this.textContent = showDiameter
          ? "Nascondi Diametro"
          : "Mostra Diametro";
        this.classList.toggle("active");
        drawCircle();
      });
    }

    if (showCircumferenceBtn) {
      showCircumferenceBtn.addEventListener("click", function () {
        showCircumference = !showCircumference;
        this.textContent = showCircumference
          ? "Nascondi Circonferenza"
          : "Mostra Circonferenza";
        this.classList.toggle("active");
        drawCircle();
      });
    }

    if (showChordBtn) {
      showChordBtn.addEventListener("click", function () {
        showChord = !showChord;
        this.textContent = showChord ? "Nascondi Corda" : "Mostra Corda";
        this.classList.toggle("active");
        drawCircle();
      });
    }

    if (showSectorBtn) {
      showSectorBtn.addEventListener("click", function () {
        showSector = !showSector;
        this.textContent = showSector ? "Nascondi Settore" : "Mostra Settore";
        this.classList.toggle("active");
        drawCircle();
      });
    }

    // Gestisci il ridimensionamento della finestra
    window.addEventListener("resize", function () {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      drawCircle();
    });

    // Disegna il cerchio iniziale
    drawCircle();

    // Bottone "Inizia ad Esplorare"
    const exploreBtn = document.querySelector(".btn-primary");
    if (exploreBtn) {
      exploreBtn.addEventListener("click", function () {
        document.querySelector("#interattivo").scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  // Animazioni al caricamento della pagina
  function animateOnScroll() {
    const elements = document.querySelectorAll(
      ".card, .formula-card, .application-item",
    );

    elements.forEach((element) => {
      const position = element.getBoundingClientRect();

      // Se l'elemento è visibile nella viewport
      if (position.top < window.innerHeight && position.bottom >= 0) {
        element.classList.add("animate");
      }
    });
  }

  // Aggiungi la classe CSS per l'animazione
  const style = document.createElement("style");
  style.textContent = `
        .card, .formula-card, .application-item {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .card.animate, .formula-card.animate, .application-item.animate {
            opacity: 1;
            transform: translateY(0);
        }
    `;
  document.head.appendChild(style);

  // Esegui l'animazione al caricamento e allo scroll
  window.addEventListener("load", animateOnScroll);
  window.addEventListener("scroll", animateOnScroll);
});
