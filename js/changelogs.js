/* PixelPulse — changelogs.js: renders the "changelogs" collection as a timeline */

function changelogItemHtml(c) {
  return (
    '<div class="timeline-item">' +
      '<span class="version">v' + escapeHtml(c.version || '—') +
        '<span class="date">' + formatDate(c.createdAt) + '</span></span>' +
      '<h3>' + escapeHtml(c.title) + '</h3>' +
      '<p class="content">' + parseDiscordMarkdown(c.content || '') + '</p>' +
      (c.authorName ? '<div class="author">Posted by ' + escapeHtml(c.authorName) + '</div>' : '') +
    '</div>'
  );
}

async function renderChangelogs(targetId, limit) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = loadingRowHtml();

  try {
    let query = db.collection('changelogs').orderBy('createdAt', 'desc');
    if (limit) query = query.limit(limit);
    const snap = await query.get();

    if (snap.empty) {
      target.innerHTML = emptyStateHtml('No changelog entries yet.');
      return;
    }
    target.innerHTML = '<div class="timeline">' +
      snap.docs.map(function (doc) { return changelogItemHtml(doc.data()); }).join('') +
      '</div>';
  } catch (err) {
    console.error('PixelPulse: failed to load changelogs', err);
    target.innerHTML = errorStateHtml('Could not load the changelog right now.');
  }
}
