// Inizializzazione al caricamento della pagina
document.addEventListener("DOMContentLoaded", function () {
  // Imposta l'anno corrente nel footer
  document.getElementById("current-year").textContent =
    new Date().getFullYear();

  // Inizializza il tema
  initTheme();

  // Inizializza la ricerca e i suggerimenti
  initSearch();

  // Imposta le date predefinite per il selettore di date
  initDatePicker();

  // Inizializza i controlli del grafico
  initChartControls();
});

// Inizializzazione del tema
function initTheme() {
  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem("theme");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Set initial theme
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else if (prefersDarkScheme.matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // Theme toggle button functionality
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", function () {
    // Get current theme
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";

    // Toggle theme
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // Add transition class for smooth animation
    document.body.classList.add("theme-transition");

    // Apply new theme
    document.documentElement.setAttribute("data-theme", newTheme);

    // Save preference
    localStorage.setItem("theme", newTheme);

    // Remove transition class after animation completes
    setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 500);

    // Aggiorna i grafici se presenti
    updateChartsTheme();
  });

  // Listen for system preference changes
  prefersDarkScheme.addEventListener("change", function (e) {
    // Only if user hasn't manually set a preference
    if (!localStorage.getItem("theme")) {
      const newTheme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  });
}

// Inizializzazione della ricerca e dei suggerimenti
function initSearch() {
  const searchInput = document.getElementById("stockSearch");
  const suggestionsContainer = document.getElementById("suggestions");
  const searchButton = document.getElementById("search-button");

  // Gestione dell'input di ricerca
  searchInput.addEventListener("input", function () {
    const query = this.value.trim();

    if (query.length === 0) {
      suggestionsContainer.style.display = "none";
      suggestionsContainer.innerHTML = "";
      return;
    }

    // Cerca i titoli tramite API
    searchSymbols(query);
  });

  // Nascondi i suggerimenti quando si clicca fuori
  document.addEventListener("click", function (event) {
    if (
      !searchInput.contains(event.target) &&
      !suggestionsContainer.contains(event.target)
    ) {
      suggestionsContainer.style.display = "none";
    }
  });

  // Gestione del pulsante di ricerca
  searchButton.addEventListener("click", function () {
    const symbol = searchInput.value.trim().toUpperCase();
    if (symbol) {
      loadStockData(symbol);
    }
  });

  // Gestione dell'invio nel campo di ricerca
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const symbol = this.value.trim().toUpperCase();
      if (symbol) {
        loadStockData(symbol);
        suggestionsContainer.style.display = "none";
      }
    }
  });
}

