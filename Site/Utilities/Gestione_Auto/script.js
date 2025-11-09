// Database keys
const DB_KEYS = {
    VEHICLES: 'vehicles',
    MAINTENANCES: 'maintenances'
};

let MAINTENANCE_TYPES = [];

// Storage functions
function getVehicles() {
    const data = localStorage.getItem(DB_KEYS.VEHICLES);
    return data ? JSON.parse(data) : [];
}

function saveVehicle(vehicle) {
    const vehicles = getVehicles();
    const existingIndex = vehicles.findIndex(v => v.id === vehicle.id);

    if (existingIndex >= 0) {
        vehicles[existingIndex] = vehicle;
    } else {
        vehicle.id = Date.now().toString();
        vehicle.createdAt = new Date().toISOString();
        vehicles.push(vehicle);
    }

    localStorage.setItem(DB_KEYS.VEHICLES, JSON.stringify(vehicles));
    return vehicle;
}

function deleteVehicle(vehicleId) {
    const vehicles = getVehicles().filter(v => v.id !== vehicleId);
    localStorage.setItem(DB_KEYS.VEHICLES, JSON.stringify(vehicles));

    // Delete associated maintenances
    const maintenances = getMaintenances().filter(m => m.vehicleId !== vehicleId);
    localStorage.setItem(DB_KEYS.MAINTENANCES, JSON.stringify(maintenances));
}

function getMaintenances() {
    const data = localStorage.getItem(DB_KEYS.MAINTENANCES);
    return data ? JSON.parse(data) : [];
}

function saveMaintenance(maintenance) {
    const maintenances = getMaintenances();
    const existingIndex = maintenances.findIndex(m => m.id === maintenance.id);

    if (existingIndex >= 0) {
        maintenances[existingIndex] = maintenance;
    } else {
        maintenance.id = Date.now().toString();
        maintenance.createdAt = new Date().toISOString();
        maintenances.push(maintenance);
    }

    localStorage.setItem(DB_KEYS.MAINTENANCES, JSON.stringify(maintenances));
    return maintenance;
}

function deleteMaintenance(maintenanceId) {
    const maintenances = getMaintenances().filter(m => m.id !== maintenanceId);
    localStorage.setItem(DB_KEYS.MAINTENANCES, JSON.stringify(maintenances));
}

// Notification functions
function checkMaintenanceDue(maintenance, currentKm) {
    const now = new Date();
    const dueDate = new Date(maintenance.dueDate);
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let isDue = false;
    let reason = '';
    let kmUntil = null;

    // Check date
    if (daysUntil <= maintenance.notifyDaysBefore && daysUntil > 1) {
        isDue = true;
        reason = `Scadenza tra ${daysUntil} giorni`;
    } else if (daysUntil === 0) {
        isDue = true;
        reason = `Scade oggi`;
    } else if (daysUntil === 1) {
        isDue = true;
        reason = `Scade domani`; // o "Scadenza tra 1 giorno"
    } else if (daysUntil < 0) {
        isDue = true;
        const daysOverdue = Math.abs(daysUntil);
        reason = `Scaduto da ${daysOverdue} ${daysOverdue === 1 ? ' giorno' : ' giorni'}`;
    }

    // Check km if applicable
    if (maintenance.dueKm && currentKm) {
        kmUntil = maintenance.dueKm - (currentKm || 0);
        if (kmUntil <= 1000 && kmUntil >= 0) {
            isDue = true;
            reason = reason ? `${reason} e ${kmUntil} km` : `Mancano ${kmUntil} km`;
        } else if (kmUntil < 0) {
            isDue = true;
            reason = reason ? `${reason} e superato di ${Math.abs(kmUntil)} km` : `Superato di ${Math.abs(kmUntil)} km`;
        }
    }

    return { isDue, daysUntil, kmUntil, reason };
}

