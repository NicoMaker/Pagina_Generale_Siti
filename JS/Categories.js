fetch("Categories.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Errore nel caricamento del file JSON");
    }
    return response.json();
  })
  .then((categories) => {
    function generateCategoryHTML(categoryName, category) {
      let linksHTML = "";
      category.forEach((item) => {
        if (categoryName == "Bici" || categoryName == "Salute")
          linksHTML += `<div class="contenitore1">`;
        else if (
          categoryName == "Borsa" ||
          categoryName == "Info_Paesi_Stati" ||
          categoryName == "Pasqua" ||
          categoryName == "Calendario"
        )
          linksHTML += `<div class="contenitore2">`;
        else linksHTML += `<div class="contenitore3">`;

        linksHTML += ` 
          <a href="${item.link}" target="_blank">${item.name}</a>
          </div>
          `;
      });
      return `
            <h2>${categoryName}</h2> 
            <br>
            <div class="container">${linksHTML}</div>
          `;
    }

    function displayCategory(categoryName) {
      const category = categories[categoryName];
      if (category) {
        document.getElementById("dati").innerHTML = generateCategoryHTML(
          categoryName,
          category
        );
      }
    }

    // Chiamata iniziale per visualizzare una categoria di default
    displayCategory("Matematica");
  })
  .catch((error) => {
    console.error("Si è verificato un errore:", error);
  });
