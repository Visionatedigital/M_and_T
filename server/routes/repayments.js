'use strict';
/**
 * Re-exports the real router implementation.
 * Older entry points load `routes/repayments` without `.cjs`; this ensures
 * endpoints like collector-summary and history-group are always registered.
 */
module.exports = require('./repayments.cjs');
