/**
 * Service Worker for 3D Maze Game PWA
 * キャッシュ管理とオフライン対応
 */

const CACHE_NAME = 'dozo-maze-v1.0.0';
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

/**
 * Service Worker インストール時の処理
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker: インストール中...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: ファイルをキャッシュ中...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: インストール完了');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: インストール失敗', error);
            })
    );
});

/**
 * Service Worker アクティブ化時の処理
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker: アクティブ化中...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 古いキャッシュを削除
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: 古いキャッシュを削除:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: アクティブ化完了');
            return self.clients.claim();
        })
    );
});

/**
 * ネットワークリクエストの処理
 */
self.addEventListener('fetch', (event) => {
    // GET リクエストのみ処理
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにあればそれを返す
                if (response) {
                    return response;
                }
                
                // キャッシュになければネットワークから取得
                return fetch(event.request).then((response) => {
                    // レスポンスが有効でない場合はそのまま返す
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
                }).catch(() => {
                    // ネットワークエラーの場合のフォールバック
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

/**
 * バックグラウンド同期
 */
self.addEventListener('sync', (event) => {
    console.log('Service Worker: バックグラウンド同期:', event.tag);
    
    if (event.tag === 'game-data-sync') {
        event.waitUntil(syncGameData());
    }
});

/**
 * プッシュ通知の処理
 */
self.addEventListener('push', (event) => {
    console.log('Service Worker: プッシュ通知受信');
    
    const options = {
        body: event.data ? event.data.text() : 'プッシュ通知',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'ゲームを開く',
                icon: '/icons/icon-72x72.png'
            },
            {
                action: 'close',
                title: '閉じる',
                icon: '/icons/icon-72x72.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('3D迷路ゲーム', options)
    );
});

/**
 * 通知クリック時の処理
 */
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: 通知クリック:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // ゲームページを開く
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * メッセージ処理
 */
self.addEventListener('message', (event) => {
    console.log('Service Worker: メッセージ受信:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

/**
 * ゲームデータの同期
 */
async function syncGameData() {
    try {
        console.log('Service Worker: ゲームデータ同期開始');
        
        // ここで必要に応じてゲームデータの同期処理を実装
        // 例：スコア、プログレス、設定の同期など
        
        console.log('Service Worker: ゲームデータ同期完了');
    } catch (error) {
        console.error('Service Worker: ゲームデータ同期失敗', error);
    }
}

/**
 * キャッシュのクリーンアップ
 */
async function cleanupCache() {
    try {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => name !== CACHE_NAME);
        
        await Promise.all(
            oldCaches.map(name => caches.delete(name))
        );
        
        console.log('Service Worker: キャッシュクリーンアップ完了');
    } catch (error) {
        console.error('Service Worker: キャッシュクリーンアップ失敗', error);
    }
}

/**
 * 定期的なメンテナンス
 */
setInterval(() => {
    cleanupCache();
}, 24 * 60 * 60 * 1000); // 24時間ごと