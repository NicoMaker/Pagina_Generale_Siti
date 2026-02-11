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

// Gestione stampa barcode
const btnPrint = document.getElementById("printBarcode");

btnPrint.addEventListener("click", function () {
  if (!canvas.width || !canvas.height) {
    alert("Genera prima il barcode cliccando su 'Genera Barcode'.");
    return;
  }

  const printWindow = window.open('', '_blank');
  const imgData = canvas.toDataURL("image/png");
  const codice = document.getElementById("codiceInput").value.trim();
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Stampa Barcode</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
          }
          h2 {
            margin-bottom: 10px;
            color: #1e293b;
          }
          .barcode-info {
            margin-bottom: 20px;
            color: #64748b;
            font-size: 14px;
          }
          img {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            background: white;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <h2>Barcode</h2>
        <div class="barcode-info">Codice: ${codice}</div>
        <img src="${imgData}" alt="Barcode"/>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
});