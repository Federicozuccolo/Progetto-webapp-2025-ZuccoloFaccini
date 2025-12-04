
/* ============================================================ VARIABILI GLOBALI =========================================================== */
const API_URL = 'http://localhost:3001/api';
let authToken = null;
let currentUser = null;
let allCars = [];
let currentEditId = null;
let currentTab = 'catalogo';
let currentEditRiparazioneId = null;

/* Parametri per la paginazione */
const ITEMS_PER_PAGE = 6;
let currentPage = 1;
let totalCars = 0;
let filteredCarsCount = 0;

/* ======================================================================= AUTENTICAZIONE ==================================================== */
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    errorDiv.style.display = 'none';
    
    if (!username || !password) {
        errorDiv.textContent = 'Inserisci username e password';
        errorDiv.style.display = 'block';
        return;
    }
    
    fetch(API_URL + '/login', {             
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Credenziali non valide');
        }
        return response.json();
    })
    .then(function(data) {
        authToken = data.token;
        currentUser = data.username;
        
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'block';
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('usernameDisplay').textContent = 'Benvenuto, ' + currentUser;
        
        loadCars();
    })
    .catch(function(error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    });
}

function logout() {
    authToken = null;
    currentUser = null;
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('appSection').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}


/* ======================================================================= GESTIONE TAB =========================================================== */
/*FUNZIONE CHE PERMETTE DI SWITCHARE I DUE TAB PRINCIPALI */
function switchTab(tabName) {
    currentTab = tabName;
    
    const tabs = document.querySelectorAll('.tab-btn');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    const contents = document.querySelectorAll('.tab-content');
    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.remove('active');
    }
    
    if (tabName === 'catalogo') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('tabCatalogo').classList.add('active');
        loadCars();
    } else if (tabName === 'riparazioni') {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('tabRiparazioni').classList.add('active');
        loadRiparazioni();
    }
}


/* ====================================================================== GESTIONE AUTO ========================================================= */
/*FUNZIONE CHE CONTROLLA SE CI SONO FILTRI ATTIVI*/
function hasActiveFilters() {
    const searchTerm = document.getElementById('searchInput').value;
    const statoFilter = document.getElementById('filterStato').value;       
    const carburanteFilter = document.getElementById('filterCarburante').value;
    const sedeFilter = document.getElementById('filterSede').value;

    return !!(searchTerm || statoFilter || carburanteFilter || sedeFilter);
}

/*FUNZIONE PER CARICARE TUTTE LE AUTO NEL CATALOGO */
function loadCars() {
    const searchTerm = document.getElementById('searchInput').value;
    const hasFilters = hasActiveFilters();

    const limit = hasFilters 
        ? 1000 
        : ITEMS_PER_PAGE;
    const offset = hasFilters 
        ? 0 
        : (currentPage - 1) * ITEMS_PER_PAGE;

    let url = API_URL + '/cars?limit=' + limit + '&offset=' + offset;

    if (searchTerm) {
        url = url + '&q=' + encodeURIComponent(searchTerm);
    }
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            allCars = data.results;
            totalCars = data.total;

            renderCars();

            if (!hasFilters) {
                /*Gestione info*/
                const resultsInfo = document.getElementById('resultsInfo');
                resultsInfo.textContent = 'Visualizzate ' + allCars.length + ' auto su ' + totalCars + ' totali';
                /*Gestione paginazione*/
                const paginationDiv = document.getElementById('pagination');
                paginationDiv.style.display = 'flex';
                renderPagination();
            }
        })
        .catch(function(error) {
            console.error('Errore nel caricamento:', error);
            showNotification('Errore nel caricamento delle auto', 'error');
        });
}

