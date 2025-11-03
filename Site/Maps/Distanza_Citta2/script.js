// Import Leaflet library
const L = window.L;

// Import leaflet-image library
const leafletImage = window.leafletImage;

// Variabili per lo stato del localStorage
const MAP_DATA_KEY = 'mapDistanceData';
const MAP_VIEW_KEY = 'mapViewData';
const MAP_OPTIONS_KEY = 'mapOptionsData';

// Funzione per caricare i dati della vista e opzioni dall'archivio locale
function loadViewAndOptions() {
    const viewData = JSON.parse(localStorage.getItem(MAP_VIEW_KEY));
    const optionsData = JSON.parse(localStorage.getItem(MAP_OPTIONS_KEY));
    
    // Inizializza mappa con dati salvati o default
    const initialCenter = viewData ? viewData.center : [41.9028, 12.4964];
    const initialZoom = viewData ? viewData.zoom : 6;
    
    // Inizializza mappa
    window.map = L.map("map").setView(initialCenter, initialZoom);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(window.map);

    // Carica opzioni
    if (optionsData) {
        selectedColor = optionsData.color || '#667eea';
        showIntermediatePlaces.checked = optionsData.showIntermediate || false;
        animatedLines.checked = optionsData.animatedLines || false;
    }
}

// Chiama prima di inizializzare le variabili globali
loadViewAndOptions();

// Variabili (ora inizializzate o caricate)
let currentMarkers = [];
let allMarkers = [];
let allLines = [];
let distanceCount = 0;
let distanceData = [];
let totalDistance = 0;
// selectedColor è caricato in loadViewAndOptions, altrimenti è il default

// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const colorPicker = document.getElementById('lineColor');
const colorHex = document.getElementById('colorHex');
const presetColors = document.querySelectorAll('.preset-color');
const showIntermediatePlaces = document.getElementById('showIntermediatePlaces');
const animatedLines = document.getElementById('animatedLines');
const loadingOverlay = document.getElementById('loadingOverlay');

let sidebarOpen = true;

// Funzione per salvare lo stato della mappa (zoom e centro)
function saveMapView() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    localStorage.setItem(MAP_VIEW_KEY, JSON.stringify({ center, zoom }));
    saveMapOptions(); // Salva anche le opzioni
}

// Funzione per salvare le opzioni della sidebar (colore, switch)
function saveMapOptions() {
    const optionsData = {
        color: selectedColor,
        showIntermediate: showIntermediatePlaces.checked,
        animatedLines: animatedLines.checked
    };
    localStorage.setItem(MAP_OPTIONS_KEY, JSON.stringify(optionsData));
}

// Funzione per salvare i dati dei marcatori e distanze
function saveToLocalStorage() {
    localStorage.setItem(MAP_DATA_KEY, JSON.stringify(distanceData));
    saveMapView(); // Aggiorna la vista e le opzioni
}