// Cerca simboli di titoli tramite API
function searchSymbols(query) {
  const apiKey = "V4B00MZ675MCO7ZQ";
  const apiUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${apiKey}`;
  const suggestionsContainer = document.getElementById("suggestions");

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta del server");
      }
      return response.json();
    })
    .then((data) => {
      if (data.bestMatches && data.bestMatches.length > 0) {
        suggestionsContainer.innerHTML = "";

        data.bestMatches.forEach((match) => {
          const symbol = match["1. symbol"];
          const name = match["2. name"];

          const suggestionItem = document.createElement("div");
          suggestionItem.className = "suggestion-item";
          suggestionItem.innerHTML = `
                        <span class="suggestion-symbol">${symbol}</span>
                        <span class="suggestion-name">${name}</span>
                    `;

          suggestionItem.addEventListener("click", function () {
            document.getElementById("stockSearch").value = symbol;
            suggestionsContainer.style.display = "none";
            loadStockData(symbol);
          });

          suggestionsContainer.appendChild(suggestionItem);
        });

        suggestionsContainer.style.display = "block";
      } else {
        suggestionsContainer.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Errore nella ricerca dei simboli:", error);
      suggestionsContainer.style.display = "none";
    });
}

// Inizializzazione del selettore di date
function initDatePicker() {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");

  // Formatta le date nel formato yyyy-mm-dd
  startDateInput.value = formatDate(oneYearAgo);
  endDateInput.value = formatDate(today);

  // Imposta i limiti delle date
  startDateInput.max = formatDate(today);
  endDateInput.max = formatDate(today);

  // Gestione del pulsante di applicazione dell'intervallo di date
  document
    .getElementById("apply-date-range")
    .addEventListener("click", function () {
      const symbol = document.getElementById("stock-symbol").textContent;
      if (symbol) {
        updateChart(symbol, "custom");
      }
    });
}

// Formatta una data nel formato yyyy-mm-dd
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Inizializzazione dei controlli del grafico
function initChartControls() {
  const timeButtons = document.querySelectorAll(".time-button");

  timeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Rimuovi la classe active da tutti i pulsanti
      timeButtons.forEach((btn) => btn.classList.remove("active"));

      // Aggiungi la classe active al pulsante cliccato
      this.classList.add("active");

      // Aggiorna il grafico con l'intervallo di tempo selezionato
      const symbol = document.getElementById("stock-symbol").textContent;
      if (symbol) {
        updateChart(symbol, this.dataset.range);
      }
    });
  });
}

// Carica i dati del titolo selezionato
function loadStockData(symbol) {
  // Mostra lo stato di caricamento
  const searchButton = document.getElementById("search-button");
  searchButton.classList.add("loading");

  // Ottieni informazioni sul titolo
  getStockOverview(symbol)
    .then((overview) => {
      // Rimuovi lo stato di caricamento
      searchButton.classList.remove("loading");

      // Mostra le sezioni nascoste
      document.getElementById("stock-info").classList.remove("hidden");
      document.getElementById("chart-container").classList.remove("hidden");
      document
        .getElementById("statistics-container")
        .classList.remove("hidden");
      document
        .getElementById("comparison-container")
        .classList.remove("hidden");

      // Aggiorna le informazioni del titolo con i dati dell'overview
      updateStockInfoFromOverview(symbol, overview);

      // Aggiorna le statistiche
      updateStatisticsFromOverview(overview);

      // Aggiorna il grafico
      updateChart(symbol, "1m"); // Mostra il grafico mensile di default

      // Aggiorna il grafico di confronto
      updateComparisonChart(symbol);

      // Seleziona il pulsante del periodo mensile
      document.querySelectorAll(".time-button").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.dataset.range === "1m") {
          btn.classList.add("active");
        }
      });
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei dati del titolo:", error);
      searchButton.classList.remove("loading");
      alert(
        `Errore nel caricamento dei dati per il titolo ${symbol}. Riprova più tardi.`
      );
    });
}

// Ottieni panoramica del titolo
function getStockOverview(symbol) {
  const apiKey = "V4B00MZ675MCO7ZQ";
  const apiUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta del server");
      }
      return response.json();
    })
    .then((data) => {
      if (Object.keys(data).length === 0) {
        throw new Error("Nessun dato disponibile per questo titolo");
      }
      return data;
    });
}

// Ottieni dati giornalieri del titolo
function getDailyStockData(symbol) {
  const apiKey = "V4B00MZ675MCO7ZQ";
  const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta del server");
      }
      return response.json();
    })
    .then((data) => {
      if (!data["Time Series (Daily)"]) {
        throw new Error("Nessun dato disponibile per questo titolo");
      }

      const timeSeriesData = data["Time Series (Daily)"];
      const formattedData = [];

      for (const date in timeSeriesData) {
        formattedData.push({
          date: new Date(date),
          open: parseFloat(timeSeriesData[date]["1. open"]),
          high: parseFloat(timeSeriesData[date]["2. high"]),
          low: parseFloat(timeSeriesData[date]["3. low"]),
          close: parseFloat(timeSeriesData[date]["4. close"]),
          volume: parseInt(timeSeriesData[date]["5. volume"]),
        });
      }

      // Ordina i dati per data (dal più vecchio al più recente)
      formattedData.sort((a, b) => a.date - b.date);

      return formattedData;
    });
}

// Ottieni dati intraday del titolo
function getIntradayStockData(symbol) {
  const apiKey = "V4B00MZ675MCO7ZQ";
  const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=full&apikey=${apiKey}`;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta del server");
      }
      return response.json();
    })
    .then((data) => {
      if (!data["Time Series (5min)"]) {
        throw new Error("Nessun dato intraday disponibile per questo titolo");
      }

      const timeSeriesData = data["Time Series (5min)"];
      const formattedData = [];

      for (const datetime in timeSeriesData) {
        formattedData.push({
          date: new Date(datetime),
          open: parseFloat(timeSeriesData[datetime]["1. open"]),
          high: parseFloat(timeSeriesData[datetime]["2. high"]),
          low: parseFloat(timeSeriesData[datetime]["3. low"]),
          close: parseFloat(timeSeriesData[datetime]["4. close"]),
          volume: parseInt(timeSeriesData[datetime]["5. volume"]),
        });
      }

      // Ordina i dati per data (dal più vecchio al più recente)
      formattedData.sort((a, b) => a.date - b.date);

      return formattedData;
    });
}