function checkAllMaintenances(vehicles, maintenances) {
    const alerts = [];

    vehicles.forEach(vehicle => {
        const vehicleMaintenances = maintenances.filter(m => m.vehicleId === vehicle.id);

        vehicleMaintenances.forEach(maintenance => {
            // Skip completed maintenances
            if (maintenance.completed) return;

            const check = checkMaintenanceDue(maintenance, vehicle.currentKm);

            if (check.isDue) {
                alerts.push({
                    vehicle,
                    maintenance,
                    ...check
                });
            }
        });
    });

    return alerts;
}

function requestNotificationPermission() {
    if ('Notification' in window) {
        // Se il permesso non è né concesso né negato, lo chiediamo.
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Permesso per le notifiche concesso.');
                    // Mostra una notifica di benvenuto
                    showBrowserNotification('Notifiche Abilitate', 'Riceverai avvisi per le manutenzioni in scadenza.');
                } else {
                    console.log('Permesso per le notifiche negato.');
                }
            });
        }
        // Se il permesso è già concesso, restituisce true.
        return Notification.permission === 'granted';
    } else {
        // Se il browser non supporta le notifiche.
        console.log('Questo browser non supporta le notifiche desktop.');
        return false;
    }
}

function showBrowserNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/car-maintenance-icon.jpg',
            badge: '/notification-badge.jpg'
        });
    }
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('it-IT');
}

// Theme management
const THEME_KEY = 'theme';

function getInitialTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeToggleUI(theme);
}

function updateThemeToggleUI(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro');
    btn.innerHTML = theme === 'dark'
        ? '<i class="fas fa-sun"></i><span class="toggle-label">Chiaro</span>'
        : '<i class="fas fa-moon"></i><span class="toggle-label">Scuro</span>';
}

// State management
let vehicles = [];
let maintenances = [];
let alerts = [];
let notifiedAlerts = new Set();
let currentVehicle = null;
let currentMaintenance = null;


// DOM References
const totalVehiclesEl = document.getElementById('totalVehicles');
const totalVehiclesLabelEl = document.getElementById('totalVehiclesLabel');
const totalMaintenancesEl = document.getElementById('totalMaintenances');
const totalMaintenancesLabelEl = document.getElementById('totalMaintenancesLabel');
const activeAlertsEl = document.getElementById('activeAlerts');
const activeAlertsLabelEl = document.getElementById('activeAlertsLabel');

const alertsIconEl = document.getElementById('alertsIcon');


const alertsSectionEl = document.getElementById('alertsSection');
const alertsContainerEl = document.getElementById('alertsContainer');
const vehiclesContainerEl = document.getElementById('vehiclesContainer');
const emptyStateEl = document.getElementById('emptyState');

// Dialogs
const dialogAddVehicleEl = document.getElementById('dialogAddVehicle');
const dialogAddMaintenanceEl = document.getElementById('dialogAddMaintenance');
const dialogVehicleDetailsEl = document.getElementById('dialogVehicleDetails');
const dialogEditMaintenanceEl = document.getElementById('dialogEditMaintenance');
const dialogConfirmEl = document.getElementById('dialogConfirm');

// Forms
const formAddVehicleEl = document.getElementById('formAddVehicle');
const formAddMaintenanceEl = document.getElementById('formAddMaintenance');
const formEditMaintenanceEl = document.getElementById('formEditMaintenance');
const typeSelectEl = document.getElementById('type');
const editTypeSelectEl = document.getElementById('editType');

// Buttons
const btnAddVehicleEl = document.getElementById('btnAddVehicle');
const btnAddVehicleEmptyEl = document.getElementById('btnAddVehicleEmpty');

// Load data
function loadData() {
    vehicles = getVehicles();
    maintenances = getMaintenances();
    alerts = checkAllMaintenances(vehicles, maintenances);

    renderStats();
    renderAlerts();
    renderVehicles();
}

/**
 * Carica i tipi di manutenzione dal file JSON.
 */
