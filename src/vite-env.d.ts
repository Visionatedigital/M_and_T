/// <reference types="vite/client" />

/** Preload bridge (electron/preload.cjs) — present only in packaged Electron */
interface ElectronAPI {
  platform?: string;
  isElectron?: boolean;
  saveFile?: (data: unknown) => Promise<unknown>;
  getAppVersion?: () => Promise<string>;
  getDbPath?: () => Promise<string>;
  checkForUpdates?: () => Promise<unknown>;
  onUpdateStatus?: (callback: (payload: {
    phase: "checking" | "available" | "downloading" | "downloaded" | "not-available" | "error";
    version?: string;
    percent?: number;
    releaseNotes?: string;
    message?: string;
  }) => void) => () => void;
  quitAndInstall?: () => Promise<{ ok?: boolean; error?: string }>;
}

interface Window {
  electronAPI?: ElectronAPI;
}
