// <habit-card>: mostra una abitudine. Imposta la proprietà .habit.
// Emette "habit-toggle" con { key } e "habit-delete".
class HabitCard extends HTMLElement {
  connectedCallback() {
    this.classList.add("habit");
    this.addEventListener("click", (e) => {
      const dot = e.target.closest(".dot");
      if (dot)
        return this.dispatchEvent(
          new CustomEvent("habit-toggle", {
            detail: { key: dot.dataset.k },
            bubbles: true,
          }),
        );
      if (e.target.closest(".del"))
        this.dispatchEvent(new CustomEvent("habit-delete", { bubbles: true }));
    });
    this.render();
  }
  set habit(h) {
    this._h = h;
    this.render();
  }
  render() {
    const h = this._h;
    if (!h) return;
    const s = Store.streak(h),
      last = Store.DAYS - 1;
    let dots = "";
    for (let i = last; i >= 0; i--) {
      const d = Store.back(i),
        k = Store.ds(d),
        on = h.done.includes(k);
      const lab = d.toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      dots += `<button class="dot${on ? " on" : ""}${i === 0 ? " today" : ""}" data-k="${k}" aria-pressed="${on}" aria-label="${lab}"></button>`;
    }
    const fatti = h.done.filter((k) => k >= Store.ds(Store.back(last))).length;
    this.innerHTML = `
      <div class="top"><div class="name"></div>
        <div class="streak"><b>${s}</b><span>${s === 1 ? "giorno" : "giorni"} di fila</span></div></div>
      <div class="strip">${dots}</div>
      <div class="foot"><span>Ultimi ${Store.DAYS} giorni · ${fatti} fatti</span><button class="del">Elimina</button></div>`;
    this.querySelector(".name").textContent = h.name;
  }
}
customElements.define("habit-card", HabitCard);
