function invertiFrase() {
  const input = document.getElementById("input").value;
  document.getElementById("output").innerHTML =
    input === ""
      ? `<p class="viola">Inserisci una frase valida</p>`
      : `<p>la frase ${input} è diventata : ${input
          .split("")
          .reverse()
          .join("")}</p>`;
}