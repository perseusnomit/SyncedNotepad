(() => {
    const storageAvailable = () => {
        try {
            const storage = window.localStorage;
            const x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch(e) {
            return false;
        }
    };

    // Server-Kommunikation
    const API_URL = 'http://192.168.0.3:3000/notes';

    const saveNotes = async (content) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            return response.ok;
        } catch(e) {
            console.error('API Fehler:', e);
            return false;
        }
    };

    const loadNotes = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            return data.content || '';
        } catch(e) {
            console.error('Lade Fehler:', e);
            return '';
        }
    };

    // Sync alle 3 Sekunden
    setInterval(async () => {
        const currentContent = notesArea.value;
        const savedContent = await loadNotes();
        if(savedContent !== currentContent) {
            notesArea.value = savedContent;
            showStatus('Neue Notizen geladen ↻');
        }
    }, 3000);

    const showStatus = (message, duration = 2000) => {
        const status = document.createElement('div');
        status.className = 'status-message';
        status.textContent = message;
        document.body.appendChild(status);
        
        setTimeout(() => {
            status.remove();
        }, duration);
    };

    // DOM Initialisierung
    const notesArea = document.getElementById('notesArea');
    const saveBtn = document.getElementById('saveBtn');
    let saveTimeout;

    // Initialen Inhalt laden
    notesArea.value = loadNotes();

    // Event-Handler
    notesArea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if(saveNotes(notesArea.value)) {
                showStatus('Automatisch gespeichert ✓');
            }
        }, 500);
    });

    saveBtn.addEventListener('click', () => {
        if(saveNotes(notesArea.value)) {
            showStatus('Manuell gespeichert ✓');
        } else {
            showStatus('⚠️ Speichern fehlgeschlagen', 3000);
        }
    });

    // Globaler Error Handler
    window.addEventListener('error', (e) => {
        showStatus(`Fehler: ${e.message}`, 5000);
    });
})();