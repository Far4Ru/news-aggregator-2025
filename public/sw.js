// Простой Service Worker для PWA
self.addEventListener('install', (event) => {
    console.log('Service Worker installed')
})

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated')
})

self.addEventListener('fetch', (event) => {
    // Базовая обработка fetch событий
})