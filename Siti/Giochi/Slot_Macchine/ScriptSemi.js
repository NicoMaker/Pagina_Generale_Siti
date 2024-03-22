const outputs = [
  document.querySelector("#suit1"),
  document.querySelector("#suit2"),
  document.querySelector("#suit3"),
  document.querySelector("#suit4"),
],generate = document.querySelector("#generateButton"),
  gameTypeSelect = document.querySelector("#gameType");

let suits = [
  "Immagini/Briscola/Bastoni.png",
  "Immagini/Briscola/Coppe.png",
  "Immagini/Briscola/Denari.png",
  "Immagini/Briscola/Spade.png",
];

gameTypeSelect.addEventListener("change", function () {
  if (gameTypeSelect.value === "briscola")
    suits = [
      "Immagini/Briscola/Bastoni.png",
      "Immagini/Briscola/Coppe.png",
      "Immagini/Briscola/Denari.png",
      "Immagini/Briscola/Spade.png",
    ];
  else if (gameTypeSelect.value === "scala40")
    suits = [
      "Immagini/Scala 40/Picche.png",
      "Immagini/Scala 40/Quadri.png",
      "Immagini/Scala 40/Cuori.png",
      "Immagini/Scala 40/Fiori.png",
    ];
  else
    suits = suits.concat([
      "Immagini/Scala 40/Picche.png",
      "Immagini/Scala 40/Quadri.png",
      "Immagini/Scala 40/Cuori.png",
      "Immagini/Scala 40/Fiori.png",
    ]);
});

function setRandomImage(container) {
  let random = Math.floor(Math.random() * suits.length),
    suitURL = suits[random];
  container.innerHTML = `<img src="${suitURL}" alt="Suit">`;
}

generate.addEventListener("click", function () {
  let randomGenerator = setInterval(() => {
    outputs.forEach((output) => setRandomImage(output));
  }, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    const suitImages = outputs.map((output) => output.querySelector("img").src),
      allEqual = suitImages.every((val, i, arr) => val === arr[0]);
    document.getElementById("Result").innerHTML = `<p>${
      allEqual ? "Hai Vinto" : "Non Hai Vinto"
    }</p>`;
  }, 500);
});
