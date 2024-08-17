async function loadPasswordConfig() {
  const response = await fetch("configurazioni.json");
  return await response.json();
}

document
  .getElementById("password-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let passwordLength = password();

    if (passwordLength < 8 || passwordLength > 20) {
      document.getElementById("password-output").textContent =
        "La lunghezza della password deve essere compresa tra 8 e 20 caratteri.";
      return;
    }

    loadPasswordConfig().then((config) => {
      createPassword(passwordLength, config);
    });
  });

document
  .getElementById("generateButton")
  .addEventListener("click", function () {
    const passwordLength = password();

    if (passwordLength < 8 || passwordLength > 20) {
      document.getElementById("password-output").textContent =
        "La lunghezza della password deve essere compresa tra 8 e 20 caratteri.";
      return;
    }

    loadPasswordConfig().then((config) => {
      const randomGenerator = setInterval(() => {
        createPassword(passwordLength, config);
      }, 150);

      setTimeout(() => {
        clearInterval(randomGenerator);
        createPassword(passwordLength, config);
      }, 500);
    });
  });

const password = () => document.getElementById("password-length").value;

function createPassword(passwordLength, config) {
  let { uppercaseChars, lowercaseChars, specialChars, numericChars } = config,
password = "";
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  password += numericChars[Math.floor(Math.random() * numericChars.length)];

  for (let i = 4; i < passwordLength; i++) {
    let charType = Math.floor(Math.random() * 4);
    switch (charType) {
      case 0:
        password +=
          uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
        break;
      case 1:
        password +=
          lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
        break;
      case 2:
        password +=
          specialChars[Math.floor(Math.random() * specialChars.length)];
        break;
      case 3:
        password +=
          numericChars[Math.floor(Math.random() * numericChars.length)];
        break;
    }
  }

  document.getElementById(
    "password-output"
  ).textContent = `Password generata: ${password}`;
}
