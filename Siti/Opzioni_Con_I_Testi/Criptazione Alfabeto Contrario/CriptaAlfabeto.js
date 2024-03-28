function cripta() {
  let input = document.getElementById("input").value,
    result = "";

  for (let i = 0; i < input.length; i++) {
    let char = input.charAt(i);
    if (char.match(/[a-z]/i)) {
      let ascii = char.charCodeAt(0);
      if (char === char.toUpperCase())
        result += String.fromCharCode(90 - (ascii - 65));
      else result += String.fromCharCode(122 - (ascii - 97));
    } else result += char;
  }

  document.getElementById("result").textContent = "Parola criptata: " + result;
}

function decripta() {
  let input = document.getElementById("input").value,
    result = "";

  for (let i = 0; i < input.length; i++) {
    let char = input.charAt(i);
    if (char.match(/[a-z]/i)) {
      let ascii = char.charCodeAt(0);
      if (char === char.toUpperCase())
        result += String.fromCharCode(90 - (ascii - 65));
      else result += String.fromCharCode(122 - (ascii - 97));
    } else result += char;
  }

  document.getElementById("result").textContent =
    "Parola decriptata: " + result;
}