// Aggiorna le informazioni del titolo con i dati dell'overview
function updateStockInfoFromOverview(symbol, overview) {
  // Aggiorna gli elementi HTML
  document.getElementById("stock-name").textContent = overview.Name || symbol;
  document.getElementById("stock-symbol").textContent = symbol;

  // Ottieni il prezzo attuale e la variazione
  getLatestQuote(symbol)
    .then((quote) => {
      document.getElementById("current-price").textContent = `$${parseFloat(
        quote.price
      ).toFixed(2)}`;

      const priceChangeElement = document.getElementById("price-change");
      const priceChange = parseFloat(quote.change);
      const percentChange = parseFloat(quote.changePercent);

      priceChangeElement.textContent = `${
        priceChange >= 0 ? "+" : ""
      }${priceChange.toFixed(2)} (${percentChange.toFixed(2)}%)`;
      priceChangeElement.className =
        priceChange >= 0 ? "price-up" : "price-down";

      // Aggiorna i dettagli
      document.getElementById("open-price").textContent = `$${parseFloat(
        quote.open
      ).toFixed(2)}`;
      document.getElementById("high-price").textContent = `$${parseFloat(
        quote.high
      ).toFixed(2)}`;
      document.getElementById("low-price").textContent = `$${parseFloat(
        quote.low
      ).toFixed(2)}`;

      // Formatta il volume con separatori delle migliaia
      const volume = parseInt(quote.volume);
      document.getElementById("volume").textContent = formatVolume(volume);
    })
    .catch((error) => {
      console.error("Errore nell'ottenere la quotazione attuale:", error);

      // Valori di fallback dall'overview
      document.getElementById("current-price").textContent = overview.Price
        ? `$${parseFloat(overview.Price).toFixed(2)}`
        : "N/D";
      document.getElementById("price-change").textContent = "N/D";
      document.getElementById("open-price").textContent = "N/D";
      document.getElementById("high-price").textContent = "N/D";
      document.getElementById("low-price").textContent = "N/D";
      document.getElementById("volume").textContent = "N/D";
    });
}

// Ottieni la quotazione più recente
function getLatestQuote(symbol) {
  const apiKey = "V4B00MZ675MCO7ZQ";
  const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta del server");
      }
      return response.json();
    })
    .then((data) => {
      if (!data["Global Quote"]) {
        throw new Error("Nessuna quotazione disponibile per questo titolo");
      }

      const quote = data["Global Quote"];
      return {
        price: quote["05. price"],
        change: quote["09. change"],
        changePercent: quote["10. change percent"].replace("%", ""),
        open: quote["02. open"],
        high: quote["03. high"],
        low: quote["04. low"],
        volume: quote["06. volume"],
      };
    });
}

// Formatta il volume con suffissi K, M, B
function formatVolume(volume) {
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + "B";
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + "M";
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + "K";
  } else {
    return volume.toString();
  }
}

// Aggiorna le statistiche con i dati dell'overview
function updateStatisticsFromOverview(overview) {
  // Calcola la media mobile a 50 giorni
  const ma50 = overview["50DayMovingAverage"]
    ? `$${parseFloat(overview["50DayMovingAverage"]).toFixed(2)}`
    : "N/D";
  document.getElementById("moving-avg").textContent = ma50;

  // RSI non è disponibile direttamente nell'API overview, quindi usiamo un valore calcolato o N/D
  document.getElementById("rsi-value").textContent = "N/D";

  // Volatilità (Beta)
  const volatility = overview.Beta
    ? `${parseFloat(overview.Beta).toFixed(2)}`
    : "N/D";
  document.getElementById("volatility").textContent = volatility;

  // Capitalizzazione di mercato
  const marketCap = overview.MarketCapitalization
    ? formatMarketCap(parseInt(overview.MarketCapitalization))
    : "N/D";
  document.getElementById("market-cap").textContent = marketCap;
}

// Formatta la capitalizzazione di mercato
function formatMarketCap(marketCap) {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `$${marketCap.toLocaleString()}`;
  }
}

