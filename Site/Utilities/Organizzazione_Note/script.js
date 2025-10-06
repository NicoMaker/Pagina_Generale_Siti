let notes = [];
let currentNoteId = null;
let activeTagFilters = [];
let deleteAction = null;

// --- UTILITY FUNCTIONS ---

function loadNotes() {
  const saved = localStorage.getItem("notes");
  if (saved) notes = JSON.parse(saved);
}

const saveNotes = () => localStorage.setItem("notes", JSON.stringify(notes));

function showToast(message, type = 'info') {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';

  toastMessage.innerHTML = `${icon} ${message}`;
  
  toast.classList.add("show");
  // Assicurati che il messaggio non venga visualizzato in modalità desktop
  if(window.innerWidth > 600) {
      toast.style.right = '2rem';
  } else {
      toast.style.right = '1rem';
  }

  setTimeout(() => toast.classList.remove("show"), 3000);
}


// Funzione per scaricare il file (usata per l'Esportazione)
function downloadFile(content, filename, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// --- IMPORT/EXPORT LOGIC ---

// Esporta in JSON
document.getElementById("export-json-btn").addEventListener("click", () => {
  const data = JSON.stringify(notes, null, 2);
  downloadFile(data, "note_organizer.json", "application/json");
  showToast("Note esportate in JSON!", 'success');
});

// Esporta in TXT
document.getElementById("export-txt-btn").addEventListener("click", () => {
  const data = notes
    .map(
      (note) =>
        `--- Nota ID: ${note.id} ---\n` +
        `Titolo: ${note.title}\n` +
        `Contenuto: ${note.content}\n` +
        `Tags: ${note.tags.join(", ")}\n` +
        `Task: ${
          note.isTask
            ? note.completed
              ? "Completato ✅"
              : "Da completare ⏳"
            : "No"
        }\n` +
        `Creato il: ${new Date(note.createdAt).toLocaleString()}\n` +
        `Aggiornato il: ${new Date(note.updatedAt).toLocaleString()}\n`
    )
    .join("\n\n");
  downloadFile(data, "note_organizer.txt", "text/plain");
  showToast("Note esportate in TXT!", 'success');
});

// Importa da file
document
  .getElementById("import-file-input")
  .addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let importedNotes = [];
        const content = e.target.result;

        if (file.name.endsWith(".json")) {
          // Importa da JSON
          const parsedData = JSON.parse(content);
          // Assicurati che sia un array di note e che le note abbiano le proprietà minime
          if (
            Array.isArray(parsedData) &&
            parsedData.every((n) => n.id && n.title)
          ) {
            // Normalizza i dati e assicurati che ogni nota abbia un ID univoco
            importedNotes = parsedData.map((note) => ({
              id: note.id || Date.now().toString(), 
              title: note.title || "Nota Senza Titolo",
              content: note.content || "",
              tags: Array.isArray(note.tags) ? note.tags : [],
              isTask: note.isTask === true,
              completed: note.completed === true,
              createdAt: note.createdAt || new Date().toISOString(),
              updatedAt: note.updatedAt || new Date().toISOString(),
            }));
          } else {
            throw new Error("Formato JSON non valido per un array di note.");
          }
        } else if (file.name.endsWith(".txt")) {
          // Importa da TXT (aggiunge un'unica nota con il contenuto)
          const newNote = {
            id: Date.now().toString(),
            title: `Importata da file TXT: ${file.name}`,
            content: content,
            tags: ["import", "txt"],
            isTask: false,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          importedNotes = [newNote];
        } else {
          throw new Error(
            "Tipo di file non supportato (accetto solo .json o .txt)."
          );
        }

        // Aggiunge le note importate all'inizio
        notes.unshift(...importedNotes);
        saveNotes();
        renderNotes();
        renderTags();
        showToast(`${importedNotes.length} note importate con successo!`, 'success');
        // Resetta l'input file per poter caricare lo stesso file di nuovo
        event.target.value = "";
      } catch (error) {
        showToast(`Errore durante l'importazione: ${error.message}`, 'error');
        // Resetta l'input file
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  });

