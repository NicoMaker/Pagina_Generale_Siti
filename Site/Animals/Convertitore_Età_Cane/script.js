function convertAge() {
  const years = parseInt(document.getElementById("years").value) || 0;
  const months = parseInt(document.getElementById("months").value) || 0;
  const days = parseInt(document.getElementById("days").value) || 0;

  const resultDiv = document.getElementById("result");
  const funFactDiv = document.getElementById("funFact");
  const humanAgeSpan = document.getElementById("humanAge");
  const factTextSpan = document.getElementById("factText");

  const totalDays = years * 365 + months * 30 + days;
  if (totalDays <= 0) {
    showAlert();
    return;
  }

  const ageInMonths = Math.round(totalDays / 30);
  let humanAge;

  if (ageInMonths <= 12) {
    humanAge = Math.round((ageInMonths / 12) * 15);
  } else if (ageInMonths <= 24) {
    humanAge = 24;
  } else {
    const yearsAfterTwo = (ageInMonths - 24) / 12;
    humanAge = Math.round(24 + yearsAfterTwo * 5);
  }

  humanAgeSpan.textContent = humanAge;
  resultDiv.classList.add("show");

  let funFact;
  if (humanAge < 15) {
    funFact = "I cuccioli apprendono in fretta! ";
  } else if (humanAge < 30) {
    funFact = "I cani giovani sono curiosi e pieni di energia!";
  } else if (humanAge < 50) {
    funFact = "Nel pieno della loro forma, i cani adulti sono compagni ideali!";
  } else {
    funFact = "I cani senior meritano coccole e attenzione extra ❤️";
  }

  factTextSpan.textContent = funFact;
  setTimeout(() => {
    funFactDiv.style.opacity = "1";
    funFactDiv.style.transform = "translateY(0)";
  }, 400);

  humanAgeSpan.style.transform = "scale(1.1)";
  setTimeout(() => {
    humanAgeSpan.style.transform = "scale(1)";
  }, 300);
}

const showAlert = () =>
  (document.getElementById("customAlert").style.display = "flex");
const closeAlert = () =>
  (document.getElementById("customAlert").style.display = "none");
