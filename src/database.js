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

    const eintrag = db.createObjectStore("Einträge", { keyPath: "id", autoIncrement: true });
    eintrag.createIndex("Frage", "Frage", { unique: false });
    eintrag.createIndex("Antwort", "Antwort", { unique: false });
    eintrag.createIndex("Kategorie", "Kategorie", { unique: false });
    eintrag.createIndex("Erstellungsdatum", "Erstellungsdatum", { unique: false });

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
        displayData(data);
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



