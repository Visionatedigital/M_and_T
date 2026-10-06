'use strict';

const DEFAULT_FLAT_RATE_PCT = 30;

function parseInterestRatePercent(loan) {
  const raw = loan?.interest_rate;
  if (raw != null && raw !== '') {
    const n = parseFloat(raw);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return DEFAULT_FLAT_RATE_PCT;
}

function interestRateDecimal(loan) {
  return parseInterestRatePercent(loan) / 100;
}

/** Total repayable for flat-rate or fixed-fee loans (matches application form logic). */
function totalRepayableAmount(loan) {
  const principal = parseFloat(loan?.loan_amount) || 0;
  const method = String(loan?.interest_method || 'flat_rate').toLowerCase();
  if (method === 'fixed_fee') {
    const fee = parseFloat(loan?.interest_fixed_amount) || 0;
    return principal + Math.max(0, fee);
  }
  return principal * (1 + interestRateDecimal(loan));
}

function isGroupLoan(loan) {
  if (loan?.group_id) return true;
  return /group/i.test(String(loan?.loan_product || ''));
}

/** Loan term in months, preferring loan_duration + duration_unit over loan_duration_months alone. */
function effectiveDurationMonths(loan) {
  const durationVal = parseFloat(loan?.loan_duration);
  const unit = String(loan?.duration_unit || 'months').toLowerCase();
  if (Number.isFinite(durationVal) && durationVal > 0) {
    if (unit === 'weeks') return durationVal / 4.33;
    if (unit === 'years') return durationVal * 12;
    return durationVal;
  }
  const fromMonthsCol = parseInt(loan?.loan_duration_months, 10);
  if (Number.isFinite(fromMonthsCol) && fromMonthsCol > 0) return fromMonthsCol;
  return 4;
}

function repaymentFrequencyForLoan(loan) {
  const freq = String(loan?.repayment_frequency || '').toLowerCase();
  if (freq === 'weekly' || freq === 'biweekly' || freq === 'monthly') return freq;
  return isGroupLoan(loan) ? 'weekly' : 'monthly';
}

function installmentCountForLoan(loan) {
  const months = effectiveDurationMonths(loan);
  const freq = repaymentFrequencyForLoan(loan);
  if (freq === 'weekly') return Math.max(1, Math.ceil(months * 4.33));
  if (freq === 'biweekly') return Math.max(1, Math.ceil(months * 2.165));
  return Math.max(1, Math.ceil(months));
}

function installmentAmountForLoan(loan) {
  const total = totalRepayableAmount(loan);
  const count = installmentCountForLoan(loan);
  return total / count;
}

function remainingBalanceParts(loan, paidAmount) {
  const principal = parseFloat(loan?.loan_amount) || 0;
  const total = totalRepayableAmount(loan);
  const paid = parseFloat(paidAmount) || 0;
  const remaining = Math.max(0, total - paid);
  if (remaining <= 0 || total <= 0) {
    return { remaining: 0, remainingPrincipal: 0, remainingInterest: 0 };
  }
  const remainingPrincipal = principal * (remaining / total);
  const remainingInterest = Math.max(0, remaining - remainingPrincipal);
  return { remaining, remainingPrincipal, remainingInterest };
}

/** Sum of installment amounts with due dates falling in [periodStart, periodEnd]. */
function expectedDueInPeriod(loan, periodStart, periodEnd) {
  const approved = new Date(loan.approved_at || loan.created_at);
  if (!Number.isFinite(approved.getTime()) || approved > periodEnd) return 0;
  const instAmt = installmentAmountForLoan(loan);
  if (instAmt <= 0) return 0;
  const freq = repaymentFrequencyForLoan(loan);
  let totalDue = 0;
  for (let i = 1; i <= 600; i += 1) {
    const due = new Date(approved);
    if (freq === 'weekly') due.setDate(due.getDate() + i * 7);
    else if (freq === 'biweekly') due.setDate(due.getDate() + i * 14);
    else due.setMonth(due.getMonth() + i);
    if (due > periodEnd) break;
    if (due >= periodStart) totalDue += instAmt;
  }
  return totalDue;
}

function nextDueDateForLoan(loan, paidAmount) {
  const installmentAmount = installmentAmountForLoan(loan);
  const installmentsPaid =
    installmentAmount > 0 ? Math.floor(paidAmount / installmentAmount) : 0;
  const approvedDate = new Date(loan.approved_at || loan.created_at);
  const nextDueDate = new Date(approvedDate);
  const freq = repaymentFrequencyForLoan(loan);
  if (freq === 'weekly') {
    nextDueDate.setDate(nextDueDate.getDate() + (installmentsPaid + 1) * 7);
  } else if (freq === 'biweekly') {
    nextDueDate.setDate(nextDueDate.getDate() + (installmentsPaid + 1) * 14);
  } else {
    nextDueDate.setMonth(nextDueDate.getMonth() + installmentsPaid + 1);
  }
  return { nextDueDate, installmentAmount, installmentsPaid };
}

/** @param {string} period 1m | 3m | 6m | 12m */
function dashboardPeriodRange(period) {
  const monthsBack = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 }[String(period || '6m').toLowerCase()] || 6;
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end.getFullYear(), end.getMonth() - (monthsBack - 1), 1);
  start.setHours(0, 0, 0, 0);
  const labels = {
    '1m': 'Last 1 month',
    '3m': 'Last 3 months',
    '6m': 'Last 6 months',
    '12m': 'Last 12 months',
  };
  return {
    monthsBack,
    start,
    end,
    label: labels[String(period || '6m').toLowerCase()] || labels['6m'],
  };
}

module.exports = {
  DEFAULT_FLAT_RATE_PCT,
  parseInterestRatePercent,
  interestRateDecimal,
  totalRepayableAmount,
  isGroupLoan,
  effectiveDurationMonths,
  repaymentFrequencyForLoan,
  installmentCountForLoan,
  installmentAmountForLoan,
  nextDueDateForLoan,
  remainingBalanceParts,
  expectedDueInPeriod,
  dashboardPeriodRange,
};
