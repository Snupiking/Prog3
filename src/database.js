const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;

const request = indexedDB.open('ForumDatabase', 1);

request.onerror = function(event) {
    console.error("An error occurred with the database");
    console.error(event);
};

request.onupgradeneeded = function(event) {
    console.log("Hat angefangen");
    db = event.target.result;
    const transaction = event.target.transaction;

    const eintrag = db.createObjectStore("Einträge", { keyPath: "id", autoIncrement: tue });
    eintrag.createIndex("Frage", "Frage", { unique: false });
    eintrag.createIndex("Antwort", "Antwort", { unique: false });
    eintrag.createIndex("Kategorie", "Kategorie", { unique: false });
    eintrag.createIndex("Erstellungsdatum", "Erstellungsdatum", { unique: false });
    eintrag.createIndex("id", "id", { unique: true });

    eintrag.add({Frage: "Wie kann ich eine Datenbank erstellen?", Antwort: "Du kannst eine Datenbank erstellen, indem du eine neue Datenbank erstellst", Kategorie: "Datenbank", Erstellungsdatum: "2021-06-01"});
    eintrag.add({Frage: "Wie kann ich eine Tabelle erstellen?", Antwort: "Du kannst eine Tabelle erstellen, indem du eine neue Tabelle erstellst", Kategorie: "Tabelle", Erstellungsdatum: "2021-06-02"});
    eintrag.add({Frage: "Wie kann ich eine Zeile hinzufügen?", Antwort: "Du kannst eine Zeile hinzufügen, indem du eine neue Zeile hinzufügst", Kategorie: "Zeile", Erstellungsdatum: "2021-06-03"});

    console.log("Initialdaten wurden hinzugefügt");

    transaction.oncomplete = function() {
        console.log('All operations in onupgradeneeded completed successfully');
    };
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Datenbank erfolgreich geöffnet");

    getEinträge(function(data) {
        console.log("Abgerufene Daten:", data);
        if (window.location.href.indexOf('MainPage.html') > -1) {
            getEinträge(function(data) {
                console.log("Abgerufene Daten:", data);
                displayData(data);
            });
        }
    });
};

function getEinträge(callback) {
    if (!db) {
        console.error("Datenbank ist nicht geöffnet.");
        return;
    }

    const transaction = db.transaction(["Einträge"], "readonly");
    const objectStore = transaction.objectStore("Einträge");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        callback(event.target.result); // Ruft die abgerufenen Daten ab und übergibt sie an die Callback-Funktion
    };

    request.onerror = function(event) {
        console.error("Fehler beim Beschaffen der Daten: " + event.target.errorCode);
    };
}

function addEinträge(newData) {
    if (!db) {
        console.error("Datenbank ist nicht geöffnet.");
        return;
    }

    const transaction = db.transaction(["Einträge"], "readwrite");
    const objectStore = transaction.objectStore("Einträge");

    const request = objectStore.add(newData);

    request.onsuccess = function(event) {
        console.log("Neuer Eintrag hinzugefügt:", newData);
    };

    request.onerror = function(event) {
        console.error("Fehler beim Hinzufügen eines neuen Eintrags:", event.target.errorCode);
    };
}

//Füge neue Daten zu der Datenbank hinzu und leere die Felder
window.onload = function() {
    const form = document.getElementById('eintrag-form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const frage = document.getElementById('frage').value;
            const antwort = document.getElementById('antwort').value;
            const kategorie = document.getElementById('kategorie').value;

            if (!frage || !antwort || !kategorie) {
                alert("Bitte füllen Sie alle Felder aus.");
                return;
            }

            addEinträge({
                Frage: frage,
                Antwort: antwort,
                Kategorie: kategorie,
                Erstellungsdatum: new Date()
            });

            document.getElementById('frage').value = '';
            document.getElementById('antwort').value = '';
            document.getElementById('kategorie').value = '';
        });
    }
};

function displayData(data) {
    data.forEach(function(item) {
        const eintragBox = document.createElement('div');
        eintragBox.className = 'eintrag-box';

        const kategorie = document.createElement('p');
        kategorie.className = 'kategorie';
        kategorie.textContent = 'Kategorie: ' + item.Kategorie;
        eintragBox.appendChild(kategorie);

        const frage = document.createElement('p');
        frage.className = 'frage';
        frage.textContent = 'Frage: ' + item.Frage;
        eintragBox.appendChild(frage);

        const antwort = document.createElement('p');
        antwort.className = 'antwort';
        antwort.textContent = 'Antwort: ' + item.Antwort;
        eintragBox.appendChild(antwort);

        document.body.appendChild(eintragBox);
    });
}



async function exportIndexedDBData() {
    const dbName = "ForumDatabase";
    const dbVersion = 1;
    const storeName = "Einträge";

    const request = indexedDB.open(dbName, dbVersion);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();


        getAllRequest.onsuccess = async () => {
            const data = getAllRequest.result;
            await fetch('http://127.0.0.1:8000/backup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

        };

        console.log("Data exported successfully.")
        getAllRequest.onerror = (event) => {
            console.error("Fehler beim Abrufen der Daten: ", event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error("IndexedDB Fehler: ", event.target.error);
    };
}

async function fetchAndReplaceData() {
    try {
        // Schritt 1: Backup-Daten vom Server abrufen
        const response = await fetch('http://127.0.0.1:8000/restore');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const backupData = await response.json();

        // Schritt 2: Datenbank öffnen und Daten ersetzen
        const dbRequest = indexedDB.open('ForumDatabase', 1);
        dbRequest.onerror = function (event) {
            console.error("Datenbank konnte nicht geöffnet werden: ", event.target.error);
        };

        dbRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(['Einträge'], 'readwrite');
            const store = transaction.objectStore('Einträge');

            // Schritt 3: Alle bestehenden Einträge löschen
            const clearRequest = store.clear();
            clearRequest.onerror = function (event) {
                console.error("Fehler beim Löschen der bestehenden Daten: ", event.target.error);
            };

            // Schritt 4: Backup-Daten in die Datenbank einfügen
            clearRequest.onsuccess = function () {
                backupData.forEach(item => {
                    const addRequest = store.add(item);
                    addRequest.onerror = function (event) {
                        console.error("Fehler beim Hinzufügen eines Eintrags: ", event.target.error);
                    };
                });

                transaction.oncomplete = function () {
                    console.log("Alle Daten erfolgreich aus dem Backup wiederhergestellt.");
                    // Daten nur auf der Hauptseite anzeigen
                    if (window.location.href.indexOf('MainPage.html') > -1) {
                        displayData(backupData);
                    }
                };
            };
        };
    } catch (error) {
        console.error("Fehler beim Abrufen und Ersetzen der Daten: ", error);
    }
}



