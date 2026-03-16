// ══════════════════════════════════════
// 🔧 Service Worker — VMM 21km Training PWA
// Cache-first: lưu tất cả assets để dùng offline
// ══════════════════════════════════════

const CACHE_NAME = 'vmm-21km-v1';
const ASSETS = [
  './dashboard.html',
  './sapa_hero.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// Sự kiện INSTALL: cache tất cả assets khi cài PWA
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching assets...');
      return cache.addAll(ASSETS);
    })
  );
  // Kích hoạt ngay, không chờ SW cũ
  self.skipWaiting();
});

// Sự kiện ACTIVATE: xóa cache cũ khi có version mới
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  // Chiếm quyền kiểm soát tất cả tab ngay
  self.clients.claim();
});

// Sự kiện FETCH: trả về cache nếu có, nếu không thì tải từ mạng
self.addEventListener('fetch', event => {
  // Chỉ cache GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Có trong cache → trả ngay + cập nhật ngầm
        const fetchPromise = fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {}); // Bỏ qua lỗi mạng
        return cached;
      }
      // Không có cache → tải từ mạng
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline và không cache → trả fallback cho HTML
        if (event.request.destination === 'document') {
          return caches.match('./dashboard.html');
        }
      });
    })
  );
});
