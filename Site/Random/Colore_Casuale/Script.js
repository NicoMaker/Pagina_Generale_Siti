// Global variables
let colorHistory = [];
const MAX_HISTORY = 10;

// Initialize the application
async function initialize() {
  try {
    // Add event listeners
    document
      .getElementById("generateButton")
      .addEventListener("click", generateColor);
    document
      .getElementById("copyButton")
      .addEventListener("click", copyColorCode);

    // Show initial image
    document.getElementById("image").style.display = "flex";
    document.getElementById("color").style.display = "none";

    // Disable copy button initially
    document.getElementById("copyButton").disabled = true;
  } catch (error) {
    console.error("Error initializing the application:", error);
  }
}

// Load colors from JSON file
async function loadColors() {
  try {
    const response = await fetch("colors.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.colors;
  } catch (error) {
    console.error("Error loading colors:", error);
    // Fallback colors if JSON fails to load
    return [
      "red",
      "blue",
      "green",
      "yellow",
      "purple",
      "orange",
      "pink",
      "cyan",
      "magenta",
      "lime",
    ];
  }
}

// Generate a random color
async function generateColor() {
  // Hide the image
  document.getElementById("image").style.display = "none";

  // Show the color display
  const colorDisplay = document.getElementById("color");
  colorDisplay.style.display = "block";

  // Add pulse animation
  colorDisplay.classList.add("pulse");
  setTimeout(() => {
    colorDisplay.classList.remove("pulse");
  }, 500);

  // Load colors and display a random one
  const colors = await loadColors();
  displayRandomColor(colors);

  // Enable copy button
  document.getElementById("copyButton").disabled = false;
}

// Display a random color
function displayRandomColor(colors) {
  const colorDisplay = document.getElementById("color");
  const colorNameElement = document.getElementById("color-name");
  const colorHexElement = document.getElementById("color-hex");

  // Create a shuffling effect
  let counter = 0;
  const maxIterations = 10;

  const shuffleInterval = setInterval(() => {
    const randomColor = getRandomColor(colors);
    colorDisplay.style.backgroundColor = randomColor;

    // Update color info
    updateColorInfo(randomColor, colorNameElement, colorHexElement);

    counter++;
    if (counter >= maxIterations) {
      clearInterval(shuffleInterval);

      // Final random color
      const finalColor = getRandomColor(colors);
      colorDisplay.style.backgroundColor = finalColor;

      // Update color info
      updateColorInfo(finalColor, colorNameElement, colorHexElement);

      // Add to history
      addToHistory(finalColor);
    }
  }, 50);
}

// Get a random color from the array
function getRandomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}

// Update color information display
function updateColorInfo(color, nameElement, hexElement) {
  // For named colors, display the name
  // For hex colors, convert to a readable name if possible
  let colorName = color;
  let hexCode = color;

  // If it's a hex code, keep it as is
  if (color.startsWith("#")) {
    colorName = getColorNameFromHex(color) || "Colore Personalizzato";
    hexCode = color;
  }
  // If it's a named color, convert to hex
  else {
    colorName = color.charAt(0).toUpperCase() + color.slice(1);
    hexCode = getHexFromColorName(color);
  }

  nameElement.textContent = colorName;
  hexElement.textContent = hexCode;
}

// Get a color name from hex (simplified)
function getColorNameFromHex(hex) {
  // This is a simplified version - in a real app you'd use a more comprehensive mapping
  const commonColors = {
    "#FF0000": "Rosso",
    "#00FF00": "Verde",
    "#0000FF": "Blu",
    "#FFFF00": "Giallo",
    "#FF00FF": "Magenta",
    "#00FFFF": "Ciano",
    "#000000": "Nero",
    "#FFFFFF": "Bianco",
    "#808080": "Grigio",
    "#FFA500": "Arancione",
    "#800080": "Viola",
    "#FFC0CB": "Rosa",
    "#A52A2A": "Marrone",
    "#79e0ee": "Azzurro Chiaro",
    "#b1afff": "Lavanda",
  };

  return commonColors[hex.toUpperCase()] || null;
}

// Get hex from color name (simplified)
function getHexFromColorName(name) {
  // Create a temporary div to get the computed color
  const tempDiv = document.createElement("div");
  tempDiv.style.color = name;
  document.body.appendChild(tempDiv);

  // Get computed style
  const computedColor = window.getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);

  // Convert rgb to hex
  if (computedColor.startsWith("rgb")) {
    const rgb = computedColor.match(/\d+/g);
    if (rgb && rgb.length === 3) {
      return (
        "#" +
        (
          (1 << 24) +
          (parseInt(rgb[0]) << 16) +
          (parseInt(rgb[1]) << 8) +
          parseInt(rgb[2])
        )
          .toString(16)
          .slice(1)
          .toUpperCase()
      );
    }
  }

  return name;
}

// Add color to history
function addToHistory(color) {
  // Don't add duplicates consecutively
  if (colorHistory.length > 0 && colorHistory[0] === color) {
    return;
  }

  // Add to beginning of array
  colorHistory.unshift(color);

  // Limit history size
  if (colorHistory.length > MAX_HISTORY) {
    colorHistory.pop();
  }

  // Update history display
  updateHistoryDisplay();
}

// Update the history display
function updateHistoryDisplay() {
  const historyContainer = document.getElementById("history-container");
  historyContainer.innerHTML = "";

  colorHistory.forEach((color) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.style.backgroundColor = color;
    historyItem.setAttribute("data-color", color);

    // Add click event to reuse this color
    historyItem.addEventListener("click", () => {
      const colorDisplay = document.getElementById("color");
      const colorNameElement = document.getElementById("color-name");
      const colorHexElement = document.getElementById("color-hex");

      // Hide image and show color
      document.getElementById("image").style.display = "none";
      colorDisplay.style.display = "block";

      // Set the color
      colorDisplay.style.backgroundColor = color;

      // Update color info
      updateColorInfo(color, colorNameElement, colorHexElement);

      // Enable copy button
      document.getElementById("copyButton").disabled = false;

      // Add pulse animation
      colorDisplay.classList.add("pulse");
      setTimeout(() => {
        colorDisplay.classList.remove("pulse");
      }, 500);
    });

    historyContainer.appendChild(historyItem);
  });
}

// Copy color code to clipboard
function copyColorCode() {
  const colorHex = document.getElementById("color-hex").textContent;

  // Use the Clipboard API
  navigator.clipboard
    .writeText(colorHex)
    .then(() => {
      showToast();
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);

      // Fallback method
      const tempInput = document.createElement("input");
      tempInput.value = colorHex;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);

      showToast();
    });
}

// Show toast notification
function showToast() {
  const toast = document.getElementById("toast");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", initialize);
