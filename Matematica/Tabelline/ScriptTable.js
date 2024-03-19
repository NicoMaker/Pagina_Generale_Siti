function generaTabellina() {
  let num = insertnum();
  let min = insertmin();
  let max = insertmax();

  // Inverti i valori min e max se min > max
  if (min > max) {
    let temp = min;
    min = max;
    max = temp;
  }

  stampatable(num, min, max);
}

let insertnum = () => parseInt(document.getElementById("num").value);
let insertmin = () => parseInt(document.getElementById("min").value);
let insertmax = () => parseInt(document.getElementById("max").value);

function stampatable(num, min, max) {
  let tabellinaHTML =
      " <table> <tr><th> Numero </th> <th>Moltiplicatore</th><th>Risultato</th></tr>",
    sum = 0;
  for (let i = min; i <= max; i++) {
    let risultato = num * i;
    tabellinaHTML += `<tr> <td>
      ${num}
      </td>
      <td>
      ${i}
      </td><td>
      ${risultato}
      </td></tr>`;

    sum++;
  }

  tabellinaHTML += `</table>
  <p>${
    sum == 1
      ? `è stata fatta ${sum} operazione`
      : `sono state fatte ${sum} operazioni`
  }
  </p>`;

  document.getElementById("tabellina").innerHTML = tabellinaHTML;
}
