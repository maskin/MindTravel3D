/**
 * Service Worker - PWA オフライン対応
 */

const CACHE_NAME = '3d-maze-game-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/maze-generator.js',
  '/js/game-engine.js',
  '/js/controls.js',
  '/js/modal.js',
  '/js/main.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// インストール時
self.addEventListener('install', (event) => {
  console.log('Service Worker インストール中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('ファイルをキャッシュ中...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('すべてのファイルがキャッシュされました');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('キャッシュ中にエラーが発生:', error);
      })
  );
});

// アクティベーション時
self.addEventListener('activate', (event) => {
  console.log('Service Worker アクティベート中...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker アクティベート完了');
      return self.clients.claim();
    })
  );
});

// フェッチ時（ネットワークリクエスト処理）
self.addEventListener('fetch', (event) => {
  // POSTリクエストなどはキャッシュしない
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにある場合はそれを返す
        if (response) {
          console.log('キャッシュから返却:', event.request.url);
          return response;
        }

        // キャッシュにない場合はネットワークから取得
        console.log('ネットワークから取得:', event.request.url);
        return fetch(event.request).then(
          (response) => {
            // 有効なレスポンスでない場合はそのまま返す
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch((error) => {
          console.error('ネットワークエラー:', error);
          
          // オフライン時のフォールバック
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          // その他のリソースの場合は適切なエラーレスポンスを返す
          return new Response('オフラインです', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain; charset=utf-8'
            })
          });
        });
      })
  );
});

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('バックグラウンド同期実行');
    // 必要に応じてゲームデータの同期処理を実装
  }
});

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
  console.log('プッシュ通知受信');
  
  const options = {
    body: event.data ? event.data.text() : '新しい迷路が利用可能です！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'プレイする',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('3D迷路ゲーム', options)
  );
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('通知がクリックされました:', event.notification.tag);
  event.notification.close();

  if (event.action === 'explore') {
    // ゲームを開く
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// エラーハンドリング
self.addEventListener('error', (event) => {
  console.error('Service Worker エラー:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker 未処理のPromise拒否:', event.reason);
});

console.log('Service Worker 登録完了');