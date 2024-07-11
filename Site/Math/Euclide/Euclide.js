function CalcolaEuclide() {
  const numero1 = parseInt(document.getElementById("numero1").value),
    numero2 = parseInt(document.getElementById("numero2").value);
  Condizioni(numero1, numero2);
}

function Condizioni(numero1, numero2) {
  let StampaRisultato = "";

  if (isNaN(numero1) || isNaN(numero2) || numero1 <= 0 || numero2 <= 0) {
    if (isNaN(numero1) && isNaN(numero2))
      StampaRisultato = "Inserisci numeri validi";
    else if (isNaN(numero1)) StampaRisultato = "Inserisci numero 1 valido";
    else if (isNaN(numero2)) StampaRisultato = "Inserisci numero 2 valido";
    else if (numero1 <= 0 && numero2 <= 0)
      StampaRisultato = "I numeri devono essere maggiori di zero";
    else if (numero1 <= 0)
      StampaRisultato = "Il numero 1 deve essere maggiore di zero";
    else if (numero2 <= 0)
      StampaRisultato = "Il numero 2 deve essere maggiore di zero";
  } else {
    const risultato = CalcolaRisultato(numero1, numero2);
    StampaRisultato = `MCD ---> ${risultato}`;
  }

  document.getElementById("passaggi").innerHTML =
    isNaN(numero1) || isNaN(numero2) || numero1 <= 0 || numero2 <= 0
      ? ""
      : document.getElementById("passaggi").innerHTML;
  document.getElementById("risultato").innerHTML = StampaRisultato;
}

function CalcolaRisultato(numero1, numero2) {
  let passaggi = [],
    passaggio = 0,
    resto = numero1 % numero2,
    quoziente = Math.floor(numero1 / numero2);

  while (resto > 0) {
    passaggio++;
    passaggi.push(
      `${passaggio}) passaggio ---> ${numero1} = ${numero2} * ${quoziente} + ${resto}`
    );
    numero1 = numero2;
    numero2 = resto;
    resto = numero1 % numero2;
    quoziente = Math.floor(numero1 / numero2);
  }

  passaggi.push(
    `Per Ricavare l'MCD sono serviti ---> ${passaggio} ${
      passaggio === 1 ? "passaggio" : "passaggi"
    }`
  );
  document.getElementById("passaggi").innerHTML = passaggi.join("<br>");

  return numero2;
}