async function loadMaintenanceTypes() {
    try {
        const response = await fetch('maintenance_types.json');
        if (!response.ok) {
            throw new Error('Errore nel caricamento dei tipi di manutenzione');
        }
        const data = await response.json();
        MAINTENANCE_TYPES = data.types;
    } catch (error) {
        console.error(error);
        // Fallback a una lista predefinita in caso di errore
        MAINTENANCE_TYPES = ["Collaudo", "Cambio Olio", "Tagliando", "Revisione", "Cambio Gomme", "Frizione", "Freni", "Filtri", "Controllo", "Altro"];
        showAlertDialog('Errore di Caricamento', 'Impossibile caricare i tipi di manutenzione. Verrà usata una lista predefinita.');
    }
}


/**
 * Popola i menu a tendina per la selezione del tipo di manutenzione.
 */
function populateMaintenanceTypeSelects() {
    const selects = [typeSelectEl, editTypeSelectEl];

    selects.forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Seleziona tipo</option>'; // Pulisce e aggiunge il placeholder
        MAINTENANCE_TYPES.forEach(type => {
            select.innerHTML += `<option value="${type}">${type}</option>`;
        });
    });
}

function renderStats() {
    totalVehiclesEl.textContent = vehicles.length;
    totalMaintenancesEl.textContent = maintenances.length;
    activeAlertsEl.textContent = alerts.length;

    // Aggiorna le etichette per singolare/plurale
    totalVehiclesLabelEl.textContent = vehicles.length === 1 ? 'Veicolo Totale' : 'Veicoli Totali';
    totalMaintenancesLabelEl.textContent = maintenances.length === 1 ? 'Manutenzione' : 'Manutenzioni';
    activeAlertsLabelEl.textContent = alerts.length === 1 ? 'Scadenza Attiva' : 'Scadenze Attive';

    // Update alerts icon
    if (alerts.length > 0) {
        alertsIconEl.className = 'stat-icon stat-icon-red';
        alertsIconEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    } else {
        alertsIconEl.className = 'stat-icon stat-icon-gray';
        alertsIconEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    }
}

/**
 * Renderizza gli avvisi di manutenzione in scadenza nell'interfaccia (NUOVA FUNZIONE).
 */
