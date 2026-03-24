import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/sonner";

type UpdatePayload = {
  phase: "checking" | "available" | "downloading" | "downloaded" | "not-available" | "error";
  version?: string;
  percent?: number;
  releaseNotes?: string;
  message?: string;
};

function stripNotes(s: string | undefined) {
  if (!s) return undefined;
  const t = s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t.length > 240 ? `${t.slice(0, 237)}…` : t;
}

/**
 * Listens for electron-updater IPC and shows Sonner toasts (Cursor-style: notify → progress → Restart).
 * No-op in browser / dev.
 */
export function ElectronUpdateNotifier() {
  const progressId = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    const api = typeof window !== "undefined" ? (window as unknown as { electronAPI?: {
      onUpdateStatus?: (cb: (p: UpdatePayload) => void) => () => void;
      quitAndInstall?: () => Promise<{ ok?: boolean }>;
    } }).electronAPI : undefined;

    if (!api?.onUpdateStatus) return;

    const unsub = api.onUpdateStatus((p: UpdatePayload) => {
      if (p.phase === "checking" || p.phase === "not-available") return;

      if (p.phase === "available" && p.version) {
        const desc = stripNotes(p.releaseNotes);
        progressId.current = toast.loading(
          desc ? `Downloading v${p.version}` : `Downloading v${p.version}…`,
          {
            description: desc || "This happens in the background.",
            duration: Infinity,
          },
        );
        return;
      }

      if (p.phase === "downloading") {
        const pct = Math.round(p.percent ?? 0);
        if (progressId.current == null) {
          progressId.current = toast.loading(`Downloading update… ${pct}%`, { duration: Infinity });
        } else {
          toast.loading(`Downloading update… ${pct}%`, {
            id: progressId.current,
            duration: Infinity,
          });
        }
        return;
      }

      if (p.phase === "downloaded" && p.version) {
        if (progressId.current != null) {
          toast.dismiss(progressId.current);
          progressId.current = undefined;
        }
        toast.success(`Update ready — v${p.version}`, {
          description: "Restart to finish installing. The app will close and reopen.",
          duration: Infinity,
          action: {
            label: "Restart now",
            onClick: () => {
              void api.quitAndInstall?.();
            },
          },
          cancel: {
            label: "Later",
            onClick: () => {},
          },
        });
        return;
      }

      if (p.phase === "error" && p.message) {
        if (progressId.current != null) {
          toast.dismiss(progressId.current);
          progressId.current = undefined;
        }
        toast.error("Update check failed", {
          description: p.message,
        });
      }
    });

    return () => {
      unsub?.();
    };
  }, []);

  return null;
}
