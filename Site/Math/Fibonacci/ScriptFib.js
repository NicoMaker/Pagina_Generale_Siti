// DOM Elements
const numInput = document.getElementById("num-input");
const outputDiv = document.getElementById("output");
const sumOutputDiv = document.getElementById("sum-output");
const fibonacciGrid = document.getElementById("fibonacci-grid");
const timelineProgress = document.getElementById("timeline-progress");
const timelineMarkers = document.getElementById("timeline-markers");
const calculateBtn = document.getElementById("calculate-btn");

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  // Set default value and calculate initial view
  numInput.value = 8;
  calculateFibonacci();

  // Add event listener for Enter key
  numInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      calculateFibonacci();
    }
  });
});

// Main function to calculate Fibonacci sequence
function calculateFibonacci() {
  // Clear previous outputs
  outputDiv.textContent = "";
  sumOutputDiv.textContent = "";
  fibonacciGrid.innerHTML = "";
  timelineMarkers.innerHTML = "";

  // Get input value
  let num = parseInt(numInput.value);

  // Validate input
  if (isNaN(num) || num < 1) {
    outputDiv.textContent = "Inserisci un numero valido maggiore di 0.";
    return;
  }

  // Limit to reasonable number to prevent performance issues
  if (num > 20) {
    num = 20;
    numInput.value = 20;
    alert(
      "Per motivi di performance, il numero massimo è stato limitato a 20.",
    );
  }

  // Generate Fibonacci sequence
  const fibNumbers = generateFibonacci(num);
  const sum = calculateSumOfLastTwo(fibNumbers);

  // Display results
  displayFibonacciSequence(fibNumbers, sum);
  createFibonacciTiles(fibNumbers);
  createTimeline(num);

  // Animate timeline progress
  animateTimelineProgress(100);
}

// Generate Fibonacci sequence
function generateFibonacci(num) {
  let fibNumbers = [1];

  if (num === 1) return fibNumbers;

  fibNumbers = [1, 1];

  for (let i = 2; i < num; i++) {
    let nextFib = fibNumbers[i - 1] + fibNumbers[i - 2];
    fibNumbers.push(nextFib);
  }

  return fibNumbers;
}

// Calculate sum of last two Fibonacci numbers
function calculateSumOfLastTwo(fibNumbers) {
  const len = fibNumbers.length;
  return len > 1 ? fibNumbers[len - 1] + fibNumbers[len - 2] : fibNumbers[0];
}

// Display Fibonacci sequence and sum
function displayFibonacciSequence(fibNumbers, sum) {
  let output = fibNumbers.join(", ");
  outputDiv.textContent = output;
  sumOutputDiv.textContent = `Somma degli ultimi due numeri: ${sum}`;

  // Add fade-in animation
  outputDiv.classList.add("animate-fade-in");
  sumOutputDiv.classList.add("animate-fade-in");
}

// Create Fibonacci tiles in grid
function createFibonacciTiles(fibNumbers) {
  // Clear previous tiles
  fibonacciGrid.innerHTML = "";

  // Calculate maximum value for scaling
  const maxValue = Math.max(...fibNumbers);

  // Create tiles with delay for animation effect
  fibNumbers.forEach((number, index) => {
    setTimeout(() => {
      // Create tile element
      const tile = document.createElement("div");
      tile.className = "fibonacci-tile animate-fade-in";

      // Scale tile size based on Fibonacci value
      const scale = calculateTileScale(number, maxValue);
      tile.style.gridColumn = `span ${scale}`;
      tile.style.gridRow = `span ${scale}`;

      // Create content
      const content = document.createElement("div");
      content.className = "content";

      const numberElement = document.createElement("div");
      numberElement.className = "number";
      numberElement.textContent = number;

      const indexElement = document.createElement("div");
      indexElement.className = "index";
      indexElement.textContent = `F(${index})`;

      content.appendChild(numberElement);
      content.appendChild(indexElement);

      // Create progress ring
      const progressRing = createProgressRing(index, fibNumbers.length);

      // Add elements to tile
      tile.appendChild(progressRing);
      tile.appendChild(content);

      // Add tile to grid
      fibonacciGrid.appendChild(tile);

      // Add click event to highlight related tiles
      tile.addEventListener("click", () => highlightRelatedTiles(index));
    }, index * 100); // Stagger animation
  });
}

