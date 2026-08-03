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
  let html = escapeHtml(text);

  // 1. Code Blocks: ```text```
  html = html.replace(/```([\s\S]*?)```/g, '<div style="background: var(--bg-alt); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.85rem; margin: 10px 0;">$1</div>');

  // 2. Inline Code: `text`
  html = html.replace(/`([^`]+)`/g, '<span style="background: var(--bg-alt); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);">$1</span>');

  // 3. Headings: #, ##, ###
  html = html.replace(/^### (.*$)/gim, '<h4 style="margin-top: 16px; margin-bottom: 8px; color: var(--text);">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 style="margin-top: 16px; margin-bottom: 8px; color: var(--text);">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 style="margin-top: 16px; margin-bottom: 8px; color: var(--text);">$1</h2>');

  // 4. Blockquotes: > text
  html = html.replace(/^> (.*$)/gim, '<div style="border-left: 3px solid var(--pulse); padding-left: 12px; margin: 8px 0; color: var(--text-dim);">$1</div>');

  // 5. Bullet Points: - example OR * example
  html = html.replace(/^[\-\*] (.*$)/gim, '<div style="padding-left: 18px; position: relative; margin: 4px 0;"><span style="position: absolute; left: 4px; color: var(--pulse);">•</span>$1</div>');

  // 6. Text Formatting: **Bold**, __Underline__, *Italics*, ~~Strikethrough~~
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<u>$1</u>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // 7. Discord Mentions: <@123...> or <@&123...>
  html = html.replace(/<@&?(\d+)>/g, '<span style="color: var(--pulse); background: var(--pulse-soft); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem;">@Mention</span>');

  // 8. Convert remaining new lines so text never squishes together
  html = html.replace(/<\/div>\n/g, '</div>');
  html = html.replace(/\n/g, '<br>');

  return html;
}

