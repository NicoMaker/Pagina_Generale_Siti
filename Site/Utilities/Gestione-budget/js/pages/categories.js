"use strict";

/* ================= CATEGORIE ================= */
function resetCatForm() {
  $("catForm").reset();
  $("cId").value = "";
  $("cPrev").textContent = "";
  $("cWarn").textContent = "";
  $("cSimilar").innerHTML = "";
  $("cSubmit").disabled = false;
  $("cFormTitle").textContent = "Nuova categoria";
  $("cSubmit").textContent = "Aggiungi";
  $("cCancel").style.display = "none";
}
$("cCancel").onclick = resetCatForm;
function previewCat() {
  const v = $("cName").value.trim(),
    ex = findCat(v),
    dup = ex && ex.id !== $("cId").value;
  const q = catKey(v),
    sim = q
      ? state.categories
          .filter((c) => catKey(c.name).includes(q) && c.id !== $("cId").value)
          .slice(0, 8)
      : [];
  $("cSimilar").innerHTML = sim.length
    ? `<span class="muted" style="width:100%">Già presenti (clicca per modificarla):</span>` +
      sim
        .map(
          (c) =>
            `<button type="button" class="chip" data-ce="${c.id}" style="--c:${c.color}"><span class="ci">${esc(c.icon)}</span>${esc(c.name)}</button>`,
        )
        .join("")
    : "";
  $("cWarn").textContent = dup ? `Esiste già la categoria "${ex.name}"` : "";
  $("cSubmit").disabled = !!dup;
  $("cPrev").textContent = v ? (ex || {}).icon || autoIcon(v) : "";
  $("cPrev").style.setProperty("--c", (ex || {}).color || nextColor());
}
$("cName").addEventListener("input", previewCat);
$("catForm").onsubmit = (e) => {
  e.preventDefault();
  const name = $("cName").value.trim().replace(/\s+/g, " "),
    id = $("cId").value;
  if (!name) return;
  const dup = findCat(name);
  if (dup && dup.id !== id)
    return toast(`Esiste già la categoria "${dup.name}"`);
  if (id) {
    const c = state.categories.find((x) => x.id === id);
    if (c) {
      if (c.name !== name)
        state.tx.forEach((t) => {
          if (t.category === c.name) t.category = name;
        });
      Object.assign(c, { name, icon: autoIcon(name) });
      toast("Categoria modificata");
    }
  } else {
    state.categories.push({
      id: uid(),
      name,
      icon: autoIcon(name),
      color: nextColor(),
    });
    toast("Categoria creata");
  }
  save();
  resetCatForm();
  render();
};
function renderCats() {
  const m = inPer();
  $("catPeriodLbl").textContent =
    perLabel() +
    " · speso " +
    fmt(sum(byType(m, "out"))) +
    " · incassato " +
    fmt(sum(byType(m, "in"))) +
    " · 🔒 = in uso, non eliminabile";
  const agg = (arr) => {
    const o = {};
    arr.forEach((t) => {
      o[t.category] = (o[t.category] || 0) + t.amount;
    });
    return o;
  };
  const P = { out: agg(byType(m, "out")), in: agg(byType(m, "in")) };
  const Dy = {
    out: agg(byType(inKey(todayISO()), "out")),
    in: agg(byType(inKey(todayISO()), "in")),
  };
  const Mo = {
    out: agg(byType(inKey(cur), "out")),
    in: agg(byType(inKey(cur), "in")),
  };
  const Yr = {
    out: agg(byType(inKey(cur.slice(0, 4)), "out")),
    in: agg(byType(inKey(cur.slice(0, 4)), "in")),
  };
  const To = {
    out: agg(byType(state.tx, "out")),
    in: agg(byType(state.tx, "in")),
  };
  const used = {};
  state.tx.forEach((t) => {
    used[t.category] = (used[t.category] || 0) + 1;
  });
  const cnt = {};
  m.forEach((t) => {
    cnt[t.category] = (cnt[t.category] || 0) + 1;
  });
  const allOut = sum(byType(m, "out")),
    mx = Math.max(0, ...Object.values(P.out)) || 1;
  const unused = state.categories.filter((c) => !used[c.name]).length;
  $("catPurge").textContent = `Elimina non usate (${unused})`;
  $("catPurge").disabled = !unused;
  const list = state.categories
    .slice()
    .sort(
      (a, b) =>
        (P.out[b.name] || 0) +
          (P.in[b.name] || 0) -
          ((P.out[a.name] || 0) + (P.in[a.name] || 0)) ||
        a.name.localeCompare(b.name, "it"),
    );
  const line = (label, cls, k, c) =>
    `<div class="amts"><span class="${cls}" style="font-weight:700">${label}</span><b>${fmt(Dy[k][c] || 0)}</b><b>${fmt(Mo[k][c] || 0)}</b><b>${fmt(Yr[k][c] || 0)}</b><b>${fmt(To[k][c] || 0)}</b></div>`;
  const head =
    '<div class="amts hd"><span></span><span>Oggi</span><span>Mese</span><span>Anno</span><span>Totale</span></div>';
  $("catOut").innerHTML = list.length
    ? list
        .map((c) => {
          const u = used[c.name] || 0,
            v = P.out[c.name] || 0,
            hasIn = (To.in[c.name] || 0) > 0,
            hasOut = (To.out[c.name] || 0) > 0;
          return `<div class="catcard" style="--c:${c.color}">
      <div class="chead"><input type="checkbox" class="csel" data-id="${c.id}" ${selCats.has(c.id) ? "checked" : ""} aria-label="Seleziona ${esc(c.name)}"><div class="big">${esc(c.icon)}</div><div class="nm">${esc(c.name)}</div>
        <button class="iconbtn" data-ce="${c.id}" title="Modifica" aria-label="Modifica">✎</button>${u ? `<button class="iconbtn" disabled style="opacity:.4;cursor:not-allowed" title="Non eliminabile: usata da ${u} ${u === 1 ? "operazione" : "operazioni"}" aria-label="Non eliminabile">🔒</button>` : `<button class="iconbtn" data-cd="${c.id}" title="Elimina" aria-label="Elimina">✕</button>`}</div>
      <div class="cbody">${head}${hasOut || !hasIn ? line("Spese", "out", "out", c.name) : ""}${hasIn ? line("Entrate", "in", "in", c.name) : ""}
      <div class="progress" style="margin:10px 0 6px;height:6px"><div style="width:${(v / mx) * 100}%;background:${c.color}"></div></div>
      <div class="muted" style="font-size:.78rem">${allOut ? ((v / allOut) * 100).toFixed(0) : 0}% delle spese del periodo · ${cnt[c.name] || 0} op. · ${u ? "🔒 usata da " + u + (u === 1 ? " operazione" : " operazioni") : "non usata, eliminabile"}</div></div></div>`;
        })
        .join("")
    : '<div class="empty">Nessuna categoria: creane una qui sopra.</div>';
  updateSelUI();
}
/* selezione multipla: le categorie in uso non vengono eliminate */
const selCats = new Set();
function updateSelUI() {
  [...selCats].forEach((id) => {
    if (!state.categories.some((c) => c.id === id)) selCats.delete(id);
  });
  $("catDelSel").textContent = `Elimina selezionate (${selCats.size})`;
  $("catDelSel").disabled = !selCats.size;
  $("selAll").checked =
    state.categories.length > 0 && selCats.size === state.categories.length;
}
$("catOut").addEventListener("change", (e) => {
  const c = e.target.closest(".csel");
  if (!c) return;
  c.checked ? selCats.add(c.dataset.id) : selCats.delete(c.dataset.id);
  updateSelUI();
});
$("selAll").onchange = (e) => {
  selCats.clear();
  if (e.target.checked) state.categories.forEach((c) => selCats.add(c.id));
  renderCats();
};
$("catDelSel").onclick = async () => {
  const inUse = new Set(state.tx.map((t) => t.category));
  const chosen = state.categories.filter((c) => selCats.has(c.id)),
    ok = chosen.filter((c) => !inUse.has(c.name)),
    blocked = chosen.filter((c) => inUse.has(c.name));
  if (!chosen.length) return;
  if (!ok.length)
    return toast(
      `Nessuna eliminata: ${blocked.length === 1 ? "è in uso" : "sono in uso"} (${blocked.map((c) => c.name).join(", ")})`,
    );
  if (
    !(await ask(
      `Eliminare ${ok.length} ${ok.length === 1 ? "categoria" : "categorie"}?\n\n${ok.map((c) => c.name).join(", ")}` +
        (blocked.length
          ? `\n\nNon verranno eliminate perché in uso: ${blocked.map((c) => c.name).join(", ")}`
          : ""),
    ))
  )
    return;
  const gone = new Set(ok.map((c) => c.id));
  state.categories = state.categories.filter((c) => !gone.has(c.id));
  selCats.clear();
  save();
  render();
  toast(
    `${ok.length} ${ok.length === 1 ? "eliminata" : "eliminate"}` +
      (blocked.length
        ? ` · ${blocked.length} non ${blocked.length === 1 ? "eliminata" : "eliminate"} perché in uso`
        : ""),
  );
};
$("catPurge").onclick = async () => {
  const inUse = new Set(state.tx.map((t) => t.category)),
    gone = state.categories.filter((c) => !inUse.has(c.name));
  if (!gone.length) return toast("Nessuna categoria non usata");
  if (
    !(await ask(
      `Eliminare ${gone.length} categorie senza operazioni?\n\n${gone.map((c) => c.name).join(", ")}`,
    ))
  )
    return;
  state.categories = state.categories.filter((c) => inUse.has(c.name));
  save();
  render();
  toast(`${gone.length} categorie eliminate`);
};
$("p-cat").onclick = async (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.ce) {
    const c = state.categories.find((x) => x.id === b.dataset.ce);
    if (!c) return;
    $("cId").value = c.id;
    $("cName").value = c.name;
    previewCat();
    $("cFormTitle").textContent = "Modifica categoria";
    $("cSubmit").textContent = "Salva";
    $("cCancel").style.display = "";
    $("catForm").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (b.dataset.cd) {
    const c = state.categories.find((x) => x.id === b.dataset.cd);
    if (!c) return;
    const n = state.tx.filter((t) => t.category === c.name).length;
    if (n)
      return toast(
        `Non eliminabile: "${c.name}" è usata da ${n} ${n === 1 ? "operazione" : "operazioni"}`,
      );
    if (!(await ask(`Eliminare la categoria "${c.name}"?`))) return;
    state.categories = state.categories.filter((x) => x.id !== c.id);
    save();
    render();
    toast("Categoria eliminata");
  }
};
const catPayload = () => ({
  app: "budget-categories",
  version: 1,
  exported: new Date().toISOString(),
  categories: state.categories.map(({ name, icon, color }) => ({
    name,
    icon,
    color,
  })),
});
function exportCats() {
  download(
    new Blob([JSON.stringify(catPayload(), null, 2)], {
      type: "application/json",
    }),
    `budget_categorie_${todayISO()}.json`,
  );
  toast("Categorie esportate");
}
$("catExport").onclick = exportCats;
$("exJsonCat").onclick = exportCats;
$("catImport").onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    const list = Array.isArray(d) ? d : d.categories;
    if (!Array.isArray(list)) throw new Error("no categories");
    const n = mergeCategories(list);
    save();
    render();
    toast(
      n ? `${n} categorie importate` : "Nessuna categoria nuova da importare",
    );
  } catch (err) {
    toast("File categorie non valido");
  }
  e.target.value = "";
};
