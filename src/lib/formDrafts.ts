/**
 * Local draft persistence for long forms (survives refresh / accidental navigation).
 * Stored in localStorage — not synced across devices.
 */

export const DRAFT_KEYS = {
  LOAN_APPLICATION: "mtg:draft:loan-application",
  ADD_BORROWER: "mtg:draft:add-borrower",
  ADD_COLLATERAL: "mtg:draft:add-collateral",
  GUARANTOR_ADD: "mtg:draft:guarantor-add",
} as const;

export function saveFormDraft<T extends object>(key: string, data: T): void {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        ...data,
        _savedAt: Date.now(),
      })
    );
  } catch (e) {
    console.warn("saveFormDraft failed", e);
  }
}

export function loadFormDraft<T>(key: string): (T & { _savedAt?: number }) | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T & { _savedAt?: number };
  } catch {
    return null;
  }
}

export function clearFormDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function formatDraftAge(savedAt?: number): string {
  if (!savedAt) return "";
  const mins = Math.floor((Date.now() - savedAt) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
