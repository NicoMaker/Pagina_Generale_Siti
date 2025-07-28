// DOM Elements
const numberInput = document.getElementById("number");
const baseInput = document.getElementById("base");
const resultDiv = document.getElementById("result");
const loadingIndicator = document.getElementById("loading-indicator");
const timelineProgress = document.getElementById("timeline-progress");
const timelineMarkers = document.getElementById("timeline-markers");
const fibonacciGrid = document.getElementById("fibonacci-grid");
const calculateBtn = document.getElementById("calculate-btn");

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  // Set default values
  numberInput.value = "100";
  baseInput.value = "10";

  // Add event listeners for Enter key
  numberInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      calcolaLogaritmo();
    }
  });

  baseInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      calcolaLogaritmo();
    }
  });

  // Initial calculation
  calcolaLogaritmo();
});

// Main function to calculate logarithm
function calcolaLogaritmo() {
  // Show loading indicator
  resultDiv.classList.remove("show");
  loadingIndicator.classList.remove("hidden");

  // Clear previous visualizations
  fibonacciGrid.innerHTML = "";
  timelineMarkers.innerHTML = "";

  // Get input values
  let numero = parseFloat(numberInput.value);
  let base = parseFloat(baseInput.value);

  // Validate inputs
  if (isNaN(numero) || isNaN(base) || numero <= 0 || base <= 0 || base === 1) {
    showError(
      "Inserisci valori validi. Numero e base devono essere positivi, e la base non può essere 1.",
    );
    return;
  }

  // Simulate calculation delay for better UX
  setTimeout(() => {
    try {
      // Calculate logarithm
      let risultato = Math.log(numero) / Math.log(base);

      // Format result to 4 decimal places
      risultato = parseFloat(risultato.toFixed(4));

      // Display result
      resultDiv.innerHTML = `Il logaritmo di ${numero} in base ${base} è: <span style="color: var(--secondary-color)">${risultato}</span>`;
      resultDiv.classList.add("show");

      // Create visualization
      createVisualization(numero, base, risultato);
    } catch (error) {
      showError("Si è verificato un errore durante il calcolo.");
    } finally {
      // Hide loading indicator
      loadingIndicator.classList.add("hidden");
    }
  }, 800);
}

// Show error message
function showError(message) {
  resultDiv.innerHTML = `<span style="color: #ff4757;">${message}</span>`;
  resultDiv.classList.add("show");
  loadingIndicator.classList.add("hidden");

  // Reset visualizations
  timelineProgress.style.width = "0%";
  fibonacciGrid.innerHTML = "";
  timelineMarkers.innerHTML = "";
}

// Create visualization based on logarithm result
function createVisualization(number, base, result) {
  // Create Fibonacci sequence for visualization
  const fibSequence = generateFibonacciSequence(8);

  // Create timeline markers
  createTimelineMarkers(base, number, result);

  // Animate timeline progress
  animateTimelineProgress(100);

  // Create Fibonacci tiles
  createFibonacciTiles(fibSequence, base, number, result);
}

// Generate Fibonacci sequence
function generateFibonacciSequence(count) {
  let sequence = [1, 1];

  for (let i = 2; i < count; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }

  return sequence;
}

// Create timeline markers
function createTimelineMarkers(base, number, result) {
  // Clear previous markers
  timelineMarkers.innerHTML = "";

  // Create power sequence from 0 to result (rounded up) + 1
  const maxPower = Math.ceil(result) + 1;

  for (let i = 0; i <= maxPower; i++) {
    const marker = document.createElement("div");
    marker.className = "timeline-marker";
    marker.setAttribute("data-value", `${base}^${i} = ${Math.pow(base, i)}`);

    // Add to timeline
    timelineMarkers.appendChild(marker);
  }

  // Highlight the markers that bracket the result
  setTimeout(() => {
    const markers = document.querySelectorAll(".timeline-marker");

    markers.forEach((marker, index) => {
      if (index <= result && index + 1 > result) {
        marker.classList.add("active");
        if (index + 1 < markers.length) {
          markers[index + 1].classList.add("active");
        }
      }
    });
  }, 1000);
}

