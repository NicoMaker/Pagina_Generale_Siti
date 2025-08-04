        // Conversion data
        const conversions = {
            length: {
                units: {
                    m: { name: 'Metro (m)', factor: 1 },
                    cm: { name: 'Centimetro (cm)', factor: 0.01 },
                    mm: { name: 'Millimetro (mm)', factor: 0.001 },
                    km: { name: 'Chilometro (km)', factor: 1000 },
                    ft: { name: 'Piede (ft)', factor: 0.3048 },
                    in: { name: 'Pollice (in)', factor: 0.0254 },
                    yd: { name: 'Iarda (yd)', factor: 0.9144 },
                    mi: { name: 'Miglio (mi)', factor: 1609.34 }
                },
                icon: 'M7 21l3-3-3-3M14 8l3 3-3 3M4 4h16'
            },
            weight: {
                units: {
                    kg: { name: 'Chilogrammo (kg)', factor: 1 },
                    g: { name: 'Grammo (g)', factor: 0.001 },
                    mg: { name: 'Milligrammo (mg)', factor: 0.000001 },
                    lb: { name: 'Libbra (lb)', factor: 0.453592 },
                    oz: { name: 'Oncia (oz)', factor: 0.0283495 },
                    t: { name: 'Tonnellata (t)', factor: 1000 },
                    st: { name: 'Stone (st)', factor: 6.35029 }
                },
                icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3'
            },
            temperature: {
                units: {
                    c: { name: 'Celsius (°C)' },
                    f: { name: 'Fahrenheit (°F)' },
                    k: { name: 'Kelvin (K)' }
                },
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            },
            volume: {
                units: {
                    l: { name: 'Litro (L)', factor: 1 },
                    ml: { name: 'Millilitro (mL)', factor: 0.001 },
                    gal: { name: 'Gallone (gal)', factor: 3.78541 },
                    qt: { name: 'Quarto (qt)', factor: 0.946353 },
                    pt: { name: 'Pinta (pt)', factor: 0.473176 },
                    cup: { name: 'Tazza (cup)', factor: 0.236588 },
                    fl_oz: { name: 'Oncia fluida (fl oz)', factor: 0.0295735 },
                    tbsp: { name: 'Cucchiaio (tbsp)', factor: 0.0147868 }
                },
                icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
            },
            
        };

        let currentCategory = 'length';
        let history = [];

        // DOM elements
        const categoryCards = document.querySelectorAll('.category-card');
        const fromUnit = document.getElementById('fromUnit');
        const toUnit = document.getElementById('toUnit');
        const fromValue = document.getElementById('fromValue');
        const result = document.getElementById('result');
        const swapBtn = document.getElementById('swapBtn');
        const historyList = document.getElementById('historyList');
        const clearHistory = document.getElementById('clearHistory');
        const quickConversions = document.getElementById('quickConversions');
        const conversionPath = document.getElementById('conversionPath');
        const pathText = document.getElementById('pathText');

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            updateUnits();
            updateQuickConversions();
            loadHistory();
        });

        // Category selection
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                categoryCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentCategory = card.dataset.category;
                updateUnits();
                updateQuickConversions();
                convert();
            });
        });

        // Update unit options
        function updateUnits() {
            const units = conversions[currentCategory].units;

            fromUnit.innerHTML = '';
            toUnit.innerHTML = '';

            Object.keys(units).forEach((key, index) => {
                const option1 = new Option(units[key].name, key);
                const option2 = new Option(units[key].name, key);

                fromUnit.appendChild(option1);
                toUnit.appendChild(option2);

                if (index === 0) fromUnit.value = key;
                if (index === 1) toUnit.value = key;
            });
        }

        // Conversion logic
        function convert() {
            const fromVal = parseFloat(fromValue.value);
            const fromUnitVal = fromUnit.value;
            const toUnitVal = toUnit.value;

            if (isNaN(fromVal)) {
                result.textContent = 'Risultato qui';
                conversionPath.classList.add('hidden');
                return;
            }

            let convertedValue;

            if (currentCategory === 'temperature') {
                convertedValue = convertTemperature(fromVal, fromUnitVal, toUnitVal);
            } else {
                convertedValue = convertWithFactors(fromVal, fromUnitVal, toUnitVal);
            }

            // Format result
            const formatted = formatNumber(convertedValue);
            result.textContent = `${formatted} ${conversions[currentCategory].units[toUnitVal].name.split('(')[1].replace(')', '')}`;

            // Show conversion path
            pathText.textContent = `${fromVal} ${conversions[currentCategory].units[fromUnitVal].name.split('(')[1].replace(')', '')} = ${formatted} ${conversions[currentCategory].units[toUnitVal].name.split('(')[1].replace(')', '')}`;
            conversionPath.classList.remove('hidden');

            // Add to history
            addToHistory(fromVal, fromUnitVal, convertedValue, toUnitVal);
        }

        function convertWithFactors(value, fromUnit, toUnit) {
            const fromFactor = conversions[currentCategory].units[fromUnit].factor;
            const toFactor = conversions[currentCategory].units[toUnit].factor;
            return (value * fromFactor) / toFactor;
        }

        function convertTemperature(value, fromUnit, toUnit) {
            let celsius;

            // Convert to Celsius first
            switch (fromUnit) {
                case 'c': celsius = value; break;
                case 'f': celsius = (value - 32) * 5 / 9; break;
                case 'k': celsius = value - 273.15; break;
            }

            // Convert from Celsius to target
            switch (toUnit) {
                case 'c': return celsius;
                case 'f': return celsius * 9 / 5 + 32;
                case 'k': return celsius + 273.15;
            }
        }

        function formatNumber(num) {
            if (Math.abs(num) < 0.001) return num.toExponential(3);
            if (Math.abs(num) > 1000000) return num.toExponential(3);
            return parseFloat(num.toFixed(6)).toString();
        }

        // Swap units
        swapBtn.addEventListener('click', () => {
            const temp = fromUnit.value;
            fromUnit.value = toUnit.value;
            toUnit.value = temp;

            swapBtn.style.animation = 'flip 0.6s ease-in-out';
            setTimeout(() => swapBtn.style.animation = '', 600);

            convert();
        });

        // Real-time conversion
        fromValue.addEventListener('input', convert);
        fromUnit.addEventListener('change', convert);
        toUnit.addEventListener('change', convert);

        // History management
        function addToHistory(fromVal, fromUnitVal, toVal, toUnitVal) {
            const fromUnitName = conversions[currentCategory].units[fromUnitVal].name;
            const toUnitName = conversions[currentCategory].units[toUnitVal].name;

            const historyItem = {
                category: currentCategory,
                from: { value: fromVal, unit: fromUnitVal, name: fromUnitName },
                to: { value: toVal, unit: toUnitVal, name: toUnitName },
                timestamp: new Date().toLocaleString('it-IT')
            };

            history.unshift(historyItem);
            if (history.length > 10) history.pop();

            saveHistory();
            renderHistory();
        }

        function renderHistory() {
            if (history.length === 0) {
                historyList.innerHTML = '<div class="text-center text-gray-500 py-8">Nessuna conversione nella cronologia</div>';
                return;
            }

            historyList.innerHTML = history.map(item => `
                <div class="history-item p-4 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer" 
                     onclick="loadFromHistory('${item.from.value}', '${item.from.unit}', '${item.to.unit}', '${item.category}')">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg font-medium">
                                    ${item.category.toUpperCase()}
                                </span>
                                <span class="text-gray-600 text-sm">${item.timestamp}</span>
                            </div>
                            <div class="mt-2 font-semibold text-gray-800">
                                ${formatNumber(item.from.value)} ${item.from.name.split('(')[1]?.replace(')', '') || item.from.unit} 
                                → 
                                ${formatNumber(item.to.value)} ${item.to.name.split('(')[1]?.replace(')', '') || item.to.unit}
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                </div>
            `).join('');
        }

        function loadFromHistory(value, fromUnitVal, toUnitVal, category) {
            // Switch to correct category
            if (category !== currentCategory) {
                categoryCards.forEach(card => {
                    card.classList.remove('active');
                    if (card.dataset.category === category) {
                        card.classList.add('active');
                    }
                });
                currentCategory = category;
                updateUnits();
                updateQuickConversions();
            }

            // Set values
            fromValue.value = value;
            fromUnit.value = fromUnitVal;
            toUnit.value = toUnitVal;

            // Convert
            convert();
        }

        function saveHistory() {
            // In a real app, you might save to localStorage
            // localStorage.setItem('converterHistory', JSON.stringify(history));
        }

        function loadHistory() {
            // In a real app, you might load from localStorage
            // const saved = localStorage.getItem('converterHistory');
            // if (saved) history = JSON.parse(saved);
            renderHistory();
        }

        clearHistory.addEventListener('click', () => {
            history = [];
            saveHistory();
            renderHistory();
        });

        // Quick conversions
        function updateQuickConversions() {
            const units = conversions[currentCategory].units;
            const unitKeys = Object.keys(units);

            if (currentCategory === 'temperature') {
                quickConversions.innerHTML = `
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl text-center">
                        <div class="text-2xl font-bold">0°C</div>
                        <div class="text-sm opacity-90">32°F | 271.15K</div>
                        <div class="text-xs mt-1">Punto di congelamento</div>
                    </div>
                    <div class="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-2xl text-center">
                        <div class="text-2xl font-bold">100°C</div>
                        <div class="text-sm opacity-90">212°F | 373.15K</div>
                        <div class="text-xs mt-1">Punto di ebollizione</div>
                    </div>
                    <div class="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-2xl text-center">
                        <div class="text-2xl font-bold">37°C</div>
                        <div class="text-sm opacity-90">98.6°F | 310.15K</div>
                        <div class="text-xs mt-1">Temperatura corporea</div>
                    </div>
                `;
                return;
            }

            // Generate quick conversions for other categories
            const commonValues = {
                length: [1, 10, 100],
                weight: [1, 5, 10],
                volume: [1, 2, 5]
            };

            const values = commonValues[currentCategory] || [1, 10, 100];
            const baseUnit = unitKeys[0];
            const targetUnits = unitKeys.slice(1, 4);

            quickConversions.innerHTML = values.map((value, index) => {
                const targetUnit = targetUnits[index] || targetUnits[0];
                const converted = convertWithFactors(value, baseUnit, targetUnit);

                return `
                    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl text-center cursor-pointer hover:scale-105 transition-transform"
                         onclick="loadQuickConversion(${value}, '${baseUnit}', '${targetUnit}')">
                        <div class="text-2xl font-bold">${value} ${units[baseUnit].name.split('(')[1]?.replace(')', '') || baseUnit}</div>
                        <div class="text-sm opacity-90">${formatNumber(converted)} ${units[targetUnit].name.split('(')[1]?.replace(')', '') || targetUnit}</div>
                        <div class="text-xs mt-1">Conversione comune</div>
                    </div>
                `;
            }).join('');
        }

        function loadQuickConversion(value, fromUnitVal, toUnitVal) {
            fromValue.value = value;
            fromUnit.value = fromUnitVal;
            toUnit.value = toUnitVal;
            convert();
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        categoryCards[0].click();
                        break;
                    case '2':
                        e.preventDefault();
                        categoryCards[1].click();
                        break;
                    case '3':
                        e.preventDefault();
                        categoryCards[2].click();
                        break;
                    case '4':
                        e.preventDefault();
                        categoryCards[3].click();
                        break;
                    case 'r':
                        e.preventDefault();
                        swapBtn.click();
                        break;
                }
            }
        });

        // Auto-focus input on page load
        setTimeout(() => {
            fromValue.focus();
        }, 500);

        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideIn 0.6s ease-out forwards';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.glass-card').forEach(card => {
            observer.observe(card);
        });

        // Add ripple effect to buttons
        document.querySelectorAll('button, .cursor-pointer').forEach(element => {
            element.addEventListener('click', function (e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add some CSS for ripple effect
        const style = document.createElement('style');
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: rippleEffect 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);