/**
 * Electron Builder Configuration for M&T Growth Gateway
 *
 * Auto-update metadata (latest.yml + blockmap) is generated when `publish` is set.
 * Set at build time (CI or local):
 *   UPDATE_BASE_URL=https://your-cdn.example.com/app-releases/   (generic — must be HTTPS, public)
 *   or
 *   GITHUB_OWNER=org  GITHUB_REPO=m-t-growth-gateway  (+ GH_TOKEN for `electron-builder publish`)
 */

function getPublish() {
    const ghOwner = process.env.GITHUB_OWNER;
    const ghRepo = process.env.GITHUB_REPO;
    const genericUrl = process.env.UPDATE_BASE_URL;
    if (ghOwner && ghRepo) {
        return { provider: 'github', owner: ghOwner, repo: ghRepo };
    }
    if (genericUrl) {
        return { provider: 'generic', url: genericUrl.replace(/\/?$/, '/') };
    }
    return null;
}

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
    publish: getPublish(),
};
