// AGM Wealth — site scripts

// SIP calculator (homepage)
function calcSIP() {
  const amountEl = document.getElementById('sip-amount');
  const returnEl = document.getElementById('sip-return');
  const yearsEl = document.getElementById('sip-years');
  if (!amountEl) return;

  const P = parseFloat(amountEl.value) || 0;
  const annualRate = parseFloat(returnEl.value) || 0;
  const years = parseFloat(yearsEl.value) || 0;
  const n = years * 12;
  const r = annualRate / 12 / 100;

  let futureValue = 0;
  if (r > 0 && n > 0) {
    futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  } else {
    futureValue = P * n;
  }
  const invested = P * n;
  const gains = futureValue - invested;

  const fmt = (num) => '\u20B9' + Math.round(num).toLocaleString('en-IN');

  document.getElementById('sip-invested').textContent = fmt(invested);
  document.getElementById('sip-gains').textContent = fmt(gains);
  document.getElementById('sip-total').textContent = fmt(futureValue);
}

document.addEventListener('DOMContentLoaded', function () {
  ['sip-amount', 'sip-return', 'sip-years'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcSIP);
  });
  calcSIP();

  ['ls-amount', 'ls-return', 'ls-years'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcLumpsum);
  });
  calcLumpsum();

  ['ret-age', 'ret-retage', 'ret-expense', 'ret-inflation'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcRetirement);
  });
  calcRetirement();

  ['goal-amount', 'goal-years', 'goal-inflation', 'goal-return'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcGoal);
  });
  calcGoal();
});

function fmtRupee(num) {
  return '\u20B9' + Math.round(num).toLocaleString('en-IN');
}

// Lumpsum calculator
function calcLumpsum() {
  const amountEl = document.getElementById('ls-amount');
  if (!amountEl) return;
  const P = parseFloat(amountEl.value) || 0;
  const annualRate = parseFloat(document.getElementById('ls-return').value) || 0;
  const years = parseFloat(document.getElementById('ls-years').value) || 0;
  const futureValue = P * Math.pow(1 + annualRate / 100, years);
  const gains = futureValue - P;
  document.getElementById('ls-invested').textContent = fmtRupee(P);
  document.getElementById('ls-gains').textContent = fmtRupee(gains);
  document.getElementById('ls-total').textContent = fmtRupee(futureValue);
}

// Retirement corpus calculator
function calcRetirement() {
  const ageEl = document.getElementById('ret-age');
  if (!ageEl) return;
  const age = parseFloat(ageEl.value) || 0;
  const retAge = parseFloat(document.getElementById('ret-retage').value) || 0;
  const expense = parseFloat(document.getElementById('ret-expense').value) || 0;
  const inflation = parseFloat(document.getElementById('ret-inflation').value) || 0;
  const yearsToRetirement = Math.max(retAge - age, 0);
  const futureMonthlyExpense = expense * Math.pow(1 + inflation / 100, yearsToRetirement);
  const corpusNeeded = futureMonthlyExpense * 12 * 25;
  document.getElementById('ret-future-expense').textContent = fmtRupee(futureMonthlyExpense);
  document.getElementById('ret-corpus').textContent = fmtRupee(corpusNeeded);
}

// Goal planner
function calcGoal() {
  const amountEl = document.getElementById('goal-amount');
  if (!amountEl) return;
  const goalToday = parseFloat(amountEl.value) || 0;
  const years = parseFloat(document.getElementById('goal-years').value) || 0;
  const inflation = parseFloat(document.getElementById('goal-inflation').value) || 0;
  const annualReturn = parseFloat(document.getElementById('goal-return').value) || 0;
  const futureCost = goalToday * Math.pow(1 + inflation / 100, years);
  const n = years * 12;
  const r = annualReturn / 12 / 100;
  let requiredSIP = 0;
  if (r > 0 && n > 0) {
    const factor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    requiredSIP = futureCost / factor;
  } else if (n > 0) {
    requiredSIP = futureCost / n;
  }
  document.getElementById('goal-future').textContent = fmtRupee(futureCost);
  document.getElementById('goal-sip').textContent = fmtRupee(requiredSIP);
}
