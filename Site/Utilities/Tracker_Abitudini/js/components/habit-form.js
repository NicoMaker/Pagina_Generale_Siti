// <habit-form>: campo + bottone. Emette "habit-add" con { name }.
class HabitForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="add">
        <input type="text" maxlength="40" placeholder="Nuova abitudine, es. Leggere 10 pagine" aria-label="Nome abitudine">
        <button class="btn">Aggiungi</button>
      </div>`;
    this.input = this.querySelector("input");
    this.querySelector("button").addEventListener("click", () => this.submit());
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.submit();
    });
  }
  submit() {
    const name = this.input.value.trim();
    if (!name) return;
    this.input.value = "";
    this.dispatchEvent(
      new CustomEvent("habit-add", { detail: { name }, bubbles: true }),
    );
  }
}
customElements.define("habit-form", HabitForm);
