class WheelOfFortune {
    constructor() {
        this.names = [];
        this.isSpinning = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateWheel();
        this.updateNamesList();
    }

    bindEvents() {
        document.getElementById('addNameBtn').addEventListener('click', () => this.addName());
        document.getElementById('nameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addName();
        });
        document.getElementById('spinButton').addEventListener('click', () => this.spinWheel());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('fileInput').addEventListener('change', (e) => this.loadFile(e));
        document.getElementById('loadFileBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        document.getElementById('exportTxtBtn').addEventListener('click', () => this.exportTxt());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJson());
    }

    generateColors(count) {
        const colors = [];
        const hueStep = 360 / count;
        for (let i = 0; i < count; i++) {
            colors.push(`hsl(${i * hueStep}, 70%, 60%)`);
        }
        return colors;
    }

    addName() {
        const input = document.getElementById('nameInput');
        const name = input.value.trim();

        if (this.names.length >= 100) {
            alert('Puoi inserire al massimo 100 nomi!');
            return;
        }

        if (name && !this.names.includes(name)) {
            this.names.push(name);
            input.value = '';
            this.updateWheel();
            this.updateNamesList();
            this.hideResult();
        }
    }

    editName(index) {
        const newName = prompt('Modifica nome:', this.names[index]);
        if (newName && newName.trim() && !this.names.includes(newName.trim())) {
            this.names[index] = newName.trim();
            this.updateWheel();
            this.updateNamesList();
            this.hideResult();
        }
    }

    deleteName(index) {
        this.names.splice(index, 1);
        this.updateWheel();
        this.updateNamesList();
        this.hideResult();
    }

    clearAll() {
        if (confirm('Sei sicuro di voler cancellare tutti i nomi?')) {
            this.names = [];
            this.updateWheel();
            this.updateNamesList();
            this.hideResult();
        }
    }

    updateWheel() {
        const svg = document.getElementById('wheelSvg');
        svg.innerHTML = '';

        if (this.names.length === 0) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '200');
            circle.setAttribute('cy', '200');
            circle.setAttribute('r', '180');
            circle.setAttribute('fill', '#e1e5e9');
            circle.setAttribute('stroke', '#ccc');
            circle.setAttribute('stroke-width', '3');
            svg.appendChild(circle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '200');
            text.setAttribute('y', '200');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#999');
            text.setAttribute('font-size', '18');
            text.setAttribute('font-weight', 'bold');
            text.textContent = 'Aggiungi nomi';
            svg.appendChild(text);
            return;
        }

        const colors = this.generateColors(this.names.length);
        const centerX = 200;
        const centerY = 200;
        const radius = 180;
        const angleStep = 360 / this.names.length;

        this.names.forEach((name, index) => {
            const startAngle = index * angleStep;
            const endAngle = (index + 1) * angleStep;

            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            const largeArcFlag = angleStep > 180 ? 1 : 0;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            path.setAttribute('d', pathData);
            path.setAttribute('fill', colors[index]);
            path.setAttribute('stroke', 'white');
            path.setAttribute('stroke-width', '3');
            path.classList.add('wheel-section');
            svg.appendChild(path);

            const textAngle = startAngle + angleStep / 2;
            const textRadius = radius * 0.7;
            const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
            const textY = centerY + textRadius * Math.sin((textAngle * Math.PI) / 180);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', textX);
            text.setAttribute('y', textY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-size', Math.min(14, 150 / this.names.length + 8));
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('paint-order', 'stroke');
            text.setAttribute('stroke', 'black');
            text.setAttribute('stroke-width', '0.8');
            text.setAttribute('transform', `rotate(${textAngle}, ${textX}, ${textY})`);
            text.textContent = name.length > 10 ? name.substring(0, 10) + '...' : name;
            text.classList.add('wheel-text');
            svg.appendChild(text);
        });
    }

    updateNamesList() {
        const namesList = document.getElementById('namesList');
        if (this.names.length === 0) {
            namesList.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">📝</div>
                    <p>Nessun nome ancora.<br>Aggiungi alcuni nomi per iniziare!</p>
                </div>`;
            return;
        }

        namesList.innerHTML = this.names.map((name, index) => `
            <div class="name-item">
                <span class="name-text">${name}</span>
                <div class="name-actions">
                    <button class="btn btn-secondary btn-small" onclick="wheel.editName(${index})">✏️</button>
                    <button class="btn btn-danger btn-small" onclick="wheel.deleteName(${index})">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    spinWheel() {
        if (this.names.length === 0 || this.isSpinning) return;

        this.isSpinning = true;
        const spinButton = document.getElementById('spinButton');
        spinButton.disabled = true;
        spinButton.textContent = '🔄 Girando...';

        const svg = document.getElementById('wheelSvg');
        const winnerIndex = Math.floor(Math.random() * this.names.length);
        const anglePerSegment = 360 / this.names.length;
        const stopAngle = 360 - (winnerIndex * anglePerSegment + anglePerSegment / 2);
        const extraSpins = 10 * 360;
        const finalRotation = extraSpins + stopAngle;

        svg.style.setProperty('--spin-rotation', finalRotation + 'deg');
        svg.classList.add('spinning');

        setTimeout(() => {
            const winner = this.names[winnerIndex];
            this.showResult(winner);

            const paths = svg.querySelectorAll('.wheel-section');
            paths.forEach((path, i) => {
                path.classList.toggle('winner', i === winnerIndex);
            });

            this.isSpinning = false;
            spinButton.disabled = false;
            spinButton.textContent = '🎲 Gira la Ruota!';
            svg.classList.remove('spinning');
        }, 4000);
    }

    showResult(winner) {
        const resultDisplay = document.getElementById('resultDisplay');
        const winnerName = document.getElementById('winnerName');
        winnerName.textContent = winner;
        resultDisplay.classList.add('show');
    }

    hideResult() {
        document.getElementById('resultDisplay').classList.remove('show');
    }

    loadFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let newNames = [];

                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(content);
                    newNames = Array.isArray(data) ? data : data.names || [];
                } else {
                    newNames = content.split('\n').map(name => name.trim()).filter(name => name);
                }

                const uniqueNames = newNames.filter(name => !this.names.includes(name));
                const remainingSlots = 100 - this.names.length;
                const namesToAdd = uniqueNames.slice(0, remainingSlots);

                this.names = [...this.names, ...namesToAdd];
                this.updateWheel();
                this.updateNamesList();
                this.hideResult();

                alert(`Caricati ${namesToAdd.length} nomi!${uniqueNames.length > namesToAdd.length ? ' (Limite di 100 raggiunto)' : ''}`);
            } catch {
                alert('Errore nel caricamento del file. Controlla il formato.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    exportTxt() {
        if (this.names.length === 0) return alert('Nessun nome da esportare!');
        const blob = new Blob([this.names.join('\n')], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'nomi_ruota_fortuna.txt';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    exportJson() {
        if (this.names.length === 0) return alert('Nessun nome da esportare!');
        const data = { names: this.names, exported: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'nomi_ruota_fortuna.json';
        a.click();
        URL.revokeObjectURL(a.href);
    }
}

// Inizializza
const wheel = new WheelOfFortune();
