document.addEventListener("DOMContentLoaded", function () {
  // Verifica che math.js sia caricato correttamente
  if (typeof math === "undefined") {
    console.error("math.js non è stato caricato correttamente");
    alert(
      "Errore: math.js non è stato caricato. Ricarica la pagina o controlla la console per dettagli.",
    );
    return;
  }

  // Theme toggle functionality
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-theme") ? "dark" : "light",
    );
  });

  // Check for saved theme preference
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
  }

  // Navigation active state
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      window.scrollTo({
        top: targetElement.offsetTop - 70,
        behavior: "smooth",
      });
    });
  });

  // Terms slider value display
  const termsSlider = document.getElementById("terms-slider");
  const termsValue = document.getElementById("terms-value");
  termsSlider.addEventListener("input", function () {
    termsValue.textContent = this.value;
  });

  // Initialize chart
  let taylorChart;
  const ctx = document.getElementById("taylor-chart").getContext("2d");

  function initChart() {
    taylorChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Funzione originale",
            borderColor: getComputedStyle(
              document.documentElement,
            ).getPropertyValue("--function-color"),
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
          },
          {
            label: "Approssimazione di Taylor",
            borderColor: getComputedStyle(
              document.documentElement,
            ).getPropertyValue("--approximation-color"),
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "linear",
            position: "center",
            grid: {
              color: getComputedStyle(
                document.documentElement,
              ).getPropertyValue("--border-color"),
            },
            ticks: {
              color: getComputedStyle(
                document.documentElement,
              ).getPropertyValue("--text-color"),
            },
          },
          y: {
            type: "linear",
            position: "center",
            grid: {
              color: getComputedStyle(
                document.documentElement,
              ).getPropertyValue("--border-color"),
            },
            ticks: {
              color: getComputedStyle(
                document.documentElement,
              ).getPropertyValue("--text-color"),
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: (${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(4)})`;
              },
            },
          },
        },
      },
    });
  }

  initChart();

  // Function to update chart based on user inputs
  function updateChart() {
    const functionExpression = document.getElementById("function-input").value;
    const centerPoint = parseFloat(
      document.getElementById("center-point").value,
    );
    const terms = parseInt(document.getElementById("terms-slider").value);
    const xMin = parseFloat(document.getElementById("x-min").value);
    const xMax = parseFloat(document.getElementById("x-max").value);

    // Clear any previous error messages
    const errorElement = document.getElementById("function-error");
    errorElement.classList.remove("visible");

    // Validate function expression
    try {
      // Test if the function can be evaluated
      const testValue = evaluateFunction(functionExpression, 1);
      if (isNaN(testValue)) {
        throw new Error("Invalid function expression");
      }
    } catch (error) {
      // Show error message
      errorElement.textContent =
        "Errore: espressione non valida. Prova con 'sin(x)', 'x^2', ecc.";
      errorElement.classList.add("visible");
      return;
    }

    // Generate data points
    const originalData = [];
    const taylorData = [];

    // Generate 200 points for smooth curves
    const step = (xMax - xMin) / 200;

    for (let x = xMin; x <= xMax; x += step) {
      // Original function
      try {
        const originalY = evaluateFunction(functionExpression, x);
        if (!isNaN(originalY) && isFinite(originalY)) {
          originalData.push({ x, y: originalY });
        }
      } catch (e) {
        // Skip points where the function is not defined
      }

      // Taylor approximation
      try {
        const taylorY = evaluateTaylorSeries(
          functionExpression,
          x,
          centerPoint,
          terms,
        );
        if (!isNaN(taylorY) && isFinite(taylorY)) {
          taylorData.push({ x, y: taylorY });
        }
      } catch (e) {
        // Skip points where the approximation is not defined
      }
    }

    // Update chart data
    taylorChart.data.datasets[0].data = originalData;
    taylorChart.data.datasets[1].data = taylorData;
    taylorChart.update();

    // Update expansion formula
    const expansionHTML = generateExpansionHTML(
      functionExpression,
      centerPoint,
      terms,
    );
    document.getElementById("expansion-formula").innerHTML = expansionHTML;

    // Render math with MathJax
    if (typeof MathJax !== "undefined") {
      MathJax.typeset();
    }
  }

  // Function evaluation using math.js
  function evaluateFunction(expression, x) {
    try {
      // Check for the specific complex rational function
      if (expression.trim() === "100/(1+x)^3+4/(1+x)^3+4/(1+x)^2+4/(1+x)") {
        // Simplify the expression: 104/(1+x)^3 + 4/(1+x)^2 + 4/(1+x)
        return 104 / Math.pow(1 + x, 3) + 4 / Math.pow(1 + x, 2) + 4 / (1 + x);
      }

      // Create a scope with the x value
      const scope = { x: x };
      // Evaluate the expression
      return math.evaluate(expression, scope);
    } catch (error) {
      console.error("Error evaluating function:", error);
      return NaN;
    }
  }

  // Taylor series evaluation
  function evaluateTaylorSeries(expression, x, a, terms) {
    let result = 0;

    // For built-in functions, use the predefined Taylor expansions
    const lowerExpression = expression.toLowerCase().trim();

    if (lowerExpression === "sin(x)") {
      return evaluateBuiltInTaylor("sin", x, a, terms);
    } else if (lowerExpression === "cos(x)") {
      return evaluateBuiltInTaylor("cos", x, a, terms);
    } else if (lowerExpression === "exp(x)" || lowerExpression === "e^x") {
      return evaluateBuiltInTaylor("exp", x, a, terms);
    } else if (lowerExpression === "log(x)" || lowerExpression === "ln(x)") {
      return evaluateBuiltInTaylor("log", x, a, terms);
    } else if (lowerExpression === "1/(1-x)") {
      return evaluateBuiltInTaylor("geometric", x, a, terms);
    } else if (
      lowerExpression === "sqrt(1+x)" ||
      lowerExpression === "sqrt(1 + x)"
    ) {
      return evaluateBuiltInTaylor("sqrt1px", x, a, terms);
    } else if (lowerExpression === "100/(1+x)^3+4/(1+x)^3+4/(1+x)^2+4/(1+x)") {
      return evaluateComplexRationalTaylor(x, a, terms);
    }

    // For custom functions, use numerical differentiation
    for (let n = 0; n < terms; n++) {
      const derivative = numericalDerivative(expression, a, n);
      result += (derivative / factorial(n)) * Math.pow(x - a, n);
    }

    return result;
  }

  // Evaluate Taylor series for the complex rational function
  function evaluateComplexRationalTaylor(x, a, terms) {
    // If a is 0, we can use a direct expansion
    if (a === 0) {
      // For 104/(1+x)^3 + 4/(1+x)^2 + 4/(1+x) at a=0
      // The expansion at x=0 is:
      // 104 * (1 - 3x + 6x^2 - 10x^3 + ...) +
      // 4 * (1 - 2x + 3x^2 - 4x^3 + ...) +
      // 4 * (1 - x + x^2 - x^3 + ...)
      let result = 0;

      // First term: 104/(1+x)^3
      for (let n = 0; n < terms; n++) {
        const coef = 104 * binomialCoefficient(n + 2, 2) * Math.pow(-1, n);
        result += coef * Math.pow(x, n);
      }

      // Second term: 4/(1+x)^2
      for (let n = 0; n < terms; n++) {
        const coef = 4 * (n + 1) * Math.pow(-1, n);
        result += coef * Math.pow(x, n);
      }

      // Third term: 4/(1+x)
      for (let n = 0; n < terms; n++) {
        const coef = 4 * Math.pow(-1, n);
        result += coef * Math.pow(x, n);
      }

      return result;
    } else {
      // For a ≠ 0, use numerical differentiation
      let result = 0;

      // Define the function
      const func = (t) => {
        return 104 / Math.pow(1 + t, 3) + 4 / Math.pow(1 + t, 2) + 4 / (1 + t);
      };

      // Calculate Taylor series using numerical derivatives
      for (let n = 0; n < terms; n++) {
        const derivative = numericalDerivativeFunc(func, a, n);
        result += (derivative / factorial(n)) * Math.pow(x - a, n);
      }

      return result;
    }
  }

  // Binomial coefficient calculation
  function binomialCoefficient(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;

    let result = 1;
    for (let i = 1; i <= k; i++) {
      result *= n - (k - i);
      result /= i;
    }
    return result;
  }

  // Numerical differentiation for a function
  function numericalDerivativeFunc(func, x, order, h = 0.0001) {
    if (order === 0) {
      return func(x);
    }

    // First derivative using central difference
    if (order === 1) {
      return (func(x + h) - func(x - h)) / (2 * h);
    }

    // Higher order derivatives using recursion
    const deriv1 = (t) => numericalDerivativeFunc(func, t, order - 1, h);
    return (deriv1(x + h) - deriv1(x - h)) / (2 * h);
  }

  // Evaluate built-in Taylor series
  function evaluateBuiltInTaylor(type, x, a, terms) {
    let result = 0;

    switch (type) {
      case "sin":
        if (a === 0) {
          // sin(x) = x - x^3/3! + x^5/5! - ...
          for (let n = 0; n < terms; n++) {
            const power = 2 * n + 1;
            const coefficient = Math.pow(-1, n) / factorial(power);
            result += coefficient * Math.pow(x, power);
          }
        } else {
          // Use the general formula for a ≠ 0
          const sinA = Math.sin(a);
          const cosA = Math.cos(a);

          result = sinA;
          if (terms > 1) result += cosA * (x - a);

          for (let n = 2; n < terms; n++) {
            const power = n;
            let coefficient;

            if (power % 4 === 0) coefficient = sinA;
            else if (power % 4 === 1) coefficient = cosA;
            else if (power % 4 === 2) coefficient = -sinA;
            else coefficient = -cosA;

            result += (coefficient * Math.pow(x - a, power)) / factorial(power);
          }
        }
        break;

      case "cos":
        if (a === 0) {
          // cos(x) = 1 - x^2/2! + x^4/4! - ...
          for (let n = 0; n < terms; n++) {
            const power = 2 * n;
            const coefficient = Math.pow(-1, n) / factorial(power);
            result += coefficient * Math.pow(x, power);
          }
        } else {
          // Use the general formula for a ≠ 0
          const sinA = Math.sin(a);
          const cosA = Math.cos(a);

          result = cosA;
          if (terms > 1) result += -sinA * (x - a);

          for (let n = 2; n < terms; n++) {
            const power = n;
            let coefficient;

            if (power % 4 === 0) coefficient = cosA;
            else if (power % 4 === 1) coefficient = -sinA;
            else if (power % 4 === 2) coefficient = -cosA;
            else coefficient = sinA;

            result += (coefficient * Math.pow(x - a, power)) / factorial(power);
          }
        }
        break;

      case "exp":
        if (a === 0) {
          // e^x = 1 + x + x^2/2! + x^3/3! + ...
          for (let n = 0; n < terms; n++) {
            result += Math.pow(x, n) / factorial(n);
          }
        } else {
          // e^x = e^a * (1 + (x-a) + (x-a)^2/2! + ...)
          const expA = Math.exp(a);
          for (let n = 0; n < terms; n++) {
            result += (expA * Math.pow(x - a, n)) / factorial(n);
          }
        }
        break;

      case "log":
        if (a <= 0) a = 1; // Avoid log(0) or negative

        if (a === 1) {
          // ln(x) = (x-1) - (x-1)^2/2 + (x-1)^3/3 - ...
          for (let n = 1; n < terms + 1; n++) {
            const sign = n % 2 === 1 ? 1 : -1;
            result += (sign * Math.pow(x - 1, n)) / n;
          }
        } else {
          // ln(x) = ln(a) + (x-a)/a - (x-a)^2/(2*a^2) + ...
          result = Math.log(a);
          for (let n = 1; n < terms; n++) {
            const sign = n % 2 === 1 ? 1 : -1;
            result += (sign * Math.pow(x - a, n)) / (n * Math.pow(a, n));
          }
        }
        break;

      case "geometric":
        if (a === 0) {
          // 1/(1-x) = 1 + x + x^2 + x^3 + ...
          for (let n = 0; n < terms; n++) {
            result += Math.pow(x, n);
          }
        } else {
          // Use the general formula for a ≠ 0
          const factor = 1 / (1 - a);
          for (let n = 0; n < terms; n++) {
            result += Math.pow(factor, n + 1) * Math.pow(x - a, n);
          }
        }
        break;

      case "sqrt1px":
        if (a === 0) {
          // sqrt(1+x) = 1 + x/2 - x^2/8 + ...
          result = 1;
          if (terms > 1) result += x / 2;

          for (let n = 2; n < terms; n++) {
            const numerator = 1;
            let denominator = Math.pow(2, n);

            // Calculate the binomial coefficient
            for (let k = 1; k < n; k++) {
              denominator *= (2 * k + 1) / (k + 1);
            }

            const sign = n % 2 === 1 ? 1 : -1;
            result += (sign * Math.pow(x, n)) / denominator;
          }
        } else {
          // Use numerical differentiation for a ≠ 0
          const sqrtA = Math.sqrt(1 + a);
          result = sqrtA;

          for (let n = 1; n < terms; n++) {
            let derivative = 0;

            if (n === 1) {
              derivative = 1 / (2 * Math.sqrt(1 + a));
            } else {
              // Calculate higher derivatives using the formula
              let coef = 1;
              for (let k = 0; k < n - 1; k++) {
                coef *= (2 * k + 1) / (2 * (k + 1));
              }
              coef *= Math.pow(-1, n - 1) / Math.pow(2, n);
              derivative = coef * Math.pow(1 + a, -n + 0.5);
            }

            result += (derivative * Math.pow(x - a, n)) / factorial(n);
          }
        }
        break;
    }

    return result;
  }

  // Numerical differentiation using central difference
  function numericalDerivative(expression, x, order, h = 0.0001) {
    if (order === 0) {
      return evaluateFunction(expression, x);
    }

    // First derivative using central difference
    if (order === 1) {
      return (
        (evaluateFunction(expression, x + h) -
          evaluateFunction(expression, x - h)) /
        (2 * h)
      );
    }

    // Higher order derivatives using recursion
    return (
      (numericalDerivative(expression, x + h, order - 1, h) -
        numericalDerivative(expression, x - h, order - 1, h)) /
      (2 * h)
    );
  }

  // Factorial function
  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  // Generate Taylor series expansion HTML
  function generateExpansionHTML(expression, a, terms) {
    // For built-in functions, use the predefined expansions
    const lowerExpression = expression.toLowerCase().trim();

    if (lowerExpression === "sin(x)") {
      return generateBuiltInExpansionHTML("sin", a, terms);
    } else if (lowerExpression === "cos(x)") {
      return generateBuiltInExpansionHTML("cos", a, terms);
    } else if (lowerExpression === "exp(x)" || lowerExpression === "e^x") {
      return generateBuiltInExpansionHTML("exp", a, terms);
    } else if (lowerExpression === "log(x)" || lowerExpression === "ln(x)") {
      return generateBuiltInExpansionHTML("log", a, terms);
    } else if (lowerExpression === "1/(1-x)") {
      return generateBuiltInExpansionHTML("geometric", a, terms);
    } else if (
      lowerExpression === "sqrt(1+x)" ||
      lowerExpression === "sqrt(1 + x)"
    ) {
      return generateBuiltInExpansionHTML("sqrt1px", a, terms);
    } else if (lowerExpression === "100/(1+x)^3+4/(1+x)^3+4/(1+x)^2+4/(1+x)") {
      return generateComplexRationalExpansionHTML(a, terms);
    }

    // For custom functions, use f^(n)(a) notation
    let formula = `${expression} \\approx f(${a})`;

    for (let n = 1; n < terms; n++) {
      const sign = "+";
      formula += ` ${sign} \\frac{f^{(${n})}(${a})}{${n}!}(x-${a})^{${n}}`;
    }

    return formula;
  }

  // Generate expansion HTML for the complex rational function
  function generateComplexRationalExpansionHTML(a, terms) {
    if (a === 0) {
      // Direct expansion at x=0
      let formula = `\\frac{100}{(1+x)^3}+\\frac{4}{(1+x)^3}+\\frac{4}{(1+x)^2}+\\frac{4}{(1+x)} \\approx `;

      // Simplify to 104/(1+x)^3 + 4/(1+x)^2 + 4/(1+x)
      formula += `112`;

      if (terms > 1) {
        formula += ` - 320x`;
      }

      if (terms > 2) {
        formula += ` + 636x^2`;
      }

      if (terms > 3) {
        formula += ` - 1052x^3`;
      }

      if (terms > 4) {
        formula += ` + 1548x^4`;
      }

      return formula;
    } else {
      // For a ≠ 0, use the general Taylor series notation
      let formula = `\\frac{100}{(1+x)^3}+\\frac{4}{(1+x)^3}+\\frac{4}{(1+x)^2}+\\frac{4}{(1+x)} \\approx f(${a})`;

      for (let n = 1; n < terms; n++) {
        formula += ` + \\frac{f^{(${n})}(${a})}{${n}!}(x-${a})^{${n}}`;
      }

      return formula;
    }
  }

  // Generate expansion HTML for built-in functions
  function generateBuiltInExpansionHTML(type, a, terms) {
    let formula = "";

    switch (type) {
      case "sin":
        if (a === 0) {
          formula = `\\sin(x) \\approx `;
          for (let n = 0; n < terms; n++) {
            const power = 2 * n + 1;
            const sign = n === 0 ? "" : n % 2 === 0 ? " + " : " - ";

            formula += `${sign}\\frac{x^{${power}}}{${power}!}`;
          }
        } else {
          formula = `\\sin(x) \\approx \\sin(${a})`;
          if (terms > 1) formula += ` + \\cos(${a})(x-${a})`;

          for (let n = 2; n < terms; n++) {
            const power = n;
            let term;

            if (power % 4 === 0) term = `\\sin(${a})`;
            else if (power % 4 === 1) term = `\\cos(${a})`;
            else if (power % 4 === 2) term = `-\\sin(${a})`;
            else term = `-\\cos(${a})`;

            formula += ` + \\frac{${term}}{${power}!}(x-${a})^{${power}}`;
          }
        }
        break;

      case "cos":
        if (a === 0) {
          formula = `\\cos(x) \\approx `;
          for (let n = 0; n < terms; n++) {
            const power = 2 * n;
            const sign = n === 0 ? "" : n % 2 === 0 ? " + " : " - ";

            formula += `${sign}\\frac{x^{${power}}}{${power}!}`;
          }
        } else {
          formula = `\\cos(x) \\approx \\cos(${a})`;
          if (terms > 1) formula += ` - \\sin(${a})(x-${a})`;

          for (let n = 2; n < terms; n++) {
            const power = n;
            let term;

            if (power % 4 === 0) term = `\\cos(${a})`;
            else if (power % 4 === 1) term = `-\\sin(${a})`;
            else if (power % 4 === 2) term = `-\\cos(${a})`;
            else term = `\\sin(${a})`;

            formula += ` + \\frac{${term}}{${power}!}(x-${a})^{${power}}`;
          }
        }
        break;

      case "exp":
        if (a === 0) {
          formula = `e^x \\approx `;
          for (let n = 0; n < terms; n++) {
            const sign = n === 0 ? "" : " + ";
            formula += `${sign}\\frac{x^{${n}}}{${n}!}`;
          }
        } else {
          formula = `e^x \\approx e^{${a}}`;
          for (let n = 1; n < terms; n++) {
            formula += ` + \\frac{e^{${a}}}{${n}!}(x-${a})^{${n}}`;
          }
        }
        break;

      case "log":
        if (a === 1) {
          formula = `\\ln(x) \\approx `;
          for (let n = 1; n < terms + 1; n++) {
            const sign = n === 1 ? "" : n % 2 === 1 ? " + " : " - ";
            formula += `${sign}\\frac{(x-1)^{${n}}}{${n}}`;
          }
        } else {
          formula = `\\ln(x) \\approx \\ln(${a})`;
          for (let n = 1; n < terms; n++) {
            const sign = n % 2 === 1 ? "+" : "-";
            formula += ` ${sign} \\frac{1}{${n}}(\\frac{x-${a}}{${a}})^{${n}}`;
          }
        }
        break;

      case "geometric":
        if (a === 0) {
          formula = `\\frac{1}{1-x} \\approx `;
          for (let n = 0; n < terms; n++) {
            const sign = n === 0 ? "" : " + ";
            formula += `${sign}x^{${n}}`;
          }
        } else {
          const factor = `\\frac{1}{1-${a}}`;
          formula = `\\frac{1}{1-x} \\approx ${factor}`;
          for (let n = 1; n < terms; n++) {
            formula += ` + ${factor}^{${n + 1}}(x-${a})^{${n}}`;
          }
        }
        break;

      case "sqrt1px":
        if (a === 0) {
          formula = `\\sqrt{1+x} \\approx 1`;
          if (terms > 1) formula += ` + \\frac{x}{2}`;

          for (let n = 2; n < terms; n++) {
            const sign = n % 2 === 1 ? "+" : "-";
            formula += ` ${sign} \\frac{x^{${n}}}{${calculateSqrt1pxCoefficient(n)}}`;
          }
        } else {
          formula = `\\sqrt{1+x} \\approx \\sqrt{1+${a}}`;
          if (terms > 1) formula += ` + \\frac{1}{2\\sqrt{1+${a}}}(x-${a})`;

          for (let n = 2; n < terms; n++) {
            formula += ` + \\frac{f^{(${n})}(${a})}{${n}!}(x-${a})^{${n}}`;
          }
        }
        break;
    }

    return formula;
  }

  // Calculate coefficient for sqrt(1+x) expansion
  function calculateSqrt1pxCoefficient(n) {
    let denominator = Math.pow(2, n);

    // Calculate the binomial coefficient
    for (let k = 1; k < n; k++) {
      denominator *= (2 * k + 1) / (k + 1);
    }

    return denominator.toFixed(0);
  }

  // Event listeners for visualization controls
  document
    .getElementById("update-chart-btn")
    .addEventListener("click", updateChart);

  // Calculator functionality
  document
    .getElementById("calculate-btn")
    .addEventListener("click", function () {
      const functionExpression = document.getElementById("calc-function").value;
      const centerPoint = parseFloat(
        document.getElementById("calc-center").value,
      );
      const terms = parseInt(document.getElementById("calc-terms").value);
      const evalPoint = parseFloat(document.getElementById("calc-point").value);

      // Clear any previous error messages
      const errorElement = document.getElementById("calc-function-error");
      errorElement.classList.remove("visible");

      // Validate function expression
      try {
        // Test if the function can be evaluated
        const testValue = evaluateFunction(functionExpression, 1);
        if (isNaN(testValue)) {
          throw new Error("Invalid function expression");
        }
      } catch (error) {
        // Show error message
        errorElement.textContent =
          "Errore: espressione non valida. Prova con 'sin(x)', 'x^2', ecc.";
        errorElement.classList.add("visible");
        return;
      }

      // Calculate exact value
      const exactValue = evaluateFunction(functionExpression, evalPoint);

      // Calculate approximation
      const approximation = evaluateTaylorSeries(
        functionExpression,
        evalPoint,
        centerPoint,
        terms,
      );

      // Calculate errors
      const absoluteError = Math.abs(exactValue - approximation);
      const relativeError =
        exactValue !== 0 ? (absoluteError / Math.abs(exactValue)) * 100 : 0;

      // Display results
      document.getElementById("exact-result").textContent =
        exactValue.toFixed(8);
      document.getElementById("approximation-result").textContent =
        approximation.toFixed(8);
      document.getElementById("error-result").textContent =
        absoluteError.toFixed(8);
      document.getElementById("relative-error-result").textContent =
        relativeError.toFixed(4) + "%";

      // Generate expansion formula
      const expansionHTML = generateExpansionHTML(
        functionExpression,
        centerPoint,
        terms,
      );
      document.getElementById("calc-expansion").innerHTML = expansionHTML;

      // Generate coefficients table
      generateCoefficientsTable(functionExpression, centerPoint, terms);

      // Render math with MathJax
      if (typeof MathJax !== "undefined") {
        MathJax.typeset();
      }
    });

  // Generate coefficients table
  function generateCoefficientsTable(expression, a, terms) {
    const tableBody = document.querySelector("#coefficients-table tbody");
    tableBody.innerHTML = "";

    for (let n = 0; n < terms; n++) {
      const derivative = numericalDerivative(expression, a, n);
      const coefficient = derivative / factorial(n);

      const row = document.createElement("tr");

      const nCell = document.createElement("td");
      nCell.textContent = n;

      const derivativeCell = document.createElement("td");
      derivativeCell.textContent = derivative.toFixed(6);

      const coefficientCell = document.createElement("td");
      coefficientCell.textContent = coefficient.toFixed(6);

      row.appendChild(nCell);
      row.appendChild(derivativeCell);
      row.appendChild(coefficientCell);

      tableBody.appendChild(row);
    }
  }

  // Example cards functionality
  document.querySelectorAll(".try-example-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const card = this.closest(".example-card");
      const functionExpression = card.getAttribute("data-function");
      const centerPoint = parseFloat(card.getAttribute("data-center"));
      const terms = parseInt(card.getAttribute("data-terms"));

      // Set values in visualization section
      document.getElementById("function-input").value = functionExpression;
      document.getElementById("center-point").value = centerPoint;
      document.getElementById("terms-slider").value = terms;
      document.getElementById("terms-value").textContent = terms;

      // Set values in calculator section
      document.getElementById("calc-function").value = functionExpression;
      document.getElementById("calc-center").value = centerPoint;
      document.getElementById("calc-terms").value = terms;

      // Update chart
      updateChart();

      // Scroll to visualization section
      document.querySelector("#visualizzazione").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  // Initial chart update
  updateChart();
});