// --- DELETE LOGIC ---

document.getElementById("delete-note").addEventListener("click", () => {
  document.getElementById("note-modal").classList.remove("show");

  deleteAction = "delete-single";
  const confirmMsg = document.getElementById("confirm-message");
  const noteToDelete = notes.find((n) => n.id === currentNoteId);

  confirmMsg.textContent = `Sei sicuro di voler eliminare la nota: "${noteToDelete.title}"?`;

  document.getElementById("confirm-modal").classList.add("show");
  document.getElementById("modal-overlay").classList.add("show");
});

// Gestione del dropdown Opzioni Elimina
document
  .querySelectorAll(".dropdown-menu:not(#data-menu) .dropdown-item")
  .forEach((item) => {
    item.addEventListener("click", () => {
      deleteAction = item.dataset.action;
      openDeleteConfirmation();
      document.getElementById("delete-menu").classList.remove("show");
    });
  });

function openDeleteConfirmation() {
  const confirmMsg = document.getElementById("confirm-message");
  const filteredNotes = filterNotes();

  switch (deleteAction) {
    case "delete-all":
      confirmMsg.textContent = `Vuoi eliminare TUTTE le ${notes.length} note?`;
      break;
    case "delete-all-completed":
      const allCompleted = notes.filter((n) => n.completed);
      confirmMsg.textContent = `Vuoi eliminare tutte le ${allCompleted.length} note completate?`;
      break;
    case "delete-filtered":
      confirmMsg.textContent = `Vuoi eliminare le ${filteredNotes.length} note filtrate?`;
      break;
    case "delete-filtered-completed":
      const filteredCompleted = filteredNotes.filter((n) => n.completed);
      confirmMsg.textContent = `Vuoi eliminare le ${filteredCompleted.length} note completate tra quelle filtrate?`;
      break;
  }

  document.getElementById("confirm-modal").classList.add("show");
  document.getElementById("modal-overlay").classList.add("show");
}

document.getElementById("confirm-delete").addEventListener("click", () => {
  executeDelete();
  closeConfirmModal();
});

document
  .getElementById("cancel-delete")
  .addEventListener("click", closeConfirmModal);

function executeDelete() {
  const filteredNotes = filterNotes();
  let count = 0;

  switch (deleteAction) {
    case "delete-all":
      count = notes.length;
      notes = [];
      break;
    case "delete-all-completed":
      const beforeCount = notes.length;
      notes = notes.filter((n) => !n.completed);
      count = beforeCount - notes.length;
      break;
    case "delete-filtered":
      const filteredIds = new Set(filteredNotes.map((n) => n.id));
      count = filteredIds.size;
      notes = notes.filter((n) => !filteredIds.has(n.id));
      break;
    case "delete-filtered-completed":
      const completedFilteredIds = new Set(
        filteredNotes.filter((n) => n.completed).map((n) => n.id)
      );
      count = completedFilteredIds.size;
      notes = notes.filter((n) => !completedFilteredIds.has(n.id));
      break;
    case "delete-single":
      notes = notes.filter((n) => n.id !== currentNoteId);
      count = 1;
      currentNoteId = null;
      break;
  }

  saveNotes();
  renderNotes();
  renderTags();
  showToast(`${count} note eliminate`, 'success');
}

function closeConfirmModal() {
  document.getElementById("confirm-modal").classList.remove("show");
  document.getElementById("modal-overlay").classList.remove("show");
}

// --- NOTE MANAGEMENT (CREATE/EDIT) ---

