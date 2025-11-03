// Import Leaflet library
const L = window.L;

// Import leaflet-image library
const leafletImage = window.leafletImage;

// Local Storage Key
const LOCAL_STORAGE_KEY = 'distanceMapDataV2';

// Initialize map
const map = L.map("map").setView([41.9028, 12.4964], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Variables
let currentMarkers = [];
let allMarkers = []; // Contiene i riferimenti Leaflet
let allLines = [];   // Contiene i riferimenti Leaflet
let distanceCount = 0;
const distanceData = []; // Contiene i dati persistenti (JSON-friendly)
let totalDistance = 0;
let selectedColor = '#667eea';

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

// --- GESTIONE LOCAL STORAGE ---

function saveMapData() {
    const dataToSave = {
        distanceData: distanceData,
        totalDistance: totalDistance,
        // Salva la vista corrente della mappa per un'esperienza utente migliore
        center: map.getCenter(),
        zoom: map.getZoom(),
    };
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
        console.error("Errore nel salvataggio in localStorage:", e);
    }
}

function clearMapData() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}

function loadMapData() {
    try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            
            // 1. Ripristina i dati e il totale
            totalDistance = parsedData.totalDistance || 0;
            document.getElementById("totalKm").textContent = totalDistance.toFixed(2);
            distanceData.length = 0; // Svuota l'array
            if (parsedData.distanceData && Array.isArray(parsedData.distanceData)) {
                 distanceData.push(...parsedData.distanceData); 
                 // Imposta l'ID per le nuove distanze
                 distanceCount = distanceData.length > 0 ? Math.max(...distanceData.map(d => d.id)) : 0;
            } else {
                 distanceCount = 0;
            }

            // 2. Ricrea marker e linee
            allMarkers = [];
            allLines = [];
            distanceData.forEach(entry => {
                const pointA = L.latLng(entry.startLat, entry.startLng);
                const pointB = L.latLng(entry.endLat, entry.endLng);
                
                // Funzione ausiliaria per creare e configurare il marker ricreato
                const createAndConfigureMarker = (latlng, color, locationName) => {
                    const marker = createCustomMarker(latlng, color);
                    marker.addTo(map);
                    allMarkers.push(marker);
                    
                    // Aggiunge il popup con le info
                    marker.bindPopup(
                        `<div style="text-align: center;">
                            <strong style="color: ${color};">${locationName}</strong><br>
                            <small>Lat: ${latlng.lat.toFixed(5)}<br>Lng: ${latlng.lng.toFixed(5)}</small>
                        </div>`
                    );

                    // Aggiunge la gestione click per la rimozione del marker (molto importante per il cleanup)
                    marker.on("click", function (e) {
                        e.originalEvent.stopPropagation();
                        // Trova e rimuovi la distanza associata.
                        // Questo è un po' più complesso dopo il caricamento, ma essenziale.
                        // Per semplicità, qui si rimuove solo il marker dalla mappa e dall'array allMarkers.
                        // L'eliminazione completa della distanza deve avvenire tramite il pulsante nel pannello laterale.
                        map.removeLayer(marker);
                        allMarkers = allMarkers.filter((m) => m !== marker);
                        // Per evitare confusione, non permettiamo la rimozione di marker persistenti dal click mappa.
                        // La rimozione definitiva avviene solo dal pannello laterale (delete-btn).
                    });
                    
                    return marker;
                };

                // Ricrea Marker A e B
                createAndConfigureMarker(pointA, entry.color, entry.locationA);
                createAndConfigureMarker(pointB, entry.color, entry.locationB);
                
                // Ricrea la Linea
                const lineOptions = {
                    color: entry.color,
                    weight: 4,
                    opacity: 0.8,
                };
                const line = L.polyline([pointA, pointB], lineOptions).addTo(map);
                allLines.push(line);

                // Aggiunge la gestione click per la rimozione della linea
                line.on("click", function (e) {
                    e.originalEvent.stopPropagation();
                    map.removeLayer(line);
                    allLines = allLines.filter((l) => l !== line);
                    // Anche qui, l'eliminazione completa della distanza deve avvenire tramite il pannello laterale.
                });

            });

            // 3. Ripristina la vista della mappa
            if (parsedData.center && parsedData.zoom) {
                 map.setView(parsedData.center, parsedData.zoom);
            } else if (allMarkers.length > 0) {
                 const group = new L.featureGroup(allMarkers);
                 map.fitBounds(group.getBounds());
            }

            // 4. Aggiorna l'interfaccia
            updateDistanceList();
            return true; 
        }
    } catch (e) {
        console.error("Errore nel caricamento da localStorage. Reset:", e);
        clearMapData(); // Pulisce dati corrotti
    }
    return false; // Nessun dato caricato
}