// Animate timeline progress
function animateTimelineProgress(percentage) {
  // Reset progress
  timelineProgress.style.width = "0%";

  // Animate progress
  setTimeout(() => {
    timelineProgress.style.width = `${percentage}%`;
  }, 100);
}

// Create Fibonacci tiles
function createFibonacciTiles(fibSequence, base, number, result) {
  // Clear previous tiles
  fibonacciGrid.innerHTML = "";

  // Calculate powers of the base around the result
  const powers = [];
  const floorResult = Math.floor(result);
  const ceilResult = Math.ceil(result);

  // Add powers around the result
  for (let i = Math.max(0, floorResult - 2); i <= ceilResult + 2; i++) {
    powers.push({
      power: i,
      value: Math.pow(base, i),
    });
  }

  // Create tiles with staggered animation
  powers.forEach((power, index) => {
    setTimeout(() => {
      // Create tile
      const tile = document.createElement("div");
      tile.className = "fibonacci-tile";

      // Scale tile based on Fibonacci sequence
      const fibIndex = Math.min(index, fibSequence.length - 1);
      const scale = fibSequence[fibIndex];

      // Set grid span based on Fibonacci value
      tile.style.gridColumn = `span ${Math.min(scale, 3)}`;
      tile.style.gridRow = `span ${Math.min(scale, 3)}`;

      // Create content
      const valueElement = document.createElement("div");
      valueElement.className = "value";
      valueElement.textContent = power.value.toLocaleString();

      const labelElement = document.createElement("div");
      labelElement.className = "label";
      labelElement.textContent = `${base}^${power.power}`;

      // Create progress circle
      const progressCircle = createProgressCircle(power.value, number);

      // Add elements to tile
      tile.appendChild(progressCircle);
      tile.appendChild(valueElement);
      tile.appendChild(labelElement);

      // Add to grid
      fibonacciGrid.appendChild(tile);

      // Trigger animation
      setTimeout(() => {
        tile.classList.add("show");
      }, 50);

      // Highlight tile if it's close to the target number
      if (power.value <= number && power.value * base > number) {
        tile.style.boxShadow = "0 0 15px rgba(67, 97, 238, 0.8)";
      }
    }, index * 200); // Stagger animation
  });
}

// Create SVG progress circle
function createProgressCircle(value, targetNumber) {
  // Create SVG element
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "progress-circle");
  svg.setAttribute("viewBox", "0 0 100 100");

  // Create background circle
  const bgCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  bgCircle.setAttribute("cx", "50");
  bgCircle.setAttribute("cy", "50");
  bgCircle.setAttribute("r", "45");
  bgCircle.setAttribute("fill", "none");
  bgCircle.setAttribute("stroke", "#e0e0e0");
  bgCircle.setAttribute("stroke-width", "5");

  // Create progress circle
  const progressCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  progressCircle.setAttribute("cx", "50");
  progressCircle.setAttribute("cy", "50");
  progressCircle.setAttribute("r", "45");
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("stroke", getProgressColor(value, targetNumber));
  progressCircle.setAttribute("stroke-width", "5");
  progressCircle.setAttribute("stroke-dasharray", "283");

  // Calculate progress percentage
  const progress = calculateProgress(value, targetNumber);
  const dashOffset = 283 - (283 * progress) / 100;
  progressCircle.setAttribute("stroke-dashoffset", dashOffset);

  // Add circles to SVG
  svg.appendChild(bgCircle);
  svg.appendChild(progressCircle);

  return svg;
}

// Calculate progress percentage
function calculateProgress(value, targetNumber) {
  if (value >= targetNumber) {
    return 100;
  }

  // Logarithmic scale for better visualization
  return (Math.log(value) / Math.log(targetNumber)) * 100;
}

// Get color based on progress
function getProgressColor(value, targetNumber) {
  const progress = calculateProgress(value, targetNumber);

  if (progress < 33) {
    return "#4361ee"; // Primary color
  } else if (progress < 66) {
    return "#4cc9f0"; // Accent color
  } else {
    return "#3a0ca3"; // Secondary color
  }
}
