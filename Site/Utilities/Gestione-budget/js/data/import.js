"use strict";

/* ================= DATI: import ================= */
function toISODate(v) {
  if (v instanceof Date && !isNaN(v))
    return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
  if (typeof v === "number") {
    const d = new Date(Math.round((v - 25569) * 86400000));
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const s = String(v ?? "").trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)))
    return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  if ((m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/))) {
    const yr = m[3].length === 2 ? "20" + m[3] : m[3];
    return `${yr}-${pad(m[2])}-${pad(m[1])}`;
  }
  return null;
}
function toNum(v) {
  if (typeof v === "number") return v;
  let s = String(v ?? "").replace(/[€\s]/g, "");
  if (s.includes(",") && s.includes("."))
    s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}
function normRows(objs) {
  const out = [];
  let skipped = 0;
  objs.forEach((o) => {
    const k = {};
    Object.keys(o).forEach(
      (key) => (k[key.toString().trim().toLowerCase()] = o[key]),
    );
    const date = toISODate(k.data ?? k.date);
    let amount = toNum(k.importo ?? k.amount ?? k.valore);
    const rawType = String(k.tipo ?? k.type ?? "").toLowerCase();
    let type = /^(in|e|entrata|income|\+)/.test(rawType)
      ? "in"
      : /^(out|u|uscita|expense|spesa|-)/.test(rawType)
        ? "out"
        : amount < 0
          ? "out"
          : "out";
    amount = Math.abs(amount);
    if (!date || !(amount > 0)) {
      skipped++;
      return;
    }
    out.push({
      id: k.id ? String(k.id) : uid(),
      date,
      type,
      category: String(k.categoria ?? k.category ?? "Altro").trim() || "Altro",
      description: String(k.descrizione ?? k.description ?? "").trim(),
      amount: Math.round(amount * 100) / 100,
    });
  });
  return { out, skipped };
}
function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const first = text.split(/\r?\n/)[0] || "",
    delim =
      (first.match(/;/g) || []).length >= (first.match(/,/g) || []).length
        ? ";"
        : ",";
  const rows = [];
  let row = [],
    cell = "",
    q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c !== "")) rows.push(row);
  const head = rows.shift() || [];
  return rows.map((r) =>
    Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])),
  );
}
async function applyImport(list, extra, skipped) {
  const imode = $("impMode").value;
  if (imode === "replace") {
    if (
      !(await ask(
        "Sostituire TUTTI i dati attuali con quelli importati?",
        "Sostituisci",
      ))
    )
      return;
    state.tx = [];
    if (extra.budgets) state.budgets = {};
    if (extra.categories) state.categories = [];
  }
  const nCat = extra.categories ? mergeCategories(extra.categories) : 0;
  if (!state.categories.length) seedCategories();
  const key = (t) =>
    [
      t.date,
      t.type,
      t.category.toLowerCase(),
      t.description.toLowerCase(),
      t.amount,
    ].join("|");
  const have = new Set(state.tx.map(key));
  let added = 0,
    dup = 0;
  list.forEach((t) => {
    if (have.has(key(t))) {
      dup++;
      return;
    }
    have.add(key(t));
    t.category = ensureCat(t.category, t.type).name;
    state.tx.push(t);
    added++;
  });
  if (extra.budgets) Object.assign(state.budgets, extra.budgets);
  save();
  render();
  toast(
    `Importate ${added} operazioni` +
      (nCat ? ` · ${nCat} categorie` : "") +
      (dup ? ` · ${dup} duplicati ignorati` : "") +
      (skipped ? ` · ${skipped} righe scartate` : ""),
  );
}
$("impFile").onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const ext = f.name.split(".").pop().toLowerCase();
  try {
    if (ext === "json") {
      const d = JSON.parse(await f.text());
      if (!Array.isArray(d) && d.app === "budget-categories") {
        const n = mergeCategories(d.categories);
        save();
        render();
        toast(`${n} categorie importate`);
        e.target.value = "";
        return;
      }
      const arr = Array.isArray(d) ? d : d.transactions || d.tx || [];
      const { out, skipped } = normRows(
        arr.map((t) => ({
          id: t.id,
          data: t.date ?? t.data,
          tipo: t.type ?? t.tipo,
          categoria: t.category ?? t.categoria,
          descrizione: t.description ?? t.descrizione,
          importo: t.amount ?? t.importo,
        })),
      );
      applyImport(
        out,
        {
          categories: Array.isArray(d.categories) ? d.categories : null,
          budgets:
            d.budgets &&
            typeof d.budgets === "object" &&
            !Array.isArray(d.budgets)
              ? d.budgets
              : null,
        },
        skipped,
      );
    } else if (ext === "csv") {
      const { out, skipped } = normRows(parseCSV(await f.text()));
      applyImport(out, {}, skipped);
    } else if (ext === "xlsx" || ext === "xls") {
      if (!need(window.XLSX, "XLSX")) return;
      const wb = XLSX.read(await f.arrayBuffer(), {
        type: "array",
        cellDates: true,
      });
      const { out, skipped } = normRows(
        XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { raw: true }),
      );
      applyImport(out, {}, skipped);
    } else toast("Formato non supportato (usa JSON, CSV o XLSX)");
  } catch (err) {
    console.error(err);
    toast("Errore durante l'importazione: file non valido");
  }
  e.target.value = "";
};
$("wipe").onclick = async () => {
  if (
    (await ask("Cancellare DEFINITIVAMENTE tutti i dati?", "Continua")) &&
    (await ask("Sei sicuro? Fai prima un backup JSON.", "Cancella tutto"))
  ) {
    state.tx = [];
    state.budgets = {};
    state.categories = [];
    seedCategories();
    save();
    render();
    toast("Dati cancellati");
  }
};