// Funzione per caricare e disegnare marcatori/linee
function loadFromLocalStorage() {
    const dataString = localStorage.getItem(MAP_DATA_KEY);
    if (!dataString) return;

    try {
        const loadedData = JSON.parse(dataString);
        distanceData = loadedData;

        // Reset del contatore e distanza totale prima di ricaricare
        distanceCount = 0;
        totalDistance = 0;

        loadedData.forEach(data => {
            // Aggiorna contatore
            if (data.id > distanceCount) {
                distanceCount = data.id;
            }
            
            // Aggiorna distanza totale
            totalDistance += parseFloat(data.distanceFormatted);

            const pointA = L.latLng(data.startLat, data.startLng);
            const pointB = L.latLng(data.endLat, data.endLng);

            // Ricrea marcatori (potrebbe essere necessario ri-filtrare per non duplicare)
            // Per semplicità, li ricreiamo sempre basandoci sui dati della distanza
            const markerA = createCustomMarker(pointA, data.color);
            const markerB = createCustomMarker(pointB, data.color);
            
            // Per il caricamento, creiamo marcatori con popup semplici
             markerA
                .bindPopup(
                    `<div style="text-align: center;">
                        <strong style="color: ${data.color};">${data.locationA}</strong><br>
                        <small>Lat: ${data.startLat}<br>Lng: ${data.startLng}</small>
                    </div>`
                )
                .addTo(map);

             markerB
                .bindPopup(
                    `<div style="text-align: center;">
                        <strong style="color: ${data.color};">${data.locationB}</strong><br>
                        <small>Lat: ${data.endLat}<br>Lng: ${data.endLng}</small>
                    </div>`
                )
                .addTo(map);

            allMarkers.push(markerA, markerB);

            // Ricrea linea
            const lineOptions = {
                color: data.color,
                weight: 4,
                opacity: 0.8,
            };

            // Rileva se la linea era animata
            // NOTA: il salvataggio dello stato di 'animatedLines' si basa sull'opzione globale, non sulla singola linea
            if (animatedLines.checked) {
                lineOptions.className = 'animated-line';
                lineOptions.dashArray = '10, 5';
            }
            
            const line = L.polyline([pointA, pointB], lineOptions).addTo(map);
            allLines.push(line);
            
            // Aggiungi listener per la rimozione, necessario per l'eliminazione da mappa
            line.on("click", function (e) {
                e.originalEvent.stopPropagation();
                // NON ELIMINIAMO GLI ELEMENTI SALVATI CLICCANDO LA LINEA
                // Si può scegliere se permettere l'eliminazione da mappa, 
                // ma in questo esempio lasciamo solo l'eliminazione dalla sidebar.
                // map.removeLayer(line); 
                // allLines = allLines.filter((l) => l !== line);
            });


            // Aggiorna i popup dei marcatori per permettere la rimozione
            [markerA, markerB].forEach(m => {
                m.on("click", function (e) {
                    e.originalEvent.stopPropagation();
                    // Anche qui, non permettiamo la rimozione diretta del marcatore persistente
                    // Se un marcatore fa parte di una distanza, deve essere rimosso insieme alla distanza
                    // tramite il tasto cestino
                });
            });

            // Ricrea popup distanza (opzionale, ma utile)
            const midPoint = L.latLng(
                (pointA.lat + pointB.lat) / 2,
                (pointA.lng + pointB.lng) / 2
            );
            
            const intermediatePlacesText = data.intermediatePlaces && data.intermediatePlaces.length > 0
                ? `<br><small style="color: #666;"><i class="fas fa-route"></i> Via: ${data.intermediatePlaces.join(', ')}</small>`
                : '';

            const popupText = `
                <div style="text-align: center; padding: 8px;">
                    <i class="fas fa-ruler" style="color: ${data.color}; margin-right: 8px;"></i>
                    <strong style="color: ${data.color};">${data.distanceFormatted} ${data.unit}</strong>
                    ${intermediatePlacesText}
                </div>
            `;
            // L.popup().setLatLng(midPoint).setContent(popupText).openOn(map); // Evitiamo di aprire tutti i popup
        });

        // Aggiorna totali e lista
        document.getElementById("totalKm").textContent = totalDistance.toFixed(2);
        updateDistanceList();

    } catch (e) {
        console.error("Errore nel caricamento dei dati da localStorage:", e);
        distanceData = []; // Pulisce i dati in caso di errore
        localStorage.removeItem(MAP_DATA_KEY);
    }
    
    // Aggiorna l'interfaccia con il colore e lo stato salvato
    colorPicker.value = selectedColor;
    colorHex.value = selectedColor.toUpperCase();
    updateActivePresetColor();
}


// Sidebar toggle functionality
sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        const icon = sidebarToggle.querySelector('i');
        icon.className = sidebar.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    } else {
        sidebar.classList.toggle('collapsed');
        sidebarOpen = !sidebarOpen;
        const icon = sidebarToggle.querySelector('i');
        icon.className = sidebarOpen ? 'fas fa-bars' : 'fas fa-chevron-right';
    }
});

// Color picker functionality
colorPicker.addEventListener('input', (e) => {
    selectedColor = e.target.value;
    colorHex.value = selectedColor.toUpperCase();
    updateActivePresetColor();
    saveMapOptions(); // Salva l'opzione
});

