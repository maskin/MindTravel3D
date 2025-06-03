// Service Worker - PWAオフライン対応
const CACHE_NAME = '3d-maze-game-v1.0.0';
const STATIC_CACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './js/maze-generator.js',
    './js/game-engine.js',
    './js/controls.js',
    './js/modal.js',
    './js/main.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// インストール時のキャッシュ
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker installation failed:', error);
            })
    );
});

// アクティベーション時の古いキャッシュ削除
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// ネットワークリクエストの処理
self.addEventListener('fetch', (event) => {
    // GET リクエストのみ処理
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // キャッシュにある場合は返す
                if (cachedResponse) {
                    return cachedResponse;
                }

                // ネットワークからフェッチを試行
                return fetch(event.request)
                    .then((networkResponse) => {
                        // レスポンスが有効な場合はキャッシュに保存
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            
                            // 静的ファイルのみキャッシュ
                            if (isStaticResource(event.request.url)) {
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, responseToCache);
                                    });
                            }
                        }
                        
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.log('Network fetch failed:', error);
                        
                        // オフライン時のフォールバック
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        // その他のリソースは空のレスポンスを返す
                        return new Response('', {
                            status: 404,
                            statusText: 'Not Found'
                        });
                    });
            })
    );
});

// 静的リソースかどうかを判定
function isStaticResource(url) {
    const staticExtensions = ['.js', '.css', '.html', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'];
    const urlPath = new URL(url).pathname;
    
    return staticExtensions.some(ext => urlPath.endsWith(ext)) || 
           url.includes('cdnjs.cloudflare.com') ||
           urlPath === '/' ||
           urlPath === './';
}

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        // 将来的にゲームデータの同期等に使用
    }
});

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
    console.log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : '3D迷路ゲームからの通知',
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'ゲームを開く',
                icon: './icons/icon-192.png'
            },
            {
                action: 'close',
                title: '閉じる'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('3D迷路ゲーム', options)
    );
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked');
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// エラーハンドリング
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

// 未処理のPromise拒否をキャッチ
self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});