function renderAlerts() {
    if (alerts.length === 0) {
        alertsSectionEl.style.display = 'none';
        return;
    }

    alertsSectionEl.style.display = 'block';
    alertsContainerEl.innerHTML = ''; // Pulisce il contenitore

    // Ordina gli alert per data di scadenza (più vicina prima)
    alerts.sort((a, b) => {
        // Prioritizza gli alert che sono già in scadenza (negativi)
        if (a.daysUntil < 0 && b.daysUntil >= 0) return -1;
        if (a.daysUntil >= 0 && b.daysUntil < 0) return 1;
        // Altrimenti, ordina per giorni mancanti (crescente)
        return a.daysUntil - b.daysUntil;
    });

    alerts.forEach(alert => {
        const alertMessage = document.createElement('div');
        alertMessage.className = 'alert-message warning';
        alertMessage.onclick = () => handleViewDetails(alert.vehicle.id); // Rende l'alert cliccabile

        const formattedDate = new Date(alert.maintenance.dueDate).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        alertMessage.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-message-content">
                <strong>${alert.vehicle.brand} ${alert.vehicle.model}: ${alert.maintenance.type}</strong>
                <p>Scadenza: ${formattedDate} (${alert.reason})</p>
                    <small>Clicca sulla card per i dettagli.</small>
                </div>
                <div class="alert-actions">
                    <button class="btn btn-sm btn-success" onclick="event.stopPropagation(); handleMarkCompleteFromAlert('${alert.maintenance.id}')">
                        <i class="fas fa-check"></i> Completa
                    </button>
            </div>
        `;
        alertsContainerEl.appendChild(alertMessage);
    });
}

function renderVehicles() {
    vehiclesContainerEl.innerHTML = '';

    if (vehicles.length === 0) {
        emptyStateEl.style.display = 'block';
        return;
    }

    emptyStateEl.style.display = 'none';

    vehicles.forEach((vehicle, index) => {
        const vehicleMaintenances = maintenances.filter(m => m.vehicleId === vehicle.id);
        const maintenanceText = vehicleMaintenances.length === 1 ? 'manutenzione' : 'manutenzioni';

        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'vehicle-card';

        // LOGICA AGGIORNATA PER PULSANTI DETTAGLI/ELIMINA NELL'HEADER (ICONI TOUCH FRIENDLY)
        vehicleCard.innerHTML = `
            <div class="vehicle-card-header">
                <div class="vehicle-card-info">
                    <div class="vehicle-icon">
                        <i class="fas fa-car"></i>
                    </div>
                    <div class="vehicle-info">
                        <h3>${vehicle.brand} ${vehicle.model}</h3>
                        <p>${vehicle.plate}</p>
                    </div>
                </div>
                <div class="vehicle-header-actions">
                    <button class="btn-icon btn-secondary" onclick="handleEditVehicle('${vehicle.id}')" aria-label="Modifica Veicolo">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="handleDeleteVehicle('${vehicle.id}')" aria-label="Elimina Veicolo">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                </div>
            <div class="vehicle-card-footer">
                <div class="vehicle-card-info-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>${vehicle.currentKm ? vehicle.currentKm.toLocaleString() : 0} km</span>
                </div>
                <div class="vehicle-card-info-item">
                    <i class="fas fa-calendar"></i>
                    <span>${vehicleMaintenances.length} ${maintenanceText}</span>
                </div>
            </div>
            <div class="vehicle-card-actions">
                <button class="btn btn-secondary btn-full" onclick="handleViewDetails('${vehicle.id}')">
                    Dettagli
                </button>
                <button class="btn btn-primary btn-full" onclick="handleAddMaintenance('${vehicle.id}')">
                    <i class="fas fa-plus"></i>
                    Manutenzione
                </button>
            </div>
        `;

        vehiclesContainerEl.appendChild(vehicleCard);
    });
}

// Event handlers
function handleDeleteVehicle(vehicleId) {
    showConfirmDialog(
        'Conferma Eliminazione Veicolo',
        'Sei sicuro di voler eliminare questo veicolo? Verranno eliminate anche tutte le manutenzioni associate.',
        () => {
            deleteVehicle(vehicleId);
            loadData();
        }
    );
}

function showConfirmDialog(title, message, onConfirm) {
    document.getElementById('confirmDialogTitle').textContent = title;
    document.getElementById('confirmDialogMessage').textContent = message;
    dialogConfirmEl.classList.add('show');

    document.getElementById('btnConfirmAction').onclick = () => {
        onConfirm();
        dialogConfirmEl.classList.remove('show');
    };
}

function handleViewDetails(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    currentVehicle = vehicle;
    const vehicleMaintenances = maintenances.filter(m => m.vehicleId === vehicleId);

    // Set dialog info
    document.getElementById('detailsVehicleName').textContent = `${vehicle.brand} ${vehicle.model}`;
    document.getElementById('detailsVehicleInfo').textContent = `${vehicle.plate} - Anno ${vehicle.year}`;
    document.getElementById('updateKm').value = vehicle.currentKm || 0;

    // Render maintenances
    const maintenancesListEl = document.getElementById('maintenancesList');
    if (vehicleMaintenances.length === 0) {
        maintenancesListEl.innerHTML = '<div class="no-maintenances"><p>Nessuna manutenzione programmata</p></div>';
    } else {
        maintenancesListEl.innerHTML = '';
        vehicleMaintenances.forEach((maintenance, index) => {
            const check = checkMaintenanceDue(maintenance, vehicle.currentKm);
            const isOverdue = check.daysUntil < 0;

            const maintenanceItem = document.createElement('div');
            maintenanceItem.className = `maintenance-item ${maintenance.completed ? 'completed' : check.isDue ? 'due' : ''}`;

            // CLASSI E PULSANTI AGGIORNATI
            maintenanceItem.innerHTML = `
                <div class="maintenance-item-header">
                    <div class="maintenance-item-info">
                        <div class="maintenance-item-header-left">
                            <button class="maintenance-checkbox" onclick="handleToggleComplete('${maintenance.id}')">
                                <i class="fas ${maintenance.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                            </button>
                            <h4 class="maintenance-title ${maintenance.completed ? 'completed' : ''}">${maintenance.type}</h4>
                        </div>
                        <div class="maintenance-details">
                            <div class="maintenance-detail-item" style="color: var(--text-secondary)">
                                <i class="fas fa-calendar"></i>
                                <span>Scadenza: ${formatDate(maintenance.dueDate)}</span>
                                ${!maintenance.completed ? `
                                    <span class="${isOverdue ? 'text-overdue' : 'text-normal'}">
                                        (${check.daysUntil >= 0 ? `tra ${check.daysUntil} ${check.daysUntil === 1 ? 'giorno' : 'giorni'}` : `scaduto da ${Math.abs(check.daysUntil)} ${Math.abs(check.daysUntil) === 1 ? 'giorno' : 'giorni'}`})
                                    </span>
                                ` : ''}
                            </div>
                            ${maintenance.dueKm ? `
                                <div class="maintenance-detail-item" style="color: var(--text-secondary)">
                                    <i class="fas fa-tachometer-alt"></i>
                                    <span>Km: ${maintenance.dueKm.toLocaleString()}</span>
                                    ${check.kmUntil !== null && !maintenance.completed ? `
                                        <span class="${check.kmUntil < 0 ? 'text-overdue' : 'text-normal'}">
                                            (${check.kmUntil >= 0 ? `mancano ${check.kmUntil} km` : `superato di ${Math.abs(check.kmUntil)} km`})
                                        </span>
                                    ` : ''}
                                </div>
                            ` : ''}
                            ${maintenance.notes ? `<p class="maintenance-notes" style="color: var(--text-secondary)">${maintenance.notes}</p>` : ''}
                            ${maintenance.completed && maintenance.completedAt ? `
                                <p class="maintenance-completed-date">Completata il ${formatDate(maintenance.completedAt)}</p>
                            ` : ''}
                        </div>
                    </div>
                    <div class="maintenance-actions"> <button class="btn-icon btn-secondary" onclick="handleEditMaintenance('${maintenance.id}')" aria-label="Modifica Manutenzione">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="handleDeleteMaintenance('${maintenance.id}')" aria-label="Elimina Manutenzione">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            maintenancesListEl.appendChild(maintenanceItem);
        });
    }

    dialogVehicleDetailsEl.classList.add('show');
}

