function generateTriangle() {
  const numberInput = document.getElementById("number"),
    number = parseInt(numberInput.value);

  if (isNaN(number) || number < 1) {
    alert("Per favore inserisci un numero intero positivo valido.");
    return;
  }

  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";

  let prevRow = [];
  for (let i = 0; i < number; i++) {
    const row = [];

    for (let j = 0; j <= i; j++) {
      if (j === 0 || j === i) row.push(1);
      else row.push(prevRow[j - 1] + prevRow[j]);
    }

    const rowDiv = document.createElement("div");
    rowDiv.classList.add("triangle-row");
    outputDiv.appendChild(rowDiv);

    row.forEach((value) => {
      const numberDiv = document.createElement("div");
      numberDiv.classList.add("triangle-number");
      if (value > 99) {
        numberDiv.classList.add("small");
      }
      const numberSpan = document.createElement("span");
      numberSpan.innerText = value;
      numberDiv.appendChild(numberSpan);
      rowDiv.appendChild(numberDiv);
    });

    prevRow = row;
  }
}