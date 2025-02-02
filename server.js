const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

const DB_FILE = 'notes-db.json';

// Erweiterte CORS Konfiguration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Datenbank initialisieren
async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ content: '' }));
  }
}

// Notizen speichern
app.post('/notes', async (req, res) => {
  try {
    const notes = JSON.parse(await fs.readFile(DB_FILE, 'utf-8')) || [];
    const existing = notes.findIndex(note => note.device === req.body.device);
    if(existing !== -1) {
      notes[existing] = { ...req.body, timestamp: Date.now() };
    } else {
      notes.push({ ...req.body, timestamp: Date.now() });
    }
    await fs.writeFile(DB_FILE, JSON.stringify(notes));
    res.status(200).send({ status: 'success' });
  } catch (error) {
    res.status(500).send({ error: 'Speichern fehlgeschlagen' });
  }
});

// Notizen laden
app.get('/notes', async (req, res) => {
  try {
    const notes = JSON.parse(await fs.readFile(DB_FILE, 'utf-8')) || [];
    res.json(notes.sort((a,b) => b.timestamp - a.timestamp));
  } catch (error) {
    res.status(500).send({ error: 'Laden fehlgeschlagen' });
  }
});

// Server starten
initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
  });
});
