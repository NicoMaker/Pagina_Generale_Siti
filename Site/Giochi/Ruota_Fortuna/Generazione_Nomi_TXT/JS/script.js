function generaFile() {
  const numNomiInput = document.getElementById("numNomi");
  const number = parseInt(numNomiInput.value);

  // Validate the input number
  if (isNaN(number) || number < 1 || number > 100) {
    alert("Per favore, inserisci un numero tra 1 e 100.");
    return; // Stop the function if validation fails
  }

  const nomi = [];
  for (let i = 1; i <= number; i++) {
    nomi.push(`Nome${i}`);
  }

  const contenuto = nomi.join("\n");
  const blob = new Blob([contenuto], {
    type: "text/plain",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `nomi${number}.txt`;
  link.click();

  // Clean up the URL.revokeObjectURL after a short delay
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
}