colorHex.addEventListener('input', (e) => {
    const value = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(value)) {
        selectedColor = value;
        colorPicker.value = selectedColor;
        updateActivePresetColor();
        saveMapOptions(); // Salva l'opzione
    }
});

// Preset colors functionality
presetColors.forEach(preset => {
    preset.addEventListener('click', () => {
        selectedColor = preset.dataset.color;
        colorPicker.value = selectedColor;
        colorHex.value = selectedColor.toUpperCase();
        updateActivePresetColor();
        saveMapOptions(); // Salva l'opzione
    });
});

// Aggiungi listener per gli switch (salvataggio opzioni)
showIntermediatePlaces.addEventListener('change', saveMapOptions);
animatedLines.addEventListener('change', saveMapOptions);

function updateActivePresetColor() {
    presetColors.forEach(preset => {
        preset.classList.toggle('active', preset.dataset.color.toLowerCase() === selectedColor.toLowerCase());
    });
}

// Handle responsive behavior
function handleResize() {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('open');
        const icon = sidebarToggle.querySelector('i');
        icon.className = sidebarOpen ? 'fas fa-bars' : 'fas fa-chevron-right';
    } else {
        sidebar.classList.remove('collapsed');
        const icon = sidebarToggle.querySelector('i');
        icon.className = 'fas fa-bars';
    }
}

window.addEventListener('resize', handleResize);

// Gestione eventi mappa per salvare la vista
map.on('moveend', saveMapView);
map.on('zoomend', saveMapView);


// Reset function
function resetAll() {
    allMarkers.forEach((m) => map.removeLayer(m));
    allLines.forEach((l) => map.removeLayer(l));
    currentMarkers = [];
    allMarkers = [];
    allLines = [];
    distanceCount = 0;
    distanceData.length = 0;
    totalDistance = 0;
    document.getElementById("totalKm").textContent = totalDistance.toFixed(2);
    map.closePopup();
    updateDistanceList();
    saveToLocalStorage(); // Salva lo stato vuoto
}

// Reverse geocoding (nessuna modifica)
async function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        return (
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.hamlet ||
            data.display_name ||
            "Luogo sconosciuto"
        );
    } catch (err) {
        return "Errore nel geocoding";
    }
}

// Get intermediate places along the route (nessuna modifica)
async function getIntermediatePlaces(startLat, startLng, endLat, endLng) {
    if (!showIntermediatePlaces.checked) return [];

    const places = [];
    const steps = 3; // Number of intermediate points to check

    for (let i = 1; i < steps; i++) {
        const ratio = i / steps;
        const lat = startLat + (endLat - startLat) * ratio;
        const lng = startLng + (endLng - startLng) * ratio;

        try {
            const place = await reverseGeocode(lat, lng);
            if (place && place !== "Luogo sconosciuto" && place !== "Errore nel geocoding") {
                // Extract city/town name from full address
                const placeName = place.split(',')[0].trim();
                if (!places.includes(placeName)) {
                    places.push(placeName);
                }
            }
        } catch (err) {
            console.log('Error getting intermediate place:', err);
        }
    }

    return places;
}

// Show loading overlay (nessuna modifica)
function showLoading() {
    loadingOverlay.classList.add('show');
}

// Hide loading overlay (nessuna modifica)
function hideLoading() {
    loadingOverlay.classList.remove('show');
}

// Update distance list (nessuna modifica strutturale)
function updateDistanceList() {
    const listContainer = document.getElementById("distanceList");

    if (distanceData.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marker-alt"></i>
                <p>Nessuna distanza calcolata</p>
                <small>Inizia cliccando sulla mappa</small>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = distanceData.map((entry, index) => {
        const intermediatePlacesHtml = entry.intermediatePlaces && entry.intermediatePlaces.length > 0
            ? `<div class="intermediate-places">
                <div class="intermediate-title">
                    <i class="fas fa-route"></i>
                    Luoghi intermedi:
                </div>
                <div class="intermediate-list">${entry.intermediatePlaces.join(' → ')}</div>
               </div>`
            : '';

        return `
            <div class="distance-item" style="border-left-color: ${entry.color};">
                <div class="distance-header">
                    <div class="distance-number" style="background: ${entry.color};">${index + 1}</div>
                    <button class="delete-btn" data-id="${entry.id}" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="distance-route">${entry.locationA} → ${entry.locationB}</div>
                <div class="distance-value" style="color: ${entry.color};">
                    <i class="fas fa-ruler"></i>
                    ${entry.distanceFormatted} ${entry.unit}
                </div>
                ${intermediatePlacesHtml}
            </div>
        `;
    }).join('');
}

// Create custom marker (nessuna modifica)
function createCustomMarker(latlng, color = selectedColor) {
    return L.marker(latlng, {
        icon: L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-icon" style="background: ${color}; border-color: white;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        }),
    });
}

