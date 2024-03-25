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
    } else {
      console.error(`La categoria '${categoryName}' non è stata trovata.`);
    }
  }
}