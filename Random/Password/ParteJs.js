document
  .getElementById("password-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    

    let passwordLength = password();

    if (passwordLength < 8 || passwordLength > 20) {
      alert(
        "La lunghezza della password deve essere compresa tra 8 e 20 caratteri."
      );
      return;
    }
    createpassword(passwordLength);
  });


const password = () => document.getElementById("password-length").value;

function createpassword(passwordLength) {
  let uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  let specialChars = "!@#$%^&*()";
  let numericChars = "0123456789";

  let password = "";
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

  document.getElementById("password-output").textContent =
    `Password generata: ${password}`;
}