// Map click event
map.on("click", async (e) => {
    const { lat, lng } = e.latlng;

    const marker = createCustomMarker(e.latlng, selectedColor);
    marker.addTo(map);
    allMarkers.push(marker);

    const locationName = await reverseGeocode(lat, lng);
    marker
        .bindPopup(
            `<div style="text-align: center;">
                <strong style="color: ${selectedColor};">${locationName}</strong><br>
                <small>Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}</small>
            </div>`
        )
        .openPopup();

    currentMarkers.push({ marker, locationName });

    // Rimuovi marcatore al click (solo per marcatore "temporaneo")
    marker.on("click", function (e) {
        e.originalEvent.stopPropagation();
        map.removeLayer(marker);
        allMarkers = allMarkers.filter((m) => m !== marker);
        currentMarkers = currentMarkers.filter((cm) => cm.marker !== marker);
    });

    if (currentMarkers.length === 2) {
        showLoading();

        const pointA = currentMarkers[0].marker.getLatLng();
        const pointB = currentMarkers[1].marker.getLatLng();
        const locationA = currentMarkers[0].locationName;
        const locationB = currentMarkers[1].locationName;

        // Rimuovi i marcatori temporanei
        currentMarkers.forEach(cm => {
            map.removeLayer(cm.marker);
        });
        allMarkers = allMarkers.filter(m => currentMarkers.every(cm => cm.marker !== m));
        
        // Get intermediate places
        const intermediatePlaces = await getIntermediatePlaces(
            pointA.lat, pointA.lng, pointB.lat, pointB.lng
        );

        const lineOptions = {
            color: selectedColor,
            weight: 4,
            opacity: 0.8,
        };

        if (animatedLines.checked) {
            lineOptions.className = 'animated-line';
            lineOptions.dashArray = '10, 5';
        }

        const line = L.polyline([pointA, pointB], lineOptions).addTo(map);
        allLines.push(line);

        // NON ELIMINIAMO LA LINEA AL CLICK SE SALVATA (vedi loadFromLocalStorage)
        line.on("click", function (e) {
             e.originalEvent.stopPropagation();
             const midPoint = L.latLng(
                (pointA.lat + pointB.lat) / 2,
                (pointA.lng + pointB.lng) / 2
            );
            
            const intermediatePlacesText = intermediatePlaces.length > 0
                ? `<br><small style="color: #666;"><i class="fas fa-route"></i> Via: ${intermediatePlaces.join(', ')}</small>`
                : '';

            const distanceMeters = pointA.distanceTo(pointB);
            let distance = distanceMeters / 1000;
            let unit = "km";
            if (distance < 1) {
                distance = distanceMeters;
                unit = "m";
            }
            const distanceFormatted = distance.toFixed(2);


            const popupText = `
                <div style="text-align: center; padding: 8px;">
                    <i class="fas fa-ruler" style="color: ${selectedColor}; margin-right: 8px;"></i>
                    <strong style="color: ${selectedColor};">${distanceFormatted} ${unit}</strong>
                    ${intermediatePlacesText}
                </div>
            `;
            L.popup().setLatLng(midPoint).setContent(popupText).openOn(map);
        });


        const distanceMeters = pointA.distanceTo(pointB);
        let distance = distanceMeters / 1000;
        let unit = "km";
        if (distance < 1) {
            distance = distanceMeters;
            unit = "m";
        }

        const distanceFormatted = distance.toFixed(2);

        const midPoint = L.latLng(
            (pointA.lat + pointB.lat) / 2,
            (pointA.lng + pointB.lng) / 2
        );

        // Creazione e aggiunta dei marcatori "permanenti" salvabili
        const markerA_perm = createCustomMarker(pointA, selectedColor);
        const markerB_perm = createCustomMarker(pointB, selectedColor);
        
        // Aggiungi subito i marcatori permanenti per coerenza
        markerA_perm.addTo(map);
        markerB_perm.addTo(map);
        allMarkers.push(markerA_perm, markerB_perm);
        
        // Collega i popup con le info
         markerA_perm
            .bindPopup(
                `<div style="text-align: center;">
                    <strong style="color: ${selectedColor};">${locationA}</strong><br>
                    <small>Lat: ${pointA.lat.toFixed(5)}<br>Lng: ${pointA.lng.toFixed(5)}</small>
                </div>`
            );
         markerB_perm
            .bindPopup(
                `<div style="text-align: center;">
                    <strong style="color: ${selectedColor};">${locationB}</strong><br>
                    <small>Lat: ${pointB.lat.toFixed(5)}<br>Lng: ${pointB.lng.toFixed(5)}</small>
                </div>`
            );
        
        // Apri il popup della linea per mostrare la distanza
         const intermediatePlacesText = intermediatePlaces.length > 0
            ? `<br><small style="color: #666;"><i class="fas fa-route"></i> Via: ${intermediatePlaces.join(', ')}</small>`
            : '';

         const popupText = `
            <div style="text-align: center; padding: 8px;">
                <i class="fas fa-ruler" style="color: ${selectedColor}; margin-right: 8px;"></i>
                <strong style="color: ${selectedColor};">${distanceFormatted} ${unit}</strong>
                ${intermediatePlacesText}
            </div>
        `;
        L.popup().setLatLng(midPoint).setContent(popupText).openOn(map);


        totalDistance += parseFloat(distanceFormatted);
        document.getElementById("totalKm").textContent = totalDistance.toFixed(2);

        distanceCount++;
        distanceData.push({
            id: distanceCount,
            distanceFormatted,
            unit,
            locationA,
            locationB,
            startLat: pointA.lat.toFixed(5),
            startLng: pointA.lng.toFixed(5),
            endLat: pointB.lat.toFixed(5),
            endLng: pointB.lng.toFixed(5),
            color: selectedColor,
            intermediatePlaces: intermediatePlaces
        });
        
        saveToLocalStorage(); // Salva dopo l'aggiunta
        hideLoading();
        updateDistanceList();
        currentMarkers = [];
    }

    if (currentMarkers.length === 3) {
        // Se si cliccano 3 volte, si resetta, ma i marcatori permanenti rimangono.
        // Potrebbe essere meglio impedire il terzo click in questo contesto, 
        // ma manteniamo la logica originale.
        resetAll();
    }
});

