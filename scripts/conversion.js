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
  var STORES = function () {
  return '<div class="cv-stores-wrap">' +
    '<a class="cv-store-badge" href="' + CFG.playLink + '" target="_blank" rel="noopener">' +
      '<svg width="22" height="24" viewBox="0 0 24 24" fill="none"><path d="M3.609 1.814L13.793 12 3.609 22.186c-.368-.37-.59-.893-.59-1.474V3.288c0-.581.222-1.104.59-1.474z" fill="#00E676"/><path d="M17.186 8.607L13.793 12l3.393 3.393 3.824-2.193c.773-.443.773-1.957 0-2.4L17.186 8.607z" fill="#FFD600"/><path d="M3.609 1.814L13.793 12 17.186 8.607 5.787 2.067c-.672-.385-1.517-.282-2.178-.253z" fill="#00B0FF"/><path d="M3.609 22.186L13.793 12l3.393 3.393-11.399 6.54c-.661.029-1.506.132-2.178-.253z" fill="#FF3D00"/></svg>' +
      '<span class="cv-store-txt"><small>GET IT ON</small><strong>Google Play</strong></span>' +
    '</a>' +
    '<a class="cv-store-badge" href="' + CFG.iosLink + '" target="_blank" rel="noopener">' +
      '<svg width="22" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1.01.08 2.01-.49 2.63-1.24z"/></svg>' +
      '<span class="cv-store-txt"><small>Download on the</small><strong>App Store</strong></span>' +
    '</a>' +
  '</div>';
};

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

  '<section class="cv-sec" id="founder"><div class="container cv-founder"><img class="cv-photo" src="assets/kamlesh-founder.jpg" alt="Kamlesh Mandowara, founder of AGM Wealth" width="160" height="160"><div><h2>Kamlesh Mandowara</h2>' +
  '<p style="max-width:62ch">Founder, AGM Wealth. <strong>25+ years of total professional experience</strong>, including <strong>19+ years in banking and financial services</strong> (former Investment Specialist at ICICI Bank Wealth and Branch Manager at Kotak Mahindra Bank). Prior to banking, spent 6+ years in the pharmaceutical sector.</p>' +
  '<blockquote>Wealth is preserved by patience and process. Our job is to keep you clear on what you own, why you own it and what it costs.</blockquote>' +
  '<p style="margin:16px 0 20px;"><a href="about.html#founder-journey" class="btn btn-ghost" style="padding:8px 18px; font-size:0.88rem; display:inline-flex; align-items:center; gap:6px; text-decoration:none;">Meet the Founder &amp; Full Career Journey &rarr;</a></p>' +
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

  
  // Enhance store-btn links with SVG icons if not already present
  $$('.store-btn').forEach(function (btn) {
    if (btn.querySelector('svg')) return;
    var isPlay = /play\.google\.com/i.test(btn.href);
    var isIos = /apps\.apple\.com/i.test(btn.href);
    if (isPlay) {
      btn.insertAdjacentHTML('afterbegin', '<svg width="22" height="24" viewBox="0 0 24 24" fill="none" style="flex-shrink:0; margin-right:8px;"><path d="M3.609 1.814L13.793 12 3.609 22.186c-.368-.37-.59-.893-.59-1.474V3.288c0-.581.222-1.104.59-1.474z" fill="#00E676"/><path d="M17.186 8.607L13.793 12l3.393 3.393 3.824-2.193c.773-.443.773-1.957 0-2.4L17.186 8.607z" fill="#FFD600"/><path d="M3.609 1.814L13.793 12 17.186 8.607 5.787 2.067c-.672-.385-1.517-.282-2.178-.253z" fill="#00B0FF"/><path d="M3.609 22.186L13.793 12l3.393 3.393-11.399 6.54c-.661.029-1.506.132-2.178-.253z" fill="#FF3D00"/></svg>');
    } else if (isIos) {
      btn.insertAdjacentHTML('afterbegin', '<svg width="22" height="24" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0; margin-right:8px;"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.87-.9.04-2 0.6-2.64 1.35-.56.64-.99 1.7-0.92 2.76 1.01.08 2.01-.49 2.63-1.24z"/></svg>');
    }
  });

    /* Sticky Action Bar (Option 2: Recognizable Solid Icons) */
  var bar = document.createElement('div');
  bar.className = 'cv-bar';
  bar.innerHTML =
    '<a href="' + wa('Hello AGM Wealth, I would like to explore starting an investment portfolio.') + '" class="cv-btn cv-btn-wa" target="_blank" rel="noopener" aria-label="WhatsApp">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.05-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.212 8.212 0 0 1-1.26-4.47c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.53c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.12-.14.17-.25.25-.41.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3z"/></svg>' +
      '<span>WhatsApp</span>' +
    '</a>' +
    '<a href="tel:+918875050447" class="cv-btn cv-btn-call" aria-label="Call AGM Wealth">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.053 15.053 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.57 3.99c0-.55-.45-1-1-1H4.06c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.48c0-.55-.45-1-.05-1.13z"/></svg>' +
      '<span>Call</span>' +
    '</a>' +
    '<button type="button" data-open="callback" class="cv-btn cv-btn-cb" aria-label="Request Callback">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 0 0-1.02.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM18 2h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.59l-4.3 4.29a.996.996 0 1 0 1.41 1.41L18 5.41V7c0 .55.45 1 1 1s1-.45 1-1V3c0-.55-.45-1-1-1z"/></svg>' +
      '<span class="cv-long">Request Callback</span><span class="cv-short">Call back</span>' +
    '</button>';
  document.body.appendChild(bar);

  var cvwaEl = $('#cvwa');
  if (cvwaEl) {
    cvwaEl.addEventListener('click', function () {
      window.open(wa('Hello AGM Wealth, I would like to explore starting an investment portfolio.'), '_blank');
    });
  }

  var nav = $('#main-nav');
  if (nav) {
    var calc = $('a[href="calculators.html"]', nav);
    if (calc && !$('a[href="cas-analyzer.html"]', nav)) calc.insertAdjacentHTML('afterend', '<a href="cas-analyzer.html">Portfolio Analyzer</a>');
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

  /* ---- v2: numbers row, offerings, disclaimer pop-up, statutory footer ---- */
  var STATS = [['2017', 'Founded'], ['19+', 'Years in banking & financial services'], ['Global', 'Clients in India and abroad']]; // add families / fund houses here when you decide to publish them
  var hero = $('section.hero-ledger');
  if (hero) hero.insertAdjacentHTML('afterend', '<section class="cv-numbers"><div class="container">' + STATS.map(function (s) { return '<div><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('') + '</div></section>');
  var OFF = [
    ['Grow', 'Mutual Funds', 'mutual-funds', 'Equity, debt and hybrid schemes from many fund houses, through SIPs or lump sums.'],
    ['Managed', 'Portfolio Management (PMS)', 'pms', 'Professionally managed portfolios for eligible investors, from ₹50 lakh.'],
    ['Alternatives', 'Alternative Investment Funds', 'aif', 'Category I, II and III funds for eligible investors, from ₹1 crore.'],
    ['Specialised', 'Specialised Investment Funds', 'sif', 'A step between mutual funds and PMS, for investors who understand the added complexity.'],
    ['Income', 'Bonds & NCDs', 'bonds', 'New NCD issues and secondary-market bonds, with rating and issuer details shared up front.'],
    ['Deposits', 'Fixed Deposits', 'fixed-deposits', 'Deposits from leading NBFCs and small finance banks.'],
    ['Liquidity', 'Loan Against Securities', 'loan-against-securities', 'Borrow against eligible holdings instead of selling them, through our platform partner.'],
    ['Protection', 'Insurance', 'life-insurance', 'Life, health and general cover from our insurer partners. Insurance is the subject matter of solicitation.']
  ];
  var apr = $('#approach');
  if (apr) apr.insertAdjacentHTML('afterend', '<section class="cv-sec" id="offerings"><div class="container"><h2>Everything we offer, in one place</h2><p class="cv-sub">Each page explains what the product is, who it may suit, what to weigh up and the risks involved.</p><div class="cv-offgrid">' +
    OFF.map(function (o) { return '<a class="cv-off" href="solutions.html#' + o[2] + '"><small>' + o[0] + '</small><h3>' + o[1] + '</h3><p>' + o[3] + '</p><span>Learn more &rarr;</span></a>'; }).join('') + '</div></div></section>');
  var legal = '<h4>Market risk</h4><p>Mutual fund investments are subject to market risks. Read all scheme related documents carefully before investing. Past performance is not indicative of future results.</p>' +
    '<h4>Who we are</h4><p>AGM Wealth is an AMFI-registered Mutual Fund Distributor (ARN-124172) and an APMI-registered PMS Distributor (APRN 00099). We also distribute AIF and SIF products and insurance through insurer agency codes, and facilitate bonds, fixed deposits and loans against securities offered by third-party issuers and lenders. We earn commission from product providers; see our Commission Disclosures page.</p>' +
    '<h4>What we do not do</h4><p>We are not a SEBI-registered Investment Adviser, Research Analyst or Portfolio Manager. Nothing here should be read as advice, a recommendation or an offer.</p>' +
    '<h4>Your money</h4><p>Pay only to the AMC, issuer or insurer, in your own name. Never transfer money to an individual&rsquo;s account, and never share passwords or OTPs.</p>';
  var seen; try { seen = localStorage.getItem('agm-disc'); } catch (e) {}
  if (!seen && !/risk-disclaimer|privacy|terms-of-use/.test(location.pathname)) {
    var d2 = document.createElement('dialog'); d2.id = 'agm-disc';
    d2.innerHTML = '<h3>Before you browse</h3><p class="cv-note" style="margin:0 0 14px">A few things worth knowing before you look around.</p>' + legal + '<p style="margin-top:18px"><button type="button" class="btn btn-primary" id="agm-ok">I understand</button> <a href="risk-disclaimer.html" style="margin-left:12px">Read the full disclaimer</a></p>';
    document.body.appendChild(d2);
    d2.addEventListener('cancel', function (e) { e.preventDefault(); });
    $('#agm-ok').addEventListener('click', function () { try { localStorage.setItem('agm-disc', '1'); } catch (e) {} d2.close(); });
    d2.showModal();
  }
  var foot = $('footer.site-footer');
  if (foot) {
    var stat = '<div class="cv-legal"><div class="container"><h4>Statutory disclosures</h4><p>AGM Wealth is registered with AMFI as a Mutual Fund Distributor (ARN-124172; SIFD-124172 for Specialised Investment Funds) and with APMI as a PMS Distributor (APRN 00099), and distributes AIFs (AIF 124172). Registration with AMFI or APMI and NISM certification do not guarantee the performance of the intermediary or assure returns to investors.</p><p>PMS, AIF and SIF are suitable only for eligible investors and carry higher risk. Bonds, fixed deposits and loans are offered by third-party issuers and lenders under their own terms and credit policies. Insurance is the subject matter of solicitation. Calculators and tools on this website are illustrations, not projections.</p><p>Please verify any distributor&rsquo;s ARN on the AMFI website before you transact. For grievances see our Grievance Redressal page; unresolved complaints can be raised on the SEBI SCORES portal (scores.sebi.gov.in).</p></div></div>';
    var fb = $('.footer-bottom', foot); if (fb) fb.insertAdjacentHTML('beforebegin', stat); else foot.insertAdjacentHTML('beforeend', stat);
  }

  /* ---- v3: promises strip, why families stay, closing call to action ---- */
  var PROMISES = ['AMFI-registered Mutual Fund Distributor · ARN-124172', 'Risks explained before returns', 'We encourage a nominee on every folio', 'Commission disclosed openly', 'Money goes only to the provider, in your name'];
  var num = $('.cv-numbers');
  if (num) { var one = '<div class="cv-strip-set">' + PROMISES.map(function (p) { return '<span>' + p + '</span>'; }).join('') + '</div>'; num.insertAdjacentHTML('afterend', '<div class="cv-strip" aria-label="Our commitments"><div class="cv-strip-track">' + one + one.replace('<div ', '<div aria-hidden="true" ') + '</div></div>'); }
  var off = $('#offerings');
  if (off) off.insertAdjacentHTML('afterend', '<section class="cv-sec cv-alt" id="why"><div class="container"><h2>Why families stay with us</h2><p class="cv-sub">Three habits that have shaped how we work since 2017.</p><div class="cv-why">' +
    '<div class="cv-card"><h3>Founder-led</h3><p>You deal with people who know your family&rsquo;s history, not a call-centre queue.</p></div>' +
    '<div class="cv-card"><h3>Plain language</h3><p>Risks first, returns after, and costs on the table. If a product cannot be explained simply, we say so.</p></div>' +
    '<div class="cv-card"><h3>We stay for the boring parts</h3><p>KYC, nominations, consolidation, transmission and claims: the unglamorous work that matters most later.</p></div></div></div></section>');
  if (foot && !/risk-disclaimer|privacy|terms-of-use/.test(location.pathname) && /index|\/$/.test(location.pathname)) foot.insertAdjacentHTML('beforebegin', '<section class="cv-cta"><div class="container"><h2>Ready for a clear conversation?</h2><p>Talk to us about your investments: on a call, on WhatsApp, or in person in Jaipur.</p><p class="cv-cta-row"><a class="btn btn-gold" target="_blank" rel="noopener" href="' + wa('Hello AGM Wealth, I would like to explore starting an investment portfolio.') + '">Chat on WhatsApp</a><button type="button" class="btn btn-ghost" data-open="callback">Request a call back</button><button type="button" class="btn btn-ghost" data-open="onboard">Start paperless onboarding</button></p></div></section>');
})();

