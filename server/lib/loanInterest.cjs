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
};
