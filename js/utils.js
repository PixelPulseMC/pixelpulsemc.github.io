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

function parseDiscordMarkdown(text) {
  if (!text) return '';

  // 1. Clean line breaks (\r\n and \r -> \n)
  let cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Escape HTML for security
  let html = escapeHtml(cleanedText);

  // 3. Code Blocks: ```text```
  html = html.replace(/```([\s\S]*?)```/g, '<div style="background: var(--bg-alt); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.85rem; margin: 10px 0; white-space: pre-wrap;">$1</div>');

  // 4. Inline Code: `text`
  html = html.replace(/`([^`]+)`/g, '<span style="background: var(--bg-alt); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);">$1</span>');

  // 5. Headings: #, ##, ### (handles optional leading spaces)
  html = html.replace(/^\s*###\s+(.*$)/gim, '<h4 style="margin-top: 16px; margin-bottom: 8px; color: var(--text); display: block;">$1</h4>');
  html = html.replace(/^\s*##\s+(.*$)/gim, '<h3 style="margin-top: 18px; margin-bottom: 8px; color: var(--text); display: block;">$1</h3>');
  html = html.replace(/^\s*#\s+(.*$)/gim, '<h2 style="margin-top: 20px; margin-bottom: 10px; color: var(--text); display: block;">$1</h2>');

  // 6. Blockquotes: > text (handles &gt; after escapeHtml)
  html = html.replace(/^\s*(?:&gt;|>)\s?(.*$)/gim, '<div style="border-left: 3px solid var(--pulse); padding-left: 12px; margin: 8px 0; color: var(--text-dim); display: block;">$1</div>');

  // 7. Bullet Points: - example OR * example (handles leading spaces)
  html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<div style="display: block; padding-left: 18px; position: relative; margin: 4px 0;"><span style="position: absolute; left: 4px; color: var(--pulse);">•</span>$1</div>');

  // 8. Text Formatting: **Bold**, __Underline__, *Italics*, ~~Strikethrough~~
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<u>$1</u>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // 9. Discord Mentions: <@123...> or <@&123...> (handles &lt; and &gt;)
  html = html.replace(/(?:&lt;|<)@&?(\d+)(?:&gt;|>)/g, '<span style="color: var(--pulse); background: var(--pulse-soft); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem;">@Mention</span>');

  // 10. Clean up extra breaks after block tags, then convert remaining line breaks into <br>
  html = html.replace(/(<\/h[2-4]>|<\/div>)\n/gi, '$1');
  html = html.replace(/\n/g, '<br>');

  return html;
}
function displayDate(item) {
  return formatDate(item.date || item.createdAt);
}

function toDateInputValue(ts) {
  if (!ts) return '';
  const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