document.getElementById("add-note-btn").addEventListener("click", () => {
  currentNoteId = null;
  document.getElementById("modal-title").textContent = "✏️ Aggiungi nota";
  document.getElementById("note-title").value = "";
  document.getElementById("note-content").value = "";
  document.getElementById("note-tags").value = "";
  document.getElementById("is-task").checked = false;
  document.getElementById("is-completed").checked = false;
  document.getElementById("task-completed-container").classList.add("hidden");
  document.getElementById("delete-note").classList.add("hidden");
  document.getElementById("note-modal").classList.add("show");
  document.getElementById("modal-overlay").classList.add("show");
});

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("note-modal").classList.remove("show");
  document.getElementById("modal-overlay").classList.remove("show");
});

document.getElementById("is-task").addEventListener("change", (e) => {
  document
    .getElementById("task-completed-container")
    .classList.toggle("hidden", !e.target.checked);
});

document.getElementById("save-note").addEventListener("click", () => {
  const title = document.getElementById("note-title").value.trim();
  const content = document.getElementById("note-content").value.trim();
  const tags = document
    .getElementById("note-tags")
    .value.split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const isTask = document.getElementById("is-task").checked;
  const completed = document.getElementById("is-completed").checked;

  if (!title) {
    showToast("Inserisci un titolo", 'error');
    return;
  }

  const isNew = !currentNoteId;

  const note = {
    id: currentNoteId || Date.now().toString(),
    title,
    content,
    tags,
    isTask,
    completed: isTask ? completed : false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (currentNoteId) {
    const index = notes.findIndex((n) => n.id === currentNoteId);
    notes[index] = note;
  } else {
    notes.unshift(note);
  }

  saveNotes();
  renderNotes();
  renderTags();
  document.getElementById("note-modal").classList.remove("show");
  document.getElementById("modal-overlay").classList.remove("show");
  showToast(`Nota ${isNew ? 'creata' : 'aggiornata'}!`, 'success');
});

window.editNote = (id) => {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  currentNoteId = id;
  document.getElementById("modal-title").textContent = "✏️ Modifica nota";
  document.getElementById("note-title").value = note.title;
  document.getElementById("note-content").value = note.content;
  document.getElementById("note-tags").value = note.tags.join(", ");
  document.getElementById("is-task").checked = note.isTask;
  document.getElementById("is-completed").checked = note.completed;
  document
    .getElementById("task-completed-container")
    .classList.toggle("hidden", !note.isTask);
  document.getElementById("delete-note").classList.remove("hidden");
  document.getElementById("note-modal").classList.add("show");
  document.getElementById("modal-overlay").classList.add("show");
};

// --- RENDERING & FILTERING ---

document.getElementById("search-input").addEventListener("input", renderNotes);

function filterNotes() {
  const query = document.getElementById("search-input").value.toLowerCase();
  return notes.filter((note) => {
    const matchesSearch =
      !query ||
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some((t) => t.toLowerCase().includes(query));

    const matchesTags =
      activeTagFilters.length === 0 ||
      activeTagFilters.every((tag) => note.tags.includes(tag));

    return matchesSearch && matchesTags;
  });
}

function updateSummary(filteredNotes) {
  const summaryCard = document.getElementById("notes-summary-card");
  const summaryText = document.getElementById("summary-text");
  const progressFill = document.getElementById("progress-fill");
  const progressEmoji = document.getElementById("progress-emoji");

  // FILTRIAMO SOLO LE NOTE CHE SONO ATTIVITÀ (isTask: true)
  const taskNotes = filteredNotes.filter((n) => n.isTask);

  const totalTasks = taskNotes.length;
  const completedTasks = taskNotes.filter((n) => n.completed).length;

  if (totalTasks === 0) {
    summaryCard.classList.add("hidden");
    return;
  }

  summaryCard.classList.remove("hidden");

  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Applichiamo il grassetto come richiesto
  summaryText.innerHTML = `
            Hai completato <strong>${completedTasks} </strong> di <strong>${totalTasks}</strong> attività filtrate.
            <span style="font-weight: 800; color: var(--primary-color);">(${percentage}%)</span>
        `;

  progressFill.style.width = `${percentage}%`;

  let emoji = "";
  if (percentage === 0) emoji = "😔";
  else if (percentage < 30) emoji = "🤔";
  else if (percentage < 70) emoji = "💪";
  else if (percentage < 100) emoji = "🥳";
  else emoji = "🚀";

  progressEmoji.textContent = emoji;
}

function renderNotes() {
  const grid = document.getElementById("notes-grid");
  const filtered = filterNotes();

  // Aggiorna il riepilogo solo con le attività
  updateSummary(filtered);

  if (filtered.length === 0) {
    grid.innerHTML =
      '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-tertiary);">Nessuna nota trovata</div>';
    return;
  }

  grid.innerHTML = filtered
    .map(
      (note) => `
        <div class="note-card ${
          note.completed ? "completed" : ""
        }" onclick="editNote('${note.id}')">
          <h3 style="font-size: 1.25rem; margin-bottom: 0.75rem;">
             <strong style="${
            note.completed
              ? "text-decoration: line-through; color: var(--text-secondary);"
              : "color: var(--text-primary);"
          }">${note.title}</strong>
          </h3>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">${note.content.substring(
            0,
            150
          )}${note.content.length > 150 ? "..." : ""}</p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
            ${note.tags
              .map(
                (tag) =>
                  `<span style="background: var(--bg-tertiary); padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.875rem; color: var(--text-primary); font-weight: 500;">#${tag}</span>`
              )
              .join("")}
          </div>
          ${
            note.isTask
              ? `<div style="margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--border-light); font-weight: 700; color: ${
                  note.completed ? "var(--success-color)" : "#f59e0b"
                };">${
                  note.completed ? "✅ Completato" : "⏳ Da completare"
                }</div>`
              : ""
          }
        </div>
      `
    )
    .join("");
}

function renderTags() {
  const tagList = document.getElementById("tag-list");
  // 1. Ottiene tutti i tag unici e conta quante note li contengono
  const tagCounts = notes
    .flatMap((n) => n.tags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

  const allTags = Object.keys(tagCounts).sort();

  // 2. Renderizza la lista con il conteggio
  tagList.innerHTML = allTags
    .map((tag) => {
      const count = tagCounts[tag];
      const isActive = activeTagFilters.includes(tag);
      const activeClass = isActive ? "active" : "";

      return `
          <div 
            class="tag-item ${activeClass}" 
            onclick="toggleTag('${tag}')"
          >
            <span>🏷️ ${tag}</span>
            <span class="tag-count">${count}</span>
          </div>
        `;
    })
    .join("");
}

window.toggleTag = (tag) => {
  const index = activeTagFilters.indexOf(tag);
  if (index === -1) {
    activeTagFilters.push(tag);
  } else {
    activeTagFilters.splice(index, 1);
  }
  renderTags();
  renderNotes();
};

// --- INITIALIZATION ---

document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  showToast('Tema modificato', 'info');
});

const deleteDropdownBtn = document.getElementById("delete-dropdown-btn");
const deleteDropdownMenu = document.getElementById("delete-menu");
const dataDropdownBtn = document.getElementById("data-dropdown-btn");
const dataDropdownMenu = document.getElementById("data-menu");

// Gestione dei dropdown
[
  [deleteDropdownBtn, deleteDropdownMenu],
  [dataDropdownBtn, dataDropdownMenu],
].forEach(([btn, menu]) => {
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Chiudi l'altro dropdown se aperto
      const otherMenu =
        menu === deleteDropdownMenu ? dataDropdownMenu : deleteDropdownMenu;
      if (otherMenu) otherMenu.classList.remove("show");

      menu.classList.toggle("show");
    });

    menu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
});

document.addEventListener("click", () => {
  deleteDropdownMenu.classList.remove("show");
  if (dataDropdownMenu) dataDropdownMenu.classList.remove("show");
});

loadNotes();
renderNotes();
renderTags();