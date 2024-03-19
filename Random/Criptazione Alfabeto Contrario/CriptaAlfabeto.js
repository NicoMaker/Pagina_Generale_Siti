function cripta() {
    var input = document.getElementById("input").value;
    var result = "";

    for (var i = 0; i < input.length; i++) {
      var char = input.charAt(i);
      if (char.match(/[a-z]/i)) {
        var ascii = char.charCodeAt(0);
        if (char === char.toUpperCase()) {
          result += String.fromCharCode(90 - (ascii - 65));
        } else {
          result += String.fromCharCode(122 - (ascii - 97));
        }
      } else {
        result += char;
      }
    }

    document.getElementById("result").textContent = "Parola criptata: " + result;
  }

  function decripta() {
    var input = document.getElementById("input").value;
    var result = "";

    for (var i = 0; i < input.length; i++) {
      var char = input.charAt(i);
      if (char.match(/[a-z]/i)) {
        var ascii = char.charCodeAt(0);
        if (char === char.toUpperCase()) {
          result += String.fromCharCode(90 - (ascii - 65));
        } else {
          result += String.fromCharCode(122 - (ascii - 97));
        }
      } else {
        result += char;
      }
    }

    document.getElementById("result").textContent = "Parola decriptata: " + result;
  }