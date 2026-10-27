const MAX_VALUE = 1e12;
const nf = new Intl.NumberFormat("it-IT");

const $ = (selector) => document.querySelector(selector);

const form = $("#prime-form");
const input = $("#number");
const result = $("#result");
const badge = $("#result-badge");
const resultNumber = $("#result-number");
const resultText = $("#result-text");
const factorizationBox = $("#factorization");
const factorizationValue = $("#factorization-value");
const divisorsBox = $("#divisors");
const divisorsList = $("#divisors-list");

$("#year").textContent = new Date().getFullYear();

/* ---------- Matematica ---------- */

/** Test di primalità per tentativi (6k ± 1). */
function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/** Restituisce tutti i divisori di n in ordine crescente. */
function getDivisors(n) {
  const small = [];
  const large = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i !== 0) continue;
    small.push(i);
    if (i !== n / i) large.push(n / i);
  }
  return [...small, ...large.reverse()];
}

/** Scomposizione in fattori primi: Map(primo → esponente). */
function factorize(n) {
  const factors = new Map();
  for (let p = 2; p * p <= n; p += p === 2 ? 1 : 2) {
    while (n % p === 0) {
      factors.set(p, (factors.get(p) ?? 0) + 1);
      n /= p;
    }
  }
  if (n > 1) factors.set(n, (factors.get(n) ?? 0) + 1);
  return factors;
}

/* ---------- Rendering ---------- */

const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const toSuperscript = (num) =>
  [...String(num)].map((d) => SUPERSCRIPTS[Number(d)]).join("");

function formatFactorization(factors) {
  return [...factors]
    .map(([p, e]) => nf.format(p) + (e > 1 ? toSuperscript(e) : ""))
    .join(" × ");
}

function showResult({ state, label, number = "", text }) {
  badge.textContent = label;
  badge.dataset.state = state;
  resultNumber.textContent = number;
  resultText.textContent = text;
  factorizationBox.hidden = true;
  divisorsBox.hidden = true;

  // Riavvia l'animazione di comparsa
  result.hidden = false;
  result.style.animation = "none";
  void result.offsetWidth;
  result.style.animation = "";
}

function showError(message) {
  showResult({ state: "error", label: "Errore", text: message });
}

function renderDivisors(divisors) {
  divisorsList.replaceChildren(
    ...divisors.map((divisor, index) => {
      const li = document.createElement("li");
      li.className = "chip";
      li.style.setProperty("--i", index);
      li.classList.toggle("is-prime", isPrime(divisor));
      li.textContent = nf.format(divisor);
      return li;
    }),
  );
  divisorsBox.hidden = false;
}

function checkPrime() {
  const raw = input.value.trim();
  const number = Number(raw);

  if (raw === "" || !Number.isFinite(number)) {
    return showError("Inserisci un numero valido.");
  }
  if (!Number.isInteger(number)) {
    return showError("Inserisci un numero intero.");
  }
  if (number < 2) {
    return showError("Il numero deve essere maggiore di 1.");
  }
  if (number > MAX_VALUE) {
    return showError(
      `Per ora gestisco numeri fino a ${nf.format(MAX_VALUE)}.`,
    );
  }

  const divisors = getDivisors(number);
  const prime = divisors.length === 2;

  showResult({
    state: prime ? "prime" : "composite",
    label: prime ? "Primo" : "Composto",
    number: nf.format(number),
    text: prime
      ? `${nf.format(number)} è un numero primo! È divisibile solo per 1 e per se stesso.`
      : `${nf.format(number)} non è un numero primo. Ha ${divisors.length} divisori.`,
  });

  if (!prime) {
    factorizationValue.textContent = formatFactorization(factorize(number));
    factorizationBox.hidden = false;
  }
  renderDivisors(divisors);
}

/* ---------- Eventi ---------- */

form.addEventListener("submit", (event) => {
  event.preventDefault();
  checkPrime();
});

// Esempi: delegazione degli eventi, niente onclick inline
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-example]");
  if (!button) return;

  input.value = button.dataset.example;
  input.classList.remove("flash");
  void input.offsetWidth;
  input.classList.add("flash");
  input.addEventListener("animationend", () => input.classList.remove("flash"), {
    once: true,
  });

  checkPrime();
});