// Aggiorna il grafico principale
function updateChart(symbol, timeRange) {
  // Mostra un indicatore di caricamento nel grafico
  const chartContainer = document.getElementById("chart-container");
  chartContainer.classList.add("loading");

  // Ottieni i dati appropriati in base all'intervallo di tempo
  let dataPromise;

  if (timeRange === "1d") {
    dataPromise = getIntradayStockData(symbol);
  } else {
    dataPromise = getDailyStockData(symbol);
  }

  dataPromise
    .then((allData) => {
      // Filtra i dati in base all'intervallo di tempo selezionato
      let filteredData = filterDataByTimeRange(allData, timeRange);

      // Prepara i dati per il grafico
      const labels = filteredData.map((item) => item.date);
      const prices = filteredData.map((item) => item.close);

      // Ottieni il contesto del canvas
      const ctx = document.getElementById("stock-chart").getContext("2d");

      // Distruggi il grafico esistente se presente
      if (window.stockChart) {
        window.stockChart.destroy();
      }

      // Crea il nuovo grafico
      window.stockChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: `${symbol} Prezzo`,
              data: prices,
              borderColor: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--primary-color"),
              backgroundColor:
                getComputedStyle(document.documentElement).getPropertyValue(
                  "--primary-color"
                ) + "20",
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 5,
              fill: true,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label: function (context) {
                  return `Prezzo: $${context.parsed.y.toFixed(2)}`;
                },
                title: function (context) {
                  const date = new Date(context[0].label);
                  return date.toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                },
              },
            },
          },
          scales: {
            x: {
              type: "time",
              time: {
                unit: getTimeUnit(timeRange),
                displayFormats: {
                  hour: "HH:mm",
                  day: "dd/MM/yyyy",
                  week: "dd/MM/yyyy",
                  month: "MM/yyyy",
                },
              },
              grid: {
                display: false,
              },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 10,
              },
            },
            y: {
              grid: {
                color: getComputedStyle(
                  document.documentElement
                ).getPropertyValue("--chart-grid"),
              },
              ticks: {
                callback: function (value) {
                  return "$" + value.toFixed(2);
                },
              },
            },
          },
          interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false,
          },
        },
      });

      // Rimuovi l'indicatore di caricamento
      chartContainer.classList.remove("loading");
    })
    .catch((error) => {
      console.error("Errore nell'aggiornamento del grafico:", error);
      chartContainer.classList.remove("loading");
      alert(
        `Errore nel caricamento dei dati del grafico per ${symbol}. Riprova più tardi.`
      );
    });
}

// Filtra i dati in base all'intervallo di tempo
function filterDataByTimeRange(data, timeRange) {
  const today = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case "1d":
      startDate.setDate(today.getDate() - 1);
      break;
    case "1w":
      startDate.setDate(today.getDate() - 7);
      break;
    case "1m":
      startDate.setMonth(today.getMonth() - 1);
      break;
    case "1y":
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    case "custom":
      const startDateInput = document.getElementById("start-date").value;
      const endDateInput = document.getElementById("end-date").value;
      startDate = new Date(startDateInput);
      today = new Date(endDateInput);
      break;
  }

  // Filtra i dati in base all'intervallo di date
  return data.filter((item) => {
    return item.date >= startDate && item.date <= today;
  });
}

// Determina l'unità di tempo appropriata per il grafico
function getTimeUnit(timeRange) {
  switch (timeRange) {
    case "1d":
      return "hour";
    case "1w":
      return "day";
    case "1m":
      return "day";
    default:
      return "month";
  }
}

