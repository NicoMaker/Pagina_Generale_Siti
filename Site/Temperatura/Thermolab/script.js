const scrollToContent = () =>
    document.getElementById('content').scrollIntoView({ behavior: 'smooth' });


function showTempInfo(type) {
    const infoDiv = document.getElementById('temp-info');
    const titleEl = document.getElementById('info-title');
    const descEl = document.getElementById('info-description');

    const tempData = {
        zero: {
            title: "Zero Assoluto (-273.15°C)",
            desc: "Il punto in cui tutta l'energia termica è stata rimossa da una sostanza. È il limite inferiore teorico della temperatura, dove il movimento molecolare si ferma completamente."
        },
        freeze: {
            title: "Punto di Congelamento dell'Acqua (0°C)",
            desc: "La temperatura alla quale l'acqua cambia da liquido a solido. Questo punto è stato utilizzato come riferimento per la scala Celsius."
        },
        body: {
            title: "Temperatura Corporea Umana (37°C)",
            desc: "La temperatura ottimale per il funzionamento degli enzimi e dei processi biologici nel corpo umano. Varia leggermente tra individui e durante il giorno."
        },
        boil: {
            title: "Punto di Ebollizione dell'Acqua (100°C)",
            desc: "La temperatura alla quale l'acqua cambia da liquido a gas a pressione atmosferica standard. Varia con l'altitudine e la pressione."
        },
        sun: {
            title: "Superficie del Sole (5778°C)",
            desc: "La temperatura della fotosfera solare, lo strato visibile del Sole. All'interno del nucleo solare, la temperatura raggiunge i 15 milioni di gradi Celsius."
        }
    };

    if (tempData[type]) {
        titleEl.textContent = tempData[type].title;
        descEl.textContent = tempData[type].desc;
        infoDiv.style.display = 'block';
    }
}

function toggleKnowledge(element) {
    const isExpanded = element.classList.contains('expanded');

    // Reset all items
    document.querySelectorAll('.knowledge-item').forEach(item => {
        item.classList.remove('expanded');
        item.style.background = 'rgba(255, 255, 255, 0.05)';
    });

    if (!isExpanded) {
        element.classList.add('expanded');
        element.style.background = 'rgba(78, 205, 196, 0.2)';
    }
}

// Add scroll animations
window.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.feature-card, .knowledge-item');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
});

// Initialize cards as hidden
document.querySelectorAll('.feature-card, .knowledge-item').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
});