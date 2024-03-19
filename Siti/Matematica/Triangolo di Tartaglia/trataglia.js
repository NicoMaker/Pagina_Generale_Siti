function generateTriangle() {
  let numberInput = document.getElementById("number"),
    number = parseInt(numberInput.value);

  if (isNaN(number) || number < 1) {
    alert("Per favore inserisci un numero intero positivo valido.");
    return;
  }

  let triangle = [];
  for (let i = 0; i < number; i++) {
    triangle[i] = [];
    triangle[i][0] = 1;
    for (let j = 1; j < i; j++) {
      triangle[i][j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
    }
    triangle[i][i] = 1;
  }

  let outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";

  let maxNumber = Math.max(...triangle.flat());

  for (let i = 0; i < number; i++) {
    let rowDiv = document.createElement("div");
    rowDiv.classList.add("triangle-row");

    for (let j = 0; j <= i; j++) {
      let numberDiv = document.createElement("div");
      numberDiv.classList.add("triangle-number");

      if (triangle[i][j] > 99) {
        numberDiv.classList.add("small");
      }

      let numberSpan = document.createElement("span");
      numberSpan.innerText = triangle[i][j];

      numberDiv.appendChild(numberSpan);
      rowDiv.appendChild(numberDiv);
    }
    outputDiv.appendChild(rowDiv);
  }
}
