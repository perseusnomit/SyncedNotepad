const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const port = 3000;

const DB_FILE = 'notes-db.json';

// Erweiterte CORS Konfiguration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT']
}));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Datenbank initialisieren
async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify([]));
  }
}

// WebSocket Server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  ws.on('message', async message => {
    const { type, data } = JSON.parse(message);
    if (type === 'sync') {
      try {
        const notes = JSON.parse(await fs.readFile(DB_FILE, 'utf-8')) || [];
        ws.send(JSON.stringify({ type: 'sync', data: notes }));
      } catch (error) {
        console.error('WebSocket Fehler:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Fehler beim Synchronisieren der Notizen' }));
      }
    }
  });
});

const broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Notizen speichern
app.post('/notes', async (req, res) => {
  try {
    let notes = [];
    try {
      const fileContent = await fs.readFile(DB_FILE, 'utf-8');
      notes = JSON.parse(fileContent || '[]');
    } catch (error) {
      console.error('Lesen Fehler:', error);
    }
    if (!Array.isArray(notes)) {
      notes = [];
    }
    const existing = notes.findIndex(note =>
      note.device === req.body.device &&
      note.content === req.body.content
    );
    if(existing !== -1) {
      notes[existing] = { ...req.body, timestamp: Date.now() };
    } else {
      notes.push({ ...req.body, timestamp: Date.now() });
    }
    await fs.writeFile(DB_FILE, JSON.stringify(notes));
    broadcast({ type: 'sync', data: notes });
    res.status(200).send({ status: 'success' });
  } catch (error) {
    console.error('Speichern Fehler:', error);
    res.status(500).send({ error: 'Speichern fehlgeschlagen' });
  }
});

// Notizen laden
app.get('/notes', async (req, res) => {
  try {
    let notes = [];
    try {
      const fileContent = await fs.readFile(DB_FILE, 'utf-8');
      notes = JSON.parse(fileContent || '[]');
    } catch (error) {
      console.error('Lesen Fehler:', error);
    }
    if (!Array.isArray(notes)) {
      notes = [];
    }
    res.json(notes.sort((a,b) => b.timestamp - a.timestamp));
  } catch (error) {
    console.error('Laden Fehler:', error);
    res.status(500).send({ error: 'Laden fehlgeschlagen' });
  }
});

// Lösch-Endpoint hinzufügen
app.delete('/notes/:id', async (req, res) => {
  try {
    let notes = [];
    try {
      const fileContent = await fs.readFile(DB_FILE, 'utf-8');
      notes = JSON.parse(fileContent || '[]');
    } catch (error) {
      console.error('Lesen Fehler:', error);
    }
    if (!Array.isArray(notes)) {
      notes = [];
    }
    notes = notes.filter(note => note.timestamp !== parseInt(req.params.id));
    await fs.writeFile(DB_FILE, JSON.stringify(notes));
    broadcast({ type: 'sync', data: notes });
    res.status(200).send({ status: 'success' });
  } catch (error) {
    console.error('Löschen Fehler:', error);
    res.status(500).send({ error: 'Löschen fehlgeschlagen' });
  }
});

// Root Route für API-Status
app.get('/status', (req, res) => {
  res.json({ status: 'Server läuft', port });
});

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server starten
initDB().then(() => {
  server.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
  });
});