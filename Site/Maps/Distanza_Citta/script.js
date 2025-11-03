// Import Leaflet library
const L = window.L;

// Import leaflet-image library
const leafletImage = window.leafletImage;

// Initialize map
const map = L.map("map").setView([41.9028, 12.4964], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Variables
let currentMarkers = [];
let allMarkers = [];
let allLines = [];
let distanceCount = 0;
const distanceData = [];
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
    });

    if (currentMarkers.length === 2) {
        showLoading();

        const pointA = currentMarkers[0].marker.getLatLng();
        const pointB = currentMarkers[1].marker.getLatLng();
        const locationA = currentMarkers[0].locationName;
        const locationB = currentMarkers[1].locationName;

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

        hideLoading();
        updateDistanceList();
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

// Save map
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

// Delete distance entries
document.getElementById("distanceList").addEventListener("click", (e) => {
    if (e.target.closest('.delete-btn')) {
        const deleteBtn = e.target.closest('.delete-btn');
        const idToRemove = deleteBtn.getAttribute("data-id");

        const distanceToRemove = distanceData.find((d) => d.id == idToRemove);
        if (!distanceToRemove) return;

        // Remove markers and lines
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

        // Remove line
        const lineToRemove = allLines.find((l) =>
            l.getLatLngs().some(
                (latlng) =>
                    (latlng.lat.toFixed(5) === distanceToRemove.startLat &&
                        latlng.lng.toFixed(5) === distanceToRemove.startLng) ||
                    (latlng.lat.toFixed(5) === distanceToRemove.endLat &&
                        latlng.lng.toFixed(5) === distanceToRemove.endLng)
            )
        );

        if (lineToRemove) {
            map.removeLayer(lineToRemove);
            allLines = allLines.filter(l => l !== lineToRemove);
        }

        // Update total distance
        totalDistance -= parseFloat(distanceToRemove.distanceFormatted);
        document.getElementById("totalKm").textContent = totalDistance.toFixed(2);

        // Remove from data array
        const index = distanceData.findIndex((d) => d.id == idToRemove);
        if (index > -1) {
            distanceData.splice(index, 1);
        }

        updateDistanceList();
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

// Initialize
updateDistanceList();
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