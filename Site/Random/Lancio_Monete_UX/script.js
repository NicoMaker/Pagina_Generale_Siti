class CoinFlipApp {
    constructor() {
        this.totalHeads = 0;
        this.totalTails = 0;
        this.totalFlips = 0;
        this.history = [];
        this.maxHistory = 10;
        this.historyVisible = true;
        this.sessionData = [];

        this.initializeElements();
        this.bindEvents();
        this.initializeCharts();
    }

    initializeElements() {
        this.coinCountInput = document.getElementById('coinCount');
        this.decreaseBtn = document.getElementById('decreaseBtn');
        this.increaseBtn = document.getElementById('increaseBtn');
        this.flipBtn = document.getElementById('flipBtn');
        this.coin = document.getElementById('coin');
        this.resultBanner = document.getElementById('resultBanner');
        this.resultText = document.getElementById('resultText');
        this.headsCount = document.getElementById('headsCount');
        this.tailsCount = document.getElementById('tailsCount');
        this.headsPercentage = document.getElementById('headsPercentage');
        this.tailsPercentage = document.getElementById('tailsPercentage');
        this.historyList = document.getElementById('historyList');
        this.historyPanel = document.getElementById('historyPanel');
        this.toggleHistory = document.getElementById('toggleHistory');
    }

    bindEvents() {
        this.decreaseBtn.addEventListener('click', () => this.adjustCoinCount(-1));
        this.increaseBtn.addEventListener('click', () => this.adjustCoinCount(1));
        this.flipBtn.addEventListener('click', () => this.flipCoins());
        this.coinCountInput.addEventListener('input', () => this.validateInput());
        this.toggleHistory.addEventListener('click', () => this.toggleHistoryPanel());
    }

    initializeCharts() {
        // Pie Chart
        const pieCtx = document.getElementById('pieChart').getContext('2d');
        this.pieChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Teste', 'Croci'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#6366f1', '#10b981'],
                    borderColor: ['#4f46e5', '#059669'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });

        // Line Chart
        const lineCtx = document.getElementById('lineChart').getContext('2d');
        this.lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Teste',
                    data: [],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Croci',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1',
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: '#475569'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: '#475569'
                        }
                    }
                }
            }
        });
    }

    toggleHistoryPanel() {
        this.historyVisible = !this.historyVisible;
        const historyContent = this.historyList;

        if (this.historyVisible) {
            historyContent.classList.remove('hidden');
            this.toggleHistory.textContent = 'Nascondi';
        } else {
            historyContent.classList.add('hidden');
            this.toggleHistory.textContent = 'Mostra';
        }
    }

    adjustCoinCount(delta) {
        const currentValue = parseInt(this.coinCountInput.value);
        const newValue = Math.max(1, Math.min(1000, currentValue + delta));
        this.coinCountInput.value = newValue;
    }

    validateInput() {
        const value = parseInt(this.coinCountInput.value);
        if (isNaN(value) || value < 1) {
            this.coinCountInput.value = 1;
        } else if (value > 1000) {
            this.coinCountInput.value = 1000;
        }
    }

    async flipCoins() {
        const coinCount = parseInt(this.coinCountInput.value);
        if (coinCount < 1) return;

        this.flipBtn.disabled = true;
        this.resultText.textContent = 'Lanciando...';
        this.resultBanner.className = 'result-banner';

        // Animate coin flip
        await this.animateCoinFlip();

        // Calculate results
        const results = this.calculateFlipResults(coinCount);

        // Update totals
        this.totalHeads += results.heads;
        this.totalTails += results.tails;
        this.totalFlips += coinCount;

        // Update session data for charts
        this.sessionData.push({
            label: `Lancio ${this.sessionData.length + 1}`,
            heads: this.totalHeads,
            tails: this.totalTails
        });

        // Update UI
        this.updateResults(results, coinCount);
        this.updateStats();
        this.updateCharts();
        this.addToHistory(results, coinCount);

        this.flipBtn.disabled = false;
    }

    calculateFlipResults(coinCount) {
        let heads = 0;
        let tails = 0;
        const flips = [];

        for (let i = 0; i < coinCount; i++) {
            const isHeads = Math.random() < 0.5;
            if (isHeads) {
                heads++;
                flips.push('heads');
            } else {
                tails++;
                flips.push('tails');
            }
        }

        return { heads, tails, flips };
    }

    async animateCoinFlip() {
        return new Promise(resolve => {
            this.coin.classList.add('flip');

            setTimeout(() => {
                this.coin.classList.remove('flip');
                resolve();
            }, 1500);
        });
    }

    updateResults(results, coinCount) {
        const { heads, tails } = results;

        if (coinCount === 1) {
            const isHeads = heads > 0;
            this.resultText.textContent = isHeads ? '🎯 È uscita TESTA!' : '🎯 È uscita CROCE!';
            this.resultBanner.className = `result-banner ${isHeads ? 'heads' : 'tails'}`;

            // Set coin final position
            this.coin.style.transform = isHeads ? 'rotateY(0deg)' : 'rotateY(-180deg)';
        } else {
            if (heads > tails) {
                this.resultText.textContent = `🏆 VINCONO LE TESTE! (${heads} vs ${tails})`;
                this.resultBanner.className = 'result-banner heads';
            } else if (tails > heads) {
                this.resultText.textContent = `🏆 VINCONO LE CROCI! (${tails} vs ${heads})`;
                this.resultBanner.className = 'result-banner tails';
            } else {
                this.resultText.textContent = `🤝 PAREGGIO! (${heads} - ${tails})`;
                this.resultBanner.className = 'result-banner';
            }
        }
    }

    updateStats() {
        this.headsCount.textContent = this.totalHeads;
        this.tailsCount.textContent = this.totalTails;

        if (this.totalFlips > 0) {
            const headsPerc = ((this.totalHeads / this.totalFlips) * 100).toFixed(1);
            const tailsPerc = ((this.totalTails / this.totalFlips) * 100).toFixed(1);
            this.headsPercentage.textContent = `${headsPerc}%`;
            this.tailsPercentage.textContent = `${tailsPerc}%`;
        }
    }

    updateCharts() {
        // Update pie chart
        this.pieChart.data.datasets[0].data = [this.totalHeads, this.totalTails];
        this.pieChart.update();

        // Update line chart
        if (this.sessionData.length > 0) {
            // Keep only last 10 data points for better visualization
            const recentData = this.sessionData.slice(-10);

            this.lineChart.data.labels = recentData.map(d => d.label);
            this.lineChart.data.datasets[0].data = recentData.map(d => d.heads);
            this.lineChart.data.datasets[1].data = recentData.map(d => d.tails);
            this.lineChart.update();
        }
    }

    addToHistory(results, coinCount) {
        const historyItem = {
            timestamp: new Date(),
            coinCount,
            heads: results.heads,
            tails: results.tails,
            flips: results.flips
        };

        this.history.unshift(historyItem);

        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="empty-history">Nessun lancio effettuato</div>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => {
            const time = item.timestamp.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                        <div class="history-item">
                            <div class="history-info">
                                <div class="history-time">${time}</div>
                                <div class="history-count">${item.coinCount} ${item.coinCount === 1 ? 'moneta' : 'monete'}</div>
                            </div>
                            <div class="history-result">
                                <div class="result-counter heads">
                                    <span>👑</span>
                                    <span>${item.heads} ${item.heads === 1 ? 'Testa' : 'Teste'}</span>
                                </div>
                                <div class="result-counter tails">
                                    <span>⚡</span>
                                    <span>${item.tails} ${item.tails === 1 ? 'Croce' : 'Croci'}</span>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CoinFlipApp();
});