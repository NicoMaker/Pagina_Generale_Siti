// ============================================================
// actions.js — gestione eventi delegata (sostituisce onclick/oninput inline)
// Uso: data-action="funzioneA funzioneB" data-args='["arg"]' (args solo con una funzione)
//      data-input-action="funzione"
// ============================================================

const localActions = {
  clickElement: (id) => document.getElementById(id)?.click(),
};

const resolve = (name) => localActions[name] ?? globalThis[name];

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const args = JSON.parse(el.dataset.args ?? "[]");
  for (const name of el.dataset.action.split(/\s+/)) {
    const fn = resolve(name);
    if (typeof fn === "function") fn(...args);
    else console.warn(`Azione sconosciuta: ${name}`);
  }
});

document.addEventListener("input", (e) => {
  const el = e.target.closest("[data-input-action]");
  if (el) globalThis[el.dataset.inputAction]?.(e);
});
