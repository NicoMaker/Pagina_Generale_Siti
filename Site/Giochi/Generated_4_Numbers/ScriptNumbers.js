const outputs = [
    document.querySelector("#number-display1"),
    document.querySelector("#number-display2"),
    document.querySelector("#number-display3"),
    document.querySelector("#number-display4"),
  ],
  generate = document.querySelector("#generateButton"),
  numbersArray = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function setRandom(output) {
  let randomIndex = Math.floor(Math.random() * numbersArray.length),
    number = numbersArray[randomIndex],
    color = generateRandomColor();
  output.style.backgroundColor = color;
  output.innerText = number;
  return number;
}

function generateRandomColor() {
  let r = Math.floor(Math.random() * 106) + 150,
    g = Math.floor(Math.random() * 106) + 150,
    b = Math.floor(Math.random() * 106) + 150;
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

generate.addEventListener("click", function () {
  let randomGenerator = setInterval(() => {
    outputs.forEach((output) => setRandom(output));
  }, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    const numbersGenerated = outputs.map((output) => setRandom(output));

    if (new Set(numbersGenerated).size === 1)
      document.getElementById("Result").innerHTML = "<p>Hai Vinto</p>";
    else document.getElementById("Result").innerHTML = "<p>Non Hai Vinto</p>";
  }, 500);
});
