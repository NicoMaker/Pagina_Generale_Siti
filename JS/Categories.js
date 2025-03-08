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
    linksHTML = category
      .map(
        (item) =>
          `<div class="${containerClass}"><a href="${item.link}" target="_blank">${item.name}</a></div>`
      )
      .join("");
  return `<h2>${categoryName}</h2><br><div class="container">${linksHTML}</div>`;
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
    } else console.error(`La categoria '${categoryName}' non è stata trovata.`);
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
  const noResultsMessage = document.createElement("p");
  noResultsMessage.id = "noResultsMessage";
  noResultsMessage.textContent = "Nessuna categoria trovata.";
  noResultsMessage.style.color = "red";
  noResultsMessage.style.textAlign = "center";
  noResultsMessage.style.fontSize = "24px"; // Imposta la dimensione del testo a 24px
  noResultsMessage.style.fontWeight = "bold"; // Imposta il testo in grassetto
  noResultsMessage.style.marginBottom = "20px"; // Spazio sotto il messaggio
  noResultsMessage.style.display = "none"; // Inizialmente nascosto

  // Aggiungi il messaggio al contenitore del menu sopra le immagini
  menuContainer.insertBefore(noResultsMessage, menuContainer.firstChild);

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
        } else {  
          item.style.display = "none";  
        }  
      }  
    });  

    // Mostra o nasconde il messaggio "Nessuna categoria trovata"  
    noResultsMessage.style.display = found ? "none" : "block";
  });
});
