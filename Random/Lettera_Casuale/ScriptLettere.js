const output = document.querySelector("#letter-display");
const body = document.body;
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

function setRandom() {
  let random = Math.floor(Math.random() * alphabets.length);
  let alphabet = alphabets[random];
  let color = generateRandomColor();

  body.style.backgroundColor = color;

  output.innerText = alphabet;
}

function generateRandomColor() {
  let r = Math.floor(Math.random() * 106) + 150;
  let g = Math.floor(Math.random() * 106) + 150;
  let b = Math.floor(Math.random() * 106) + 150;

  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

generate.addEventListener("click", function () {
  let randomGenerator = setInterval(() => {
    setRandom();
  }, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    setRandom();
  }, 500);
});
