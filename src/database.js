const indexDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB||
    window.shimIndexedDB;

const request = indexedDB.open('ForumDatabase', 1);

request.onerror = function(event) {
    console.error("An error occurred with the database");
    console.error(event);
}

request.onupgradeneeded = function() {
    const db = request.result;
    const store = db.createObjectStore("Einträge", {keyPath: "id", autoIncrement: true});
    store.createIndex("Frage", "Frage", {unique: false});
    store.createIndex("Antwort", "Antwort", {unique: false});
    store.createIndex("Kategorie", "Kategorie", {unique: false});
    store.createIndex("Erstellungsdatum", "Erstellungsdatum", {unique: false});
}


const eintrag = {
    Frage: "Ihre Frage",
    Antwort: "Ihre Antwort",
    Kategorie: "Ihre Kategorie",
    Erstellungsdatum: new Date()
};

const db = request.result;
const transaction = db.transaction(["Einträge"], "readwrite");
const store = transaction.objectStore("Einträge");
const request = store.add(eintrag);

request.onsuccess = function(event) {
    console.log("Eintrag erfolgreich hinzugefügt");
}

request.onerror = function(event) {
    console.error("Fehler beim Hinzufügen des Eintrags", event.target.error);
}