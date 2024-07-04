document.getElementById('darkmode-toggle').addEventListener('click', function(event) {
    event.preventDefault();
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('mode', 'dark');
    } else {
        localStorage.setItem('mode', 'light');
    }
});

// Beim Laden der Seite den Modus überprüfen
window.addEventListener('load', function() {
    const mode = localStorage.getItem('mode');
    if (mode === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
