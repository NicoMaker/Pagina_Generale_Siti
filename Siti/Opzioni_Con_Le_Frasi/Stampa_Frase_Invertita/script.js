function invertiFrase() {
  const input = document.getElementById("input").value,
    output = document.getElementById("output");

  output.innerHTML =
    input === ""
      ? `<p class="viola">Inserisci una frase valida</p>`
      : `<p>${input.split("").reverse().join("")}</p>`;
}