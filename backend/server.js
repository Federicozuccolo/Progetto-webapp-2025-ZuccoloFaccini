const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

/*Middleware*/
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

/* funzione per leggere i dati*/
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { cars: [], users: [], riparazioni: [] };
  }
}

/* funzione per scrivere i dati*/
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}


/* =========================================================== AUTENTICAZIONE ============================================================== */

/*AUTENTICAZIONE*/
app.post('/api/login', async function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password richiesti' });
  }

  const data = await readData();
  let user = null;
  
  /* Ricerca dell'utente */
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].username === username && data.users[i].password === password) {
      user = data.users[i];
      break;
    }
  }
  
  if (user) {
    res.json({ 
      token: user.id.toString(),
      userId: user.id, 
      username: user.username 
    });
  } else {
    res.status(401).json({ error: 'Credenziali non valide' });
  }
});

/* Middleware verifica token */
function authenticateToken(req, res, next) {
  const token = req.headers['x-auth-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Token mancante' });
  }
  
  req.userId = parseInt(token);
  next();
}

/* =========================================================== CRUD AUTO ========================================================== */

/* LISTA TUTTE LE AUTO----------------------------------------- */
app.get('/api/cars', async function(req, res) {
  try {
    const data = await readData();
    let cars = data.cars;
    
    /* Parametri query */
    const searchTerm = req.query.q;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    /* Ricerca testuale */
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = [];
      
      for (let i = 0; i < cars.length; i++) {
        const marcaLower = cars[i].marca.toLowerCase();
        const modelloLower = cars[i].modello.toLowerCase();
        
        if (marcaLower.indexOf(lowerSearch) !== -1 || 
            modelloLower.indexOf(lowerSearch) !== -1) {
          filtered.push(cars[i]);
        }
      }
      
      cars = filtered;
    }
    
    const total = cars.length;
    const results = cars.slice(offset, offset + limit);
    
    /*Risposta */
    res.json({ 
      results: results, 
      total: total, 
      limit: limit, 
      offset: offset 
    });
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dei dati' });
  }
});

/* DETTAGLIO SINGOLA AUTO --------------------------------------------- */
app.get('/api/cars/:id', async function(req, res) {
  try {
    const data = await readData();
    const carId = parseInt(req.params.id);
    let car = null;
    
    for (let i = 0; i < data.cars.length; i++) {
      if (data.cars[i].id === carId) {
        car = data.cars[i];
        break;
      }
    }
    
    /*Risposta*/
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ error: 'Auto non trovata' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dei dati' });
  }
});

/* CREAZIONE NUOVA AUTO ------------------------------------------------------- */
app.post('/api/cars', authenticateToken, async function(req, res) {
  try {
    const marca = req.body.marca;
    const modello = req.body.modello;
    const anno = req.body.anno;
    const prezzo = req.body.prezzo;
    const chilometri = req.body.chilometri;
    const carburante = req.body.carburante;
    const stato = req.body.stato;
    const colore = req.body.colore;
    const sede = req.body.sede;
    const immagine = req.body.immagine;
    const descrizione = req.body.descrizione;
    const disponibile = req.body.disponibile;
    
    /* Validazione campi obbligatori */
    if (!marca || !modello || !anno || !prezzo || chilometri === undefined || 
        !carburante || !stato || !colore || !sede || !descrizione) {
      return res.status(400).json({ error: 'Campi obbligatori mancanti' });
    }
    
    /* Validazione anno */
    if (anno < 2000 || anno > 2025) {
      return res.status(400).json({ error: 'Anno deve essere tra 2000 e 2025' });
    }
    
    /* Validazione prezzo */
    if (prezzo <= 0 || prezzo > 500000) {
      return res.status(400).json({ error: 'Prezzo non valido' });
    }
    
    /* Validazione chilometri */
    if (chilometri < 0) {
      return res.status(400).json({ error: 'Chilometri non possono essere negativi' });
    }
    
    /* Validazione carburante */
    const validCarburanti = ['Benzina', 'Diesel', 'Elettrica', 'Ibrida'];
    let carburanteValido = false;
    for (let i = 0; i < validCarburanti.length; i++) {
      if (carburante === validCarburanti[i]) {
        carburanteValido = true;
        break;
      }
    }
    if (!carburanteValido) {
      return res.status(400).json({ error: 'Carburante non valido' });
    }
    
    /* Validazione stato */
    const validStati = ['Nuova', 'Usata', 'KM Zero'];
    let statoValido = false;
    for (let i = 0; i < validStati.length; i++) {
      if (stato === validStati[i]) {
        statoValido = true;
        break;
      }
    }
    if (!statoValido) {
      return res.status(400).json({ error: 'Stato non valido' });
    }

    /* Validazione sede */
    const validSedi = ['Domio', 'Rabuiese', 'Tavagnacco', 'Zopppola', 'Pordenone', 'Milano', 'Monza', 'Brescia', 'Torino', 'Modena', 'Teramo', 'Roma'];
    let sedeValida = false;
    for (let i = 0; i < validSedi.length; i++) {
      if (sede === validSedi[i]) {
        sedeValida = true;
        break;
      }
    }
    if (!sedeValida) {
      return res.status(400).json({ error: 'Sede non valida' });
    }
    
    const data = await readData();
    
    /* Generazione nuovo ID */
    let newId = 1;
    if (data.cars.length > 0) {
      let maxId = 0;
      for (let i = 0; i < data.cars.length; i++) {
        if (data.cars[i].id > maxId) {
          maxId = data.cars[i].id;
        }
      }
      newId = maxId + 1;
    }
    
    const newCar = {
      id: newId,
      marca: marca,
      modello: modello,
      anno: parseInt(anno),
      prezzo: parseFloat(prezzo),
      chilometri: parseInt(chilometri),
      carburante: carburante,
      stato: stato,
      colore: colore,
      sede: sede,
      immagine: immagine || '',
      descrizione: descrizione,
      disponibile: disponibile !== false
    };
    
    data.cars.push(newCar);
    await writeData(data);
    /*Risposta*/
    res.status(201).json(newCar);
  } catch (error) {
    res.status(500).json({ error: 'Errore nella creazione' });
  }
});

