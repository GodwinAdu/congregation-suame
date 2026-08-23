// Service Worker for Push Notifications
const CACHE_NAME = 'suame-v2'
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/publisher',
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

// Fetch event - network first, cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((response) => {
          return response || caches.match('/')
        })
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
  if (event.tag === 'sync-field-service-reports') {
    event.waitUntil(syncPendingReports())
  } else if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function syncPendingReports() {
  // Open IndexedDB and get pending reports
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('suame-offline-reports', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    const tx = db.transaction('pending-reports', 'readonly')
    const store = tx.objectStore('pending-reports')
    const index = store.index('synced')
    
    const pending = await new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(false))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    // Notify the client to sync (the actual submission uses server actions via the client)
    const clients = await self.clients.matchAll()
    for (const client of clients) {
      client.postMessage({ type: 'SYNC_PENDING_REPORTS', count: pending.length })
    }
  } catch (error) {
    console.error('Background sync error:', error)
  }
}

function doBackgroundSync() {
  return syncPendingReports()
}