document.addEventListener("DOMContentLoaded", () => {
  // Tab navigation
  const tabs = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll(".content-section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Show target section
      sections.forEach((section) => {
        section.classList.remove("active");
        if (section.id === target) {
          section.classList.add("active");
        }
      });
    });
  });

  // Toggle calculation steps
  window.toggleStep = (header) => {
    const container = header.parentElement;
    container.classList.toggle("open");
  };

  // Open first step by default
  const firstStep = document.querySelector(".step-container");
  if (firstStep) {
    firstStep.classList.add("open");
  }

  // Theme toggle
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    // Save preference to localStorage
    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  // Print section
  window.printSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    const originalDisplay = section.style.display;

    // Hide all sections except the one to print
    sections.forEach((s) => {
      if (s.id !== sectionId) {
        s.style.display = "none";
      }
    });

    // Print
    window.print();

    // Restore original display
    sections.forEach((s) => {
      if (s.id !== sectionId) {
        s.style.display = originalDisplay;
      }
    });

    // Show toast notification
    showToast("Stampa completata");
  };

  // Toast notification
  window.showToast = (message) => {
    const toast = document.getElementById("notificationToast");
    const toastMessage = toast.querySelector(".toast-message");

    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  };

  window.closeToast = () => {
    const toast = document.getElementById("notificationToast");
    toast.classList.remove("show");
  };

  // Interactive calculator
  const calculateButton = document.getElementById("calculateButton");
  const resetButton = document.getElementById("resetCalculator");
  const configType = document.getElementById("configType");
  const resistance = document.getElementById("resistance");
  const reactance = document.getElementById("reactance");
  const voltage = document.getElementById("voltage");
  const phaseVoltage = document.getElementById("phaseVoltage");

  // Update phase voltage when line voltage changes
  voltage.addEventListener("input", () => {
    const lineVoltage = Number.parseFloat(voltage.value) || 0;
    phaseVoltage.value = (lineVoltage / Math.sqrt(3)).toFixed(2);
  });

  // Configuration type change
  configType.addEventListener("change", () => {
    if (configType.value === "star") {
      // For star configuration, phase voltage = line voltage / sqrt(3)
      const lineVoltage = Number.parseFloat(voltage.value) || 0;
      phaseVoltage.value = (lineVoltage / Math.sqrt(3)).toFixed(2);
    } else {
      // For delta configuration, phase voltage = line voltage
      phaseVoltage.value = voltage.value;
    }
  });

  // Calculate button click
  calculateButton.addEventListener("click", () => {
    const r = Number.parseFloat(resistance.value);
    const xl = Number.parseFloat(reactance.value);
    const v = Number.parseFloat(voltage.value);
    const config = configType.value;

    if (isNaN(r) || isNaN(xl) || isNaN(v)) {
      showToast("Inserisci valori numerici validi");
      return;
    }

    // Calculate impedance
    const z = Math.sqrt(r * r + xl * xl);
    const phi = Math.atan(xl / r) * (180 / Math.PI);

    // Calculate currents
    let iPhase, iLine;

    if (config === "star") {
      // Star configuration
      iPhase = v / (Math.sqrt(3) * z);
      iLine = iPhase;
    } else {
      // Delta configuration
      iPhase = v / z;
      iLine = iPhase * Math.sqrt(3);
    }

    // Calculate powers
    const p = Math.sqrt(3) * v * iLine * Math.cos((phi * Math.PI) / 180);
    const q = Math.sqrt(3) * v * iLine * Math.sin((phi * Math.PI) / 180);
    const a = Math.sqrt(3) * v * iLine;

    // Update results
    document.getElementById("resultZ").textContent = z.toFixed(2) + " Ω";
    document.getElementById("resultPhi").textContent = phi.toFixed(2) + "°";
    document.getElementById("resultIf").textContent = iPhase.toFixed(2) + " A";
    document.getElementById("resultIl").textContent = iLine.toFixed(2) + " A";
    document.getElementById("resultP").textContent =
      p.toFixed(2) + " W (" + (p / 1000).toFixed(2) + " kW)";
    document.getElementById("resultQ").textContent =
      q.toFixed(2) + " VAR (" + (q / 1000).toFixed(2) + " kVAR)";
    document.getElementById("resultA").textContent =
      a.toFixed(2) + " VA (" + (a / 1000).toFixed(2) + " kVA)";

    // Draw power triangle
    drawPowerTriangle(p, q, a, phi);

    showToast("Calcolo completato");
  });

  // Reset calculator
  resetButton.addEventListener("click", () => {
    resistance.value = "";
    reactance.value = "";
    voltage.value = "400";
    phaseVoltage.value = "230";
    configType.value = "star";

    document.getElementById("resultZ").textContent = "-";
    document.getElementById("resultPhi").textContent = "-";
    document.getElementById("resultIf").textContent = "-";
    document.getElementById("resultIl").textContent = "-";
    document.getElementById("resultP").textContent = "-";
    document.getElementById("resultQ").textContent = "-";
    document.getElementById("resultA").textContent = "-";

    // Clear power triangle
    const canvas = document.getElementById("powerTriangle");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    showToast("Calcolatore resettato");
  });

  // Draw power triangle
  function drawPowerTriangle(p, q, a, phi) {
    const canvas = document.getElementById("powerTriangle");
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set scale factor to fit triangle in canvas
    const maxDimension = Math.max(p, q, a);
    const scale = 150 / maxDimension;

    // Calculate triangle points
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const x1 = centerX - (p * scale) / 2;
    const y1 = centerY + 50;

    const x2 = x1 + p * scale;
    const y2 = y1;

    const x3 = x2;
    const y3 = y1 - q * scale;

    // Draw triangle
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();

    // Style triangle
    ctx.strokeStyle = getComputedStyle(
      document.documentElement,
    ).getPropertyValue("--primary-color");
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add labels
    ctx.font = "12px Inter";
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
      "--text-primary",
    );

    // P label
    ctx.fillText("P = " + (p / 1000).toFixed(2) + " kW", centerX - 60, y1 + 20);

    // Q label
    ctx.fillText("Q = " + (q / 1000).toFixed(2) + " kVAR", x3 + 10, centerY);

    // A label
    ctx.fillText("A = " + (a / 1000).toFixed(2) + " kVA", x1 - 20, centerY);

    // Phi angle
    ctx.beginPath();
    ctx.arc(x1, y1, 20, 0, (-phi * Math.PI) / 180, true);
    ctx.strokeStyle = getComputedStyle(
      document.documentElement,
    ).getPropertyValue("--accent-color");
    ctx.stroke();

    ctx.fillText("φ = " + phi.toFixed(2) + "°", x1 + 15, y1 - 15);
  }
});
