self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('my-cache').then(cache => {
            return cache.addAll([
                './manifest.json',
                './images',
                './icon.png'
            ]).catch(error => {
                console.error('Failed to cache files:', error);
            });
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

