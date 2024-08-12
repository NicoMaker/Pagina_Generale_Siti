async function loadAlphabets() {
  const response = await fetch("letters.json"),
    data = await response.json();
  return data.alphabets;
}

function setRandom(alphabets) {
  let random = Math.floor(Math.random() * alphabets.length),
    alphabet = alphabets[random],
    color = generateRandomColor();

  document.body.style.backgroundColor = color;
  document.querySelector("#letter-display").innerText = alphabet;
}

function generateRandomColor() {
  let r = Math.floor(Math.random() * 106) + 150,
    g = Math.floor(Math.random() * 106) + 150,
    b = Math.floor(Math.random() * 106) + 150;

  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

document
  .querySelector("#generateButton")
  .addEventListener("click", function () {
    loadAlphabets().then((alphabets) => {
      let randomGenerator = setInterval(() => {
        setRandom(alphabets);
      }, 150);

      setTimeout(() => {
        clearInterval(randomGenerator);
        setRandom(alphabets);
      }, 500);
    });
  });
