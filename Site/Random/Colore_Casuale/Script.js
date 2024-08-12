async function loadColors() {
  const response = await fetch("colors.json"),
    data = await response.json();
  return data.colors;
}

function generateColor() {
  document.getElementById("image").style.display = "none";
  loadColors().then((colors) => printColor(colors));
}

function printColor(colors) {
  let color = document.getElementById("color");
  color.style.display = "block";

  const randomGenerator = setInterval(function () {
    color.style.backgroundColor = randomColor(colors);
  }, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    color.style.backgroundColor = randomColor(colors);
  }, 500);
}

const randomColor = (colors) =>
  colors[Math.floor(Math.random() * colors.length)];

document
  .getElementById("generateButton")
  .addEventListener("click", generateColor);
