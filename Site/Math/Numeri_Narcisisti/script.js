(function () {
  const MAX_LEN = 60;
  const MIN_LEN = 2; // Escludiamo i numeri a 1 cifra

  // precalcolo potenze
  const powers = Array(10);
  for (let d = 0; d <= 9; d++) {
    powers[d] = Array(MAX_LEN + 1);
    for (let n = 0; n <= MAX_LEN; n++) {
      if (n === 0) powers[d][n] = 1n;
      else powers[d][n] = powers[d][n - 1] * BigInt(d);
    }
  }

  function sumFromCounts(counts, L) {
    let total = 0n;
    for (let d = 0; d <= 9; d++) {
      if (counts[d] === 0) continue;
      total += BigInt(counts[d]) * powers[d][L];
    }
    return total;
  }

  function getDigitCountsFromNumber(numBig, L) {
    let numStr = numBig.toString();
    if (numStr.length !== L) return null;
    const counts = Array(10).fill(0);
    for (let i = 0; i < numStr.length; i++) {
      const digit = parseInt(numStr[i], 10);
      counts[digit]++;
    }
    return counts;
  }

  function checkCombination(counts, L) {
    if (L > 1) {
      let hasNonZero = false;
      for (let d = 1; d <= 9; d++)
        if (counts[d] > 0) {
          hasNonZero = true;
          break;
        }
      if (!hasNonZero) return null;
    }

    const sumBig = sumFromCounts(counts, L);
    const sumStr = sumBig.toString();
    if (sumStr.length !== L) return null;

    const sumCounts = getDigitCountsFromNumber(sumBig, L);
    if (!sumCounts) return null;

    for (let i = 0; i <= 9; i++) {
      if (sumCounts[i] !== counts[i]) return null;
    }
    return sumBig;
  }

  function getBounds(L) {
    let lower = 10n ** BigInt(L - 1);
    let upper = 10n ** BigInt(L) - 1n;
    return { lower, upper };
  }

  function findNarcissisticNumbersByLength(L) {
    if (L < MIN_LEN || L > MAX_LEN) return [];

    const results = [];
    const initialCounts = Array(10).fill(0);
    const { lower, upper } = getBounds(L);

    function backtrack(digitIdx, remaining, currentCounts, currentSum) {
      if (remaining === 0) {
        const num = checkCombination(currentCounts, L);
        if (num !== null) results.push(num);
        return;
      }
      if (digitIdx > 9) return;

      let minFuture = 0n;
      for (let i = 0; i < remaining; i++) minFuture += powers[digitIdx][L];
      let maxFuture = 0n;
      for (let i = 0; i < remaining; i++) maxFuture += powers[9][L];

      if (currentSum + minFuture > upper) return;
      if (currentSum + maxFuture < lower) return;

      for (let cnt = 0; cnt <= remaining; cnt++) {
        currentCounts[digitIdx] = cnt;
        let addSum = powers[digitIdx][L] * BigInt(cnt);
        let newSum = currentSum + addSum;
        if (newSum > upper) break;

        let futureMinRest = 0n;
        if (digitIdx + 1 <= 9) {
          for (let r = 0; r < remaining - cnt; r++)
            futureMinRest += powers[digitIdx + 1][L];
        }
        if (newSum + futureMinRest > upper) {
          continue;
        }
        backtrack(digitIdx + 1, remaining - cnt, currentCounts, newSum);
      }
      currentCounts[digitIdx] = 0;
    }

    backtrack(0, L, initialCounts, 0n);

    const uniqueMap = new Map();
    for (let num of results) {
      uniqueMap.set(num.toString(), num);
    }
    return Array.from(uniqueMap.values()).sort((a, b) =>
      a < b ? -1 : a > b ? 1 : 0,
    );
  }

  function buildDetailedDemonstration(numBig, L) {
    const numStr = numBig.toString();
    const digits = numStr.split("").map((ch) => parseInt(ch, 10));
    const powerValues = digits.map((d) => powers[d][L]);
    const powerTerms = digits.map((d) => `${d}<sup>${L}</sup>`);
    const powerValuesStr = powerValues.map((v) => v.toString());
    const totalSum = powerValues.reduce((acc, val) => acc + val, 0n);

    return {
      numberStr: numStr,
      length: L,
      formulaWithPowers: powerTerms.join(" + "),
      valuesWithNumbers: powerValuesStr.join(" + "),
      totalSum: totalSum.toString(),
    };
  }

  const lengthInput = document.getElementById("lengthInput");
  const searchBtn = document.getElementById("searchBtn");
  const narcContainer = document.getElementById("narcListContainer");
  const statsTextSpan = document.getElementById("statsText");
  const timeBadge = document.getElementById("timeBadge");
  const timeElapsedSpan = document.getElementById("timeElapsed");

  function setLoading(isLoading, lengthVal) {
    if (isLoading) {
      narcContainer.innerHTML = `<div class="loading-message">
                        <div style="font-size:2rem;">⏳</div>
                        <p>Ricerca in corso per lunghezza ${lengthVal} ...</p>
                    </div>`;
      statsTextSpan.innerHTML = `🔬 Ricerca in corso per L = ${lengthVal} ...`;
      timeBadge.style.display = "none";
    }
  }

  function pluralize(count, singolare, plurale) {
    return count === 1 ? singolare : plurale;
  }

  function renderResults(length, numbersBig, elapsedMs) {
    if (!numbersBig || numbersBig.length === 0) {
      narcContainer.innerHTML = `<div class="empty-message">
                        😢 Nessun numero narcisista trovato con ESATTAMENTE ${length} cifre.<br>
                        <span style="font-size:0.8rem;">(range: 10^${length - 1} a 10^${length}-1)</span>
                    </div>`;
      statsTextSpan.innerHTML = `📊 Lunghezza ${length} → 0 numeri narcisisti.`;
      timeBadge.style.display = "flex";
      timeElapsedSpan.innerHTML = `${elapsedMs} ms`;
      return;
    }

    const count = numbersBig.length;
    const cardsHTML = [];
    for (let numBig of numbersBig) {
      const demo = buildDetailedDemonstration(numBig, length);
      cardsHTML.push(`
                        <div class="narc-demo-card">
                            <div class="narc-number">
                                🔢 ${demo.numberStr}
                                <span class="badge-length">${demo.length} cifre</span>
                            </div>
                            <div class="equation-full">
                                <div class="demo-step">
                                    📐 <strong>1️⃣ Elevazione a potenza:</strong><br>
                                    <span class="demo-powers">${demo.formulaWithPowers}</span>
                                </div>
                                <div class="demo-step">
                                    🧮 <strong>2️⃣ Calcolo dei valori:</strong><br>
                                    <span class="demo-powers">${demo.valuesWithNumbers}</span>
                                </div>
                                <div class="demo-step">
                                    ➕ <strong>3️⃣ Somma delle potenze:</strong><br>
                                    <span class="demo-sum">${demo.valuesWithNumbers} = ${demo.totalSum}</span>
                                </div>
                                <div class="demo-verdict">
                                    ✅ <strong>Verifica finale:</strong> ${demo.numberStr} = ${demo.totalSum}<br>
                                    <span style="color:#7affb9;">✓ NUMERO NARCISISTA ✓</span>
                                </div>
                            </div>
                        </div>
                    `);
    }

    narcContainer.innerHTML = cardsHTML.join("");
    statsTextSpan.innerHTML = `🎯 Trovati ${count} ${count === 1 ? "numero" : "numeri"} narcisista${count === 1 ? "" : "i"} con esattamente ${length} cifre.`;
    timeBadge.style.display = "flex";
    timeElapsedSpan.innerHTML = `${elapsedMs} ms`;
  }

  async function performSearch() {
    let raw = lengthInput.value.trim();
    if (raw === "") {
      narcContainer.innerHTML = `<div class="error-message">⚠️ Inserisci una lunghezza valida (2-60).</div>`;
      statsTextSpan.innerHTML = `⚠️ Input vuoto`;
      timeBadge.style.display = "none";
      return;
    }
    const L = parseInt(raw, 10);
    if (isNaN(L) || !Number.isInteger(L) || L < MIN_LEN || L > MAX_LEN) {
      narcContainer.innerHTML = `<div class="error-message">❌ Lunghezza non valida! Inserisci un intero da ${MIN_LEN} a ${MAX_LEN}.</div>`;
      statsTextSpan.innerHTML = `🔴 Errore: range consentito ${MIN_LEN}-${MAX_LEN}`;
      timeBadge.style.display = "none";
      return;
    }

    setLoading(true, L);
    await new Promise((r) => setTimeout(r, 20));

    const startTime = performance.now();
    try {
      const results = findNarcissisticNumbersByLength(L);
      const endTime = performance.now();
      const elapsed = (endTime - startTime).toFixed(1);
      renderResults(L, results, elapsed);
    } catch (err) {
      console.error(err);
      narcContainer.innerHTML = `<div class="error-message">⚠️ Errore nel calcolo: ${err.message}</div>`;
      statsTextSpan.innerHTML = `⚠️ Errore durante l'elaborazione.`;
      timeBadge.style.display = "none";
    }
  }

  searchBtn.addEventListener("click", () => performSearch());
  lengthInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  });

  // Campo vuoto all'avvio, nessuna ricerca automatica
  lengthInput.value = "";
})();
