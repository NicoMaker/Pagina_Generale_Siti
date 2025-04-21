// Theme Switcher
document.addEventListener('DOMContentLoaded', function() {
  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Set initial theme
  if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (prefersDarkScheme.matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  // Theme toggle button functionality
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', function() {
      // Get current theme
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      
      // Toggle theme
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      // Add transition class for smooth animation
      document.body.classList.add('theme-transition');
      
      // Apply new theme
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Save preference
      localStorage.setItem('theme', newTheme);
      
      // Remove transition class after animation completes
      setTimeout(() => {
          document.body.classList.remove('theme-transition');
      }, 500);
  });
  
  // Listen for system preference changes
  prefersDarkScheme.addEventListener('change', function(e) {
      // Only if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', newTheme);
      }
  });
});

// Stock Value Fetcher
function fetchStockValue() {
  const stockName = document.getElementById("stockName").value;
  const button = document.getElementById("search-button");
  const resultContainer = document.getElementById("result-container");

  if (!stockName) {
      showResult("Inserisci un nome di titolo valido.", true);
      return;
  }

  // Show loading state
  button.classList.add("loading");
  resultContainer.classList.add("hidden");

  const apiKey = "V4B00MZ675MCO7ZQ";
  const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockName}&interval=5min&apikey=${apiKey}`;

  fetch(apiUrl)
      .then(response => {
          if (!response.ok) {
              throw new Error('Errore nella risposta del server');
          }
          return response.json();
      })
      .then(data => {
          // Remove loading state
          button.classList.remove("loading");
          
          if (data["Time Series (5min)"]) {
              const timeSeriesData = data["Time Series (5min)"];
              const latestTimestamp = Object.keys(timeSeriesData)[0];
              const latestPrice = timeSeriesData[latestTimestamp]["1. open"];
              
              // Format the price with currency symbol and thousands separator
              const formattedPrice = new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD' 
              }).format(latestPrice);
              
              showResult(`Il valore del titolo ${stockName.toUpperCase()} è ${formattedPrice}`);
          } else if (data["Error Message"]) {
              showResult(`Il titolo ${stockName.toUpperCase()} non esiste.`, true);
          } else {
              showResult("Si è verificato un errore nella richiesta API.", true);
          }
      })
      .catch(error => {
          console.error("Errore nella richiesta API:", error);
          button.classList.remove("loading");
          showResult("Si è verificato un errore nella richiesta API.", true);
      });
}

// Helper function to show results
function showResult(message, isError = false) {
  const resultContainer = document.getElementById("result-container");
  const resultElement = document.getElementById("result");
  
  resultElement.innerHTML = message;
  resultContainer.classList.remove("hidden");
  
  if (isError) {
      resultElement.style.color = 'var(--secondary-color)';
  } else {
      resultElement.style.color = 'var(--text-color)';
  }
  
  // Add animation
  resultContainer.classList.add('fade-in');
  setTimeout(() => {
      resultContainer.classList.remove('fade-in');
  }, 500);
}