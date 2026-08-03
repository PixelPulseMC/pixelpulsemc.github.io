/* PixelPulse — admin.js: staff-only content management (create, edit, delete) */

let itemCache = {};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

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

    ['a-date', 'c-date', 'n-date'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el && !el.value) el.value = todayStr();
    });

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

/* --------------------------------------------------- create/edit mode */
function setFormMode(form, editing) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const cancelBtn = form.querySelector('[data-action="cancel-edit"]');
  if (editing) {
    submitBtn.textContent = submitBtn.dataset.editLabel || submitBtn.textContent;
    if (cancelBtn) cancelBtn.classList.remove('hidden');
  } else {
    submitBtn.textContent = submitBtn.dataset.createLabel || submitBtn.textContent;
    if (cancelBtn) cancelBtn.classList.add('hidden');
    form.dataset.editingId = '';
  }
}

function resetToCreateMode(form, dateFieldId) {
  form.reset();
  setFormMode(form, false);
  const dateEl = document.getElementById(dateFieldId);
  if (dateEl) dateEl.value = todayStr();
}

document.addEventListener('click', function (e) {
  const cancelBtn = e.target.closest('[data-action="cancel-edit"]');
  if (!cancelBtn) return;
  const form = cancelBtn.closest('form');
  const dateFieldId = form.id === 'addon-form' ? 'a-date' : form.id === 'changelog-form' ? 'c-date' : 'n-date';
  resetToCreateMode(form, dateFieldId);
});

/* ------------------------------------------------------- addon form --- */
function fillAddonForm(id, a) {
  const form = document.getElementById('addon-form');
  form.dataset.editingId = id;
  document.getElementById('a-name').value = a.name || '';
  document.getElementById('a-desc').value = a.description || '';
  document.getElementById('a-category').value = a.category || '';
  document.getElementById('a-version').value = a.version || '';
  document.getElementById('a-date').value = a.date || toDateInputValue(a.createdAt);
  document.getElementById('a-image').value = a.imageUrl || '';
  document.getElementById('a-download').value = a.downloadUrl || '';
  setFormMode(form, true);
}

function initAddonForm(user, profile) {
  const form = document.getElementById('addon-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('addon-msg');
    const btn = form.querySelector('button[type="submit"]');
    const editingId = form.dataset.editingId;
    btn.disabled = true;
    try {
      const payload = {
        name: document.getElementById('a-name').value.trim(),
        description: document.getElementById('a-desc').value.trim(),
        category: document.getElementById('a-category').value.trim(),
        version: document.getElementById('a-version').value.trim(),
        date: document.getElementById('a-date').value || todayStr(),
        imageUrl: document.getElementById('a-image').value.trim(),
        downloadUrl: document.getElementById('a-download').value.trim()
      };
      if (editingId) {
        await db.collection('addons').doc(editingId).update(payload);
        showFormMsg(msg, 'Addon updated.', 'success');
      } else {
        payload.createdBy = user.uid;
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('addons').add(payload);
        showFormMsg(msg, 'Addon posted.', 'success');
      }
      resetToCreateMode(form, 'a-date');
      loadManageList('addons', 'manage-addons', addonRow);
    } catch (err) {
      showFormMsg(msg, err.message, 'error');
    }
    btn.disabled = false;
  });
}

/* --------------------------------------------------- changelog form --- */
function fillChangelogForm(id, c) {
  const form = document.getElementById('changelog-form');
  form.dataset.editingId = id;
  document.getElementById('c-title').value = c.title || '';
  document.getElementById('c-version').value = c.version || '';
  document.getElementById('c-date').value = c.date || toDateInputValue(c.createdAt);
  document.getElementById('c-content').value = c.content || '';
  setFormMode(form, true);
}

