/**
 * Electron Builder Configuration for M&T Growth Gateway
 */
module.exports = {
    appId: 'com.mt-microfinance.growth-gateway',
    productName: 'M&T Growth Gateway',
    directories: {
        output: 'release',
        buildResources: 'build',
    },
    files: [
        'dist/**/*',
        'electron/**/*',
        'server/**/*',
        '.env',
        'package.json',
        'node_modules/**/*',
        '!node_modules/.cache',
        '!node_modules/@types',
        '!node_modules/typescript',
        '!node_modules/eslint*',
        '!node_modules/@eslint*',
        '!node_modules/vite',
        '!node_modules/@vitejs',
    ],
    extraFiles: [
        '.env'
    ],
    extraMetadata: {
        main: 'electron/main.cjs',
    },
    // macOS
    mac: {
        category: 'public.app-category.finance',
        target: [
            { target: 'dmg', arch: ['arm64', 'x64'] },
            { target: 'zip', arch: ['arm64', 'x64'] },
        ],
        icon: 'public/icon.png',
        darkModeSupport: true,
    },
    dmg: {
        title: 'M&T Growth Gateway',
        backgroundColor: '#0f172a',
        contents: [
            { x: 130, y: 220 },
            { x: 410, y: 220, type: 'link', path: '/Applications' },
        ],
    },
    // Windows
    win: {
        target: [
            { target: 'nsis', arch: ['x64'] },
        ],
        icon: 'public/icon.png',
    },
    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: 'M&T Growth Gateway',
    },
    // Linux
    linux: {
        target: ['AppImage', 'deb'],
        category: 'Finance',
        icon: 'public/icon.png',
    },
    // Rebuild native modules for Electron
    npmRebuild: true,
    nodeGypRebuild: false,
    // Auto-update (can be configured later)
    publish: null,
};