/* AGGIORNAMENTO AUTO---------------------------------------------------------------- */
app.put('/api/cars/:id', authenticateToken, async function(req, res) {
  try {
    const data = await readData();
    const carId = parseInt(req.params.id);
    let carIndex = -1;
    
    /* Ricerca auto */
    for (let i = 0; i < data.cars.length; i++) {
      if (data.cars[i].id === carId) {
        carIndex = i;
        break;
      }
    }
    
    if (carIndex === -1) {
      return res.status(404).json({ error: 'Auto non trovata' });
    }
    
    const car = data.cars[carIndex];
    
    /* Validazione anno se fornito */
    if (req.body.anno && (req.body.anno < 2000 || req.body.anno > 2025)) {
      return res.status(400).json({ error: 'Anno deve essere tra 2000 e 2025' });
    }
    
    /* Aggiorna i campi */
    if (req.body.marca) car.marca = req.body.marca;
    if (req.body.modello) car.modello = req.body.modello;
    if (req.body.anno) car.anno = req.body.anno;
    if (req.body.prezzo) car.prezzo = req.body.prezzo;
    if (req.body.chilometri !== undefined) car.chilometri = req.body.chilometri;
    if (req.body.carburante) car.carburante = req.body.carburante;
    if (req.body.stato) car.stato = req.body.stato;
    if (req.body.colore) car.colore = req.body.colore;
    if (req.body.sede) car.sede = req.body.sede;
    if (req.body.immagine !== undefined) car.immagine = req.body.immagine;
    if (req.body.descrizione) car.descrizione = req.body.descrizione;
    if (req.body.disponibile !== undefined) car.disponibile = req.body.disponibile;
    
    data.cars[carIndex] = car;
    await writeData(data);
    /*Risposta*/
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'aggiornamento' });
  }
});

/* ELIMINAZIONE AUTO--------------------------------------------------------------------- */
app.delete('/api/cars/:id', authenticateToken, async function(req, res) {
  try {
    const data = await readData();
    const carId = parseInt(req.params.id);
    let carIndex = -1;
    
    /*Ricerca auto*/
    for (let i = 0; i < data.cars.length; i++) {
      if (data.cars[i].id === carId) {
        carIndex = i;
        break;
      }
    }
    
    if (carIndex === -1) {
      return res.status(404).json({ error: 'Auto non trovata' });
    }
    
    /*Rimozione auto*/
    data.cars.splice(carIndex, 1);
    await writeData(data);
    /*Risposta */
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'eliminazione' });
  }
});

/* =========================================================== CRUD RIPARAZIONI ========================================================== */

/* LISTA RIPARAZIONI ----------------------------------------------------------*/
app.get('/api/riparazioni', async function(req, res) {
  try {
    const data = await readData();
    res.json(data.riparazioni || []);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero delle riparazioni' });
  }
});

