const outputs = [
    document.querySelector("#suit1"),
    document.querySelector("#suit2"),
    document.querySelector("#suit3"),
    document.querySelector("#suit4"),
  ],
  generate = document.querySelector("#generateButton"),
  gameTypeSelect = document.querySelector("#gameType");

let suits = [];

async function loadCards() {
  const response = await fetch("cards.json"),
    data = await response.json();
  return data;
}

let cardsData;

loadCards().then((data) => {
  cardsData = data;
  suits = cardsData.briscola;
});

gameTypeSelect.addEventListener("change", function () {
  if (gameTypeSelect.value === "briscola") 
    suits = cardsData.briscola;
  else if (gameTypeSelect.value === "scala40")
    suits = cardsData.scala40;
  else
    suits = cardsData.briscola.concat(cardsData.scala40);
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
