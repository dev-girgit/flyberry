// Flyberry Service Worker - Ultra Performance Caching
// Version 1.0 - Aggressive caching for maximum speed

const CACHE_NAME = 'flyberry-ultra-v1';
const STATIC_CACHE = 'flyberry-static-v1';
const IMAGE_CACHE = 'flyberry-images-v1';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/selection.html',
  '/logo.webp',
  '/css/critical.css',
  '/js/optimized.js'
];

// All WebP images for aggressive caching
const IMAGE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg'];

// Install event - Cache critical resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching critical resources...');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('flyberry-') && 
              ![CACHE_NAME, STATIC_CACHE, IMAGE_CACHE].includes(cacheName)
            )
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - Ultra-fast caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle different types of resources
  if (isImage(request.url)) {
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticRequest(request));
  } else if (isHTMLPage(request.url)) {
    event.respondWith(handleHTMLRequest(request));
  } else {
    event.respondWith(handleOtherRequest(request));
  }
});

// Image handling - Cache first, very aggressive
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Image fetch failed:', request.url);
    return new Response('', { status: 404 });
  }
}

// Static assets - Cache first with long expiration
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return cached || new Response('', { status: 404 });
  }
}

// HTML pages - Network first with fast fallback
async function handleHTMLRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || await cache.match('/');
  }
}

// Other requests - Network with cache fallback
async function handleOtherRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match(request);
  }
}

// Helper functions
function isImage(url) {
  return IMAGE_EXTENSIONS.some(ext => url.includes(ext));
}

function isStaticAsset(url) {
  return url.includes('/css/') || 
         url.includes('/js/') || 
         url.includes('/fonts/') ||
         url.includes('.woff') ||
         url.includes('.woff2');
}

function isHTMLPage(url) {
  return url.includes('.html') || 
         (!url.includes('.') && !url.includes('api'));
}

// Background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Prefetch likely next pages
  const cache = await caches.open(STATIC_CACHE);
  const prefetchUrls = [
    '/selection.html',
    '/byob.html', 
    '/premade.html'
  ];
  
  for (const url of prefetchUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.log('Prefetch failed for:', url);
    }
  }
}