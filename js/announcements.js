/* PixelPulse — announcements.js: renders the "announcements" collection, pinned first */

function announcementCardHtml(a) {
  return (
    '<article class="announce-card' + (a.pinned ? ' pinned' : '') + '">' +
      '<div class="top-row">' +
        (a.pinned ? '<span class="pin-tag">Pinned</span>' : '') +
        '<h3>' + escapeHtml(a.title) + '</h3>' +
      '</div>' +
      '<p class="content">' + escapeHtml(a.content || '') + '</p>' +
      '<div class="byline">' + escapeHtml(a.authorName || 'Staff') + ' &middot; ' + displayDate(a) + '</div>' +
    '</article>'
  );
}

async function renderAnnouncements(targetId, limit) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = loadingRowHtml();

  try {
    const snap = await db.collection('announcements').orderBy('createdAt', 'desc').get();

    if (snap.empty) {
      target.innerHTML = emptyStateHtml('No announcements yet.');
      return;
    }
    let items = snap.docs.map(function (doc) { return doc.data(); });
    items.sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); });
    if (limit) items = items.slice(0, limit);

    target.innerHTML = items.map(announcementCardHtml).join('');
  } catch (err) {
    console.error('PixelPulse: failed to load announcements', err);
    target.innerHTML = errorStateHtml('Could not load announcements right now.');
  }
}
