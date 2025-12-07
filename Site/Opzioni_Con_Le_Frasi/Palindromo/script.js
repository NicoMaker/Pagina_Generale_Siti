function controllaPalindromo() {
  const inputElement = document.getElementById("parolaInput");
  const risultatoElement = document.getElementById("risultato");
  const buttonElement = document.querySelector("button");
  let parola = inputElement.value.trim();

  buttonElement.disabled = true;
  buttonElement.textContent = "Verifica...";

  risultatoElement.className = "";
  risultatoElement.textContent = "";

  setTimeout(() => {
    const parolaPulita = parola.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (parolaPulita.length === 0) {
      risultatoElement.textContent = "⚠️ Inserisci una parola o frase valida!";
      risultatoElement.classList.add("risultato-attenzione");
    } else {
      const parolaInvertita = parolaPulita.split("").reverse().join("");

      if (parolaPulita === parolaInvertita) {
        risultatoElement.textContent = `✅ "${parola}" è un Palindromo!`;
        risultatoElement.classList.add("risultato-positivo");
      } else {
        risultatoElement.textContent = `❌ "${parola}" NON è un Palindromo. La sua inversa è: "${parolaInvertita}"`;
        risultatoElement.classList.add("risultato-negativo");
      }
    }

    buttonElement.disabled = false;
    buttonElement.textContent = "Controlla";
  }, 300);
}

document
  .getElementById("parolaInput")
  .addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      controllaPalindromo();
    }
  });