/*FUNCIONE CHE PRENDE LE AUTO CARICATE, APPLICA I FILTRI SELEZIONATI DALL'UTENTE E MOSTRA LA GRIGLIA*/
function renderCars() {
    const grid = document.getElementById('carsGrid');
    grid.innerHTML = '';

    const statoFilter = document.getElementById('filterStato').value;
    const carburanteFilter = document.getElementById('filterCarburante').value;
    const sedeFilter = document.getElementById('filterSede').value;
    
    let filteredCars = allCars;
    
    /*Filtro STATO*/
    if (statoFilter) {
        const temp = [];
        for (let i = 0; i < filteredCars.length; i++) {
            if (filteredCars[i].stato === statoFilter) {
                temp.push(filteredCars[i]);
            }
        }
        filteredCars = temp;
    }
    
    /*Filtro CARBURANTE*/
    if (carburanteFilter) {
        const temp = [];
        for (let i = 0; i < filteredCars.length; i++) {
            if (filteredCars[i].carburante === carburanteFilter) {
                temp.push(filteredCars[i]);
            }
        }
        filteredCars = temp;
    }
    
    /*FILTRO SEDE */
    if (sedeFilter) {
        const temp = [];
        for (let i = 0; i < filteredCars.length; i++) {
            if (filteredCars[i].sede === sedeFilter) {
                temp.push(filteredCars[i]);
            }
        }
        filteredCars = temp;
    }
    
    if (hasActiveFilters()) {
        const resultsInfo = document.getElementById('resultsInfo');
        const paginationDiv = document.getElementById('pagination');

        resultsInfo.textContent = 'Trovate ' + filteredCars.length + ' auto';

        if (filteredCars.length <= ITEMS_PER_PAGE) {
            paginationDiv.style.display = 'none';
        } else {
            paginationDiv.style.display = 'flex';
            renderPagination(filteredCars.length);
        }
    }

    if (filteredCars.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding:2rem; color: #64748b;">Nessuna auto trovata</p>';
        return;
    }
    
    /*Creazione delle card HTML*/
    for (let i = 0; i < filteredCars.length; i++) {
        const card = createCarCard(filteredCars[i]);
        grid.appendChild(card);
    }
}

/*CREAZIONE DEI PULSANTI 'PRECEDENTE' E 'SUCCESSIVO' PER PAGINAZIONE*/
function renderPagination(totalItems) {
    const pagination = document.getElementById('pagination');

    const itemCount = totalItems !== undefined 
    ? totalItems 
    : totalCars;
    const totalPages = Math.ceil(itemCount / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    /*Creazione pulsanti*/
    pagination.innerHTML =
        '<button onclick="changePage(' + (currentPage - 1) + ')" ' +
        (currentPage === 1 ? 'disabled' : '') + '>Precedente</button>' +
        '<span>Pagina ' + currentPage + ' di ' + totalPages + '</span>' +
        '<button onclick="changePage(' + (currentPage + 1) + ')" ' +
        (currentPage >= totalPages ? 'disabled' : '') + '>Successiva</button>';
}

/*FUNZIONE PER CAMBIARE PAGINA*/
function changePage(page) {
    const hasFilters = hasActiveFilters();
    
    if (hasFilters) {
        currentPage = page;
        renderCars();  
    } else {
        currentPage = page;
        loadCars();
    }
}

/*FUNZIONE PER FAR TORNARE L'UTENTE ALLA PRIMA PAGINA DOPO AVER APPLICATO UN FILTRO*/
function applyFilters() {
    currentPage = 1;
    loadCars();
}

/*FUNZIONE PER LA CREAZIONE VERA E PROPRIA DELLE CARD DELLE AUTO*/
function createCarCard(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    
    let statoBadge = '';
    if (car.stato === 'Nuova') {
        statoBadge = '<span class="badge badge-new">Nuova</span>';
    } else if (car.stato === 'Usata') {
        statoBadge = '<span class="badge badge-used">Usata</span>';
    } else if (car.stato === 'KM Zero') {
        statoBadge = '<span class="badge badge-km-zero">KM Zero</span>';
    }
    
    /*Badge DISPONIBILITA'*/
    const disponibilitaBadge = car.disponibile 
        ? '<span class="badge badge-available">Disponibile</span>'
        : '<span class="badge badge-sold">Venduta</span>';
    
    /*IMMAGINE AUTO*/
    const imageStyle = car.immagine 
        ? 'background-image: url(' + car.immagine + ')'
        : 'background-color: #e5e7eb';
    
    /*Creazione CARD html */
    card.innerHTML = 
        '<div class="car-image" style="' + imageStyle + '">' +
            '<div class="car-badges">' +
                statoBadge +
                disponibilitaBadge +
            '</div>' +
        '</div>' +
        '<div class="car-content">' +
            '<h3 class="car-title">' + car.marca + ' ' + car.modello + '</h3>' +
            '<div class="car-sede">📍 ' + car.sede + '</div>' +
            '<p class="car-description">' + car.descrizione + '</p>' +
            '<div class="car-details">' +
                '<div class="car-detail">' +
                    '<span class="car-detail-label">Anno</span>' +
                    '<span class="car-detail-value">' + car.anno + '</span>' +
                '</div>' +
                '<div class="car-detail">' +
                    '<span class="car-detail-label">Chilometri</span>' +
                    '<span class="car-detail-value">' + car.chilometri.toLocaleString() + ' km</span>' +
                '</div>' +
                '<div class="car-detail">' +
                    '<span class="car-detail-label">Carburante</span>' +
                    '<span class="car-detail-value">' + car.carburante + '</span>' +
                '</div>' +
                '<div class="car-detail">' +
                    '<span class="car-detail-label">Colore</span>' +
                    '<span class="car-detail-value">' + car.colore + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="car-price">€ ' + car.prezzo.toLocaleString() + '</div>' +
            '<div class="car-actions">' +
                '<button class="btn-warning btn-flex-1" onclick="editCar(' + car.id + ')">Modifica</button>' +
                '<button class="btn-danger btn-flex-1" onclick="deleteCar(' + car.id + ')">Elimina</button>' +
            '</div>' +
        '</div>';
    
    return card;
}


/* ================================================================ MODAL AUTO ================================================================== */
/*FUNZIONE CHE APRE IL MOX MODALE PER AGGIUNGERE UNA NUOVA AUTO */
function openModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Aggiungi Nuova Auto';
    document.getElementById('carForm').reset();
    document.getElementById('disponibile').checked = true;
    document.getElementById('modalError').style.display = 'none';
    document.getElementById('carModal').style.display = 'flex';
}