// --- FINE GESTIONE LOCAL STORAGE ---


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
    // Forza Leaflet a ricalcolare le dimensioni se il container cambia
    setTimeout(() => map.invalidateSize(), 300);
});

// Color picker functionality
colorPicker.addEventListener('input', (e) => {
    selectedColor = e.target.value;
    colorHex.value = selectedColor.toUpperCase();
    updateActivePresetColor();
});

colorHex.addEventListener('input', (e) => {
    const value = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(value)) {
        selectedColor = value;
        colorPicker.value = selectedColor;
        updateActivePresetColor();
    }
});

// Preset colors functionality
presetColors.forEach(preset => {
    preset.addEventListener('click', () => {
        selectedColor = preset.dataset.color;
        colorPicker.value = selectedColor;
        colorHex.value = selectedColor.toUpperCase();
        updateActivePresetColor();
    });
});

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
    clearMapData(); // Pulisce i dati salvati
}

// Reverse geocoding
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

// Get intermediate places along the route
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

// Show loading overlay
function showLoading() {
    loadingOverlay.classList.add('show');
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.classList.remove('show');
}

// Update distance list
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

    // Riordina per ID crescente per coerenza
    distanceData.sort((a, b) => a.id - b.id);

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

// Create custom marker
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

    // Remove marker on click
    marker.on("click", function (e) {
        e.originalEvent.stopPropagation();
        map.removeLayer(marker);
        allMarkers = allMarkers.filter((m) => m !== marker);
        currentMarkers = currentMarkers.filter((cm) => cm.marker !== marker);
        // Nota: non salviamo su localStorage qui, aspettiamo che venga calcolata una distanza.
    });

    if (currentMarkers.length === 2) {
        showLoading();

        const pointA = currentMarkers[0].marker.getLatLng();
        const pointB = currentMarkers[1].marker.getLatLng();
        const locationA = currentMarkers[0].locationName;
        const locationB = currentMarkers[1].locationName;
        
        // Rimuovi i marker temporanei dalla mappa e da allMarkers
        map.removeLayer(currentMarkers[0].marker);
        allMarkers = allMarkers.filter(m => m !== currentMarkers[0].marker);
        map.removeLayer(currentMarkers[1].marker);
        allMarkers = allMarkers.filter(m => m !== currentMarkers[1].marker);
        

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

        line.on("click", function (e) {
            e.originalEvent.stopPropagation();
            map.removeLayer(line);
            allLines = allLines.filter((l) => l !== line);
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
            id: distanceCount, // ID univoco per la persistenza
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
        
        // Ricrea i marker permanenti (solo lat/lng e color)
        const permanentMarkerA = createCustomMarker(pointA, selectedColor);
        permanentMarkerA.addTo(map);
        allMarkers.push(permanentMarkerA);
        permanentMarkerA.bindPopup(
            `<div style="text-align: center;"><strong style="color: ${selectedColor};">${locationA}</strong><br><small>Lat: ${pointA.lat.toFixed(5)}<br>Lng: ${pointA.lng.toFixed(5)}</small></div>`
        );
        
        const permanentMarkerB = createCustomMarker(pointB, selectedColor);
        permanentMarkerB.addTo(map);
        allMarkers.push(permanentMarkerB);
        permanentMarkerB.bindPopup(
            `<div style="text-align: center;"><strong style="color: ${selectedColor};">${locationB}</strong><br><small>Lat: ${pointB.lat.toFixed(5)}<br>Lng: ${pointB.lng.toFixed(5)}</small></div>`
        );

        hideLoading();
        updateDistanceList();
        saveMapData(); // <--- SALVA I DATI
        currentMarkers = [];
    }

    if (currentMarkers.length === 3) {
        resetAll();
    }
});

