/* global self */
importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "api_Key",
    authDomain: "online-learning-f9d31.firebaseapp.com",
    projectId: "online-learning-f9d31",
    storageBucket: "online-learning-f9d31.firebasestorage.app",
    messagingSenderId: "350760694414",
    appId: "1:350760694414:web:a62e153a0068e5b9ff0fdf",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    // Add more detailed logging
    console.log('[SW] Browser:', navigator.userAgent);
    console.log('[SW] Timestamp:', new Date().toISOString());
    console.log('[SW] Payload:', JSON.stringify(payload));
    
    const notificationTitle = payload.notification?.title || 'Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'New notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'fcm-notification',
        requireInteraction: true,
        silent: false,
        data: payload.data || {},
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'close', title: 'Close' }
        ]
    };
    
    console.log('[SW] Showing notification:', notificationTitle, notificationOptions);
    
    // Force show notification
    try {
        const notificationPromise = self.registration.showNotification(notificationTitle, notificationOptions);
        console.log('[SW] Notification show promise created');
        return notificationPromise;
    } catch (error) {
        console.error('[SW] Error showing notification:', error);
        // Fallback - try basic notification
        return self.registration.showNotification(notificationTitle, {
            body: notificationOptions.body,
            icon: '/favicon.ico'
        });
    }
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
    console.log('[SW] Notification click received:', event.notification.data);
    
    event.notification.close();
    
    // Focus or open the app window
    event.waitUntil(
        clients.matchAll({
            type: 'window'
        }).then(function(clientList) {
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
});

// Handle service worker installation
self.addEventListener('install', function(event) {
    console.log('[SW] Service worker installing...');
    self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
    console.log('[SW] Service worker activating...');
    event.waitUntil(self.clients.claim());
});

console.log('[SW] Firebase messaging service worker loaded successfully');
