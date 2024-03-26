function fetchStockValue() {
  const stockName = document.getElementById("stockName").value;

  if (!stockName) {
    alert("Inserisci un nome di titolo valido.");
    return;
  }

  const apiKey = "V4B00MZ675MCO7ZQ",
    apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockName}&interval=5min&apikey=${apiKey}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data["Time Series (5min)"]) {
        const timeSeriesData = data["Time Series (5min)"],
          latestTimestamp = Object.keys(timeSeriesData)[0],
          latestPrice = timeSeriesData[latestTimestamp]["1. open"];

        document.getElementById(
          "result"
        ).innerHTML = `Il valore del titolo ${stockName} è ${latestPrice} USD.`;
      } else if (data["Error Message"])
        document.getElementById(
          "result"
        ).innerHTML = `Il titolo ${stockName} non esiste.`;
      else
        document.getElementById("result").innerHTML =
          "Si è verificato un errore nella richiesta API.";
    })
    .catch((error) => {
      console.error("Errore nella richiesta API:", error);
      document.getElementById("result").innerHTML =
        "Si è verificato un errore nella richiesta API.";
    });
}