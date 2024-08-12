const outputs = [
    document.querySelector("#letter-display1"),
    document.querySelector("#letter-display2"),
    document.querySelector("#letter-display3"),
    document.querySelector("#letter-display4"),
  ],
  generate = document.querySelector("#generateButton");

let alphabets = [];

fetch("alfabeto.json")
  .then((response) => response.json())
  .then((data) => {
    alphabets = data.letters;
  });

function setRandom(output) {
  let randomIndex = Math.floor(Math.random() * alphabets.length),
    alphabet = alphabets[randomIndex],
    color = generateRandomColor();
  output.style.backgroundColor = color;
  output.innerText = alphabet;
  return alphabet;
}

function generateRandomColor() {
  let r = Math.floor(Math.random() * 106) + 150,
    g = Math.floor(Math.random() * 106) + 150,
    b = Math.floor(Math.random() * 106) + 150;
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}${b.toString(
    16
  )}`;
}

generate.addEventListener("click", function () {
  let randomGenerator = setInterval(() => {
    outputs.forEach((output) => setRandom(output));
  }, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    const alphabetsGenerated = outputs.map((output) => setRandom(output));

    if (new Set(alphabetsGenerated).size === 1)
      document.getElementById("Result").innerHTML = "<p>Hai Vinto</p>";
    else document.getElementById("Result").innerHTML = "<p>Non Hai Vinto</p>";
  }, 500);
});
