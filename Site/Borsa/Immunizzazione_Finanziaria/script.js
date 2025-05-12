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
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        canvas.style.width = canvas.offsetWidth + 'px';
        canvas.style.height = canvas.offsetHeight + 'px';
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
    let animationSpeed = 0.8; // Velocità di animazione aumentata (era 0.3)

    // Initialize visualization
    function initializeVisualization() {
        const duration = parseInt(elementsSlider.value);

        // Create nodes representing bonds in portfolio
        nodes = [];
        for (let i = 0; i < 20; i++) {
            const maturity = 1 + Math.floor(Math.random() * duration * 2);
            nodes.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                radius: 6 + Math.random() * 6,
                color: getColorForMaturity(maturity, duration),
                vx: (Math.random() - 0.5) * animationSpeed,
                vy: (Math.random() - 0.5) * animationSpeed,
                maturity: maturity,
                initialX: Math.random() * canvas.offsetWidth,
                initialY: Math.random() * canvas.offsetHeight,
                phase: Math.random() * Math.PI * 2
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
                        strength: Math.random(),
                        opacity: 0.1 + Math.random() * 0.3
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
            return `hsla(${120 - ratio * 60}, 80%, 50%, 0.8)`;
        } else {
            // Blue to red
            return `hsla(${240 - ratio * 60}, 80%, 50%, 0.8)`;
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

        // Animazione più veloce del valore di efficacia
        animateValue(predictabilityValue, parseFloat(predictabilityValue.textContent), effectiveness, 500); // Ridotto da 1000ms a 500ms

        // Update node colors based on new duration target
        nodes.forEach(node => {
            node.color = getColorForMaturity(node.maturity, duration);
        });

        // Draw visualization
        drawVisualization();
    }

    // Animazione fluida per il valore di efficacia
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = start + progress * (end - start);
            element.textContent = value.toFixed(2);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Draw the visualization
    function drawVisualization() {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        // Draw yield curve with gradient
        drawYieldCurve();

        // Draw connections with gradient
        connections.forEach(connection => {
            const fromNode = nodes[connection.from];
            const toNode = nodes[connection.to];

            const gradient = ctx.createLinearGradient(
                fromNode.x, fromNode.y,
                toNode.x, toNode.y
            );

            gradient.addColorStop(0, fromNode.color);
            gradient.addColorStop(1, toNode.color);

            ctx.strokeStyle = gradient;
            ctx.globalAlpha = connection.opacity;
            ctx.lineWidth = 1 + connection.strength * 2;

            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        // Draw nodes with glow effect
        nodes.forEach(node => {
            // Glow effect
            const gradient = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * 2
            );

            const color = node.color.replace('rgba', 'rgba').replace('0.8)', '0.1)');
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // Node
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(node.x - node.radius * 0.3, node.y - node.radius * 0.3, node.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Animate nodes
        animateNodes();
    }

    // Draw yield curve
    function drawYieldCurve() {
        const rateChange = parseFloat(complexitySlider.value);
        const convexity = parseFloat(recursionSlider.value);

        // Create gradient for the curve
        const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, 0);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(1, 'rgba(30, 58, 138, 0.8)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        // Draw a yield curve that changes shape based on rate change and convexity
        const baseRate = 2 + rateChange * 2;
        const steepness = 0.5 + rateChange * 0.5;
        const curvature = 0.1 + convexity * 0.2;

        // Smooth curve with more points
        for (let x = 0; x < canvas.offsetWidth; x += 2) {
            const maturity = (x / canvas.offsetWidth) * 20;
            const rate = baseRate + steepness * Math.log(1 + maturity) - curvature * Math.pow(maturity - 10, 2) / 100;
            const y = canvas.offsetHeight - (rate / 10) * canvas.offsetHeight * 0.8;

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Add glow effect to the curve
        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 12;
        ctx.globalAlpha = 0.1;
        ctx.stroke();
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.1;
        ctx.stroke();
        ctx.restore();
    }

    // Animate nodes with smoother, more organic movement - velocità aumentata
    function animateNodes() {
        const time = Date.now() * 0.002; // Velocità aumentata (era 0.001)

        nodes.forEach(node => {
            // Organic movement using sine waves with amplitude maggiore
            node.x = node.initialX + Math.sin(time * 0.8 + node.phase) * 30; // Velocità e ampiezza aumentate
            node.y = node.initialY + Math.cos(time * 0.6 + node.phase * 2) * 25; // Velocità e ampiezza aumentate

            // Ensure nodes stay within canvas
            if (node.x < node.radius) node.x = node.radius;
            if (node.x > canvas.offsetWidth - node.radius) node.x = canvas.offsetWidth - node.radius;
            if (node.y < node.radius) node.y = node.radius;
            if (node.y > canvas.offsetHeight - node.radius) node.y = canvas.offsetHeight - node.radius;
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
            rect.top <= (window.innerHeight * 0.8) &&
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
        conceptCards.forEach((card, index) => {
            if (isElementInViewport(card)) {
                // Aggiungi un ritardo progressivo per ogni card
                setTimeout(() => {
                    card.classList.add('visible');
                }, 100 * index); // Ridotto da 150ms a 100ms
            }
        });

        // Animazione per gli application items
        applicationItems.forEach((item, index) => {
            if (isElementInViewport(item)) {
                // Aggiungi un ritardo progressivo per ogni item
                setTimeout(() => {
                    item.classList.add('visible');
                }, 100 * index); // Ridotto da 150ms a 100ms
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
    setTimeout(() => {
        handleScrollAnimations();
        updateActiveSection();
    }, 100);
});