// Calculate tile scale based on Fibonacci value
function calculateTileScale(value, maxValue) {
  // Logarithmic scale to handle large Fibonacci numbers
  const minScale = 1;
  const maxScale = 3;

  if (maxValue <= 1) return minScale;

  // Calculate scale using logarithm to handle exponential growth
  const logValue = Math.log(value);
  const logMax = Math.log(maxValue);
  const scale = minScale + (logValue / logMax) * (maxScale - minScale);

  return Math.ceil(scale);
}

// Create SVG progress ring
function createProgressRing(index, total) {
  const progressRing = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  progressRing.setAttribute("class", "progress-ring");
  progressRing.setAttribute("viewBox", "0 0 100 100");

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.setAttribute("cx", "50");
  circle.setAttribute("cy", "50");
  circle.setAttribute("r", "45");
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke", "#e0e0e0");
  circle.setAttribute("stroke-width", "5");

  const progressCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  progressCircle.setAttribute("cx", "50");
  progressCircle.setAttribute("cy", "50");
  progressCircle.setAttribute("r", "45");
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("stroke", getColorForIndex(index));
  progressCircle.setAttribute("stroke-width", "5");
  progressCircle.setAttribute("stroke-dasharray", "283");

  // Calculate progress percentage
  const progress = ((index + 1) / total) * 100;
  const dashOffset = 283 - (283 * progress) / 100;
  progressCircle.setAttribute("stroke-dashoffset", dashOffset);

  progressRing.appendChild(circle);
  progressRing.appendChild(progressCircle);

  return progressRing;
}

// Create timeline with markers
function createTimeline(num) {
  // Clear previous markers
  timelineMarkers.innerHTML = "";

  // Create markers
  for (let i = 0; i < num; i++) {
    const marker = document.createElement("div");
    marker.className = "timeline-marker";
    marker.textContent = i + 1;
    marker.setAttribute("data-index", i);

    // Add click event to highlight corresponding tile
    marker.addEventListener("click", () => {
      highlightTimelineMarker(i);
      scrollToTile(i);
    });

    timelineMarkers.appendChild(marker);
  }
}

// Animate timeline progress
function animateTimelineProgress(percentage) {
  timelineProgress.style.width = "0%";

  // Use setTimeout to trigger animation
  setTimeout(() => {
    timelineProgress.style.width = percentage + "%";

    // Activate timeline markers sequentially
    const markers = document.querySelectorAll(".timeline-marker");
    markers.forEach((marker, index) => {
      setTimeout(() => {
        marker.classList.add("active");
      }, index * 200);
    });
  }, 100);
}

// Highlight related tiles (previous two tiles that sum to current)
function highlightRelatedTiles(index) {
  // Reset all tiles
  const allTiles = document.querySelectorAll(".fibonacci-tile");
  allTiles.forEach((tile) => {
    tile.style.boxShadow = "";
    tile.style.transform = "";
  });

  // Highlight current tile
  if (allTiles[index]) {
    allTiles[index].style.boxShadow = "0 0 15px rgba(255, 107, 107, 0.8)";
    allTiles[index].style.transform = "translateY(-10px)";
  }

  // Highlight previous two tiles if they exist
  if (index >= 2) {
    if (allTiles[index - 1]) {
      allTiles[index - 1].style.boxShadow = "0 0 15px rgba(78, 205, 196, 0.8)";
      allTiles[index - 1].style.transform = "translateY(-5px)";
    }

    if (allTiles[index - 2]) {
      allTiles[index - 2].style.boxShadow = "0 0 15px rgba(78, 205, 196, 0.8)";
      allTiles[index - 2].style.transform = "translateY(-5px)";
    }
  }

  // Highlight timeline marker
  highlightTimelineMarker(index);
}

// Highlight timeline marker
function highlightTimelineMarker(index) {
  const markers = document.querySelectorAll(".timeline-marker");

  // Reset all markers
  markers.forEach((marker) => {
    marker.style.transform = "";
    marker.style.backgroundColor = "";
  });

  // Highlight selected marker
  if (markers[index]) {
    markers[index].style.transform = "scale(1.3)";
    markers[index].style.backgroundColor = "var(--primary-color)";
  }
}

// Scroll to specific tile
function scrollToTile(index) {
  const tiles = document.querySelectorAll(".fibonacci-tile");
  if (tiles[index]) {
    tiles[index].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}

// Get color based on index
function getColorForIndex(index) {
  // Color palette
  const colors = [
    "#ff6b6b", // Red
    "#4ecdc4", // Teal
    "#ffe66d", // Yellow
    "#1a535c", // Dark teal
    "#f7fff7", // Light
  ];

  return colors[index % colors.length];
}
