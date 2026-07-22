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

  initRiskQuiz();
});

// Risk Profile Self-Assessment (informal, educational only - no fund recommendations)
const RISK_QUESTIONS = [
  {
    q: "If your investment dropped 15% in a month, you would:",
    options: ["Sell immediately to avoid further loss", "Feel uneasy but hold", "See it as a buying opportunity"]
  },
  {
    q: "Your primary investment goal is:",
    options: ["Protecting what I have", "A mix of growth and safety", "Maximum long-term growth"]
  },
  {
    q: "Your investment time horizon is mostly:",
    options: ["Under 3 years", "3-7 years", "7+ years"]
  },
  {
    q: "How would you describe your investing experience?",
    options: ["New to investing", "Some experience", "Experienced across market cycles"]
  }
];

function initRiskQuiz() {
  const container = document.getElementById('risk-quiz-questions');
  if (!container) return;
  container.innerHTML = RISK_QUESTIONS.map(function (item, qi) {
    const options = item.options.map(function (opt, oi) {
      return '<label style="display:block; font-size:0.9rem; padding:6px 0; cursor:pointer;">' +
        '<input type="radio" name="risk-q' + qi + '" value="' + oi + '" style="margin-right:8px;">' + opt +
        '</label>';
    }).join('');
    return '<div style="margin-bottom:18px;"><p style="font-weight:600; font-size:0.92rem; margin-bottom:8px; color:var(--ink-900);">' + (qi + 1) + '. ' + item.q + '</p>' + options + '</div>';
  }).join('');

  const submitBtn = document.getElementById('risk-quiz-submit');
  if (submitBtn) submitBtn.addEventListener('click', scoreRiskQuiz);
}

function scoreRiskQuiz() {
  let total = 0, answered = 0;
  RISK_QUESTIONS.forEach(function (item, qi) {
    const selected = document.querySelector('input[name="risk-q' + qi + '"]:checked');
    if (selected) { total += parseInt(selected.value, 10); answered++; }
  });
  if (answered < RISK_QUESTIONS.length) {
    alert('Please answer all questions to see your result.');
    return;
  }
  const maxScore = RISK_QUESTIONS.length * 2;
  const pct = total / maxScore;
  let label, desc;
  if (pct < 0.34) {
    label = 'Conservative';
    desc = 'You likely prioritise capital protection over growth. Fixed income, debt funds, and capital-protection-oriented products may align with your comfort level - though this is a starting point for a conversation, not a recommendation.';
  } else if (pct < 0.67) {
    label = 'Moderate';
    desc = 'You likely want a balance of growth and stability. Hybrid funds, a mix of equity and debt, and diversified mutual funds are commonly suited to this profile - talk to us for something tailored to your actual situation.';
  } else {
    label = 'Growth-Oriented';
    desc = 'You likely have higher comfort with market volatility in pursuit of long-term growth. Equity-oriented funds, PMS, or AIF may be worth discussing - though suitability still depends on your full financial picture.';
  }
  document.getElementById('risk-quiz-label').textContent = label;
  document.getElementById('risk-quiz-desc').textContent = desc;
  document.getElementById('risk-quiz-result').style.display = 'block';
}

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
