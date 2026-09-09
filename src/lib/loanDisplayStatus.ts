/** Shared loan status labels used by View Loans lists (Current / Arrears / Missed / etc.). */

export type LoanDisplayStatus =
  | "Current"
  | "Fully Paid"
  | "Past Maturity"
  | "Due Today"
  | "Missed Repayment"
  | "Arrears"
  | string;

/**
 * Compute a repayment-aware display status for an active loan.
 * Mirrors the repayments API so arrears / missed lists actually populate.
 */
export function computeLoanDisplayStatus(input: {
  loan_amount?: number | string | null;
  amount_paid?: number | string | null;
  loan_duration_months?: number | string | null;
  approved_at?: string | null;
  disbursed_at?: string | null;
  created_at?: string | null;
  group_id?: string | null;
  status?: string | null;
  interest_rate?: number | string | null;
}): LoanDisplayStatus {
  const principal = parseFloat(String(input.loan_amount ?? 0)) || 0;
  const ratePct = input.interest_rate != null ? parseFloat(String(input.interest_rate)) : 30;
  const rate = Number.isFinite(ratePct) ? ratePct / 100 : 0.3;
  const totalAmount = principal * (1 + rate);
  const paidAmount = parseFloat(String(input.amount_paid ?? 0)) || 0;
  const balance = Math.max(0, totalAmount - paidAmount);

  if (balance <= 0) return "Fully Paid";

  const durationMonths = parseInt(String(input.loan_duration_months || 4), 10) || 4;
  const released = input.disbursed_at || input.approved_at || input.created_at;
  if (!released) {
    return input.status === "disbursed" || input.status === "approved" ? "Current" : String(input.status || "Current");
  }

  const approvedDate = new Date(released);
  const now = new Date();
  const maturityDate = new Date(approvedDate);
  maturityDate.setMonth(maturityDate.getMonth() + durationMonths);

  const isGroup = !!input.group_id;
  const numberOfInstallments = isGroup ? Math.ceil(durationMonths * 4.33) : durationMonths;
  const installmentAmount = totalAmount / Math.max(1, numberOfInstallments);
  const installmentsPaid = installmentAmount > 0 ? Math.floor(paidAmount / installmentAmount) : 0;

  const nextDueDate = new Date(approvedDate);
  if (isGroup) {
    nextDueDate.setDate(nextDueDate.getDate() + (installmentsPaid + 1) * 7);
  } else {
    nextDueDate.setMonth(nextDueDate.getMonth() + installmentsPaid + 1);
  }

  const isPastMaturity = now > maturityDate && balance > 0;
  const isDueToday = nextDueDate.toDateString() === now.toDateString() && balance > 0;

  const daysPassed = (now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24);
  const totalDurationDays = durationMonths * 30;
  const expectedProgress = Math.min(1, Math.max(0, daysPassed / totalDurationDays));
  const expectedPaid = totalAmount * expectedProgress;
  const shortfall = expectedPaid - paidAmount;
  const isMissed = shortfall > installmentAmount * 1.5 && balance > 0 && !isPastMaturity;
  // Arrears: behind schedule (at least ~1 installment) but not yet "missed" threshold / past maturity
  const isArrears = shortfall > installmentAmount * 0.5 && balance > 0 && !isPastMaturity && !isMissed && !isDueToday;

  if (isPastMaturity) return "Past Maturity";
  if (isDueToday) return "Due Today";
  if (isMissed) return "Missed Repayment";
  if (isArrears) return "Arrears";
  return "Current";
}
