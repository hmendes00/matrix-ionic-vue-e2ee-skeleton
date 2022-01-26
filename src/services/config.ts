const ConfigService = {
    MatrixUrl: process.env.MATRIX_SERVER_URL || 'https://matrix.org',
    logLevel: process.env.LOG_LEVEL || 'silly',
    appStoragePrefix: 'skeleton-store',
    storeName: 'skeleton-store-mx-sync',
    appDataStore: 'skeleton-store-data',
    cryptoStoreName: 'matrix-js-sdk:crypto',
    defaultAvatar: '/assets/default-avatar.png'
}

export default ConfigService;