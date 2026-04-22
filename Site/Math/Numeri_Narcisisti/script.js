(function () {
  const MAX_LEN = 60;
  const MIN_LEN = 2;

  /* ---- precompute powers ---- */
  const powers = Array(10);
  for (let d = 0; d <= 9; d++) {
    powers[d] = Array(MAX_LEN + 1);
    for (let n = 0; n <= MAX_LEN; n++) {
      powers[d][n] = n === 0 ? 1n : powers[d][n - 1] * BigInt(d);
    }
  }

  function sumFromCounts(counts, L) {
    let total = 0n;
    for (let d = 0; d <= 9; d++) {
      if (counts[d]) total += BigInt(counts[d]) * powers[d][L];
    }
    return total;
  }

  function getDigitCountsFromNumber(numBig, L) {
    const s = numBig.toString();
    if (s.length !== L) return null;
    const c = Array(10).fill(0);
    for (const ch of s) c[parseInt(ch, 10)]++;
    return c;
  }

  function checkCombination(counts, L) {
    if (L > 1) {
      let ok = false;
      for (let d = 1; d <= 9; d++) if (counts[d] > 0) { ok = true; break; }
      if (!ok) return null;
    }
    const sumBig = sumFromCounts(counts, L);
    if (sumBig.toString().length !== L) return null;
    const sc = getDigitCountsFromNumber(sumBig, L);
    if (!sc) return null;
    for (let i = 0; i <= 9; i++) if (sc[i] !== counts[i]) return null;
    return sumBig;
  }

  function findNarcissisticNumbersByLength(L) {
    if (L < MIN_LEN || L > MAX_LEN) return [];
    const results = [];
    const lower = 10n ** BigInt(L - 1);
    const upper = 10n ** BigInt(L) - 1n;

    function backtrack(digitIdx, remaining, counts, currentSum) {
      if (remaining === 0) {
        const n = checkCombination(counts, L);
        if (n !== null) results.push(n);
        return;
      }
      if (digitIdx > 9) return;

      let minF = 0n, maxF = 0n;
      for (let i = 0; i < remaining; i++) {
        minF += powers[digitIdx][L];
        maxF += powers[9][L];
      }
      if (currentSum + minF > upper) return;
      if (currentSum + maxF < lower) return;

      for (let cnt = 0; cnt <= remaining; cnt++) {
        counts[digitIdx] = cnt;
        const newSum = currentSum + powers[digitIdx][L] * BigInt(cnt);
        if (newSum > upper) break;
        let futureMin = 0n;
        if (digitIdx + 1 <= 9)
          for (let r = 0; r < remaining - cnt; r++) futureMin += powers[digitIdx + 1][L];
        if (newSum + futureMin <= upper)
          backtrack(digitIdx + 1, remaining - cnt, counts, newSum);
      }
      counts[digitIdx] = 0;
    }

    backtrack(0, L, Array(10).fill(0), 0n);

    const uniq = new Map();
    for (const n of results) uniq.set(n.toString(), n);
    return Array.from(uniq.values()).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  }

  function buildDemo(numBig, L) {
    const digits = numBig.toString().split('').map(Number);
    const powVals = digits.map(d => powers[d][L]);
    const powTerms = digits.map(d => `${d}<sup>${L}</sup>`);
    const valStrs  = powVals.map(v => v.toString());
    const total    = powVals.reduce((a, v) => a + v, 0n);
    return {
      numberStr:   numBig.toString(),
      length:      L,
      powTermsHTML: powTerms.join(' + '),
      valuesHTML:   valStrs.join(' + '),
      totalStr:     total.toString(),
    };
  }

  /* ---- DOM ---- */
  const lengthInput   = document.getElementById('lengthInput');
  const searchBtn     = document.getElementById('searchBtn');
  const container     = document.getElementById('narcListContainer');
  const statusText    = document.getElementById('statusText');
  const timeBadge     = document.getElementById('timeBadge');
  const timeElapsed   = document.getElementById('timeElapsed');

  function setStatus(text, ms = null) {
    statusText.innerHTML = text;
    if (ms !== null) {
      timeBadge.style.display = 'flex';
      timeElapsed.textContent = ms + ' ms';
    } else {
      timeBadge.style.display = 'none';
    }
  }

  function renderCard(numBig, L, delay) {
    const d = buildDemo(numBig, L);
    const card = document.createElement('div');
    card.className = 'narc-demo-card';
    card.style.animationDelay = delay + 'ms';
    card.innerHTML = `
      <div class="card-top">
        <span class="card-number">${d.numberStr}</span>
        <span class="card-badge">${d.length} cifre</span>
      </div>
      <div class="card-body">
        <div class="demo-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <div class="step-label">Elevazione a potenza</div>
            <div class="step-formula f-powers">${d.powTermsHTML}</div>
          </div>
        </div>
        <div class="demo-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <div class="step-label">Valori calcolati</div>
            <div class="step-formula f-values">${d.valuesHTML}</div>
          </div>
        </div>
        <div class="demo-step">
          <div class="step-num">3</div>
          <div class="step-content">
            <div class="step-label">Somma delle potenze</div>
            <div class="step-formula f-sum">${d.valuesHTML} = ${d.totalStr}</div>
          </div>
        </div>
      </div>
      <div class="card-verdict">
        <span class="verdict-eq">${d.numberStr} = ${d.totalStr}</span>
        <span class="verdict-check">✓ Narcisista</span>
      </div>
    `;
    return card;
  }

  function renderResults(L, numbers, elapsedMs) {
    container.innerHTML = '';

    if (!numbers || numbers.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <strong>Nessun risultato</strong>
          Nessun numero narcisista con esattamente ${L} cifre.
        </div>`;
      setStatus(`Lunghezza ${L} → 0 numeri narcisisti`, elapsedMs);
      return;
    }

    const frag = document.createDocumentFragment();
    numbers.forEach((n, i) => frag.appendChild(renderCard(n, L, i * 60)));
    container.appendChild(frag);

    const c = numbers.length;
    setStatus(
      `Trovat${c === 1 ? 'o' : 'i'} <strong>${c}</strong> numero${c === 1 ? '' : 'i'} narcisista${c === 1 ? '' : 'i'} con ${L} cifre`,
      elapsedMs
    );
  }

  async function performSearch() {
    const raw = lengthInput.value.trim();
    if (raw === '') {
      container.innerHTML = `<div class="error-state">⚠ Inserisci una lunghezza valida (2–60)</div>`;
      setStatus('Nessun input');
      return;
    }
    const L = parseInt(raw, 10);
    if (isNaN(L) || !Number.isInteger(L) || L < MIN_LEN || L > MAX_LEN) {
      container.innerHTML = `<div class="error-state">Lunghezza non valida — inserisci un intero da ${MIN_LEN} a ${MAX_LEN}</div>`;
      setStatus(`Errore: range consentito ${MIN_LEN}–${MAX_LEN}`);
      return;
    }

    container.innerHTML = `
      <div class="loading-state">
        <span class="load-glyph">◆</span>
        <p>Ricerca in corso per lunghezza ${L}…</p>
      </div>`;
    setStatus(`Calcolo per L = ${L}…`);

    await new Promise(r => setTimeout(r, 20));

    const t0 = performance.now();
    try {
      const results = findNarcissisticNumbersByLength(L);
      const elapsed = (performance.now() - t0).toFixed(1);
      renderResults(L, results, elapsed);
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="error-state">Errore nel calcolo: ${err.message}</div>`;
      setStatus('Errore durante l\'elaborazione');
    }
  }

  searchBtn.addEventListener('click', performSearch);
  lengthInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') { e.preventDefault(); performSearch(); }
  });

  lengthInput.value = '';
})();

