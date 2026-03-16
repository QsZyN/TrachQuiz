const CACHE_NAME = 'trash-quiz-v2';
const APP_SHELL = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './vendor/nfcpass.bundle.js',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './rules/easy.json',
    './rules/normal.json',
    './rules/aizuwakamatsu.json',
    './rules/nfc_mapping.json',
    './images/top-bg.png',
    './images/quiz-bg.png',
    './images/result-bg.png',
    './images/beko.png',
    './images/rabitt.png',
    './images/gomi.png',
    './images/btn-easy.png',
    './images/btn-hard.png',
    './images/btn-howto.png',
    './images/btn-home.png',
    './images/botan.png',
    './images/howToPlay.png',
    './sounds/home.mp3',
    './sounds/play.mp3',
    './sounds/result.mp3',
    './sounds/Quiz-Ding_Dong05-1(Fast-Short).mp3',
    './sounds/Quiz-Buzzer05-1(Mid).mp3'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                })
                .catch(() => caches.match('./index.html'));
        })
    );
});
