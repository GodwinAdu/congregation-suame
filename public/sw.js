// Service Worker for Push Notifications
const CACHE_NAME = 'suame-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})

// Push event
self.addEventListener('push', (event) => {
  const options = {
    body: 'New notification from Suame Congregation',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  }

  if (event.data) {
    const payload = event.data.json()
    options.body = payload.body || options.body
    options.title = payload.title || 'Suame Congregation'
    options.icon = payload.icon || options.icon
    options.badge = payload.badge || options.badge
    options.image = payload.image
    options.data = { ...options.data, ...payload.data }
    options.tag = payload.tag
    options.requireInteraction = payload.requireInteraction
    options.silent = payload.silent
    if (payload.actions) {
      options.actions = payload.actions
    }
  }

  event.waitUntil(
    self.registration.showNotification(options.title || 'Suame Congregation', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  } else if (event.action === 'close') {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/dashboard')
        }
      })
    )
  }
})

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // Implement background sync logic here
  return Promise.resolve()
}