// Export CSV (nessuna modifica)
document.getElementById("exportCSV").addEventListener("click", () => {
    if (distanceData.length === 0) {
        alert("Nessuna distanza da esportare.");
        return;
    }

    const csvContent = [
        [
            "ID",
            "Luogo A",
            "Luogo B",
            "Distanza",
            "Unità di Misura",
            "Lat A",
            "Lng A",
            "Lat B",
            "Lng B",
            "Colore",
            "Luoghi Intermedi"
        ],
        ...distanceData.map((d) => [
            d.id,
            d.locationA,
            d.locationB,
            d.distanceFormatted,
            d.unit,
            d.startLat,
            d.startLng,
            d.endLat,
            d.endLng,
            d.color,
            d.intermediatePlaces ? d.intermediatePlaces.join('; ') : ''
        ]),
    ]
        .map((row) => row.join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "distanze_con_luoghi.csv");
    link.click();
});

// Save map (nessuna modifica)
document.getElementById("saveMap").addEventListener("click", () => {
    const button = document.getElementById("saveMap");
    const originalContent = button.innerHTML;
    button.innerHTML = '<div class="loading"></div> Salvando...';
    button.disabled = true;

    leafletImage(map, function (err, canvas) {
        if (err) {
            alert("Errore durante il salvataggio immagine.");
            button.innerHTML = originalContent;
            button.disabled = false;
            return;
        }

        const img = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = img;
        link.download = "mappa_distanze.png";
        link.click();

        button.innerHTML = originalContent;
        button.disabled = false;
    });
});