function initChangelogForm(user, profile) {
  const form = document.getElementById('changelog-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('changelog-msg');
    const btn = form.querySelector('button[type="submit"]');
    const editingId = form.dataset.editingId;
    btn.disabled = true;
    try {
      const payload = {
        title: document.getElementById('c-title').value.trim(),
        version: document.getElementById('c-version').value.trim(),
        date: document.getElementById('c-date').value || todayStr(),
        content: document.getElementById('c-content').value.trim()
      };
      if (editingId) {
        await db.collection('changelogs').doc(editingId).update(payload);
        showFormMsg(msg, 'Changelog entry updated.', 'success');
      } else {
        payload.authorName = (profile && profile.displayName) || user.email;
        payload.authorId = user.uid;
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('changelogs').add(payload);
        showFormMsg(msg, 'Changelog entry posted.', 'success');
      }
      resetToCreateMode(form, 'c-date');
      loadManageList('changelogs', 'manage-changelogs', changelogRow);
    } catch (err) {
      showFormMsg(msg, err.message, 'error');
    }
    btn.disabled = false;
  });
}

/* ------------------------------------------------ announcement form --- */
function fillAnnouncementForm(id, a) {
  const form = document.getElementById('announcement-form');
  form.dataset.editingId = id;
  document.getElementById('n-title').value = a.title || '';
  document.getElementById('n-date').value = a.date || toDateInputValue(a.createdAt);
  document.getElementById('n-content').value = a.content || '';
  document.getElementById('n-pinned').checked = !!a.pinned;
  setFormMode(form, true);
}

function initAnnouncementForm(user, profile) {
  const form = document.getElementById('announcement-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('announcement-msg');
    const btn = form.querySelector('button[type="submit"]');
    const editingId = form.dataset.editingId;
    btn.disabled = true;
    try {
      const payload = {
        title: document.getElementById('n-title').value.trim(),
        date: document.getElementById('n-date').value || todayStr(),
        content: document.getElementById('n-content').value.trim(),
        pinned: document.getElementById('n-pinned').checked
      };
      if (editingId) {
        await db.collection('announcements').doc(editingId).update(payload);
        showFormMsg(msg, 'Announcement updated.', 'success');
      } else {
        payload.authorName = (profile && profile.displayName) || user.email;
        payload.authorId = user.uid;
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('announcements').add(payload);
        showFormMsg(msg, 'Announcement posted.', 'success');
      }
      resetToCreateMode(form, 'n-date');
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
      '<div class="actions">' +
        '<button class="btn btn-ghost btn-sm" data-action="edit" data-col="' + col + '" data-id="' + id + '" type="button">Edit</button>' +
        '<button class="btn btn-danger btn-sm" data-action="delete" data-col="' + col + '" data-id="' + id + '" type="button">Delete</button>' +
      '</div>' +
    '</div>'
  );
}

function addonRow(id, a) {
  return manageRowHtml(id, 'addons', a.name, 'v' + (a.version || '1.0') + (a.category ? ' · ' + a.category : '') + ' · ' + displayDate(a));
}
function changelogRow(id, c) {
  return manageRowHtml(id, 'changelogs', c.title, 'v' + (c.version || '—') + ' · ' + displayDate(c));
}
function announcementRow(id, a) {
  return manageRowHtml(id, 'announcements', a.title, (a.pinned ? 'Pinned · ' : '') + displayDate(a));
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
    target.innerHTML = snap.docs.map(function (doc) {
      itemCache[collectionName + ':' + doc.id] = doc.data();
      return rowFn(doc.id, doc.data());
    }).join('');
  } catch (err) {
    console.error('PixelPulse: failed to load ' + collectionName, err);
    target.innerHTML = errorStateHtml('Could not load this list.');
  }
}

/* ---------------------------------------------------------- edit/tab -- */
function startEdit(col, id) {
  const item = itemCache[col + ':' + id];
  if (!item) return;

  const tabMap = { addons: 'panel-addons', changelogs: 'panel-changelogs', announcements: 'panel-announcements' };
  const tabBtn = document.querySelector('.admin-tab[data-tab="' + tabMap[col] + '"]');
  if (tabBtn) tabBtn.click();

  if (col === 'addons') fillAddonForm(id, item);
  if (col === 'changelogs') fillChangelogForm(id, item);
  if (col === 'announcements') fillAnnouncementForm(id, item);

  const formId = col === 'addons' ? 'addon-form' : col === 'changelogs' ? 'changelog-form' : 'announcement-form';
  const form = document.getElementById(formId);
  if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('click', function (e) {
  const editBtn = e.target.closest('[data-action="edit"]');
  if (editBtn) {
    startEdit(editBtn.dataset.col, editBtn.dataset.id);
    return;
  }
});

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
