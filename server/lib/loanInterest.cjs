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

module.exports = {
  DEFAULT_FLAT_RATE_PCT,
  parseInterestRatePercent,
  interestRateDecimal,
  totalRepayableAmount,
};
