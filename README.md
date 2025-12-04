# AutoTorino Italia - Gestionale Concessionaria

## Installazione ed esecuzione

1. Aprire il terminale cmd di visual studio code
   
2. Installare le dipendenze del backend:

cd backend

npm install


3. Avviare il server:

npm start

Il server sarà disponibile su http://localhost:3001


## Descrizione route principali
Per quanto riguarda l'autenticazione:
METODO      ENDPOINT
POST        /api/login                    login utente

Per quanto rigurda l'entità AUTO
METODO      ENDPOINT
GET         /api/cars                     lista auto
GET         /api/cars/:id                 dettaglio singola auto
POST        /api/cars                     crea nuova auto
PUT         /api/cars/:id                 aggiorna auto esistente
DELETE      /api/cars/:id                 elimina auto

Per quanto riguarda l'entità RIPARAZIONI:
METODO      ENDPOINT
GET         /api/riparazioni              lista riparazioni
GET         /api/riparazioni/:id          dettaglio singola riparazione
POST        /api/riparazioni              crea nuova riparazione
PUT         /api/riparazioni/:id          aggiorna riparazione
DELETE      /api/riparazione/:id          elimina riparazione


## Credenziali di Test
Per accedere all'applicazione utilizzare una delle seguenti credenziali:

- **Username:** Mario 
  **Password:** password123

- **Username:** Luca
  **Password:** password456

## Esempi di richieste e risposte

1. LOGIN
   Richiesta:
      POST /api/login HTTP/1.1
      Content-Type: application/json

      {
         "username": "Mario",
         "password": "password123"
      }
   
   Risposta positiva (200 OK):
      {
         "token": "1",
         "userId": 1,
         "username": "Mario"
      }

   Risposta negativa (401 Unauthorized):
      {
         "error": "Credenziali non valide"
      }

2. Dettaglio singola auto:
   Richiesta:
      GET /api/cars/1 HTTP/1.1
   
   Risposta positiva (200 OK):
      {
         "id": 1,
         "marca": "BMW",
         "modello": "X3",
         "anno": 2021,
         "prezzo": 42000,
         "chilometri": 35000,
         "carburante": "Diesel",
         "stato": "Usata",
         "colore": "Blu navy",
         "disponibile": true,
         "immagine": "immagini/BMW_X3.png",
         "sede": "Zoppola",
         "descrizione": "BMW X3 in ottime condizioni, tagliandi certificati BMW..."
      }
   
   Risposta negativa (404 Not Found):
      {
         "error": "Auto non trovata"
      }

3. Creazione nuova auto
   Richiesta:
   POST /api/cars HTTP/1.1
   Content-Type: application/json
   X-Auth-Token: 1

   {
      "marca": "Volkswagen",
      "modello": "Golf",
      "anno": 2023,
      "prezzo": 28000,
      "chilometri": 5000,
      "carburante": "Benzina",
      "stato": "KM Zero",
      "colore": "Grigio",
      "sede": "Milano",
      "immagine": "immagini/VW_GOLF.png",
      "descrizione": "Non ha nessun difetto. Full accessoriata, cerchi in lega,...",
      "disponibile": true
   }

   Risposta positiva (201 created):
   {
      "id": 8,
      "marca": "Volkswagen",
      "modello": "Golf",
      "anno": 2023,
      "prezzo": 28000,
      "chilometri": 5000,
      "carburante": "Benzina",
      "stato": "KM Zero",
      "colore": "Grigio",
      "sede": "Milano",
      "immagine": "immagini/VW_GOLF.png",
      "descrizione": "Non ha nessun difetto. Full accessoriata, cerchi in lega,...",
      "disponibile": true
   }

   Risposta negativa (404 bad request):
   {
      "error": "Campi obbligatori mancanti"
   }

   Risposta negativa (401 Unauthorized):
   {
      "error": "Token mancante"
   }

4. Aggiornamento auto 
   Richiesta:
   PUT /api/cars/1 HTTP/1.1
   Content-Type: application/json
   X-Auth-Token: 1

   {
      "prezzo": 40000,
      "chilometri": 38000,
      "disponibile": false
   }

   Risposta positiva (200 OK):
   {
      "id": 1,
      "marca": "BMW",
      "modello": "X3",
      "anno": 2021,
      "prezzo": 40000,
      "chilometri": 38000,
      "carburante": "Diesel",
      "stato": "Usata",
      "colore": "Blu navy",
      "disponibile": false,
      "immagine": "immagini/BMW_X3.png",
      "sede": "Zoppola",
      "descrizione": "BMW X3 in ottime condizioni..."
   }

5. Eliminazione auto:
   Richiesta:
   DELETE /api/cars/7 HTTP/1.1
   X-Auth-Token: 1

   Risposta positiva:
   auto viene eliminata (nessun body)

   Risposta negativa (404 Not Found):
   {
      "error": "Auto non trovata"
   }