/*FUNZIONE PER LA CHIUSURA DEL BOX MODALE*/
function closeModal() {
    document.getElementById('carModal').style.display = 'none';
    currentEditId = null;
}

/*FUNZIONE CHE APRE IL MODALE PER LA MODIFICA DELLE AUTO */
function editCar(id) {
    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Modifica Auto';
    
    fetch(API_URL + '/cars/' + id)
        .then(function(response) {
            return response.json();
        })
        .then(function(car) {
            document.getElementById('marca').value = car.marca;
            document.getElementById('modello').value = car.modello;
            document.getElementById('anno').value = car.anno;
            document.getElementById('prezzo').value = car.prezzo;
            document.getElementById('chilometri').value = car.chilometri;
            document.getElementById('carburante').value = car.carburante;
            document.getElementById('stato').value = car.stato;
            document.getElementById('colore').value = car.colore;
            document.getElementById('sede').value = car.sede;
            document.getElementById('immagine').value = car.immagine || '';
            document.getElementById('descrizione').value = car.descrizione;
            document.getElementById('disponibile').checked = car.disponibile;
            
            document.getElementById('modalError').style.display = 'none';
            document.getElementById('carModal').style.display = 'flex';
        })
        .catch(function(error) {
            showNotification('Errore nel caricamento dei dati', 'error');
        });
}

/*FUNZIONE PER CREARE O MODIFICARE UN'AUTO */
function saveCar() {
    const carData = {
        marca: document.getElementById('marca').value,
        modello: document.getElementById('modello').value,
        anno: parseInt(document.getElementById('anno').value),
        prezzo: parseFloat(document.getElementById('prezzo').value),
        chilometri: parseInt(document.getElementById('chilometri').value),
        carburante: document.getElementById('carburante').value,
        stato: document.getElementById('stato').value,
        colore: document.getElementById('colore').value,
        sede: document.getElementById('sede').value,
        immagine: document.getElementById('immagine').value,
        descrizione: document.getElementById('descrizione').value,
        disponibile: document.getElementById('disponibile').checked
    };
    
    const url = currentEditId 
        ? API_URL + '/cars/' + currentEditId
        : API_URL + '/cars';
    
    const method = currentEditId 
    ? 'PUT' 
    : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authToken
        },
        body: JSON.stringify(carData)
    })
    .then(function(response) {
        if (!response.ok) {
            return response.json().then(function(err) {
                throw new Error(err.error);
            });
        }
        return response.json();
    })
    .then(function(data) {
        closeModal();
        loadCars();
        const message = currentEditId ? 'Auto modificata con successo' : 'Auto aggiunta con successo';
        showNotification(message, 'success');
    })
    .catch(function(error) {
        document.getElementById('modalError').textContent = error.message;
        document.getElementById('modalError').style.display = 'block';
    });
}

