function convert() {
  const amount = document.getElementById("amount").value,
    from = document.getElementById("from").value,
    to = document.getElementById("to").value;

  fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
    .then((response) => response.json())
    .then((data) => {
      const rate = data.rates[to];
      const convertedAmount = (amount * rate).toFixed(2);
      document.getElementById(
        "result"
      ).innerText = `${amount} ${from} = ${convertedAmount} ${to}`;
    })
    .catch((error) => {
      console.log(error);
      document.getElementById("result").innerText =
        "Si è verificato un errore nella conversione.";
    });
}