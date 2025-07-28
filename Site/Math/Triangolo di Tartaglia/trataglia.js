document.addEventListener("DOMContentLoaded", () => {
  // Generate default triangle on page load
  generateTriangle();

  // Add keyboard support
  document.getElementById("number").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      generateTriangle();
    }
  });
});

function generateTriangle() {
  // Get and validate input
  const numberInput = document.getElementById("number");
  let number = Number.parseInt(numberInput.value);

  // Validate input
  if (isNaN(number) || number < 1) {
    number = 1;
    numberInput.value = 1;
  } else if (number > 10) {
    number = 10;
    numberInput.value = 10;
  }

  // Get output container
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";

  // Add loading state
  outputDiv.classList.add("loading");

  // Use setTimeout to allow for animation
  setTimeout(() => {
    // Generate Pascal's Triangle
    let prevRow = [];

    for (let i = 0; i < number; i++) {
      const row = [];

      // Calculate values for this row
      for (let j = 0; j <= i; j++) {
        if (j === 0 || j === i) {
          row.push(1);
        } else {
          row.push(prevRow[j - 1] + prevRow[j]);
        }
      }

      // Create row element with delay for animation
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("triangle-row");
      rowDiv.style.opacity = "0";
      rowDiv.style.transform = "translateY(10px)";
      outputDiv.appendChild(rowDiv);

      // Add numbers to row with animation
      row.forEach((value, index) => {
        const numberDiv = document.createElement("div");
        numberDiv.classList.add("triangle-number");

        // Add size classes based on digit count
        if (value > 99 && value <= 999) {
          numberDiv.classList.add("small");
        } else if (value > 999 && value <= 9999) {
          numberDiv.classList.add("medium");
        } else if (value > 9999) {
          numberDiv.classList.add("large");
        }

        // Add special class for 1s (the outer edges of the triangle)
        if (value === 1) {
          numberDiv.classList.add("edge-value");
        }

        // Create span for the number
        const numberSpan = document.createElement("span");
        numberSpan.innerText = value;
        numberDiv.appendChild(numberSpan);

        // Add tooltip for large numbers
        if (value > 999) {
          numberDiv.title = value;
        }

        // Add to row
        rowDiv.appendChild(numberDiv);

        // Add click event to show the binomial coefficient formula
        numberDiv.addEventListener("click", function () {
          showBinomialInfo(i, index, value);

          // Add pulse animation
          this.classList.add("pulse");
          setTimeout(() => {
            this.classList.remove("pulse");
          }, 500);
        });
      });

      // Animate row appearance
      setTimeout(() => {
        rowDiv.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        rowDiv.style.opacity = "1";
        rowDiv.style.transform = "translateY(0)";
      }, i * 100);

      // Save this row for next iteration
      prevRow = row;
    }

    // Remove loading state
    outputDiv.classList.remove("loading");
  }, 300);
}

function showBinomialInfo(n, k, value) {
  // Create or update info element
  let infoElement = document.querySelector(".binomial-info");

  if (!infoElement) {
    infoElement = document.createElement("div");
    infoElement.classList.add("binomial-info");
    document.querySelector(".triangle-container").appendChild(infoElement);
  }

  // Set content
  infoElement.innerHTML = `
    <div class="info-content">
      <h3>Coefficiente Binomiale</h3>
      <div class="formula">
        <span class="math-symbol">(</span>
        <div class="fraction">
          <span class="numerator">${n}</span>
          <span class="denominator">${k}</span>
        </div>
        <span class="math-symbol">)</span>
        <span class="equals">=</span>
        <span class="value">${value}</span>
      </div>
      <p>Rappresenta il numero di modi in cui si possono scegliere ${k} elementi da un insieme di ${n} elementi.</p>
    </div>
  `;

  // Show with animation
  infoElement.style.display = "block";
  infoElement.classList.add("fade-in");

  // Add close button
  const closeButton = document.createElement("button");
  closeButton.classList.add("close-btn");
  closeButton.innerHTML = "×";
  closeButton.addEventListener("click", () => {
    infoElement.style.display = "none";
  });

  infoElement.querySelector(".info-content").appendChild(closeButton);
}

// Add this CSS to the existing stylesheet
document.head.insertAdjacentHTML(
  "beforeend",
  `
<style>
.binomial-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--color-light);
  border: 2px solid var(--color-gold);
  border-radius: var(--border-radius);
  padding: 15px;
  box-shadow: var(--shadow);
  max-width: 300px;
  z-index: 10;
  display: none;
}

.info-content {
  position: relative;
}

.close-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-terracotta);
  color: white;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  padding: 0;
}

.formula {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px 0;
  font-size: 1.2rem;
}

.math-symbol {
  font-size: 1.5rem;
  margin: 0 5px;
}

.fraction {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 5px;
}

.numerator, .denominator {
  padding: 2px 5px;
}

.numerator {
  border-bottom: 1px solid var(--color-dark);
}

.equals {
  margin: 0 10px;
}

.value {
  font-weight: bold;
  color: var(--color-terracotta);
}

.loading {
  position: relative;
  min-height: 100px;
}

.loading::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-cream);
  border-top-color: var(--color-terracotta);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.edge-value {
  background-color: rgba(212, 175, 55, 0.2);
}
</style>
`,
);
