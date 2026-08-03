/* PixelPulse — shared helpers. Load this before auth.js / addons.js / etc. */

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, function (c) { return HTML_ESCAPES[c]; });
}

function formatDate(ts) {
  if (!ts) return '';
  const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function safeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  return /^https:\/\//i.test(trimmed) || /^http:\/\//i.test(trimmed) ? trimmed : '';
}

function loadingRowHtml() {
  return '<div class="loading-row"><div class="sq"></div><div class="sq"></div><div class="sq"></div><div class="sq"></div></div>';
}

function emptyStateHtml(message) {
  return '<div class="empty-state">' + escapeHtml(message) + '</div>';
}

function errorStateHtml(message) {
  return '<div class="empty-state">' + escapeHtml(message) + '</div>';
}
