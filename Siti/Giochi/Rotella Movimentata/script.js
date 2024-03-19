document
  .getElementById("settingsForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const selectedColor = document.getElementById("color").value,
      selectedSpeed = document.getElementById("speed").value,
      wheel = document.querySelector(".wheel");
    wheel.style.backgroundColor = selectedColor;
    wheel.style.animationDuration = selectedSpeed + "s";
  });