function handleAddMaintenance(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    currentVehicle = vehicle;
    document.getElementById('maintenanceVehicleInfo').textContent =
        `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`;

    // Reset form
    formAddMaintenanceEl.reset();
    document.getElementById('notifyDaysBefore').value = '7';

    dialogAddMaintenanceEl.classList.add('show');
}

function handleEditMaintenance(maintenanceId) {
    const maintenance = maintenances.find(m => m.id === maintenanceId);
    if (!maintenance) return;

    currentMaintenance = maintenance;

    // Populate form
    document.getElementById('editType').value = maintenance.type;
    document.getElementById('editDueDate').value = maintenance.dueDate ? new Date(maintenance.dueDate).toISOString().split('T')[0] : '';
    document.getElementById('editDueKm').value = maintenance.dueKm || '';
    document.getElementById('editNotifyDaysBefore').value = maintenance.notifyDaysBefore || 7;
    document.getElementById('editNotes').value = maintenance.notes || '';

    dialogEditMaintenanceEl.classList.add('show');
}

function handleDeleteMaintenance(maintenanceId) {
    showConfirmDialog(
        'Conferma Eliminazione Manutenzione',
        'Sei sicuro di voler eliminare questa manutenzione?',
        () => {
            deleteMaintenance(maintenanceId);
            loadData();
            if (currentVehicle) {
                handleViewDetails(currentVehicle.id);
            }
        }
    );
}

