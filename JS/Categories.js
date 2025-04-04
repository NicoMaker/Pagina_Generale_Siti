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
    linksHTML = generateLinksHTML(sortedCategory, containerClass),
    searchBarHTML = generateSearchBarHTML(categoryName);

  return `<h2>${categoryName}</h2><br>${searchBarHTML}<div class="container" id="categoryItemsContainer">${linksHTML}</div>`;
}

const generateLinksHTML = (sortedCategory, containerClass) =>
    sortedCategory
      .map(
        (item) =>
          `<div class="${containerClass}" data-name="${item.name.toLowerCase()}"><a href="${
            item.link
          }" target="_blank">${item.name}</a></div>`
      )
      .join(""),
  generateSearchBarHTML = (categoryName) =>
    `
    <div class="category-search-container">
      <input type="text" id="categoryItemSearch" placeholder="Cerca in ${categoryName}..." class="category-search-input">
    </div>
    <br> 
    <div id="noItemsFound" class="no-items-found">Nessun elemento trovato.</div>
  `;

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
      setupCategoryItemSearch();
    } else console.error(`La categoria '${categoryName}' non è stata trovata.`);
  }
}

function setupCategoryItemSearch() {
  const searchInput = document.getElementById("categoryItemSearch"),
    noItemsFound = document.getElementById("noItemsFound"),
    itemsContainer = document.getElementById("categoryItemsContainer"),
    allItems = itemsContainer.querySelectorAll("div[data-name]");

  noItemsFound.style.display = "none";

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();
    filterItems(allItems, searchTerm, noItemsFound);
  });
}

function filterItems(allItems, searchTerm, noItemsFound) {
  let visibleCount = 0;

  allItems.forEach((item) => {
    const itemName = item.getAttribute("data-name");
    if (itemName.includes(searchTerm)) {
      item.style.display = "";
      visibleCount++;
    } else item.style.display = "none";
  });

  // Mostra o nascondi il messaggio "Nessun elemento trovato"
  noItemsFound.style.display =
    visibleCount === 0 && searchTerm !== "" ? "block" : "none";
  adjustContainerLayout(visibleCount);
}

// Funzione per adattare il layout del contenitore in base al numero di elementi visibili
function adjustContainerLayout(visibleCount) {
  const itemsContainer = document.getElementById("categoryItemsContainer");

  if (visibleCount <= 3) itemsContainer.classList.add("adjusted-layout");
  else itemsContainer.classList.remove("adjusted-layout");
}

// Funzione per generare il link per inviare un'email
function contactEmail(emailsubject, subjetmail) {
  const email = emailsubject,
    subject = `info sul sito ${subjetmail}`,
    mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  window.location.href = mailtoLink;
}

const contactCell = () => (window.location.href = "tel:+393337024320");

function openWhatsAppChat() {
  const phoneNumber = "+393337024320",
    message = encodeURIComponent("*Info sul sito Pagina Generale Siti*");
  window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
}

// Funzione per la ricerca nel menu delle categorie
function setupMenuSearch() {
  const searchInput = document.getElementById("searchInput"),
    menuItems = document.querySelectorAll(".menu li"),
    menuContainer = document.querySelector(".menu"),
    noResultsMessage = createNoResultsMessage(menuContainer);

  searchInput.addEventListener("input", function () {
    const filter = searchInput.value.toLowerCase().trim();
    let found = false;

    menuItems.forEach((item) => {
      const button = item.querySelector("button");
      if (button) {
        const text = button.textContent.toLowerCase();
        if (text.includes(filter)) {
          item.style.display = "";
          found = true;
        } else item.style.display = "none";
      }
    });

    noResultsMessage.style.display = found ? "none" : "block";
  });
}

// Funzione per creare il messaggio "Nessuna categoria trovata"
function createNoResultsMessage(menuContainer) {
  const noResultsMessage = document.createElement("li");
  noResultsMessage.id = "noResultsMessage";
  noResultsMessage.textContent = "Nessuna categoria trovata.";
  noResultsMessage.style.color = "red";
  noResultsMessage.style.textAlign = "center";
  noResultsMessage.style.fontSize = "24px";
  noResultsMessage.style.fontWeight = "bold";
  noResultsMessage.style.display = "none";

  menuContainer.appendChild(noResultsMessage);
  return noResultsMessage;
}

// Inizializza la ricerca nel menu quando il documento è pronto
document.addEventListener("DOMContentLoaded", setupMenuSearch);
