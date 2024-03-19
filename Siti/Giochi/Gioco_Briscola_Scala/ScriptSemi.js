const outputs = [
  document.querySelector("#suit1"),
  document.querySelector("#suit2"),
  document.querySelector("#suit3"),
  document.querySelector("#suit4"),
];
const generate = document.querySelector("#generateButton");
const gameTypeSelect = document.querySelector("#gameType");

let suits = [
  "https://ih1.redbubble.net/image.3006511618.8602/st,small,507x507-pad,600x600,f8f8f8.jpg",
  "https://ih1.redbubble.net/image.1648092438.5340/st,small,507x507-pad,600x600,f8f8f8.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUvEjPGRmsR8oKNgLqynsIOa2ykLTB-IVZGQ5GtqHT1g&s",
  "https://ih1.redbubble.net/image.1112458171.9010/st,small,845x845-pad,1000x1000,f8f8f8.jpg",
];

gameTypeSelect.addEventListener("change", function () {
  if (gameTypeSelect.value === "briscola") {
    suits = [
      "https://ih1.redbubble.net/image.3006511618.8602/st,small,507x507-pad,600x600,f8f8f8.jpg",
      "https://ih1.redbubble.net/image.1648092438.5340/st,small,507x507-pad,600x600,f8f8f8.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUvEjPGRmsR8oKNgLqynsIOa2ykLTB-IVZGQ5GtqHT1g&s",
      "https://ih1.redbubble.net/image.1112458171.9010/st,small,845x845-pad,1000x1000,f8f8f8.jpg",
    ];
  } else if (gameTypeSelect.value === "scala40") {
    suits = [
      "https://img.freepik.com/free-vector/spade-playing-card-symbol_1308-80063.jpg",
      "https://www.chipotlescreazioni.it/3411/ciondolo-seme-di-quadri-carte-da-poker-40x36-mm-plexiglass-rosso.jpg",
      "https://keyplayingcards.com/img/cms/carte-cuori.png",
      "https://keyplayingcards.com/img/cms/blog%20mazzi/1200px-SuitClubs-svg.png",
    ];
  } else {
    suits = suits.concat([
      "https://img.freepik.com/free-vector/spade-playing-card-symbol_1308-80063.jpg",
      "https://www.chipotlescreazioni.it/3411/ciondolo-seme-di-quadri-carte-da-poker-40x36-mm-plexiglass-rosso.jpg",
      "https://keyplayingcards.com/img/cms/carte-cuori.png",
      "https://keyplayingcards.com/img/cms/blog%20mazzi/1200px-SuitClubs-svg.png",
    ]);
  }
});

function setRandomImage(container) {
  let random = Math.floor(Math.random() * suits.length);
  let suitURL = suits[random];
  container.innerHTML = `<img src="${suitURL}" alt="Suit">`;
}

generate.addEventListener("click", function () {
  let randomGenerator = setInterval(() => {
    outputs.forEach((output) => setRandomImage(output));
  }, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    const suitImages = outputs.map((output) => output.querySelector("img").src);
    const allEqual = suitImages.every((val, i, arr) => val === arr[0]);
    document.getElementById("Result").innerHTML = `<p>${
      allEqual ? "Hai Vinto" : "Non Hai Vinto"
    }</p>`;
  }, 500);
});