// Aggiorna il grafico di confronto
function updateComparisonChart(symbol) {
  // Mostra un indicatore di caricamento
  const comparisonContainer = document.getElementById("comparison-container");
  comparisonContainer.classList.add("loading");

  // Ottieni i dati del titolo
  getDailyStockData(symbol)
    .then((stockData) => {
      // Filtra gli ultimi 30 giorni
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const stockData30d = stockData.filter(
        (item) => item.date >= thirtyDaysAgo
      );

      // Ottieni i dati degli indici (qui usiamo dati di esempio per semplicità)
      // In un'implementazione reale, dovresti ottenere questi dati dall'API
      const sp500Data30d = generateMockIndexData(30, 4500, 100);
      const nasdaqData30d = generateMockIndexData(30, 14000, 300);

      // Normalizza i dati
      const stockNormalized = normalizeData(
        stockData30d.map((item) => ({ date: item.date, price: item.close }))
      );
      const sp500Normalized = normalizeData(sp500Data30d);
      const nasdaqNormalized = normalizeData(nasdaqData30d);

      // Prepara i dati per il grafico
      const labels = stockData30d.map((item) => item.date);

      // Ottieni il contesto del canvas
      const ctx = document.getElementById("comparison-chart").getContext("2d");

      // Distruggi il grafico esistente se presente
      if (window.comparisonChart) {
        window.comparisonChart.destroy();
      }

      // Aggiorna l'etichetta della legenda
      document.getElementById("stock-legend-label").textContent = symbol;

      // Crea il nuovo grafico
      window.comparisonChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: symbol,
              data: stockNormalized,
              borderColor: "rgba(0, 116, 217, 0.7)",
              backgroundColor: "transparent",
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
            {
              label: "S&P 500",
              data: sp500Normalized,
              borderColor: "rgba(255, 71, 87, 0.7)",
              backgroundColor: "transparent",
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
            {
              label: "NASDAQ",
              data: nasdaqNormalized,
              borderColor: "rgba(46, 204, 113, 0.7)",
              backgroundColor: "transparent",
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label}: ${context.parsed.y.toFixed(
                    2
                  )}%`;
                },
                title: function (context) {
                  const date = new Date(context[0].label);
                  return date.toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                },
              },
            },
          },
          scales: {
            x: {
              type: "time",
              time: {
                unit: "day",
                displayFormats: {
                  day: "dd/MM",
                },
              },
              grid: {
                display: false,
              },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 10,
              },
            },
            y: {
              grid: {
                color: getComputedStyle(
                  document.documentElement
                ).getPropertyValue("--chart-grid"),
              },
              ticks: {
                callback: function (value) {
                  return value.toFixed(1) + "%";
                },
              },
            },
          },
          interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false,
          },
        },
      });

      // Rimuovi l'indicatore di caricamento
      comparisonContainer.classList.remove("loading");
    })
    .catch((error) => {
      console.error(
        "Errore nell'aggiornamento del grafico di confronto:",
        error
      );
      comparisonContainer.classList.remove("loading");
      alert(
        `Errore nel caricamento dei dati di confronto per ${symbol}. Riprova più tardi.`
      );
    });
}

// Genera dati di esempio per gli indici di mercato
function generateMockIndexData(days, basePrice, volatility) {
  const today = new Date();
  const data = [];
  let price = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    // Genera un prezzo casuale con una certa volatilità
    const change = (Math.random() - 0.5) * volatility;
    price = Math.max(price + change, 1); // Assicura che il prezzo non vada sotto 1

    data.push({
      date: date,
      price: price,
    });
  }

  return data;
}

// Normalizza i dati per il confronto (converte in percentuale di variazione)
function normalizeData(data) {
  if (data.length === 0) return [];

  const baseValue = data[0].price;
  return data.map((item) => ({
    x: item.date,
    y: ((item.price - baseValue) / baseValue) * 100,
  }));
}

// Aggiorna i temi dei grafici quando si cambia tema
function updateChartsTheme() {
  if (window.stockChart) {
    window.stockChart.options.scales.y.grid.color = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--chart-grid");
    window.stockChart.data.datasets[0].borderColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--primary-color");
    window.stockChart.data.datasets[0].backgroundColor =
      getComputedStyle(document.documentElement).getPropertyValue(
        "--primary-color"
      ) + "20";
    window.stockChart.update();
  }

  if (window.comparisonChart) {
    window.comparisonChart.options.scales.y.grid.color = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--chart-grid");
    window.comparisonChart.update();
  }
}

// Helper function to show results
function showResult(message, isError = false) {
  const resultContainer = document.getElementById("result-container");
  const resultElement = document.getElementById("result");

  resultElement.innerHTML = message;
  resultContainer.classList.remove("hidden");

  if (isError) {
    resultElement.style.color = "var(--secondary-color)";
  } else {
    resultElement.style.color = "var(--text-color)";
  }

  // Add animation
  resultContainer.classList.add("fade-in");
  setTimeout(() => {
    resultContainer.classList.remove("fade-in");
  }, 500);
}