// Reset button
document.getElementById("resetButton").addEventListener("click", resetAll);

// Delete distance entries (modificato per la rimozione da allMarkers/allLines e salvataggio)
document.getElementById("distanceList").addEventListener("click", (e) => {
    if (e.target.closest('.delete-btn')) {
        const deleteBtn = e.target.closest('.delete-btn');
        const idToRemove = parseInt(deleteBtn.getAttribute("data-id"));

        const distanceToRemove = distanceData.find((d) => d.id === idToRemove);
        if (!distanceToRemove) return;

        // Rimuovi marcatori e linee
        // Trova i marcatori PERMANENTI (quelli con coordinate esatte nei dati salvati)
        const markerToRemoveA = allMarkers.find(
            (m) =>
                m.getLatLng().lat.toFixed(5) === distanceToRemove.startLat &&
                m.getLatLng().lng.toFixed(5) === distanceToRemove.startLng
        );
        const markerToRemoveB = allMarkers.find(
            (m) =>
                m.getLatLng().lat.toFixed(5) === distanceToRemove.endLat &&
                m.getLatLng().lng.toFixed(5) === distanceToRemove.endLng
        );

        if (markerToRemoveA) {
            map.removeLayer(markerToRemoveA);
            allMarkers = allMarkers.filter(m => m !== markerToRemoveA);
        }
        if (markerToRemoveB) {
            map.removeLayer(markerToRemoveB);
            allMarkers = allMarkers.filter(m => m !== markerToRemoveB);
        }

        // Rimuovi linea. Si basa sulle coordinate del punto iniziale/finale.
        const lineToRemove = allLines.find((l) => {
            const latlngs = l.getLatLngs();
            const startMatch = latlngs[0].lat.toFixed(5) === distanceToRemove.startLat && latlngs[0].lng.toFixed(5) === distanceToRemove.startLng;
            const endMatch = latlngs[latlngs.length - 1].lat.toFixed(5) === distanceToRemove.endLat && latlngs[latlngs.length - 1].lng.toFixed(5) === distanceToRemove.endLng;
            return startMatch && endMatch;
        });

        if (lineToRemove) {
            map.removeLayer(lineToRemove);
            allLines = allLines.filter(l => l !== lineToRemove);
        }
        
        // Rimuovi eventuali popup aperti sulla distanza eliminata
        map.closePopup(); 

        // Update total distance
        totalDistance -= parseFloat(distanceToRemove.distanceFormatted);
        document.getElementById("totalKm").textContent = totalDistance.toFixed(2);

        // Remove from data array
        const index = distanceData.findIndex((d) => d.id === idToRemove);
        if (index > -1) {
            distanceData.splice(index, 1);
        }

        updateDistanceList();
        saveToLocalStorage(); // Salva dopo l'eliminazione
    }
});

// Close sidebar on mobile when clicking map (nessuna modifica)
map.on('click', () => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        const icon = sidebarToggle.querySelector('i');
        icon.className = 'fas fa-bars';
    }
});

// Initialize
loadFromLocalStorage(); // Carica i dati salvati all'avvio
updateActivePresetColor(); // Assicura che il colore selezionato sia visibile

// Validate hex color input (nessuna modifica)
colorHex.addEventListener('keypress', (e) => {
    const char = String.fromCharCode(e.which);
    if (!/[0-9A-Fa-f#]/.test(char)) {
        e.preventDefault();
    }
});

// Format hex input
colorHex.addEventListener('blur', (e) => {
    let value = e.target.value.trim();
    if (value && !value.startsWith('#')) {
        value = '#' + value;
    }
    if (value.length === 4) {
        // Convert #RGB to #RRGGBB
        value = '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }
    if (/^#[0-9A-F]{6}$/i.test(value)) {
        e.target.value = value.toUpperCase();
        selectedColor = value;
        colorPicker.value = selectedColor;
        updateActivePresetColor();
        saveMapOptions(); // Salva l'opzione
    } else if (value !== '') {
        e.target.value = selectedColor.toUpperCase();
    }
});