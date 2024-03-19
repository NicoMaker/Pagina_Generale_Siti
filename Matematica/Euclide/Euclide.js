function CalcolaEuclide() {
  const numero1 = parseInt(document.getElementById("numero1").value),
    numero2 = parseInt(document.getElementById("numero2").value);

  if (isNaN(numero1) || isNaN(numero2) || numero1 <= 0 || numero2 <= 0) {
    let StampaRisultato;
    if (isNaN(numero1) && isNaN(numero2))
      StampaRisultato = "Inserisci numeri validi";
    else if (isNaN(numero1)) StampaRisultato = "Inserisci numero 1 valido";
    else if (isNaN(numero2)) StampaRisultato = "Inserisci numero 2 valido";
    else if (numero1 <= 0 && numero2 <= 0)
      StampaRisultato = "I numeri devono essere maggiori di zero";
    document.getElementById("passaggi").innerHTML = "";
    document.getElementById("risultato").innerHTML = StampaRisultato;
  } else {
    const risultato = CalcolaRisultato(numero1, numero2);
    const StampaRisultato = `MCD ---> ${risultato}`;
    document.getElementById("risultato").innerHTML = StampaRisultato;
  }
}

function CalcolaRisultato(numero1, numero2) {
  let passaggio = 0,
    resto = numero1 % numero2,
    quoziente = Math.floor(numero1 / numero2),
    stampaHTML = "";

  while (resto > 0) {
    passaggio++;
    stampaHTML += `${passaggio}) passaggio ---> ${numero1} = ${numero2} * ${quoziente} + ${resto}<br>`;
    numero1 = numero2;
    numero2 = resto;
    resto = numero1 % numero2;
    quoziente = Math.floor(numero1 / numero2);
  }

  stampaHTML += "<br>";

  const passaggiString = passaggio === 1 ? "passaggio" : "passaggi";
  stampaHTML += `Per Ricavare l'MCD sono serviti ---> ${passaggio} ${passaggiString}<br><br>`;

  document.getElementById("passaggi").innerHTML = stampaHTML;

  return numero2;
}
