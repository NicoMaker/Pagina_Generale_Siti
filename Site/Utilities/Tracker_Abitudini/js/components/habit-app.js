// <habit-app>: contiene lo stato, ascolta gli eventi dei componenti figli.
class HabitApp extends HTMLElement {
  connectedCallback() {
    this.habits = Store.load();
    this.innerHTML = '<habit-form></habit-form><div class="list"></div>';
    this.list = this.querySelector(".list");

    this.addEventListener("habit-add", (e) => {
      this.habits.push({ name: e.detail.name, done: [] });
      this.update();
    });
    this.addEventListener("habit-toggle", (e) => {
      const h = this.habits[this.indexOf(e.target)],
        k = e.detail.key,
        j = h.done.indexOf(k);
      j > -1 ? h.done.splice(j, 1) : h.done.push(k);
      this.update();
    });
    this.addEventListener("habit-delete", (e) => {
      if (confirm("Eliminare questa abitudine?")) {
        this.habits.splice(this.indexOf(e.target), 1);
        this.update();
      }
    });
    this.render();
  }
  indexOf(card) {
    return +card.closest("habit-card").dataset.index;
  }
  update() {
    Store.save(this.habits);
    this.render();
  }
  render() {
    this.list.innerHTML = "";
    if (!this.habits.length) {
      this.list.innerHTML =
        '<div class="empty">Nessuna abitudine. Scrivine una qui sopra per iniziare la tua prima serie.</div>';
      return;
    }
    this.habits.forEach((h, i) => {
      const card = document.createElement("habit-card");
      card.dataset.index = i;
      card.habit = h;
      this.list.appendChild(card);
    });
  }
}
customElements.define("habit-app", HabitApp);
