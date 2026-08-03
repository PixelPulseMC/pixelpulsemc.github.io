/* PixelPulse — addons.js: renders addon cards from the "addons" collection */

function addonCardHtml(a) {
  const imgUrl = safeUrl(a.imageUrl);
  const dlUrl = safeUrl(a.downloadUrl);
  const img = imgUrl
    ? '<img src="' + escapeHtml(imgUrl) + '" alt="' + escapeHtml(a.name) + '" loading="lazy">'
    : '<span class="ph">No preview image</span>';
  const tag = a.category
    ? '<div class="tag-row"><span class="tag">' + escapeHtml(a.category) + '</span></div>'
    : '';
  const download = dlUrl
    ? '<a class="btn btn-primary btn-sm" href="' + escapeHtml(dlUrl) + '" target="_blank" rel="noopener">Download</a>'
    : '<span class="btn btn-ghost btn-sm" style="opacity:.5">Link coming soon</span>';

  return (
    '<article class="card addon-card notched">' +
      '<div class="thumb">' + img + '</div>' +
      '<div class="body">' +
        '<h3>' + escapeHtml(a.name) + '</h3>' +
        '<p class="desc">' + escapeHtml(a.description || '') + '</p>' +
        tag +
        '<div class="meta"><span>v' + escapeHtml(a.version || '1.0') + '</span><span>' + formatDate(a.createdAt) + '</span></div>' +
        '<div class="foot">' + download + '</div>' +
      '</div>' +
    '</article>'
  );
}

async function renderAddons(targetId, limit) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = loadingRowHtml();

  try {
    let query = db.collection('addons').orderBy('createdAt', 'desc');
    if (limit) query = query.limit(limit);
    const snap = await query.get();

    if (snap.empty) {
      target.innerHTML = emptyStateHtml('No addons posted yet. Check back soon.');
      return;
    }
    target.innerHTML = snap.docs.map(function (doc) { return addonCardHtml(doc.data()); }).join('');
  } catch (err) {
    console.error('PixelPulse: failed to load addons', err);
    target.innerHTML = errorStateHtml('Could not load addons right now.');
  }
}
