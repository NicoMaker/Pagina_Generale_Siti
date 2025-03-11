async function loadCategoriesFromJSON() {
  try {
    const response = await fetch("JS/Categories.json"),
      data = await response.json();
    return data;
  } catch (error) {
    console.error("Errore durante il caricamento dei dati JSON:", error);
    return null;
  }
}

function generateCategoryHTML(categoryName, category, categoryClasses) {
  const containerClass = categoryClasses[categoryName],
    sortedCategory = category.sort((a, b) => a.name.localeCompare(b.name)),
    linksHTML = sortedCategory
      .map(
        (item) =>
          `<div class="${containerClass}" data-name="${item.name.toLowerCase()}"><a href="${
            item.link
          }" target="_blank">${item.name}</a></div>`
      )
      .join("");

  // Aggiungi la barra di ricerca per gli elementi della categoria
  const searchBarHTML = `
    <div class="category-search-container">
      <input type="text" id="categoryItemSearch" placeholder="Cerca in ${categoryName}..." class="category-search-input">
    </div>
    <div id="noItemsFound" class="no-items-found">Nessun elemento trovato.</div>
  `;

  return `<h2>${categoryName}</h2><br>${searchBarHTML}<div class="container" id="categoryItemsContainer">${linksHTML}</div>`;
}

async function displayCategory(categoryName) {
  const data = await loadCategoriesFromJSON();
  if (data) {
    const categories = data.categories,
      categoryClasses = data.categoryClasses,
      category = categories[categoryName];
    if (category) {
      document.getElementById("dati").innerHTML = generateCategoryHTML(
        categoryName,
        category,
        categoryClasses
      );

      // Aggiungi l'event listener per la ricerca degli elementi della categoria
      setupCategoryItemSearch();
    } else console.error(`La categoria '${categoryName}' non è stata trovata.`);
  }
}

// Nuova funzione per configurare la ricerca degli elementi della categoria
function setupCategoryItemSearch() {
  const searchInput = document.getElementById("categoryItemSearch"),
    noItemsFound = document.getElementById("noItemsFound"),
    itemsContainer = document.getElementById("categoryItemsContainer"),
    allItems = itemsContainer.querySelectorAll("div[data-name]");

  // Nascondi inizialmente il messaggio "Nessun elemento trovato"
  noItemsFound.style.display = "none";

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();
    let visibleCount = 0;

    allItems.forEach((item) => {
      const itemName = item.getAttribute("data-name");
      if (itemName.includes(searchTerm)) {
        item.style.display = "";
        visibleCount++;
      } else {
        item.style.display = "none";
      }
    });

    // Mostra o nascondi il messaggio "Nessun elemento trovato"
    if (visibleCount === 0 && searchTerm !== "") {
      noItemsFound.style.display = "block";
    } else {
      noItemsFound.style.display = "none";
    }

    // Adatta il contenitore in base al numero di elementi visibili
    adjustContainerLayout(visibleCount);
  });
}

// Funzione per adattare il layout del contenitore in base al numero di elementi visibili
function adjustContainerLayout(visibleCount) {
  const itemsContainer = document.getElementById("categoryItemsContainer");

  // Se ci sono solo 1, 2 o 3 elementi, aggiungi una classe per adattare il layout
  if (visibleCount <= 3) {
    itemsContainer.classList.add("adjusted-layout");
  } else {
    itemsContainer.classList.remove("adjusted-layout");
  }
}

function contactEmail(emailsubject, subjetmail) {
  const email = emailsubject,
    subject = `info sul sito ${subjetmail}`,
    mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  window.location.href = mailtoLink;
}

const contactCell = () => (window.location.href = "tel:+393337024320"),
  openWhatsAppChat = () => {
    const phoneNumber = "+393337024320",
      message = encodeURIComponent("*Info sul sito Pagina Generale Siti*");
    window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
  };

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput"),
    menuItems = document.querySelectorAll(".menu li"),
    menuContainer = document.querySelector(".menu"); // Contenitore del menu

  // Creazione del messaggio "Nessuna categoria trovata"
  const noResultsMessage = document.createElement("li");
  noResultsMessage.id = "noResultsMessage";
  noResultsMessage.textContent = "Nessuna categoria trovata.";
  noResultsMessage.style.color = "red";
  noResultsMessage.style.textAlign = "center";
  noResultsMessage.style.fontSize = "24px"; // Imposta la dimensione del testo a 24px
  noResultsMessage.style.fontWeight = "bold"; // Imposta il testo in grassetto
  noResultsMessage.style.display = "none"; // Inizialmente nascosto

  // Aggiungi il messaggio come elemento <li> dentro il menu
  menuContainer.appendChild(noResultsMessage);

  searchInput.addEventListener("input", function () {
    const filter = searchInput.value.toLowerCase().trim();
    let found = false;

    menuItems.forEach((item) => {
      const button = item.querySelector("button");
      if (button) {
        const text = button.textContent.toLowerCase();
        if (text.includes(filter)) {
          item.style.display = ""; // Mantiene lo stile originale
          found = true;
        } else item.style.display = "none";
      }
    });

    // Mostra o nasconde il messaggio "Nessuna categoria trovata"
    noResultsMessage.style.display = found ? "none" : "block";
  });
});
