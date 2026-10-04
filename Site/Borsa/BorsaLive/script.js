
      /* ==========================================================
   BORSAMANAGER - Robo-advisor simulato
   ========================================================== */

      const STOCKS = [
        {
          symbol: "AAPL",
          name: "Apple",
          price: 189.42,
          volatility: 0.8,
          sector: "tech",
        },
        {
          symbol: "MSFT",
          name: "Microsoft",
          price: 412.18,
          volatility: 0.7,
          sector: "tech",
        },
        {
          symbol: "TSLA",
          name: "Tesla",
          price: 243.87,
          volatility: 1.8,
          sector: "auto",
        },
        {
          symbol: "NVDA",
          name: "NVIDIA",
          price: 875.3,
          volatility: 2.2,
          sector: "tech",
        },
        {
          symbol: "GOOGL",
          name: "Alphabet",
          price: 157.65,
          volatility: 0.9,
          sector: "tech",
        },
        {
          symbol: "AMZN",
          name: "Amazon",
          price: 184.2,
          volatility: 1.1,
          sector: "retail",
        },
        {
          symbol: "META",
          name: "Meta",
          price: 502.14,
          volatility: 1.3,
          sector: "tech",
        },
        {
          symbol: "BTC",
          name: "Bitcoin",
          price: 67234,
          volatility: 2.5,
          sector: "crypto",
        },
      ];

      const MODES = {
        balanced: {
          name: "⚖️ Bilanciata",
          desc: "Il robot cerca un equilibrio tra rischio e rendimento. Compra su debolezza, vende su forza, mantiene il 30% in cash per le opportunità.",
          tags: [
            { t: "Rischio Medio", c: "risk-mid" },
            { t: "Buy the dip" },
            { t: "Cash 30%" },
          ],
          maxPositions: 5,
          cashTarget: 0.3,
          buyThreshold: -1.5, // % di calo per comprare
          sellThreshold: 3.0, // % di guadagno per vendere
          tradeSize: 0.1, // 10% del capitale per trade
        },
        aggressive: {
          name: "🚀 Aggressiva",
          desc: "Il robot punta a massimizzare i rendimenti. Compra più spesso, size maggiori, meno cash. Più volatilità, più opportunità.",
          tags: [
            { t: "Alto Rischio", c: "risk-high" },
            { t: "Momentum" },
            { t: "Cash 10%" },
          ],
          maxPositions: 7,
          cashTarget: 0.1,
          buyThreshold: -0.8,
          sellThreshold: 5.0,
          tradeSize: 0.15,
        },
        conservative: {
          name: "🛡️ Conservativa",
          desc: "Il robot protegge il capitale. Compra solo su forti cali, vende appena in profitto, mantiene tanto cash.",
          tags: [
            { t: "Basso Rischio", c: "risk-low" },
            { t: "Value investing" },
            { t: "Cash 50%" },
          ],
          maxPositions: 3,
          cashTarget: 0.5,
          buyThreshold: -3.0,
          sellThreshold: 2.0,
          tradeSize: 0.08,
        },
      };

      /* ---------- STATE ---------- */
      let state = {
        initialCapital: 10000,
        cash: 10000,
        positions: {}, // { SYMBOL: { qty, avgPrice, bought } }
        prices: {},
        history: {}, // storico prezzi per ogni titolo
        equityCurve: [10000],
        trades: [],
        wins: 0,
        losses: 0,
        mode: "balanced",
        log: [],
        lastPrices: {}, // prezzo precedente per calcolare variazione
      };

      /* ---------- INIT ---------- */
      function initState() {
        state.cash = state.initialCapital;
        state.positions = {};
        state.prices = {};
        state.history = {};
        state.lastPrices = {};
        state.equityCurve = [state.initialCapital];
        state.trades = [];
        state.wins = 0;
        state.losses = 0;
        state.log = [];

        STOCKS.forEach((s) => {
          state.prices[s.symbol] = s.price;
          state.lastPrices[s.symbol] = s.price;
          state.history[s.symbol] = [s.price];
        });

        pushLog(
          "info",
          "🤖 Robot avviato",
          `Capitale iniziale: €${state.initialCapital.toLocaleString("it-IT")}. Modalità: ${MODES[state.mode].name}`,
        );
      }

      /* ---------- LOG ---------- */
      function pushLog(type, title, reason) {
        state.log.unshift({
          type,
          title,
          reason,
          time: new Date(),
        });
        if (state.log.length > 50) state.log.pop();
        renderLog();
      }

      /* ---------- PRICE UPDATES ---------- */
      function updatePrices() {
        STOCKS.forEach((s) => {
          const prev = state.prices[s.symbol];
          const drift = (Math.random() - 0.5) * 0.01 * s.volatility;
          const newPrice = prev * (1 + drift);
          state.lastPrices[s.symbol] = prev;
          state.prices[s.symbol] = newPrice;
          state.history[s.symbol].push(newPrice);
          if (state.history[s.symbol].length > 100)
            state.history[s.symbol].shift();
        });
      }

      /* ---------- ROBOT DECISION ---------- */
      function robotDecide() {
        const mode = MODES[state.mode];
        const positions = Object.keys(state.positions);
        const holdingsValue = getHoldingsValue();
        const totalValue = state.cash + holdingsValue;
        const cashPct = state.cash / totalValue;

        // 1. Check vendite (take profit o stop loss)
        for (const sym of [...positions]) {
          const pos = state.positions[sym];
          const currentPrice = state.prices[sym];
          const pnlPct = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100;

          if (pnlPct >= mode.sellThreshold) {
            sellStock(
              sym,
              pos.qty,
              `Take profit: +${pnlPct.toFixed(2)}% (soglia ${mode.sellThreshold}%)`,
            );
            return;
          }
          if (pnlPct <= -6) {
            sellStock(
              sym,
              pos.qty,
              `Stop loss: ${pnlPct.toFixed(2)}% (limite -6%)`,
            );
            return;
          }
        }

        // 2. Check acquisti (calo significativo)
        if (positions.length >= mode.maxPositions) return;
        if (cashPct <= mode.cashTarget) return;

        // Trova il titolo con il calo maggiore
        let bestBuy = null;
        let bestChange = 0;

        STOCKS.forEach((s) => {
          if (state.positions[s.symbol]) return; // già in portafoglio
          const hist = state.history[s.symbol];
          if (hist.length < 5) return;
          const recent = hist[hist.length - 1];
          const prev = hist[hist.length - 5];
          const changePct = ((recent - prev) / prev) * 100;

          if (changePct < mode.buyThreshold && changePct < bestChange) {
            bestChange = changePct;
            bestBuy = s.symbol;
          }
        });

        if (bestBuy) {
          const budget = totalValue * mode.tradeSize;
          const available = Math.min(
            budget,
            state.cash - totalValue * mode.cashTarget,
          );
          if (available > 100) {
            const price = state.prices[bestBuy];
            const qty = Math.floor(available / price);
            if (qty > 0) {
              buyStock(
                bestBuy,
                qty,
                `Calo del ${bestChange.toFixed(2)}% — opportunità di acquisto (soglia ${mode.buyThreshold}%)`,
              );
              return;
            }
          }
        }

        // 3. Nessuna azione — log "hold"
        if (Math.random() < 0.3) {
          const thoughts = [
            "Mercato stabile, nessuna opportunità evidente. Rimango in attesa.",
            "Prezzi in range, preferisco non rischiare. Cash ready.",
            "Analisi completata: nessun segnale forte. Aspetto.",
            "Volatilità nella norma, mantengo la strategia.",
          ];
          pushLog(
            "hold",
            "⏸️ In attesa",
            thoughts[Math.floor(Math.random() * thoughts.length)],
          );
        }
      }

      /* ---------- BUY ---------- */
      function buyStock(symbol, qty, reason) {
        const price = state.prices[symbol];
        const cost = price * qty;
        if (cost > state.cash) return;

        state.cash -= cost;
        state.positions[symbol] = {
          qty,
          avgPrice: price,
          bought: new Date(),
        };
        state.trades.push({
          side: "BUY",
          symbol,
          qty,
          price,
          reason,
          time: new Date(),
        });

        pushLog(
          "buy",
          `🟢 Acquistati ${qty} ${symbol}`,
          `${reason} — Prezzo: $${price.toFixed(2)} · Costo: $${cost.toFixed(2)}`,
        );
        renderAll();
      }

      /* ---------- SELL ---------- */
      function sellStock(symbol, qty, reason) {
        const pos = state.positions[symbol];
        if (!pos || pos.qty < qty) return;

        const price = state.prices[symbol];
        const revenue = price * qty;
        const cost = pos.avgPrice * qty;
        const pnl = revenue - cost;

        state.cash += revenue;
        pos.qty -= qty;
        if (pos.qty === 0) delete state.positions[symbol];

        if (pnl > 0) state.wins++;
        else state.losses++;

        state.trades.push({
          side: "SELL",
          symbol,
          qty,
          price,
          reason,
          time: new Date(),
          pnl,
        });

        pushLog(
          "sell",
          `🔴 Venduti ${qty} ${symbol} (${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)})`,
          `${reason} — Prezzo: $${price.toFixed(2)} · Ricavo: $${revenue.toFixed(2)}`,
        );
        renderAll();
      }

      /* ---------- FORCE DECISION ---------- */
      function forceDecision() {
        updatePrices();
        robotDecide();
        updateEquity();
        renderAll();
        showToast("⚡ Il robot ha preso una decisione");
      }

      /* ---------- SELL ALL ---------- */
      function sellAll() {
        const positions = Object.keys(state.positions);
        if (positions.length === 0) {
          showToast("Nessuna posizione da liquidare");
          return;
        }
        positions.forEach((sym) => {
          sellStock(
            sym,
            state.positions[sym].qty,
            "Liquidazione manuale richiesta dall'utente",
          );
        });
        showToast("💰 Tutte le posizioni liquidate");
      }

      /* ---------- RESET ---------- */
      function resetAll() {
        if (
          !confirm("Vuoi davvero resettare tutto? Il robot ripartirà da zero.")
        )
          return;
        initState();
        renderAll();
        showToast("🔄 Robot resettato");
      }

      /* ---------- MODE ---------- */
      function setMode(mode) {
        state.mode = mode;
        document.querySelectorAll(".mode-btn").forEach((b, i) => {
          const modes = ["balanced", "aggressive", "conservative"];
          b.classList.toggle("active", modes[i] === mode);
        });
        const m = MODES[mode];
        document.getElementById("stratName").textContent = m.name;
        document.getElementById("stratDesc").textContent = m.desc;
        document.getElementById("stratTags").innerHTML = m.tags
          .map((t) => `<span class="tag ${t.c || ""}">${t.t}</span>`)
          .join("");
        pushLog("info", `🔄 Strategia cambiata`, `Nuova modalità: ${m.name}`);
        renderAll();
      }

      /* ---------- COMPUTE ---------- */
      function getHoldingsValue() {
        let v = 0;
        Object.entries(state.positions).forEach(([sym, p]) => {
          v += state.prices[sym] * p.qty;
        });
        return v;
      }

      function getTotalValue() {
        return state.cash + getHoldingsValue();
      }

      function updateEquity() {
        state.equityCurve.push(getTotalValue());
        if (state.equityCurve.length > 100) state.equityCurve.shift();
      }

      /* ---------- RENDER ---------- */
      function renderAll() {
        renderTopbar();
        renderEquity();
        renderStats();
        renderPositions();
        renderLog();
      }

      function renderTopbar() {
        const total = getTotalValue();
        const pnlPct =
          ((total - state.initialCapital) / state.initialCapital) * 100;

        document.getElementById("topCapital").textContent =
          "€" + total.toLocaleString("it-IT", { maximumFractionDigits: 0 });
        const pnlEl = document.getElementById("topPnl");
        pnlEl.textContent = (pnlPct >= 0 ? "+" : "") + pnlPct.toFixed(2) + "%";
        pnlEl.style.color = pnlPct >= 0 ? "var(--green)" : "var(--red)";
      }

      function renderEquity() {
        const svg = document.getElementById("equity");
        const data = state.equityCurve;
        const W = 800,
          H = 220,
          pad = 15;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const pts = data.map((v, i) => ({
          x: pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2),
          y: H - pad - ((v - min) / range) * (H - pad * 2),
        }));

        const line = pts
          .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
          .join(" ");
        const area =
          line + ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

        const isUp = data[data.length - 1] >= data[0];
        const color = isUp ? "#00d97e" : "#ff4757";

        svg.innerHTML = `
    <defs>
      <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#eqGrad)"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="${pts[pts.length - 1].x}" cy="${pts[pts.length - 1].y}" r="5" fill="${color}"/>
  `;

        document.getElementById("equityTime").textContent =
          new Date().toLocaleTimeString("it-IT");
      }

      function renderStats() {
        const total = getTotalValue();
        const totalTrades = state.wins + state.losses;
        const winRate =
          totalTrades > 0
            ? ((state.wins / totalTrades) * 100).toFixed(0) + "%"
            : "--";

        document.getElementById("statTrades").textContent = state.trades.length;
        document.getElementById("statWin").textContent = winRate;
        document.getElementById("statCash").textContent =
          "€" +
          state.cash.toLocaleString("it-IT", { maximumFractionDigits: 0 });
        document.getElementById("statPos").textContent = Object.keys(
          state.positions,
        ).length;
      }

      function renderPositions() {
        const body = document.getElementById("positionsBody");
        const entries = Object.entries(state.positions);
        document.getElementById("posCount").textContent =
          `${entries.length} aperture`;

        if (entries.length === 0) {
          body.innerHTML = `
      <div class="empty">
        <span class="emoji">🎯</span>
        Il robot sta analizzando il mercato...<br>
        Aspetta che trovi la prima opportunità!
      </div>`;
          return;
        }

        body.innerHTML = entries
          .map(([sym, p]) => {
            const current = state.prices[sym];
            const pnl = ((current - p.avgPrice) / p.avgPrice) * 100;
            const value = current * p.qty;
            const up = pnl >= 0;
            return `
      <div class="position">
        <div class="pos-symbol">${sym}</div>
        <div class="pos-info">
          <div class="pos-qty">${p.qty} azioni</div>
          <div class="pos-avg">P.Medio: $${p.avgPrice.toFixed(2)}</div>
        </div>
        <div class="pos-value">
          <div class="pos-price">$${value.toFixed(2)}</div>
          <div class="pos-pnl ${up ? "up" : "down"}">${up ? "+" : ""}${pnl.toFixed(2)}%</div>
        </div>
      </div>
    `;
          })
          .join("");
      }

      function renderLog() {
        const log = document.getElementById("log");
        if (state.log.length === 0) {
          log.innerHTML = `<div class="empty"><span class="emoji">🧠</span>Il robot si sta svegliando...</div>`;
          return;
        }

        log.innerHTML = state.log
          .map((e) => {
            const time = e.time.toLocaleTimeString("it-IT");
            const iconMap = { buy: "🟢", sell: "🔴", info: "ℹ️", hold: "⏸️" };
            return `
      <div class="log-entry">
        <div class="log-icon ${e.type}">${iconMap[e.type]}</div>
        <div class="log-content">
          <div class="log-title">${e.title}</div>
          <div class="log-reason">${e.reason}</div>
          <div class="log-time">${time}</div>
        </div>
      </div>
    `;
          })
          .join("");
      }

      /* ---------- TOAST ---------- */
      function showToast(msg) {
        const t = document.getElementById("toast");
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(t._timer);
        t._timer = setTimeout(() => t.classList.remove("show"), 2200);
      }

      /* ---------- LOOP ---------- */
      function tick() {
        updatePrices();
        robotDecide();
        updateEquity();
        renderAll();
      }

      /* ---------- START ---------- */
      initState();
      setMode("balanced");
      renderAll();

      // Il robot lavora ogni 4 secondi
      setInterval(tick, 4000);

      // Prima decisione dopo 2 secondi
      setTimeout(tick, 2000);