/* =============================================
   MODAL — Info / Come funziona
   ============================================= */
(function () {
  const backdrop   = document.getElementById('modalBackdrop');
  const infoBtn    = document.getElementById('infoBtn');
  const closeBtn   = document.getElementById('modalClose');
  const exGrid     = document.getElementById('examplesGrid');
  const checkerInp = document.getElementById('checkerInput');
  const checkerBtn = document.getElementById('checkerBtn');
  const checkerRes = document.getElementById('checkerResult');

  /* ---- open / close ---- */
  function openModal() {
    backdrop.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    checkerRes.textContent = '';
    checkerRes.className = 'checker-result';
  }
  function closeModal() {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  infoBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ---- famous examples ---- */
  const EXAMPLES = [
    {
      n: '153', k: 3,
      digits: [1,5,3],
      tag: '3 cifre · il più famoso'
    },
    {
      n: '370', k: 3,
      digits: [3,7,0],
      tag: '3 cifre'
    },
    {
      n: '9474', k: 4,
      digits: [9,4,7,4],
      tag: '4 cifre'
    },
    {
      n: '54748', k: 5,
      digits: [5,4,7,4,8],
      tag: '5 cifre'
    },
  ];

  function pow(base, exp) {
    let r = BigInt(1);
    const b = BigInt(base);
    for (let i = 0; i < exp; i++) r *= b;
    return r;
  }

  function buildExCard(ex) {
    const card = document.createElement('div');
    card.className = 'ex-card';

    const head = document.createElement('div');
    head.className = 'ex-card-head';
    head.innerHTML = `
      <span class="ex-card-num">${ex.n}</span>
      <span class="ex-card-tag">${ex.tag}</span>
      <span class="ex-card-arrow">▼</span>
    `;

    const body = document.createElement('div');
    body.className = 'ex-card-body';

    // step 1: powers
    const terms = ex.digits.map(d => `${d}<sup>${ex.k}</sup>`).join(' + ');
    const vals  = ex.digits.map(d => pow(d, ex.k).toString());
    const sum   = vals.reduce((a, v) => a + BigInt(v), 0n).toString();

    body.innerHTML = `
      <div class="ex-row"><span class="hi">Cifre:</span> &nbsp;${ex.digits.join(', ')} &nbsp;(k = ${ex.k})</div>
      <div class="ex-row"><span class="hi">Potenze:</span> &nbsp;${terms} = ${vals.join(' + ')}</div>
      <div class="ex-row"><span class="hi">Somma:</span> &nbsp;<span class="gld">${vals.join(' + ')} = ${sum}</span></div>
      <div class="ex-row"><span class="grn">✓ ${sum} = ${ex.n} → numero narcisista</span></div>
    `;

    head.addEventListener('click', () => {
      card.classList.toggle('open');
    });

    card.appendChild(head);
    card.appendChild(body);
    return card;
  }

  EXAMPLES.forEach(ex => exGrid.appendChild(buildExCard(ex)));

  /* ---- checker ---- */
  function checkNumber() {
    const raw = checkerInp.value.trim();
    if (!raw || raw.length < 2) {
      checkerRes.textContent = 'Inserisci un numero con almeno 2 cifre.';
      checkerRes.className = 'checker-result err';
      return;
    }
    const str    = raw.replace(/\D/g, '');
    if (!str || str.length < 2) {
      checkerRes.textContent = 'Numero non valido.';
      checkerRes.className = 'checker-result err';
      return;
    }
    const k      = str.length;
    const digits = str.split('').map(Number);
    const vals   = digits.map(d => pow(d, k));
    const total  = vals.reduce((a, v) => a + v, 0n);
    const isNarc = total.toString() === str;

    const termsHTML  = digits.map(d => `${d}<sup>${k}</sup>`).join(' + ');
    const valsJoined = vals.map(v => v.toString()).join(' + ');

    if (isNarc) {
      checkerRes.className = 'checker-result is-narc';
      checkerRes.innerHTML = `
        ✓ ${str} È un numero narcisista!<br>
        ${termsHTML} = ${valsJoined} = ${total}
      `;
    } else {
      checkerRes.className = 'checker-result not-narc';
      checkerRes.innerHTML = `
        ✗ ${str} NON è narcisista.<br>
        ${termsHTML} = ${valsJoined} = ${total} ≠ ${str}
      `;
    }
  }

  checkerBtn.addEventListener('click', checkNumber);
  checkerInp.addEventListener('keypress', e => {
    if (e.key === 'Enter') { e.preventDefault(); checkNumber(); }
  });

})();