try {
    importScripts(
        './sw/utils/constants.js',
        './sw/utils/helpers.js',
        './sw/core/db-manager.js',
        './sw/core/cache-handler.js',
        './sw/modules/news-sync.js',
        './sw/modules/notification-manager.js',
        './sw/sw-main.js'
    );
} catch (error) {
    console.error('Error importing scripts:', error);
}