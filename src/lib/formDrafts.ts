/**
 * Local draft persistence for long forms (survives refresh / accidental navigation).
 * Stored in localStorage — not synced across devices.
 */

export const DRAFT_KEYS = {
  /** @deprecated Legacy single-slot key; migrated automatically to loan application list */
  LOAN_APPLICATION: "mtg:draft:loan-application",
  ADD_BORROWER: "mtg:draft:add-borrower",
  ADD_COLLATERAL: "mtg:draft:add-collateral",
  GUARANTOR_ADD: "mtg:draft:guarantor-add",
} as const;

const LOAN_APPLICATION_DRAFTS_KEY = "mtg:draft:loan-applications-list";

export type LoanApplicationDraftPayload = {
  formValues: Record<string, unknown>;
  guarantors?: unknown[];
  groupMembers?: unknown[];
  groupLeaderAmount?: number;
  selectedBorrowerId?: string;
  selectedGroupLeaderId?: string;
  selectedCollateralId?: string;
};

export type LoanApplicationStoredDraft = {
  id: string;
  savedAt: number;
  label: string;
  payload: LoanApplicationDraftPayload;
};

function defaultLoanDraftLabel(payload: LoanApplicationDraftPayload): string {
  const fv = payload.formValues as {
    full_name?: string;
    loan_product?: string;
    application_type?: string;
    group_name?: string;
  };
  const name = (fv?.full_name || "").trim();
  const group = (fv?.group_name || "").trim();
  const prod = (fv?.loan_product || "").trim();
  const type = fv?.application_type === "group" ? "Group" : "Individual";
  if (group && fv?.application_type === "group") return `${group} · ${type}`;
  if (name && prod) return `${name} · ${prod}`;
  if (name) return `${name} · ${type}`;
  if (prod) return `${prod} (${type})`;
  return `Untitled · ${type}`;
}

function readLoanDraftListRaw(): LoanApplicationStoredDraft[] {
  try {
    const raw = localStorage.getItem(LOAN_APPLICATION_DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.id === "string" && x.payload);
  } catch {
    return [];
  }
}

function writeLoanDraftList(list: LoanApplicationStoredDraft[]): void {
  try {
    localStorage.setItem(LOAN_APPLICATION_DRAFTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("writeLoanDraftList failed", e);
  }
}

/** One-time migration from single-key draft to list */
function migrateLegacyLoanApplicationDraft(): void {
  try {
    const legacyRaw = localStorage.getItem(DRAFT_KEYS.LOAN_APPLICATION);
    if (!legacyRaw) return;
    const legacy = JSON.parse(legacyRaw);
    if (!legacy?.formValues || typeof legacy.formValues !== "object") {
      localStorage.removeItem(DRAFT_KEYS.LOAN_APPLICATION);
      return;
    }
    const list = readLoanDraftListRaw();
    const payload: LoanApplicationDraftPayload = {
      formValues: legacy.formValues,
      guarantors: legacy.guarantors,
      groupMembers: legacy.groupMembers,
      groupLeaderAmount: legacy.groupLeaderAmount,
      selectedBorrowerId: legacy.selectedBorrowerId,
      selectedGroupLeaderId: legacy.selectedGroupLeaderId,
      selectedCollateralId: legacy.selectedCollateralId,
    };
    list.push({
      id: crypto.randomUUID(),
      savedAt: typeof legacy._savedAt === "number" ? legacy._savedAt : Date.now(),
      label: defaultLoanDraftLabel(payload),
      payload,
    });
    writeLoanDraftList(list);
    localStorage.removeItem(DRAFT_KEYS.LOAN_APPLICATION);
  } catch {
    /* ignore */
  }
}

export function loadLoanApplicationDraftList(): LoanApplicationStoredDraft[] {
  migrateLegacyLoanApplicationDraft();
  const list = readLoanDraftListRaw();
  return [...list].sort((a, b) => b.savedAt - a.savedAt);
}

/** Create or update a draft; returns the draft id (new id if draftId was null). */
export function upsertLoanApplicationDraft(
  draftId: string | null,
  payload: LoanApplicationDraftPayload
): string {
  migrateLegacyLoanApplicationDraft();
  const list = readLoanDraftListRaw();
  const id = draftId || crypto.randomUUID();
  const label = defaultLoanDraftLabel(payload);
  const savedAt = Date.now();
  const rec: LoanApplicationStoredDraft = { id, savedAt, label, payload };
  const idx = list.findIndex((x) => x.id === id);
  if (idx >= 0) list[idx] = rec;
  else list.push(rec);
  writeLoanDraftList(list);
  return id;
}

export function deleteLoanApplicationDraft(id: string): void {
  const list = readLoanDraftListRaw().filter((x) => x.id !== id);
  writeLoanDraftList(list);
  try {
    localStorage.removeItem(DRAFT_KEYS.LOAN_APPLICATION);
  } catch {
    /* ignore */
  }
}

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
