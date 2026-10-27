/* AGM Wealth - conversion layer: tools, forms, onboarding, sticky bar.
   EDIT ONLY THE SETTINGS BELOW. */
(function () {
  if (window.__agmcv) return; window.__agmcv = 1;
  var CFG = {
    phone: '918875050447',
    formEndpoint: '',   // e.g. https://api.web3forms.com/submit (leave empty = forms send via WhatsApp)
    accessKey: 'bc4c45fb-cf1c-4a72-bb0c-34608e3dad43',    // paste your free Web3Forms access key here (web3forms.com) to receive forms by email
    bookingLink: '',    // Google Calendar / Calendly link; empty = in-page slot request form
    kycLink: '',        // your paperless KYC link; empty = KYC link is sent on WhatsApp
    playLink: 'https://play.google.com/store/apps/details?id=com.agmwealth.agmwealth&hl=en',
    iosLink: 'https://apps.apple.com/us/app/agm-wealth/id6618147710',
    appLink: ''         // app download link (Play Store / App Store page); empty = QR code only
  };
  var EP = function () { return CFG.accessKey ? 'https://api.web3forms.com/submit' : CFG.formEndpoint; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wa = function (t) { return 'https://wa.me/' + CFG.phone + '?text=' + encodeURIComponent(t); };
  var inr = function (n) { return n >= 1e7 ? '₹' + (n / 1e7).toFixed(2) + ' Cr' : n >= 1e5 ? '₹' + (n / 1e5).toFixed(2) + ' L' : '₹' + Math.round(n).toLocaleString('en-IN'); };
  var fv = function (p, r, y) { var i = r / 1200, n = y * 12; return i ? p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) : p * n; };

  /* ---------- forms ---------- */
  var SIZES = ['Below ₹25 lakh', '₹25 lakh – ₹1 crore', '₹1 crore – ₹5 crore', 'Above ₹5 crore'];
  var MODES = ['Jaipur in-person', 'Google Meet', 'Phone call'];
  var inp = function (n, l, t, ac) { return '<label>' + l + '<input name="' + n + '" type="' + t + '" autocomplete="' + ac + '" required><small class="err"></small></label>'; };
  var sel = function (n, l, o) { return '<label>' + l + '<select name="' + n + '" required><option value="">Select</option>' + o.map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select><small class="err"></small></label>'; };
  var today = new Date().toISOString().slice(0, 10);
  var consent = '<label class="chk"><input type="checkbox" name="consent" required><span>I agree to AGM Wealth contacting me about this request, as per the <a href="privacy-policy.html">Privacy Policy</a>.</span></label><small class="err"></small>';
  var hp = '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">';
  var FORMS = {
    lead: { btn: 'Request My Portfolio Review', f: inp('name', 'Name', 'text', 'name') + inp('phone', 'WhatsApp phone number', 'tel', 'tel') + inp('email', 'Email', 'email', 'email') + sel('size', 'Current portfolio size', SIZES) + sel('mode', 'Preferred way to connect', MODES) },
    callback: { btn: 'Request Call Back', f: inp('name', 'Name', 'text', 'name') + inp('phone', 'Phone number', 'tel', 'tel') },
    book: { btn: 'Request This Slot', f: inp('name', 'Name', 'text', 'name') + inp('phone', 'WhatsApp phone number', 'tel', 'tel') + '<label>Preferred date<input name="date" type="date" min="' + today + '" required><small class="err"></small></label>' + sel('slot', 'Preferred time', ['Morning (10 am – 1 pm)', 'Afternoon (2 pm – 5 pm)', 'Evening (5 pm – 8 pm)']) + sel('mode', 'Mode', MODES) },
    onboard: { btn: 'Next', f: '<fieldset data-step="1" style="border:0">' + inp('name', 'Full name', 'text', 'name') + inp('phone', 'WhatsApp number', 'tel', 'tel') + inp('email', 'Email', 'email', 'email') + '</fieldset><fieldset data-step="2" style="border:0" hidden>' + sel('size', 'Approximate investable amount', SIZES) + sel('mode', 'How would you like to connect?', MODES) + '<p class="cv-note" style="margin:0 0 14px">Please do not enter PAN or Aadhaar numbers here. KYC is completed later on a secure, regulated KYC platform.</p></fieldset>' }
  };
  var OK = {
    lead: 'Thank you. Your review request is received. Please send your Consolidated Account Statement (CAS) to us on WhatsApp 88750 50447 and we will revert within one business day.',
    callback: 'Thank you. We will call you back shortly during business hours.',
    book: 'Thank you. Your slot request is received. We will confirm the time on WhatsApp.',
    onboard: 'Thank you. Your onboarding request is received.'
  };
  function formHTML(k) { var d = FORMS[k]; return '<form class="cv-form" data-kind="' + k + '" novalidate>' + d.f + hp + consent + '<button type="submit" class="btn btn-primary" style="width:100%">' + d.btn + '</button></form>'; }
  function check(scope) {
    var ok = true;
    $$('input:not(.hp),select', scope).forEach(function (el) {
      var m = '', v = el.value.trim(), e = el.closest('label') ? $('.err', el.closest('label')) : el.parentNode.nextElementSibling;
      if (el.closest('[hidden]')) return;
      if (el.type === 'checkbox') { if (!el.checked) m = 'Please tick to continue.'; }
      else if (!v) m = 'This field is required.';
      else if (el.name === 'name' && v.length < 2) m = 'Enter your full name.';
      else if (el.name === 'phone' && !/^[6-9]\d{9}$/.test(v.replace(/\D/g, '').slice(-10))) m = 'Enter a valid 10-digit mobile number.';
      else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = 'Enter a valid email address.';
      if (e) e.textContent = m;
      el.setAttribute('aria-invalid', m ? 'true' : 'false');
      if (m) ok = false;
    });
    return ok;
  }
  function done(form, k, link) {
    if (link) { form.outerHTML = '<div class="cv-ok" role="status"><p><strong>Almost done. Tap Send in WhatsApp to deliver your details to us.</strong></p><p><a class="btn btn-primary" href="' + link + '" target="_blank" rel="noopener">Open WhatsApp</a></p></div>'; return; }
    var extra = (k === 'onboard' && CFG.kycLink) ? '<p><a class="btn btn-primary" href="' + CFG.kycLink + '" target="_blank" rel="noopener">Continue to Secure KYC</a></p>' : (k === 'onboard' ? '<p>We will WhatsApp you the secure KYC link within one business day.</p>' : '');
    form.outerHTML = '<div class="cv-ok" role="status"><p><strong>' + OK[k] + '</strong></p>' + extra + '</div>';
  }
  document.addEventListener('submit', function (ev) {
    var form = ev.target.closest('.cv-form'); if (!form) return; ev.preventDefault();
    var k = form.dataset.kind;
    if (k === 'onboard') {
      var s1 = $('[data-step="1"]', form), s2 = $('[data-step="2"]', form), btn = $('button[type=submit]', form);
      if (!s1.hidden) { if (!check(s1)) return; s1.hidden = true; s2.hidden = false; btn.textContent = 'Submit Request'; return; }
    }
    if (!check(form)) return;
    var data = {}; new FormData(form).forEach(function (v, n) { if (n !== 'website' && n !== 'consent') data[n] = v; });
    if (form.website && form.website.value) return done(form, k);
    var msg = 'Hello AGM Wealth, ' + ({ lead: 'I would like a portfolio review.', callback: 'please call me back.', book: 'I would like to book a 15-minute conversation.', onboard: 'I would like to start paperless onboarding.' })[k] + '\n' + Object.keys(data).map(function (n) { return n + ': ' + data[n]; }).join('\n');
    if (!EP()) { window.open(wa(msg), '_blank'); return done(form, k, wa(msg)); }
    var b = $('button[type=submit]', form); b.disabled = true; b.textContent = 'Sending…';
    data.from_name = 'AGM Wealth Website';
data.subject = 'New enquiry from AGM Wealth website (' + k + ')';
if (CFG.accessKey) data.access_key = CFG.accessKey;

    fetch(EP(), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw 0; done(form, k); })
      .catch(function () { b.disabled = false; b.textContent = FORMS[k].btn; alert('Could not send right now. Please WhatsApp us on 88750 50447.'); });
  });

  /* ---------- modal ---------- */
  var dlg = document.createElement('dialog'); dlg.id = 'agm-dlg';
  dlg.innerHTML = '<button class="x" aria-label="Close" type="button">&times;</button><div class="b"></div>';
  document.body.appendChild(dlg);
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('x')) dlg.close(); });
  var TITLES = { onboard: ['Start paperless onboarding', 'Two quick steps. We handle the rest digitally.'], book: ['Book a 15-minute conversation', 'Pick a convenient slot and we will confirm on WhatsApp.'], callback: ['Request a call back', 'Share your number and we will call you.'] };
  var STORES = function () { return '<a class="btn btn-primary" href="' + CFG.playLink + '" target="_blank" rel="noopener">Download on Google Play Store</a><a class="btn btn-ghost" href="' + CFG.iosLink + '" target="_blank" rel="noopener">Download on Apple App Store</a>'; };
  function appModal() {
    var guided = wa('Hi Kamlesh, I would like to open an investment account and complete my paperless KYC with AGM Wealth.');
    $('.b', dlg).innerHTML = '<h3>Complete Paperless KYC on the AGM Wealth App</h3><p class="cv-note" style="margin:0 0 18px">Open your account securely on the AGM Wealth mobile app (PAN + Aadhaar required).</p>' +
      '<div class="cv-desk" style="text-align:center"><img src="assets/app-qr.png" width="200" height="200" alt="QR code to download the AGM Wealth app" style="max-width:100%;height:auto"><p>Scan with your phone camera to download the AGM Wealth App on Google Play / App Store.</p><p class="cv-note"><a href="' + guided + '" target="_blank" rel="noopener">Prefer guided help? Chat on WhatsApp with Kamlesh (+91 88750 50447)</a></p></div>' +
      '<div class="cv-mob">' + STORES() + '</div><hr style="margin:20px 0;border:0;border-top:1px solid var(--line)"><a class="btn btn-ghost" style="display:block;text-align:center" href="' + guided + '" target="_blank" rel="noopener">Request Assisted Onboarding on WhatsApp</a>';
    dlg.showModal();
  }
  function openM(k) {
    if (k === 'onboard') return appModal();
    if (k === 'book' && CFG.bookingLink) { window.open(CFG.bookingLink, '_blank'); return; }
    $('.b', dlg).innerHTML = '<h3>' + TITLES[k][0] + '</h3><p class="cv-note" style="margin:0 0 18px">' + TITLES[k][1] + '</p>' + formHTML(k);
    dlg.showModal();
  }
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-open]'); if (t) { e.preventDefault(); openM(t.dataset.open); } });

  /* ---------- sections ---------- */
  var DISC = 'Mutual fund investments are subject to market risks. Read all scheme-related documents carefully.';
  var html =
  '<section class="cv-sec" id="tools"><div class="container"><h2>Two quick tools before you decide</h2><p class="cv-sub">Illustrations and general information to help you prepare for a conversation.</p>' +
  '<div class="cv-tabs" role="tablist"><button role="tab" id="t1" aria-controls="p1" aria-selected="true">SIP growth &amp; cost of delay</button><button role="tab" id="t2" aria-controls="p2" aria-selected="false" tabindex="-1">PMS &amp; AIF eligibility guide</button></div>' +
  '<div role="tabpanel" id="p1" aria-labelledby="t1" class="cv-grid"><div>' +
  '<label class="cv-ctl">Monthly investment <output id="o1"></output><input type="range" id="s1" min="5000" max="500000" step="5000" value="25000"></label>' +
  '<label class="cv-ctl">Assumed annual return <output id="o2"></output><input type="range" id="s2" min="6" max="15" step="0.5" value="12"></label>' +
  '<label class="cv-ctl">Investment horizon <output id="o3"></output><input type="range" id="s3" min="5" max="30" step="1" value="15"></label></div>' +
  '<div class="cv-card" aria-live="polite" id="sipout"></div></div>' +
  '<div role="tabpanel" id="p2" aria-labelledby="t2" hidden><div class="cv-card" id="scr" style="max-width:620px"></div></div></div></section>' +

  '<section class="cv-sec cv-dark" id="onboarding"><div class="container"><h2>Digital onboarding in three steps</h2><p class="cv-sub" style="color:#C6D1C9">No branch visit and no paperwork.</p><ol class="cv-steps">' +
  '<li><h3>Quick discovery &amp; paperless KYC</h3><p>Complete 100% digital KYC with your PAN and Aadhaar, from wherever you are.</p></li>' +
  '<li><h3>Discuss options &amp; choose</h3><p>We explain the risks, costs and features of mutual funds, PMS, AIF and fixed income, so you can choose what fits your own plan.</p></li>' +
  '<li><h3>Track &amp; review</h3><p>24/7 portfolio access through our investor app, with periodic review conversations.</p></li></ol>' +
  '<div class="cv-app"><img src="assets/app-qr.png" alt="QR code to download the AGM Wealth mobile app" width="170" height="170" loading="lazy"><div><h3>Get the AGM Wealth app</h3><p>Track your portfolio 24/7. Scan the QR code with your phone camera to download the app.</p>' + '<p class="cv-mob">' + STORES() + '</p>' + '</div></div>' +
  '<p style="margin-top:28px"><button type="button" class="btn btn-gold" data-open="onboard">Start Paperless Onboarding</button></p></div></section>' +

  '<section class="cv-sec cv-alt" id="portfolio-review"><div class="container cv-grid"><div><h2>Get a Confidential Review of Your Portfolio</h2>' +
  '<p class="cv-sub">Share your Consolidated Account Statement (CAS). We review fund overlap, expense ratios and how your holdings are spread across categories, at zero cost and with no obligation.</p>' +
  '<p class="cv-note">Your details are used only to respond to this request.</p></div><div class="cv-card">' + formHTML('lead') + '</div></div></section>' +

  '<section class="cv-sec" id="founder"><div class="container cv-founder"><div class="cv-mono" aria-hidden="true">KM</div><div><h2>Kamlesh Mandowara</h2>' +
  '<p style="max-width:62ch">Founder, AGM Wealth. 24+ years in banking and financial services, including <strong>Investment Specialist with ICICI Bank Wealth</strong> and Branch Manager at Kotak Mahindra Bank, and a trusted distributor for hundreds of families across India and around the world.</p>' +
  '<blockquote>Wealth is preserved by patience and process. Our job is to keep you clear on what you own, why you own it and what it costs.</blockquote>' +
  '<ul class="cv-creds"><li>AMFI ARN-124172</li><li>APMI APRN 00099</li><li>AIF Distributor 124172</li><li>SIF SIFD-124172</li></ul></div></div></section>';
  var anchor = $('#approach'); if (anchor) anchor.insertAdjacentHTML('afterend', html);

  /* tabs */
  $$('[role=tab]').forEach(function (t) { t.addEventListener('click', function () { $$('[role=tab]').forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; }); }); });

  /* SIP + cost of delay */
  function sip() {
    var p = +$('#s1').value, r = +$('#s2').value, y = +$('#s3').value;
    $('#o1').textContent = '₹' + p.toLocaleString('en-IN'); $('#o2').textContent = r + '%'; $('#o3').textContent = y + ' yrs';
    var v = fv(p, r, y), inv = p * y * 12, rows = '';
    [1, 2, 3].forEach(function (d) { if (y > d) rows += '<div class="cv-row cost"><span>Start ' + d + ' year' + (d > 1 ? 's' : '') + ' later</span><b>−' + inr(v - fv(p, r, y - d)) + '</b></div>'; });
    $('#sipout').innerHTML = '<p>Estimated value after ' + y + ' years</p><p class="cv-big">' + inr(v) + '</p>' +
      '<div class="cv-row"><span>Total invested</span><b>' + inr(inv) + '</b></div><div class="cv-row"><span>Estimated wealth created</span><b>' + inr(v - inv) + '</b></div>' +
      '<p style="margin-top:16px;font-weight:600;color:var(--ink-900)">Cost of delay</p>' + rows +
      '<p class="cv-note">Illustration only: assumes a constant annual return compounded monthly. Actual returns vary and are not guaranteed. ' + DISC + '</p>';
  }
  $$('#s1,#s2,#s3').forEach(function (s) { s.addEventListener('input', sip); }); if (anchor) sip();

  /* eligibility guide */
  var Q = [
    ['Investment horizon', ['Under 3 years', '3 to 5 years', 'More than 5 years']],
    ['Investable surplus you could commit', ['Below ₹50 lakh', '₹50 lakh to ₹1 crore', '₹1 crore and above']],
    ['Comfort with ups and downs in value', ['Low: stability comes first', 'Moderate: some swings are fine', 'High: comfortable with large swings']]
  ], ans = [];
  function scr() {
    var el = $('#scr'), i = ans.length;
    if (i < 3) {
      el.innerHTML = '<p class="cv-note" style="margin:0">Question ' + (i + 1) + ' of 3</p><h3 style="font:600 1.2rem var(--font-display);color:var(--ink-900);margin-top:6px">' + Q[i][0] + '</h3><div class="cv-opts">' + Q[i][1].map(function (o, j) { return '<button type="button" data-a="' + j + '">' + o + '</button>'; }).join('') + '</div>';
      return;
    }
    var h = ans[0], s = ans[1], r = ans[2], li = '<li><strong>Mutual funds.</strong> Open to everyone; the usual starting point.</li>';
    li += (s >= 1 && h >= 1 && r >= 1) ? '<li><strong>PMS.</strong> Your answers fall within the typical profile (minimum investment ₹50 lakh).</li>' : '<li class="no"><strong>PMS.</strong> Needs ₹50 lakh minimum, a 3+ year horizon and comfort with volatility.</li>';
    li += (s === 2 && h === 2 && r === 2) ? '<li><strong>AIF.</strong> Your answers fall within the typical profile (minimum investment ₹1 crore).</li>' : '<li class="no"><strong>AIF.</strong> Needs ₹1 crore minimum, a 5+ year horizon and high risk comfort; may be less liquid.</li>';
    el.innerHTML = '<h3 style="font:600 1.2rem var(--font-display);color:var(--ink-900)">Categories to explore</h3><ul class="cv-res" style="margin-top:14px">' + li + '</ul><p class="cv-note">General information only, not investment advice or a recommendation. PMS and AIF carry higher risk and are not suitable for every investor. ' + DISC + '</p><p style="margin-top:16px"><button type="button" class="btn btn-primary" data-open="book">Discuss these options</button> <button type="button" class="btn btn-ghost" id="rs">Start again</button></p>';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-a]'); if (a) { ans.push(+a.dataset.a); scr(); }
    if (e.target.id === 'rs') { ans = []; scr(); }
  }); if (anchor) scr();

  /* sticky bar */
  var bar = document.createElement('div'); bar.className = 'cv-bar';
  bar.innerHTML = '<button type="button" id="cvwa">Chat on WhatsApp</button><button type="button" data-open="callback">Request Call Back</button>';
  document.body.appendChild(bar);
  $('#cvwa').addEventListener('click', function () { window.open(wa('Hello AGM Wealth, I would like to explore starting an investment portfolio.'), '_blank'); });
      /* ---- header links, NRI card, calculators, insights ---- */
  var nav = $('#main-nav');
  if (nav) {
    var calc = $('a[href="calculators.html"]', nav);
    if (calc && !$('a[href="cas-analyzer.html"]', nav)) {
      calc.insertAdjacentHTML('afterend', '<a href="cas-analyzer.html">Portfolio Analyzer</a>');
    }
  }


  var more = $('a.btn-text[href="solutions.html"]');
  if (more && anchor) more.insertAdjacentHTML('beforebegin', '<div class="cv-nri"><h3>NRI Investors</h3><p>Mutual funds and PMS for eligible NRIs across the GCC, UK, Singapore and other regions, subject to FEMA guidelines and each provider’s eligibility rules. US and Canada-resident investors can invest with select fund houses that accept online investments from these countries, subject to FATCA compliance, additional documentation and each fund house’s own conditions. Digital onboarding from anywhere.</p></div>');
  $$('.calc-card').forEach(function (c) {
    if (!c.querySelector('[id^=sip-],[id^=ls-],[id^=ret-],[id^=goal-]')) return;
    var p = document.createElement('p'); p.style.marginTop = '18px';
    p.innerHTML = '<button type="button" class="btn btn-primary">Discuss These Numbers with AGM Wealth</button>';
    c.appendChild(p);
    p.firstChild.addEventListener('click', function () {
      var t = (c.querySelector('h2,h3') || {}).textContent || 'calculator', parts = [];
      $$('.calc-result-num', c).forEach(function (n) { var l = n.previousElementSibling; parts.push((l ? l.textContent.trim() + ': ' : '') + n.textContent.trim()); });
      window.open(wa('Hi Kamlesh, I calculated an investment on your website (' + t.trim() + '): ' + parts.join('; ') + '. I would like to start onboarding.'), '_blank');
    });
  });
  var ft = $('footer.site-footer');
  if (/insights/.test(location.pathname) && ft) ft.insertAdjacentHTML('beforebegin', '<section class="cv-sec cv-alt"><div class="container"><p style="max-width:60ch">Have a question about how market trends affect your family’s portfolio?</p><p style="margin-top:14px"><a class="btn btn-gold" href="' + wa('Hi Kamlesh, I read your insights and have a question about my portfolio.') + '" target="_blank" rel="noopener">Discuss with Kamlesh on WhatsApp &#8599;</a></p></div></section>');
})();