// Export CSV
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
            `"${d.locationA}"`, // Aggiungo virgolette per gestire i nomi con virgole
            `"${d.locationB}"`,
            d.distanceFormatted,
            d.unit,
            d.startLat,
            d.startLng,
            d.endLat,
            d.endLng,
            d.color,
            `"${d.intermediatePlaces ? d.intermediatePlaces.join('; ') : ''}"`
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

// Save map (Image export)
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

// Delete distance entries (gestione più precisa della rimozione)
document.getElementById("distanceList").addEventListener("click", (e) => {
    if (e.target.closest('.delete-btn')) {
        const deleteBtn = e.target.closest('.delete-btn');
        const idToRemove = parseInt(deleteBtn.getAttribute("data-id"));

        const index = distanceData.findIndex((d) => d.id === idToRemove);
        if (index === -1) return;
        
        const distanceToRemove = distanceData[index];

        // Rimuovi i marker e le linee corrispondenti
        // Usiamo la precisione per trovare i layer Leaflet che corrispondono ai dati

        // Funzione per trovare e rimuovere marker per coordinate
        const findAndRemoveMarker = (lat, lng) => {
            const markerIndex = allMarkers.findIndex(m => 
                m.getLatLng().lat.toFixed(5) === lat && 
                m.getLatLng().lng.toFixed(5) === lng
            );
            if (markerIndex > -1) {
                const marker = allMarkers.splice(markerIndex, 1)[0];
                map.removeLayer(marker);
            }
        };

        // Rimuovi Marker A
        findAndRemoveMarker(distanceToRemove.startLat, distanceToRemove.startLng);
        // Rimuovi Marker B
        findAndRemoveMarker(distanceToRemove.endLat, distanceToRemove.endLng);


        // Rimuovi Linea (usa le coordinate della linea)
        const lineIndex = allLines.findIndex((l) => {
            const latlngs = l.getLatLngs();
            const startMatch = latlngs.some(ll => ll.lat.toFixed(5) === distanceToRemove.startLat && ll.lng.toFixed(5) === distanceToRemove.startLng);
            const endMatch = latlngs.some(ll => ll.lat.toFixed(5) === distanceToRemove.endLat && ll.lng.toFixed(5) === distanceToRemove.endLng);
            return startMatch && endMatch;
        });

        if (lineIndex > -1) {
             const lineToRemove = allLines.splice(lineIndex, 1)[0];
             map.removeLayer(lineToRemove);
        }

        // Aggiorna total distance
        totalDistance -= parseFloat(distanceToRemove.distanceFormatted);
        document.getElementById("totalKm").textContent = totalDistance.toFixed(2);

        // Rimuovi dall'array dei dati
        distanceData.splice(index, 1);

        updateDistanceList();
        saveMapData(); // <--- SALVA DOPO LA RIMOZIONE
    }
});

// Close sidebar on mobile when clicking map
map.on('click', () => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        const icon = sidebarToggle.querySelector('i');
        icon.className = 'fas fa-bars';
    }
});

// Initialize and Load Data
if (!loadMapData()) {
    // Se non ci sono dati salvati, inizializza normalmente
    updateDistanceList();
}
updateActivePresetColor();

// Validate hex color input
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
    } else if (value !== '') {
        e.target.value = selectedColor.toUpperCase();
    }
});