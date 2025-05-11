document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    mobileMenu.addEventListener('click', function () {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            if (navMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('active');
            }

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });

                // Aggiorna la classe active per il link di navigazione
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Learn more button scroll
    document.getElementById('learn-more').addEventListener('click', function () {
        window.scrollTo({
            top: document.getElementById('introduzione').offsetTop - 70,
            behavior: 'smooth'
        });
    });

    // Visualization
    const canvas = document.getElementById('visualization-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    function setCanvasDimensions() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Sliders
    const elementsSlider = document.getElementById('elements-slider');
    const complexitySlider = document.getElementById('complexity-slider');
    const recursionSlider = document.getElementById('recursion-slider');

    const elementsValue = document.getElementById('elements-value');
    const complexityValue = document.getElementById('complexity-value');
    const recursionValue = document.getElementById('recursion-value');
    const predictabilityValue = document.getElementById('predictability-value');

    // Update values and visualization when sliders change
    elementsSlider.addEventListener('input', updateVisualization);
    complexitySlider.addEventListener('input', updateVisualization);
    recursionSlider.addEventListener('input', updateVisualization);

    // Nodes and connections for visualization
    let nodes = [];
    let connections = [];

    // Initialize visualization
    function initializeVisualization() {
        const duration = parseInt(elementsSlider.value);

        // Create nodes representing bonds in portfolio
        nodes = [];
        for (let i = 0; i < 20; i++) {
            const maturity = 1 + Math.floor(Math.random() * duration * 2);
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 5 + Math.random() * 5,
                color: getColorForMaturity(maturity, duration),
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                maturity: maturity
            });
        }

        // Create connections based on correlation
        connections = [];
        const rateChange = parseFloat(complexitySlider.value);
        const connectionProbability = 0.3 + rateChange * 0.2;

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (Math.random() < connectionProbability) {
                    connections.push({
                        from: i,
                        to: j,
                        strength: Math.random()
                    });
                }
            }
        }
    }

    // Get color based on maturity relative to target duration
    function getColorForMaturity(maturity, targetDuration) {
        // Bonds with maturity close to target duration are blue
        // Shorter bonds are green, longer bonds are red
        const diff = Math.abs(maturity - targetDuration);
        const ratio = diff / targetDuration;

        if (maturity < targetDuration) {
            // Green to blue
            return `hsl(${120 - ratio * 60}, 70%, 50%)`;
        } else {
            // Blue to red
            return `hsl(${240 - ratio * 60}, 70%, 50%)`;
        }
    }

    // Update visualization based on slider values
    function updateVisualization() {
        // Update display values
        elementsValue.textContent = elementsSlider.value;
        complexityValue.textContent = complexitySlider.value;
        recursionValue.textContent = recursionSlider.value;

        // Calculate immunization effectiveness
        const duration = parseInt(elementsSlider.value);
        const rateChange = parseFloat(complexitySlider.value);
        const convexity = parseFloat(recursionSlider.value);

        // Formula for immunization effectiveness:
        // Higher when duration matches liability duration (assumed to be equal to slider value)
        // Higher convexity provides additional protection
        // Larger rate changes reduce effectiveness unless convexity is high
        const durationMatch = 1 - Math.min(0.3, Math.abs(duration - 5) / 10);
        const convexityProtection = convexity * 0.2;
        const rateImpact = 1 - (rateChange * 0.2) + (convexity * rateChange * 0.2);

        const effectiveness = Math.min(0.99, Math.max(0.01, (durationMatch + convexityProtection) * rateImpact));
        predictabilityValue.textContent = effectiveness.toFixed(2);

        // Update node colors based on new duration target
        nodes.forEach(node => {
            node.color = getColorForMaturity(node.maturity, duration);
        });

        // Draw visualization
        drawVisualization();
    }

    // Draw the visualization
    function drawVisualization() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw yield curve
        drawYieldCurve();

        // Draw connections
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 1;

        connections.forEach(connection => {
            const fromNode = nodes[connection.from];
            const toNode = nodes[connection.to];

            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach(node => {
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Animate nodes
        animateNodes();
    }

    // Draw yield curve
    function drawYieldCurve() {
        const rateChange = parseFloat(complexitySlider.value);
        const convexity = parseFloat(recursionSlider.value);

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();

        // Draw a yield curve that changes shape based on rate change and convexity
        const baseRate = 2 + rateChange * 2;
        const steepness = 0.5 + rateChange * 0.5;
        const curvature = 0.1 + convexity * 0.2;

        for (let x = 0; x < canvas.width; x += 5) {
            const maturity = (x / canvas.width) * 20;
            const rate = baseRate + steepness * Math.log(1 + maturity) - curvature * Math.pow(maturity - 10, 2) / 100;
            const y = canvas.height - (rate / 10) * canvas.height * 0.8;

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
    }

    // Animate nodes
    function animateNodes() {
        nodes.forEach(node => {
            // Update position
            node.x += node.vx;
            node.y += node.vy;

            // Bounce off walls
            if (node.x < node.radius || node.x > canvas.width - node.radius) {
                node.vx *= -1;
            }

            if (node.y < node.radius || node.y > canvas.height - node.radius) {
                node.vy *= -1;
            }
        });

        // Request next frame
        requestAnimationFrame(drawVisualization);
    }

    // Carica dati personalizzati
    function loadCustomData() {
        // Imposta i valori degli slider in base ai dati personalizzati
        elementsSlider.value = 5;
        complexitySlider.value = 0.5;
        recursionSlider.value = 0.5;

        // Aggiorna la visualizzazione con i nuovi dati
        updateVisualization();
    }

    // Scroll progress bar
    const progressBar = document.getElementById('progress-bar');

    window.addEventListener('scroll', function () {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercentage = (scrollTop / documentHeight) * 100;

        progressBar.style.width = scrollPercentage + '%';

        // Aggiorna la sezione attiva in base allo scroll
        updateActiveSection();
    });

    // Animazioni al scroll
    const sections = document.querySelectorAll('.section');
    const conceptCards = document.querySelectorAll('.concept-card');
    const applicationItems = document.querySelectorAll('.application-item');
    const visualizationContainer = document.querySelector('.visualization-container');

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight * 0.75) &&
            rect.bottom >= 0
        );
    }

    function updateActiveSection() {
        let currentSectionId = '';
        let minDistance = Infinity;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top);

            if (distance < minDistance) {
                minDistance = distance;
                currentSectionId = section.id;
            }
        });

        // Aggiorna la classe active per la sezione corrente
        sections.forEach(section => {
            section.classList.remove('active-section');
            if (section.id === currentSectionId) {
                section.classList.add('active-section');
            }
        });

        // Aggiorna la classe active per il link di navigazione
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSectionId) {
                link.classList.add('active');
            }
        });
    }

    function handleScrollAnimations() {
        // Animazione per le concept cards
        conceptCards.forEach(card => {
            if (isElementInViewport(card)) {
                card.classList.add('visible');
            }
        });

        // Animazione per gli application items
        applicationItems.forEach(item => {
            if (isElementInViewport(item)) {
                item.classList.add('visible');
            }
        });

        // Animazione per il container di visualizzazione
        if (visualizationContainer && isElementInViewport(visualizationContainer)) {
            visualizationContainer.classList.add('visible');
        }
    }

    window.addEventListener('scroll', handleScrollAnimations);

    // Initialize and start visualization
    initializeVisualization();

    // Carica i dati personalizzati all'avvio
    loadCustomData();

    // Animate visualization
    drawVisualization();

    // Trigger scroll animations on page load
    handleScrollAnimations();
    updateActiveSection();
});