function showAlertDialog(title, message) {
    // Usa il dialog di conferma esistente per mostrare un avviso
    document.getElementById('confirmDialogTitle').textContent = title;
    document.getElementById('confirmDialogMessage').textContent = message;
    document.getElementById('btnConfirmAction').style.display = 'none'; // Nasconde il pulsante di conferma
    document.getElementById('btnCancelConfirm').textContent = 'OK'; // Cambia il testo del pulsante di annullamento
    dialogConfirmEl.classList.add('show');
}
function handleToggleComplete(maintenanceId) {
    const maintenance = maintenances.find(m => m.id === maintenanceId);
    if (!maintenance) return;

    const updatedMaintenance = {
        ...maintenance,
        completed: !maintenance.completed,
        completedAt: !maintenance.completed ? new Date().toISOString() : null
    };

    saveMaintenance(updatedMaintenance);
    loadData();

    // Refresh details if open
    if (currentVehicle) {
        handleViewDetails(currentVehicle.id);
    }
}

function handleMarkComplete(index) {
    const alert = alerts[index];
    if (!alert) return;

    const updatedMaintenance = {
        ...alert.maintenance,
        completed: true,
        completedAt: new Date().toISOString()
    };

    saveMaintenance(updatedMaintenance);
    loadData();
}

/**
 * Segna una manutenzione come completata direttamente da un avviso.
 * @param {string} maintenanceId - L'ID della manutenzione da completare.
 */
function handleMarkCompleteFromAlert(maintenanceId) {
    const maintenance = maintenances.find(m => m.id === maintenanceId);
    if (!maintenance || maintenance.completed) return;

    const updatedMaintenance = {
        ...maintenance,
        completed: true,
        completedAt: new Date().toISOString()
    };

    saveMaintenance(updatedMaintenance);
    loadData(); // Ricarica tutti i dati per aggiornare l'interfaccia
}

function handleUpdateKm() {
    const newKm = parseInt(document.getElementById('updateKm').value) || 0;
    const updatedVehicle = {
        ...currentVehicle,
        currentKm: newKm
    };

    saveVehicle(updatedVehicle);
    loadData();
    handleViewDetails(currentVehicle.id);
}

// Dialog buttons
btnAddVehicleEl.addEventListener('click', () => {
    currentVehicle = null;
    formAddVehicleEl.reset();
    document.getElementById('dialogAddVehicleTitle').textContent = 'Aggiungi Nuovo Veicolo';
    dialogAddVehicleEl.classList.add('show');
});

btnAddVehicleEmptyEl.addEventListener('click', () => {
    currentVehicle = null;
    formAddVehicleEl.reset();
    document.getElementById('dialogAddVehicleTitle').textContent = 'Aggiungi Nuovo Veicolo';
    dialogAddVehicleEl.classList.add('show');
});

document.getElementById('btnCancelAddVehicle').addEventListener('click', () => {
    const wasEditing = !!currentVehicle;
    const vehicleIdToRestore = wasEditing ? currentVehicle.id : null;

    dialogAddVehicleEl.classList.remove('show');
    currentVehicle = null;

    // If we were editing, reopen the details dialog
    if (wasEditing && vehicleIdToRestore) {
        // Use a small delay to allow the dialog to close smoothly
        setTimeout(() => {
            handleViewDetails(vehicleIdToRestore);
        }, 100);
    }
});

