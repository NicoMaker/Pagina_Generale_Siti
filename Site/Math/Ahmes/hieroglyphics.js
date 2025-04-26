/**
 * Egyptian Hieroglyphic Numerals Module
 * Provides consistent hieroglyphic representations throughout the site
 */

// Fetch the Egyptian data from the JSON file
let EGYPTIAN_DATA = null;
let EGYPTIAN_NUMERALS = {};
let DECORATIVE_SYMBOLS = [];
let HIEROGLYPHIC_PHRASES = {};
let MAX_NUMBER = 5000;

// Fetch the data from the JSON file
async function loadEgyptianData() {
  try {
    const response = await fetch("egyptian-data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    EGYPTIAN_DATA = await response.json();

    // Extract the data
    EGYPTIAN_NUMERALS = {
      UNIT: EGYPTIAN_DATA.numerals.UNIT.symbol,
      TEN: EGYPTIAN_DATA.numerals.TEN.symbol,
      HUNDRED: EGYPTIAN_DATA.numerals.HUNDRED.symbol,
      THOUSAND: EGYPTIAN_DATA.numerals.THOUSAND.symbol,
      TEN_THOUSAND: EGYPTIAN_DATA.numerals.TEN_THOUSAND.symbol,
    };

    DECORATIVE_SYMBOLS = EGYPTIAN_DATA.decorative;

    HIEROGLYPHIC_PHRASES = {
      WELCOME: EGYPTIAN_DATA.phrases.WELCOME.symbols,
      CALCULATION: EGYPTIAN_DATA.phrases.CALCULATION.symbols,
      RESULT: EGYPTIAN_DATA.phrases.RESULT.symbols,
      KNOWLEDGE: EGYPTIAN_DATA.phrases.KNOWLEDGE.symbols,
    };

    MAX_NUMBER = EGYPTIAN_DATA.maxNumber;

    // Initialize the page after data is loaded
    initializePage();
  } catch (error) {
    console.error("Error loading Egyptian data:", error);
    // Fallback to hardcoded values if JSON loading fails
    initializeWithFallbackData();
  }
}

// Fallback initialization with hardcoded values
function initializeWithFallbackData() {
  EGYPTIAN_NUMERALS = {
    UNIT: "𓏺", // Single stroke for 1
    TEN: "𓍢", // Heel bone for 10
    HUNDRED: "𓍱", // Coiled rope for 100
    THOUSAND: "𓆼", // Lotus flower for 1000
    TEN_THOUSAND: "𓆐", // Pointing finger for 10,000
  };

  DECORATIVE_SYMBOLS = [
    "𓀀",
    "𓀁",
    "𓀂",
    "𓀃",
    "𓀄",
    "𓀅",
    "𓀆",
    "𓀇",
    "𓀈",
    "𓀉",
    "𓀊",
    "𓀋",
    "𓀌",
    "𓀍",
    "𓀎",
    "𓀏",
    "𓀐",
    "𓀑",
    "𓀒",
    "𓀓",
  ];

  HIEROGLYPHIC_PHRASES = {
    WELCOME: "𓅓𓂋𓏏𓈖𓎡𓅱𓏏",
    CALCULATION: "𓊪𓏏𓂋𓏏",
    RESULT: "𓂋𓏏𓏏𓏭",
    KNOWLEDGE: "𓂋𓐍𓏏",
  };

  MAX_NUMBER = 5000;

  initializePage();
}

/**
 * Converts a number to Egyptian hieroglyphic representation
 * @param {number} num - The number to convert
 * @return {string} The hieroglyphic representation
 */
function convertToEgyptianNumerals(num) {
  if (num <= 0 || isNaN(num) || num > MAX_NUMBER) {
    return num > MAX_NUMBER ? "Numero troppo grande" : "";
  }

  let result = "";

  // Ten Thousands (max 1 symbol since we limit to 10,000)
  if (num === 10000) {
    return EGYPTIAN_NUMERALS.TEN_THOUSAND;
  }

  // Thousands
  const thousands = Math.floor(num / 1000);
  result += EGYPTIAN_NUMERALS.THOUSAND.repeat(thousands);
  num %= 1000;

  // Hundreds
  const hundreds = Math.floor(num / 100);
  result += EGYPTIAN_NUMERALS.HUNDRED.repeat(hundreds);
  num %= 100;

  // Tens
  const tens = Math.floor(num / 10);
  result += EGYPTIAN_NUMERALS.TEN.repeat(tens);
  num %= 10;

  // Units
  result += EGYPTIAN_NUMERALS.UNIT.repeat(num);

  return result;
}

/**
 * Generates decorative hieroglyphic text
 * @param {number} length - Number of symbols to generate
 * @return {string} Random hieroglyphic symbols
 */
function generateDecorativeHieroglyphics(length = 5) {
  if (!DECORATIVE_SYMBOLS || DECORATIVE_SYMBOLS.length === 0) {
    return "";
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * DECORATIVE_SYMBOLS.length);
    result += DECORATIVE_SYMBOLS[randomIndex];
  }
  return result;
}

/**
 * Adds decorative hieroglyphics to elements with the hieroglyphic-decoration class
 */
function addDecorativeHieroglyphics() {
  const decorations = document.querySelectorAll(".hieroglyphic-decoration");

  decorations.forEach((decoration) => {
    decoration.textContent = generateDecorativeHieroglyphics(7);
  });
}

// Initialize the page
function initializePage() {
  // Add decorative hieroglyphics
  addDecorativeHieroglyphics();

  // Set max attribute on number inputs
  const numberInputs = document.querySelectorAll('input[type="number"]');
  numberInputs.forEach((input) => {
    input.setAttribute("max", MAX_NUMBER);
  });
}

// Load the Egyptian data when the DOM is loaded
document.addEventListener("DOMContentLoaded", loadEgyptianData);

// Export the function for use in calculator.js
export { convertToEgyptianNumerals, MAX_NUMBER };
