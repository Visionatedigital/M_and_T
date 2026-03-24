import { API_ORIGIN } from "@/services/api";

/** Turn stored upload paths or relative URLs into a usable image/document URL. */
export function resolveMediaUrl(path: string | null | undefined): string | null {
    if (path == null || typeof path !== "string") return null;
    const trimmed = path.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const base = API_ORIGIN.replace(/\/$/, "");
    return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}