document.getElementById('btnCancelAddMaintenance').addEventListener('click', () => {
    dialogAddMaintenanceEl.classList.remove('show');
    // Se c'è un veicolo corrente, riapri il modale dei dettagli
    if (currentVehicle) {
        // Usa un piccolo ritardo per consentire al dialog di chiudersi senza intoppi
        setTimeout(() => {
            handleViewDetails(currentVehicle.id);
        }, 100);
    }
});

document.getElementById('btnCancelEditMaintenance').addEventListener('click', () => {
    dialogEditMaintenanceEl.classList.remove('show');
});

document.getElementById('btnCancelConfirm').addEventListener('click', () => {
    dialogConfirmEl.classList.remove('show');
});

document.getElementById('btnCloseDetails').addEventListener('click', () => {
    dialogVehicleDetailsEl.classList.remove('show');
    currentVehicle = null;
});

document.getElementById('btnEditVehicleFromDetails').addEventListener('click', () => {
    if (!currentVehicle) return;

    // Chiudi il dialog dei dettagli
    dialogVehicleDetailsEl.classList.remove('show');

    // Apri il dialog di modifica dopo una breve attesa per una transizione fluida
    setTimeout(() => {
        handleEditVehicle(currentVehicle.id);
    }, 200);
});

// Event listener for "Add Maintenance" button inside Vehicle Details dialog
document.getElementById('btnAddMaintenanceFromDetails').addEventListener('click', () => {
    if (!currentVehicle) return;

    // Close the details dialog
    dialogVehicleDetailsEl.classList.remove('show');

    // Open the add maintenance dialog after a brief delay for a smooth transition
    setTimeout(() => {
        handleAddMaintenance(currentVehicle.id);
    }, 200);
});

document.getElementById('btnUpdateKm').addEventListener('click', handleUpdateKm);

// Form submissions
formAddVehicleEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const plateInput = document.getElementById('plate');
    const newPlate = plateInput.value.toUpperCase().trim();

    // Controlla se la targa esiste già per un altro veicolo
    const allVehicles = getVehicles();
    const isDuplicate = allVehicles.some(
        (v) => v.plate === newPlate && v.id !== (currentVehicle ? currentVehicle.id : null)
    );

    if (isDuplicate) {
        showAlertDialog('Errore: Targa Duplicata', 'La targa inserita è già associata a un altro veicolo. Controlla e riprova.');
        plateInput.focus();
        return; // Interrompe il salvataggio
    }

    const vehicle = {
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        plate: document.getElementById('plate').value.toUpperCase(),
        year: parseInt(document.getElementById('year').value),
        currentKm: parseInt(document.getElementById('currentKm').value) || 0
    };

    // If editing, keep the ID and remember we were editing
    const wasEditing = !!currentVehicle;
    if (currentVehicle) {
        vehicle.id = currentVehicle.id;
    }

    saveVehicle(vehicle);
    loadData();
    dialogAddVehicleEl.classList.remove('show');

    // Reset currentVehicle
    currentVehicle = null;

    // If we were editing, reopen the details dialog with updated data
    if (wasEditing && vehicle.id) {
        handleViewDetails(vehicle.id);
    }
});

formAddMaintenanceEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const vehicleId = currentVehicle ? currentVehicle.id : null;

    const maintenance = {
        vehicleId: vehicleId,
        type: document.getElementById('type').value,
        dueDate: document.getElementById('dueDate').value,
        dueKm: document.getElementById('dueKm').value ? parseInt(document.getElementById('dueKm').value) : null,
        notifyDaysBefore: parseInt(document.getElementById('notifyDaysBefore').value),
        notes: document.getElementById('notes').value,
        completed: false
    };

    saveMaintenance(maintenance);
    loadData();
    dialogAddMaintenanceEl.classList.remove('show');

    // Se la manutenzione è stata aggiunta da un veicolo specifico, riapri i dettagli
    if (vehicleId) {
        // Usa un piccolo ritardo per consentire al dialog di chiudersi senza intoppi
        setTimeout(() => {
            handleViewDetails(vehicleId);
        }, 100);
    }
});

formEditMaintenanceEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const maintenance = {
        ...currentMaintenance,
        type: document.getElementById('editType').value,
        dueDate: document.getElementById('editDueDate').value,
        dueKm: document.getElementById('editDueKm').value ? parseInt(document.getElementById('editDueKm').value) : null,
        notifyDaysBefore: parseInt(document.getElementById('editNotifyDaysBefore').value),
        notes: document.getElementById('editNotes').value
    };

    saveMaintenance(maintenance);
    loadData();

    dialogEditMaintenanceEl.classList.remove('show');

    // Refresh details if open
    if (currentVehicle) {
        handleViewDetails(currentVehicle.id);
    }
});

// Close dialogs on overlay click
function setupDialogCloseHandlers() {
    const dialogs = [dialogAddVehicleEl, dialogAddMaintenanceEl, dialogVehicleDetailsEl, dialogEditMaintenanceEl, dialogConfirmEl];

    dialogs.forEach(dialog => {
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                // Resetta lo stile del dialog di conferma quando viene chiuso
                if (dialog === dialogConfirmEl) {
                    document.getElementById('btnConfirmAction').style.display = 'inline-flex';
                    document.getElementById('btnCancelConfirm').textContent = 'Annulla';
                }
                dialog.classList.remove('show');
            }
        });
    });
}

// Check maintenances periodically
function checkMaintenancesAndNotify() {
    const vehiclesData = getVehicles();
    const maintenancesData = getMaintenances();

    const alertsData = checkAllMaintenances(vehiclesData, maintenancesData);
    alerts = alertsData; // Aggiorna lo stato globale degli alert

    if (alertsData.length > 0) {
        // Usiamo un nuovo Set per tenere traccia degli alert già notificati in questa sessione
        const newNotifiedAlerts = new Set(notifiedAlerts);

        alertsData.forEach(alert => {
            // Creiamo un ID univoco per ogni alert di manutenzione
            const alertId = `${alert.vehicle.id}-${alert.maintenance.id}`;
            // Se non abbiamo ancora notificato questo alert, lo facciamo
            if (!notifiedAlerts.has(alertId)) {
                showBrowserNotification(
                    `Manutenzione in scadenza: ${alert.vehicle.brand} ${alert.vehicle.model}`,
                    `${alert.maintenance.type} - ${alert.reason}`
                );
                newNotifiedAlerts.add(alertId); // Aggiungiamo l'ID al set per non notificarlo di nuovo
            }
        });
        notifiedAlerts = newNotifiedAlerts;
    }

    loadData();
}

// Initialize app
setupDialogCloseHandlers();
requestNotificationPermission();

// Theme init
const initialTheme = getInitialTheme();
setTheme(initialTheme);

// Theme toggle handler
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const current = localStorage.getItem(THEME_KEY) || initialTheme;
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    });
}

/**
 * Inizializza l'applicazione.
 */
async function initializeApp() {
    // Setup handlers che non dipendono dai dati
    setupDialogCloseHandlers();
    requestNotificationPermission();

    // Inizializza il tema
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);

    // Carica i dati asincroni
    await loadMaintenanceTypes();

    // Popola i select e carica i dati principali
    populateMaintenanceTypeSelects();
    loadData();

    // Avvia i controlli periodici
    setInterval(checkMaintenancesAndNotify, 5 * 60 * 1000);
}

initializeApp();

function handleEditVehicle(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    currentVehicle = vehicle;
    document.getElementById('dialogAddVehicleTitle').textContent = 'Modifica Veicolo';
    document.getElementById('brand').value = vehicle.brand;
    document.getElementById('model').value = vehicle.model;
    document.getElementById('plate').value = vehicle.plate;
    document.getElementById('year').value = vehicle.year;
    document.getElementById('currentKm').value = vehicle.currentKm || 0;
    dialogAddVehicleEl.classList.add('show');
}