/*FUNZIONE PER ELIMINARE UN'AUTO */
function deleteCar(id) {
    if (!confirm('Sei sicuro di voler eliminare questa auto?')) {
        return;
    }
    
    fetch(API_URL + '/cars/' + id, {
        method: 'DELETE',
        headers: {
            'x-auth-token': authToken
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Errore nell\'eliminazione');
        }
        loadCars();
        showNotification('Auto eliminata con successo', 'success');
    })
    .catch(function(error) {
        showNotification(error.message, 'error');
    });
}


/* ============================================================== GESTIONE RIPARAZIONI ========================================================= */
/*FUNZIONE PER IL CARICAMENTO DELLE RIPARAZIONI */
function loadRiparazioni() {
    fetch(API_URL + '/riparazioni')
        .then(function(response) {
            return response.json();
        })
        .then(function(riparazioni) {
            return fetch(API_URL + '/cars?limit=1000')
                .then(function(response) {
                    return response.json();
                })
                .then(function(carsData) {
                    renderRiparazioni(riparazioni, carsData.results);
                });
        })
        .catch(function(error) {
            showNotification('Errore nel caricamento delle riparazioni', 'error');
        });
}

/*FUNZIONE PER LA CREAZIONE DELLE SCHEDE DI RIPARAZIONE*/
function renderRiparazioni(riparazioni, cars) {
    const grid = document.getElementById('riparazioniGrid');
    grid.innerHTML = '';
    
    if (riparazioni.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">Nessuna riparazione presente</p>';
        return;
    }
    
    for (let i = 0; i < riparazioni.length; i++) {
        const rip = riparazioni[i];
        let car = null;
        
        for (let j = 0; j < cars.length; j++) {
            if (cars[j].id === rip.carId) {
                car = cars[j];
                break;
            }
        }
        
        const carInfo = car 
        ? car.marca + ' ' + car.modello 
        : 'Auto non trovata';
        
        /*Badge dello STATO */
        let statoBadge = '';
        if (rip.statoLavorazione === 'da_fare') {
            statoBadge = '<span class="stato-badge stato-da-fare">Da fare</span>';
        } else if (rip.statoLavorazione === 'in_corso') {
            statoBadge = '<span class="stato-badge stato-in-corso">In corso</span>';
        } else {
            statoBadge = '<span class="stato-badge stato-completato">Completato</span>';
        }
        
        /*Creazione SCHEDA */
        const card = document.createElement('div');
        card.className = 'riparazione-card';
        card.innerHTML = 
            '<div class="riparazione-info">' +
                '<h3>' + carInfo + '</h3>' +
                '<p>ID Auto: ' + rip.carId + '</p>' +
            '</div>' +
            '<div class="riparazione-tipo">' + rip.tipoLavorazione + '</div>' +
            '<div class="riparazione-stato">' + statoBadge + '</div>' +
            '<div class="riparazione-costo">' +
                '<div class="riparazione-costo-label">Costo</div>' +
                '<div class="riparazione-costo-value">€ ' + rip.costo.toFixed(2) + '</div>' +
            '</div>' +
            '<div class="riparazione-costo">' +
                '<div class="riparazione-costo-label">Ore</div>' +
                '<div class="riparazione-costo-value">' + rip.oreRichieste + 'h</div>' +
            '</div>' +
            '<div class="riparazione-actions">' +
                '<button class="btn-warning" onclick="editRiparazione(' + rip.id + ')">Modifica</button>' +
                '<button class="btn-danger" onclick="deleteRiparazione(' + rip.id + ')">Elimina</button>' +
            '</div>';
        
        grid.appendChild(card);
    }
}

/*FUNZIONE PER L'APERTURA DEL BOX MODALE DELLE RIPARAZIONI*/
function openRiparazioneModal() {
    currentEditRiparazioneId = null;
    document.getElementById('riparazioneModalTitle').textContent = 'Nuova Riparazione';
    document.getElementById('riparazioneForm').reset();
    document.getElementById('riparazioneModalError').style.display = 'none';
    
    loadCarsForSelect();
    document.getElementById('riparazioneModal').style.display = 'flex';
}

