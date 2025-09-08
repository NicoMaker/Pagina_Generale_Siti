class BMICalculator {
    constructor() {
        this.isMetric = true;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.metricBtn = document.getElementById('metric-btn');
        this.imperialBtn = document.getElementById('imperial-btn');
        this.form = document.getElementById('bmi-form');
        this.heightInput = document.getElementById('height');
        this.weightInput = document.getElementById('weight');
        this.heightUnit = document.getElementById('height-unit');
        this.weightUnit = document.getElementById('weight-unit');
        this.result = document.getElementById('result');
        this.bmiNumber = document.getElementById('bmi-number');
        this.categoryText = document.getElementById('category-text');
        this.bmiIndicator = document.getElementById('bmi-indicator');
        this.adviceText = document.getElementById('advice-text');
    }

    bindEvents() {
        this.metricBtn.addEventListener('click', () => this.switchToMetric());
        this.imperialBtn.addEventListener('click', () => this.switchToImperial());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time calculation
        this.heightInput.addEventListener('input', () => this.calculateIfValid());
        this.weightInput.addEventListener('input', () => this.calculateIfValid());
    }

    switchToMetric() {
        this.isMetric = true;
        this.metricBtn.classList.add('active');
        this.imperialBtn.classList.remove('active');
        this.heightUnit.textContent = 'cm';
        this.weightUnit.textContent = 'kg';
        this.heightInput.placeholder = '170';
        this.weightInput.placeholder = '70';
        this.heightInput.value = '';
        this.weightInput.value = '';
        this.hideResult();
    }

    switchToImperial() {
        this.isMetric = false;
        this.imperialBtn.classList.add('active');
        this.metricBtn.classList.remove('active');
        this.heightUnit.textContent = 'in';
        this.weightUnit.textContent = 'lbs';
        this.heightInput.placeholder = '67';
        this.weightInput.placeholder = '154';
        this.heightInput.value = '';
        this.weightInput.value = '';
        this.hideResult();
    }

    handleSubmit(e) {
        e.preventDefault();
        this.calculateBMI();
    }

    calculateIfValid() {
        const height = parseFloat(this.heightInput.value);
        const weight = parseFloat(this.weightInput.value);
        
        if (height > 0 && weight > 0) {
            this.calculateBMI();
        }
    }

    calculateBMI() {
        const height = parseFloat(this.heightInput.value);
        const weight = parseFloat(this.weightInput.value);

        if (!height || !weight || height <= 0 || weight <= 0) {
            this.hideResult();
            return;
        }

        let bmi;
        if (this.isMetric) {
            // BMI = weight(kg) / height(m)²
            const heightInMeters = height / 100;
            bmi = weight / (heightInMeters * heightInMeters);
        } else {
            // BMI = (weight(lbs) / height(in)²) × 703
            bmi = (weight / (height * height)) * 703;
        }

        this.displayResult(bmi);
    }

    displayResult(bmi) {
        const roundedBMI = Math.round(bmi * 10) / 10;
        const category = this.getBMICategory(bmi);
        
        this.bmiNumber.textContent = roundedBMI.toFixed(1);
        this.categoryText.textContent = category.name;
        this.categoryText.className = `category ${category.class}`;
        
        this.updateIndicator(bmi);
        this.updateAdvice(category);
        this.showResult();
    }

    getBMICategory(bmi) {
        if (bmi < 18.5) {
            return {
                name: 'Sottopeso',
                class: 'underweight',
                advice: 'Il tuo BMI indica sottopeso. Considera di consultare un nutrizionista per un piano alimentare equilibrato che ti aiuti a raggiungere un peso salutare in modo graduale e sicuro.'
            };
        } else if (bmi < 25) {
            return {
                name: 'Peso Normale',
                class: 'normal',
                advice: 'Complimenti! Il tuo BMI è nella norma. Mantieni uno stile di vita attivo con esercizio regolare e una dieta equilibrata per preservare la tua salute ottimale.'
            };
        } else if (bmi < 30) {
            return {
                name: 'Sovrappeso',
                class: 'overweight',
                advice: 'Il tuo BMI indica sovrappeso. Considera di adottare abitudini più salutari: aumenta l\'attività fisica, riduci le porzioni e scegli cibi nutrienti. Consulta un professionista per un piano personalizzato.'
            };
        } else {
            return {
                name: 'Obesità',
                class: 'obese',
                advice: 'Il tuo BMI indica obesità. È importante consultare un medico per valutare i rischi per la salute e sviluppare un piano di gestione del peso sicuro ed efficace.'
            };
        }
    }

    updateIndicator(bmi) {
        // Calculate position on scale (0-100%)
        let position;
        if (bmi < 18.5) {
            // Underweight section (0-25%)
            position = Math.min((bmi / 18.5) * 25, 25);
        } else if (bmi < 25) {
            // Normal section (25-50%)
            position = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
        } else if (bmi < 30) {
            // Overweight section (50-75%)
            position = 50 + ((bmi - 25) / (30 - 25)) * 25;
        } else {
            // Obese section (75-100%)
            position = 75 + Math.min(((bmi - 30) / 10) * 25, 25);
        }

        this.bmiIndicator.style.left = `${Math.min(Math.max(position, 0), 100)}%`;
    }

    updateAdvice(category) {
        this.adviceText.textContent = category.advice;
    }

    showResult() {
        this.result.classList.remove('hidden');
        this.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideResult() {
        this.result.classList.add('hidden');
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BMICalculator();
});

// Add some smooth animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.calculator-card, .info-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});