/* DETTAGLIO RIPARAZIONE ----------------------------------------------------- */
app.get('/api/riparazioni/:id', async function(req, res) {
  try {
    const data = await readData();
    const ripId = parseInt(req.params.id);
    let riparazione = null;
    
    for (let i = 0; i < data.riparazioni.length; i++) {
      if (data.riparazioni[i].id === ripId) {
        riparazione = data.riparazioni[i];
        break;
      }
    }
    /*Risposta*/
    if (riparazione) {
      res.json(riparazione);
    } else {
      res.status(404).json({ error: 'Riparazione non trovata' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dei dati' });
  }
});

/* CREAZIONE NUOVA RIPARAZIONE ------------------------------------------------------------- */
app.post('/api/riparazioni', authenticateToken, async function(req, res) {
  try {
    const carId = req.body.carId;
    const tipoLavorazione = req.body.tipoLavorazione;
    const statoLavorazione = req.body.statoLavorazione;
    const costo = req.body.costo;
    const oreRichieste = req.body.oreRichieste;
    
    /* Validazione campi obbligatori*/
    if (!carId || !tipoLavorazione || !statoLavorazione || !costo || !oreRichieste) {
      return res.status(400).json({ error: 'Campi obbligatori mancanti' });
    }
    
    /* validazione costo */
    if (costo <= 0) {
      return res.status(400).json({ error: 'Il costo deve essere maggiore di zero' });
    }
    
    /*Validazione ore richieste */
    if (oreRichieste <= 0) {
      return res.status(400).json({ error: 'Le ore richieste devono essere maggiori di zero' });
    }
    
    /* validazione stato */
    const validStati = ['da_fare', 'in_corso', 'completato'];
    let statoValido = false;
    for (let i = 0; i < validStati.length; i++) {
      if (statoLavorazione === validStati[i]) {
        statoValido = true;
        break;
      }
    }
    if (!statoValido) {
      return res.status(400).json({ error: 'Stato lavorazione non valido' });
    }
    
    const data = await readData();
    
    /* Verifica che l'auto esista */
    let carExists = false;
    for (let i = 0; i < data.cars.length; i++) {
      if (data.cars[i].id === carId) {
        carExists = true;
        break;
      }
    }
    if (!carExists) {
      return res.status(404).json({ error: 'Auto non trovata' });
    }
    
    /* Generazione nuovo ID */
    let newId = 1;
    if (data.riparazioni.length > 0) {
      let maxId = 0;
      for (let i = 0; i < data.riparazioni.length; i++) {
        if (data.riparazioni[i].id > maxId) {
          maxId = data.riparazioni[i].id;
        }
      }
      newId = maxId + 1;
    }
    
    const newRiparazione = {
      id: newId,
      carId: parseInt(carId),
      tipoLavorazione: tipoLavorazione,
      statoLavorazione: statoLavorazione,
      costo: parseFloat(costo),
      oreRichieste: parseFloat(oreRichieste)
    };
    
    data.riparazioni.push(newRiparazione);
    await writeData(data);
    /* Risposta */
    res.status(201).json(newRiparazione);
  } catch (error) {
    res.status(500).json({ error: 'Errore nella creazione della riparazione' });
  }
});

/* AGGIORNAMENTO RIPARAZIONE -------------------------------------------------------*/
app.put('/api/riparazioni/:id', authenticateToken, async function(req, res) {
  try {
    const data = await readData();
    const ripId = parseInt(req.params.id);
    let ripIndex = -1;
    
    for (let i = 0; i < data.riparazioni.length; i++) {
      if (data.riparazioni[i].id === ripId) {
        ripIndex = i;
        break;
      }
    }
    
    if (ripIndex === -1) {
      return res.status(404).json({ error: 'Riparazione non trovata' });
    }
    
    const riparazione = data.riparazioni[ripIndex];
    
    if (req.body.carId) riparazione.carId = req.body.carId;
    if (req.body.tipoLavorazione) riparazione.tipoLavorazione = req.body.tipoLavorazione;
    if (req.body.statoLavorazione) riparazione.statoLavorazione = req.body.statoLavorazione;
    if (req.body.costo) riparazione.costo = req.body.costo;
    if (req.body.oreRichieste) riparazione.oreRichieste = req.body.oreRichieste;
    
    data.riparazioni[ripIndex] = riparazione;
    await writeData(data);
    
    res.json(riparazione);
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'aggiornamento' });
  }
});

/* ELIMINAZIONE RIPARAZIONE ----------------------------------------------------------------*/
app.delete('/api/riparazioni/:id', authenticateToken, async function(req, res) {
  try {
    const data = await readData();
    const ripId = parseInt(req.params.id);
    let ripIndex = -1;
    
    for (let i = 0; i < data.riparazioni.length; i++) {
      if (data.riparazioni[i].id === ripId) {
        ripIndex = i;
        break;
      }
    }
    
    if (ripIndex === -1) {
      return res.status(404).json({ error: 'Riparazione non trovata' });
    }
    
    data.riparazioni.splice(ripIndex, 1);
    await writeData(data);
    /*Risposta*/
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'eliminazione' });
  }
});

/* Avvio server */
app.listen(PORT, function() {
  console.log('Server avviato su http://localhost:' + PORT);
});