/*FUNZIONE PER LA CHIUSURA DEL BOX MODALE*/
function closeRiparazioneModal() {
    document.getElementById('riparazioneModal').style.display = 'none';
    currentEditRiparazioneId = null;
}

/*FUNZIONE CHE POPOLA IL MENU A TENDINA CON TUTTE LE AUTO PRESENTI NEL CATALOGO*/
function loadCarsForSelect() {
    fetch(API_URL + '/cars?limit=1000')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            const select = document.getElementById('riparazioneCarId');
            select.innerHTML = '<option value="">Seleziona un\'auto...</option>';
            
            for (let i = 0; i < data.results.length; i++) {
                const car = data.results[i];
                const option = document.createElement('option');
                option.value = car.id;
                option.textContent = car.marca + ' ' + car.modello + ' (' + car.anno + ')';
                select.appendChild(option);
            }
        });
}
/*FUNZIONE PER LA MODIFICA DELLE RIPARAZIONI*/
function editRiparazione(id) {
    currentEditRiparazioneId = id;
    document.getElementById('riparazioneModalTitle').textContent = 'Modifica Riparazione';
    
    loadCarsForSelect();
    
    fetch(API_URL + '/riparazioni/' + id)
        .then(function(response) {
            return response.json();
        })
        .then(function(rip) {
            document.getElementById('riparazioneCarId').value = rip.carId;
            document.getElementById('tipoLavorazione').value = rip.tipoLavorazione;
            document.getElementById('statoLavorazione').value = rip.statoLavorazione;
            document.getElementById('costoRiparazione').value = rip.costo;
            document.getElementById('oreRichieste').value = rip.oreRichieste;
            
            document.getElementById('riparazioneModalError').style.display = 'none';
            document.getElementById('riparazioneModal').style.display = 'flex';
        })
        .catch(function(error) {
            showNotification('Errore nel caricamento dei dati', 'error');
        });
}

/*FUNZIONE PER MODIFICA O CREAZIONE RIPARAZIONE*/
function saveRiparazione() {
    const ripData = {
        carId: parseInt(document.getElementById('riparazioneCarId').value),
        tipoLavorazione: document.getElementById('tipoLavorazione').value,
        statoLavorazione: document.getElementById('statoLavorazione').value,
        costo: parseFloat(document.getElementById('costoRiparazione').value),
        oreRichieste: parseFloat(document.getElementById('oreRichieste').value)
    };
    
    const url = currentEditRiparazioneId 
        ? API_URL + '/riparazioni/' + currentEditRiparazioneId
        : API_URL + '/riparazioni';
    
    const method = currentEditRiparazioneId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authToken
        },
        body: JSON.stringify(ripData)
    })
    .then(function(response) {
        if (!response.ok) {
            return response.json().then(function(err) {
                throw new Error(err.error);
            });
        }
        return response.json();
    })
    .then(function(data) {
        closeRiparazioneModal();
        loadRiparazioni();
        const message = currentEditRiparazioneId 
            ? 'Riparazione modificata con successo' 
            : 'Riparazione aggiunta con successo';
        showNotification(message, 'success');
    })
    .catch(function(error) {
        document.getElementById('riparazioneModalError').textContent = error.message;
        document.getElementById('riparazioneModalError').style.display = 'block';
    });
}

/*FUNZIONE PER ELIMINARE UNA RIPARAZIONE*/
function deleteRiparazione(id) {
    if (!confirm('Sei sicuro di voler eliminare questa riparazione?')) {
        return;
    }
    
    fetch(API_URL + '/riparazioni/' + id, {
        method: 'DELETE',
        headers: {
            'x-auth-token': authToken
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Errore nell\'eliminazione');
        }
        loadRiparazioni();
        showNotification('Riparazione eliminata con successo', 'success');
    })
    .catch(function(error) {
        showNotification(error.message, 'error');
    });
}

/* ================================================================= NOTIFICHE ================================================================ */
/*FUNZIONE PER MOSTRARE LE NOTIFICHE*/
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification ' + type + ' show';
    
    setTimeout(function() {
        notification.classList.remove('show');
    }, 3000);
}