// AGM Wealth - renders editable content (Insights articles, testimonials)
// from /content/*.json at page load, so non-technical edits made through
// the CMS admin panel show up without needing a rebuild step.

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function renderInsights() {
  const container = document.getElementById('insights-articles');
  if (!container) return;
  try {
    const res = await fetch('content/insights.json', { cache: 'no-store' });
    const data = await res.json();
    const articles = data.articles || [];
    container.innerHTML = articles.map(function (a, i) {
      const bodyHtml = (a.body || []).map(function (p) { return '<p>' + escapeHtml(p) + '</p>'; }).join('');
      const divider = i > 0 ? '<div class="ledger-rule"></div>' : '';
      return (
        divider +
        '<article>' +
        '<span class="eyebrow">' + escapeHtml(a.category || '') + '</span>' +
        '<h2 style="font-size:1.9rem;">' + escapeHtml(a.title || '') + '</h2>' +
        bodyHtml +
        '<p style="font-size:0.85rem; color:var(--text-muted);">' + escapeHtml(a.disclaimer || '') + '</p>' +
        '</article>'
      );
    }).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:var(--text-muted);">Articles are loading - if this message persists, please refresh the page.</p>';
  }
}

async function renderTestimonials() {
  const container = document.getElementById('testimonials-grid');
  if (!container) return;
  try {
    const res = await fetch('content/testimonials.json', { cache: 'no-store' });
    const data = await res.json();
    const testimonials = data.testimonials || [];
    container.innerHTML = testimonials.map(function (t) {
      return (
        '<div class="testi-card">' +
        '<p>"' + escapeHtml(t.quote || '') + '"</p>' +
        '<div class="testi-name">- ' + escapeHtml(t.name || '') + '</div>' +
        '<div class="testi-meta">' + escapeHtml(t.meta || '') + '</div>' +
        '</div>'
      );
    }).join('');
  } catch (e) {
    // Leave any static fallback content in place if the fetch fails
  }
}

document.addEventListener('DOMContentLoaded', function () {
  renderInsights();
  renderTestimonials();
});
