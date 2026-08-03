/* PixelPulse — admin.js: staff-only content management (add + delete) */

document.addEventListener('DOMContentLoaded', function () {
  const gate = document.getElementById('admin-gate');
  const content = document.getElementById('admin-content');

  onAuthReady(function (user, profile) {
    const staff = user && profile && profile.role === 'staff';

    if (!staff) {
      if (gate) gate.classList.remove('hidden');
      if (content) content.classList.add('hidden');
      return;
    }

    if (gate) gate.classList.add('hidden');
    if (content) content.classList.remove('hidden');

    initTabs();
    initAddonForm(user, profile);
    initChangelogForm(user, profile);
    initAnnouncementForm(user, profile);
    loadManageList('addons', 'manage-addons', addonRow);
    loadManageList('changelogs', 'manage-changelogs', changelogRow);
    loadManageList('announcements', 'manage-announcements', announcementRow);
  });
});

function initTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(function (p) { p.classList.remove('active'); });
      const panel = document.getElementById(tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ------------------------------------------------------- addon form --- */
function initAddonForm(user, profile) {
  const form = document.getElementById('addon-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('addon-msg');
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await db.collection('addons').add({
        name: document.getElementById('a-name').value.trim(),
        description: document.getElementById('a-desc').value.trim(),
        category: document.getElementById('a-category').value.trim(),
        version: document.getElementById('a-version').value.trim(),
        imageUrl: document.getElementById('a-image').value.trim(),
        downloadUrl: document.getElementById('a-download').value.trim(),
        createdBy: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      form.reset();
      showFormMsg(msg, 'Addon posted.', 'success');
      loadManageList('addons', 'manage-addons', addonRow);
    } catch (err) {
      showFormMsg(msg, err.message, 'error');
    }
    btn.disabled = false;
  });
}

/* --------------------------------------------------- changelog form --- */
function initChangelogForm(user, profile) {
  const form = document.getElementById('changelog-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('changelog-msg');
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await db.collection('changelogs').add({
        title: document.getElementById('c-title').value.trim(),
        version: document.getElementById('c-version').value.trim(),
        content: document.getElementById('c-content').value.trim(),
        authorName: (profile && profile.displayName) || user.email,
        authorId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      form.reset();
      showFormMsg(msg, 'Changelog entry posted.', 'success');
      loadManageList('changelogs', 'manage-changelogs', changelogRow);
    } catch (err) {
      showFormMsg(msg, err.message, 'error');
    }
    btn.disabled = false;
  });
}

/* ------------------------------------------------ announcement form --- */
function initAnnouncementForm(user, profile) {
  const form = document.getElementById('announcement-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('announcement-msg');
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await db.collection('announcements').add({
        title: document.getElementById('n-title').value.trim(),
        content: document.getElementById('n-content').value.trim(),
        pinned: document.getElementById('n-pinned').checked,
        authorName: (profile && profile.displayName) || user.email,
        authorId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      form.reset();
      showFormMsg(msg, 'Announcement posted.', 'success');
      loadManageList('announcements', 'manage-announcements', announcementRow);
    } catch (err) {
      showFormMsg(msg, err.message, 'error');
    }
    btn.disabled = false;
  });
}

/* -------------------------------------------------------- manage list */
function manageRowHtml(id, col, title, meta) {
  return (
    '<div class="manage-row">' +
      '<div class="info"><h4>' + escapeHtml(title) + '</h4><span>' + escapeHtml(meta) + '</span></div>' +
      '<div class="actions"><button class="btn btn-danger btn-sm" data-action="delete" data-col="' + col + '" data-id="' + id + '" type="button">Delete</button></div>' +
    '</div>'
  );
}

function addonRow(id, a) {
  return manageRowHtml(id, 'addons', a.name, 'v' + (a.version || '1.0') + (a.category ? ' · ' + a.category : ''));
}
function changelogRow(id, c) {
  return manageRowHtml(id, 'changelogs', c.title, 'v' + (c.version || '—') + ' · ' + formatDate(c.createdAt));
}
function announcementRow(id, a) {
  return manageRowHtml(id, 'announcements', a.title, (a.pinned ? 'Pinned · ' : '') + formatDate(a.createdAt));
}

async function loadManageList(collectionName, targetId, rowFn) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = loadingRowHtml();
  try {
    const snap = await db.collection(collectionName).orderBy('createdAt', 'desc').get();
    if (snap.empty) {
      target.innerHTML = emptyStateHtml('Nothing here yet.');
      return;
    }
    target.innerHTML = snap.docs.map(function (doc) { return rowFn(doc.id, doc.data()); }).join('');
  } catch (err) {
    console.error('PixelPulse: failed to load ' + collectionName, err);
    target.innerHTML = errorStateHtml('Could not load this list.');
  }
}

document.addEventListener('click', async function (e) {
  const btn = e.target.closest('[data-action="delete"]');
  if (!btn) return;
  const col = btn.dataset.col;
  const id = btn.dataset.id;
  if (!confirm('Delete this entry? This cannot be undone.')) return;
  btn.disabled = true;
  try {
    await db.collection(col).doc(id).delete();
    btn.closest('.manage-row').remove();
  } catch (err) {
    alert('Could not delete: ' + err.message);
    btn.disabled = false;
  }
});
