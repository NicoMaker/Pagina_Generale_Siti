function invertiFrase() {
  const input = document.getElementById("input").value,
    output = input
      .split(" ")
      .map((word) => word.split("").reverse().join(""))
      .join(" ");
  document.getElementById("output").innerHTML =
    input === ""
      ? `<p class="viola">Inserisci una frase valida</p>`
      : `<p>La frase "${input}" è diventata: "${output}"</p>`;
}