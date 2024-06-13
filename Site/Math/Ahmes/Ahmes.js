function CalcolaAhmes() {
  const numero1 = parseFloat(document.getElementById("numero1").value),
    numero2 = parseFloat(document.getElementById("numero2").value);

  if (isNaN(numero1) || isNaN(numero2)) {
    const errorMessage =
      isNaN(numero1) && isNaN(numero2)
        ? "Inserisci numero 1 e numero 2 validi"
        : isNaN(numero1)
        ? "Inserisci numero 1 valido"
        : "Inserisci numero 2 valido";

    {
      document.getElementById("passaggi").innerHTML = "";
      document.getElementById("risultato").innerHTML = "";
    }
    displayResult(errorMessage);
  } else {
    const risultato = CalcolaRisultato(numero1, numero2);
    document.getElementById(
      "risultato"
    ).innerHTML = `Il risultato finale è ${risultato}`;
  }
}

function CalcolaRisultato(numero1, numero2) {
  let resto = 0,
    passaggio = 0,
    StampaHtml = "";

  while (numero1 > 0) {
    passaggio++;

    if (numero1 % 2 === 0) {
      StampaHtml += `${passaggio}) passaggio visto che ${numero1} è pari allora --> (${numero1} / 2) + (2 * ${numero2})`;
      numero1 /= 2;
      numero2 *= 2;
    } else {
      const incremento = resto === 0 ? "" : ` + ${resto}`;
      StampaHtml += `${passaggio}) passaggio visto che ${numero1} è dispari allora --> (${numero1} - 1) + ${numero2}${incremento}`;
      numero1--;
      resto += numero2;
    }

    StampaHtml += "<br>";
  }

  const risultato = resto;

  StampaHtml += "<br>";

  const passaggiString = passaggio === 1 ? "passaggio" : "passaggi";
  StampaHtml += `il calcolo è stato fatto in ${passaggio} ${passaggiString}<br><br>`;

  document.getElementById("passaggi").innerHTML = StampaHtml;

  return risultato;
}
