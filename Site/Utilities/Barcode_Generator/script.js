function generaBarcode(codice) {
  try {
    // Genera SVG
    JsBarcode("#barcodeSvg", codice, {
      format: "CODE128",
      displayValue: true,
      fontSize: 18,
      lineColor: "#1e293b",
      width: 2,
      height: 80,
      margin: 10,
    });

    // Genera Canvas
    JsBarcode("#barcodeCanvas", codice, {
      format: "CODE128",
      displayValue: true,
      fontSize: 18,
      lineColor: "#1e293b",
      width: 2,
      height: 80,
      margin: 10,
    });
  } catch (error) {
    alert("Errore nella generazione del barcode. Verifica il codice inserito.");
    console.error(error);
  }
}

// Gestione click "Genera barcode"
document.getElementById("generaBtn").addEventListener("click", function () {
  const codice = document.getElementById("codiceInput").value.trim();
  if (!codice) {
    alert("Inserisci un codice valido.");
    return;
  }
  generaBarcode(codice);
});

// Genera su Enter
document
  .getElementById("codiceInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("generaBtn").click();
    }
  });

// Primo barcode di default
window.addEventListener("load", function () {
  const codiceDefault = document.getElementById("codiceInput").value.trim();
  if (codiceDefault) {
    generaBarcode(codiceDefault);
  }
});

// Gestione download PNG dal canvas
const canvas = document.getElementById("barcodeCanvas");
const linkDownload = document.getElementById("downloadBarcode");

linkDownload.addEventListener("click", function (e) {
  if (!canvas.width || !canvas.height) {
    e.preventDefault();
    alert("Genera prima il barcode cliccando su 'Genera Barcode'.");
    return;
  }

  const dataURL = canvas.toDataURL("image/png");
  linkDownload.href = dataURL;
});
