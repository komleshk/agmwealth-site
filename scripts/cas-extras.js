/* AGM Wealth - CAS analyzer extras: help accordion + lead card */
(function () {
  var up = document.getElementById('uploadPanel'), rep = document.getElementById('report');
  if (!up || !rep) return;
  var wa = function (t) { return 'https://wa.me/918875050447?text=' + encodeURIComponent(t); };
  var btn = 'display:inline-block;padding:11px 18px;margin:6px 8px 0 0;border-radius:4px;font-weight:600;text-decoration:none;border:1.5px solid #394E47;';
  var acc = document.createElement('details');
  acc.style.cssText = 'margin:16px 0;padding:12px 16px;border:1px solid #d9d4c4;border-radius:4px;background:#fff';
  acc.innerHTML = '<summary style="cursor:pointer;font-weight:600;color:#394E47">Need help getting your statement? (Click to view steps)</summary><ol style="margin:12px 0 0 20px;line-height:1.7"><li>Visit CAMS Online (camsonline.com) or KFintech (kfintech.com) and request a Consolidated Account Statement (Summary).</li><li>Enter your registered email address and PAN.</li><li>Open the emailed PDF using your PAN (in CAPITAL letters) as the password, and upload it here.</li><li>Parsing runs 100% locally in your browser. Your statement and password are never sent to any server.</li></ol>';
  (document.getElementById('drop') || up).insertAdjacentElement('afterend', acc);
  var card = document.createElement('div');
  card.style.cssText = 'margin:24px 0;padding:24px;border:1px solid #d9d4c4;border-left:4px solid #C99A24;border-radius:4px;background:#fbf6e8';
  card.innerHTML = '<h2 style="margin:0 0 8px;color:#394E47;font-size:1.3rem">Want a Professional Review of This Portfolio?</h2><p style="margin:0 0 10px;max-width:62ch">Get your scheme overlap, category spread and fund-wise holdings reviewed by Kamlesh Mandowara (19+ years in banking and financial services).</p>' +
    '<a style="' + btn + 'background:#394E47;color:#fff" target="_blank" rel="noopener" href="' + wa('Hi Kamlesh, I analyzed my portfolio on your website and would like to discuss a portfolio review.') + '">Discuss Report on WhatsApp &#8599;</a>' +
    '<a style="' + btn + 'background:#fff;color:#394E47" target="_blank" rel="noopener" href="' + wa('Hi Kamlesh, I analyzed my portfolio on your website and would like to book a 15-minute call.') + '">Book a 15-Min Call &#8599;</a>';
  function sync() {
    var show = !rep.classList.contains('hidden') && rep.children.length > 0;
    if (show && !card.parentNode) rep.insertAdjacentElement('afterend', card);
    if (!show && card.parentNode) card.remove();
  }
  new MutationObserver(sync).observe(rep, { attributes: true, childList: true });
  sync();
})();
