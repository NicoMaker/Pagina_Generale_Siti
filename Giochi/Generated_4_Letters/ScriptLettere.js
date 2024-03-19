const outputs = [
  document.querySelector("#letter-display1"),
  document.querySelector("#letter-display2"),
  document.querySelector("#letter-display3"),
  document.querySelector("#letter-display4"),
];

const generate = document.querySelector("#generateButton");

const alphabets = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

function setRandom(output) {
  let randomIndex = Math.floor(Math.random() * alphabets.length);
  let alphabet = alphabets[randomIndex];
  let color = generateRandomColor();
  output.style.backgroundColor = color;
  output.innerText = alphabet;
  return alphabet;
}

function generateRandomColor() {
  let r = Math.floor(Math.random() * 106) + 150;
  let g = Math.floor(Math.random() * 106) + 150;
  let b = Math.floor(Math.random() * 106) + 150;
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

generate.addEventListener("click", function () {
  let randomGenerator = setInterval(() => {
    outputs.forEach((output) => setRandom(output));
  }, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    const alphabetsGenerated = outputs.map((output) => setRandom(output));

    if (new Set(alphabetsGenerated).size === 1) {
      document.getElementById("Result").innerHTML = "<p>Hai Vinto</p>";
    } else {
      document.getElementById("Result").innerHTML = "<p>Non Hai Vinto</p>";
    }
  }, 500);
});
