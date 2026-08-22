let CACHE = null;

async function loadVersion() {
    const response = await fetch('./version.json', {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`Failed to load version.json: ${response.status}`);
    }

    return await response.json();
}

async function getCacheName() {
    if (CACHE) {
        return CACHE;
    }

    const version = await loadVersion();

    CACHE =
        `visual-playground-${version.version}-${version.build}`;

    return CACHE;
}

const APP_FILES = [
    './',
    './index.html',
    './style.css',
    './manifest.webmanifest',
    './version.json',

    './js/main.js',
    './js/renderer.js',
    './js/gl.js',
    './js/input.js',
    './js/includes.js',

    './shaders/fullscreen.vert',
    './shaders/common.glsl',

    './scenes/demo/scene.json',
    './scenes/demo/sky.frag',
    './scenes/demo/clouds.frag',
    './scenes/demo/clouds-panoramic.frag',
    './scenes/demo/cloud-noise.png',
    './scenes/demo/city.frag',

    './scenes/demo/skyline-far.png',
    './scenes/demo/skyline-mid.png',
    './scenes/demo/skyline-near.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            const cacheName = await getCacheName();
            const cache = await caches.open(cacheName);

            await cache.addAll(APP_FILES);

            await self.skipWaiting();
        })()
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const cacheName = await getCacheName();
            const keys = await caches.keys();

            await Promise.all(
                keys
                    .filter(key =>
                        key.startsWith('visual-playground-') &&
                        key !== cacheName
                    )
                    .map(key => caches.delete(key))
            );

            await self.clients.claim();
        })()
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        (async () => {
            const cacheName = await getCacheName();
            const cache = await caches.open(cacheName);

            const cached = await cache.match(event.request);

            if (cached) {
                return cached;
            }

            const response = await fetch(event.request);

            if (response.ok) {
                cache.put(
                    event.request,
                    response.clone()
                );
            }

            return response;
        })()
    );
});
