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
  var consent = '<label class="chk"><input type="checkbox" name="consent" required><span>I agree to AGM Wealth contacting me about this request, as per the <a href="privacy-policy.html">Privacy Policy</a>.</span></label>';
  var FORMS = {
    lead: {
      btn: 'Request Review',
      fields:
        inp('name', 'Full Name', 'text', 'name') +
        inp('phone', 'Mobile Number (WhatsApp preferred)', 'tel', 'tel') +
        inp('email', 'Email Address', 'email', 'email') +
        sel('portfolio_size', 'Approximate Portfolio Size', SIZES) +
        inp('city', 'City', 'text', 'address-level2') +
        '<label>Specific questions or notes (optional)<textarea name="notes" rows="2" placeholder="e.g. Existing funds with ICICI / HDFC, need overlap check"></textarea></label>' +
        consent
    },
    callback: {
      btn: 'Request Callback',
      fields:
        inp('name', 'Full Name', 'text', 'name') +
        inp('phone', 'Phone Number', 'tel', 'tel') +
        '<label>Preferred time<input name="preferred_time" type="text" placeholder="e.g. Tomorrow 4 PM, or Weekday evenings" required><small class="err"></small></label>' +
        consent
    },
    book: {
      btn: 'Request This Slot',
      fields:
        inp('name', 'Full Name', 'text', 'name') +
        inp('phone', 'Mobile (WhatsApp)', 'tel', 'tel') +
        inp('email', 'Email Address', 'email', 'email') +
        '<label>Preferred date<input name="date" type="date" min="' + today + '" required><small class="err"></small></label>' +
        sel('slot', 'Time of day', ['Morning (10:00 – 12:00)', 'Afternoon (14:00 – 16:00)', 'Evening (17:00 – 19:00)']) +
        sel('meeting_mode', 'Mode', MODES) +
        consent
    },
    onboard: {
      btn: 'Continue to Step 2',
      fields:
        '<div data-step="1">' +
          inp('name', 'Full Name (as per PAN)', 'text', 'name') +
          inp('phone', 'Mobile (linked to Aadhaar)', 'tel', 'tel') +
          inp('email', 'Email Address', 'email', 'email') +
          inp('city', 'City / Location', 'text', 'address-level2') +
          sel('resident_status', 'Resident Status', ['Resident Indian', 'NRI (GCC / UAE)', 'NRI (US / Canada)', 'NRI (UK / Europe)', 'NRI (Singapore / Other)']) +
          consent +
        '</div>' +
        '<div data-step="2" hidden>' +
          '<p class="cv-note">Step 2 of 2: KYC Readiness (optional, saves time later)</p>' +
          '<label>Do you have a KRA-compliant Mutual Fund KYC?<select name="kyc_status"><option value="unknown">Not sure</option><option value="yes">Yes, already KYC compliant</option><option value="no">No, need fresh KYC</option></select></label>' +
          '<label>PAN Number (optional, helps verify existing KYC)<input name="pan" type="text" placeholder="ABCDE1234F" style="text-transform:uppercase" maxlength="10"></label>' +
          '<label>Primary investment objective<select name="goal"><option value="">Select</option><option>Start a new monthly SIP</option><option>Lump sum mutual fund purchase</option><option>Explore PMS / AIF strategies</option><option>Portfolio restructuring / consolidation</option></select></label>' +
        '</div>'
    }
  };

  function formHTML(k) { var d = FORMS[k]; return '<form class="cv-form" data-kind="' + k + '" novalidate><input type="hidden" name="form_name" value="' + k + '"><input type="text" name="website" class="hp" tabindex="-1" autocomplete="off">' + d.fields + '<button type="submit" class="btn btn-primary">' + d.btn + '</button></form>'; }

  function check(scope) {
    var ok = true;
    $$('input:not(.hp),select', scope).forEach(function (el) {
      if (el.offsetParent === null) return;
      var err = el.parentElement.querySelector('.err');
      var val = (el.value || '').trim();
      var bad = el.required && (!val || (el.type === 'checkbox' && !el.checked));
      if (!bad && el.type === 'email' && val) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!bad && el.type === 'tel' && val) bad = !/^[0-9+() -]{8,15}$/.test(val);
      if (bad) { ok = false; el.classList.add('bad'); if (err) err.textContent = 'Please check this field'; }
      else { el.classList.remove('bad'); if (err) err.textContent = ''; }
    });
    return ok;
  }

  function done(form, k, link) {
    var title = k === 'onboard' ? 'Onboarding Request Received' : 'Thank You';
    var text = k === 'onboard'
      ? (link ? 'Your account opening request is recorded. Click below to proceed with digital KYC.' : 'Your request is recorded. A member of our Jaipur team will verify your KYC readiness and send your paperless onboarding link over WhatsApp within 1 business day.')
      : (k === 'callback' ? 'We have received your callback request and will reach out at your preferred time.' : 'We have received your request and will be in touch shortly.');
    var cta = link ? '<p style="margin-top:16px"><a class="btn btn-primary" href="' + link + '" target="_blank" rel="noopener">Continue to KYC &rarr;</a></p>' : '';
    form.innerHTML = '<div class="cv-done"><h3>' + title + '</h3><p>' + text + '</p>' + cta + '</div>';
  }

  document.addEventListener('submit', function (ev) {
    var form = ev.target.closest('.cv-form'); if (!form) return;
    ev.preventDefault();
    var k = form.getAttribute('data-kind');
    if (k === 'onboard') {
      var s1 = $('[data-step="1"]', form), s2 = $('[data-step="2"]', form), btn = $('button[type=submit]', form);
      if (s2 && s2.hidden) {
        if (!check(s1)) return;
        s1.hidden = true; s2.hidden = false; btn.textContent = 'Submit Onboarding Request'; return;
      }
    }
    if (!check(form)) return;
    var data = {}; new FormData(form).forEach(function (v, n) { if (n !== 'website' && n !== 'consent') data[n] = v; });
    if (form.querySelector('[name=website]').value) return; // honeypot
    var msg = 'Hello AGM Wealth, ' + ({ lead: 'I would like a portfolio review.', callback: 'please call me back.', book: 'I would like to book a 15-minute conversation.', onboard: 'I would like to start paperless onboarding.' }[k] || '') + '\n' + Object.keys(data).map(function (x) { return x + ': ' + data[x]; }).join('\n');
    if (!EP()) { window.open(wa(msg), '_blank'); done(form, k, CFG.kycLink); return; }
    var b = $('button[type=submit]', form); b.disabled = true; b.textContent = 'Sending…';
    var payload = CFG.accessKey ? {
      access_key: CFG.accessKey,
      subject: 'AGM Wealth: New ' + k + ' request (' + (data.name || 'Visitor') + ')',
      from_name: 'AGM Wealth Website',
      ...data
    } : data;
    fetch(EP(), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw 0; done(form, k, CFG.kycLink); })
      .catch(function () { b.disabled = false; b.textContent = FORMS[k].btn; alert('Could not send right now. Opening WhatsApp instead.'); window.open(wa(msg), '_blank'); done(form, k, CFG.kycLink); });
  });

  /* ---------- modal ---------- */
  var dlg = document.createElement('div'); dlg.className = 'cv-modal'; dlg.hidden = true;
  dlg.innerHTML = '<button class="x" aria-label="Close" type="button">&times;</button><div class="b"></div>';
  document.body.appendChild(dlg);
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('x')) dlg.hidden = true; });

  var STORES = function () {
    return '<div class="cv-stores-wrap">' +
      '<a class="cv-store-badge" href="' + CFG.playLink + '" target="_blank" rel="noopener">' +
        '<svg width="22" height="24" viewBox="0 0 24 24" fill="none"><path d="M3.609 1.814L13.793 12 3.609 22.186c-.368-.37-.59-.893-.59-1.474V3.288c0-.581.222-1.104.59-1.474z" fill="#00E676"/><path d="M17.186 8.607L13.793 12l3.393 3.393 3.824-2.193c.773-.443.773-1.957 0-2.4L17.186 8.607z" fill="#FFD600"/><path d="M3.609 1.814L13.793 12 17.186 8.607 5.787 2.067c-.672-.385-1.517-.282-2.178-.253z" fill="#00B0FF"/><path d="M3.609 22.186L13.793 12l3.393 3.393-11.399 6.54c-.661.029-1.506.132-2.178-.253z" fill="#FF3D00"/></svg>' +
        '<span class="cv-store-txt"><small>GET IT ON</small><strong>Google Play</strong></span>' +
      '</a>' +
      '<a class="cv-store-badge" href="' + CFG.iosLink + '" target="_blank" rel="noopener">' +
        '<svg width="22" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.87-.9.04-2 0.6-2.64 1.35-.56.64-.99 1.7-0.92 2.76 1.01.08 2.01-.49 2.63-1.24z"/></svg>' +
        '<span class="cv-store-txt"><small>Download on the</small><strong>App Store</strong></span>' +
      '</a>' +
    '</div>';
  };

  function appModal() {
    $('.b', dlg).innerHTML = '<h3 style="font:700 1.35rem var(--font-display);color:var(--ink-900);margin:0 0 6px">Get the AGM Wealth App</h3><p class="cv-note" style="margin:0 0 18px">Open your account securely and track your portfolio from your phone.</p>' +
      '<div style="text-align:center"><img src="assets/app-qr.png" alt="Scan to download AGM Wealth app" width="200" height="200" style="border:1px solid var(--line);border-radius:12px;padding:8px;background:#fff">' +
      '<p style="font-size:0
