class NotificationManager {
    async showNewsNotification(newsCount) {
        await self.registration.showNotification('Новые новости!', {
            body: `Появилось ${newsCount} новых статей`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            tag: 'news-update',
            actions: [
                { action: 'open', title: 'Открыть' },
                { action: 'dismiss', title: 'Закрыть' }
            ],
            data: {
                url: '/news',
                newsCount: newsCount
            }
        });
    }

    handleNotificationClick(event) {
        event.notification.close();

        if (event.action === 'open' || event.action === '') {
            event.waitUntil(
                self.clients.matchAll().then((clientList) => {
                    if (clientList.length > 0) {
                        return clientList[0].focus();
                    }
                    return self.clients.openWindow('/news');
                })
            );
        }
    }
}

export const notificationManager = new NotificationManager();