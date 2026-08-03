/* PixelPulse — admin.js: staff-only content management (add, edit + delete) */

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

function resetFormSubmitBtn(form, defaultText) {
  delete form.dataset.editId;
  const btn = form.querySelector('button[type="submit"]');
  if (btn) {
    btn.innerText = defaultText;
    btn.style.background = '';
  }
}

/* -------------------------------------------------------- DLC Form --- */
function initAddonForm(user, profile) {
  const form = document.getElementById('addon-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('addon-msg');
    const btn = form.querySelector('button[type="submit"]');
    const editId = form.dataset.editId;
    btn.disabled = true;

    const payload = {
      name: document.getElementById('a-name').value.trim(),
      description: document.getElementById('a-desc').value.trim(),
      category: document.getElementById('a-category').value.trim(),
      version: document.getElementById('a-version').value.trim(),
      imageUrl: document.getElementById('a-image').value.trim(),
      downloadUrl: document.getElementById('a-download').value.trim(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (editId) {
        await db.collection('addons').doc(editId).update(payload);
        showFormMsg(msg, 'DLC updated successfully.', 'success');
      } else {
        payload.createdBy = user.uid;
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('addons').add(payload);
        showFormMsg(msg, 'DLC posted.', 'success');
      }
      form.reset();
      resetFormSubmitBtn(form, 'Post DLC');
      loadManageList('addons', 'manage-addons', addonRow);
    } catch (err) {
      showFormMsg(msg, err.message, 'error');
    }
    btn.disabled = false;
  });
}

/* --------------------------------------------------- Changelog Form --- */
function initChangelogForm(user, profile) {
  const form = document.getElementById('changelog-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('changelog-msg');
    const btn = form.querySelector('button[type="submit"]');
    const editId = form.dataset.editId;
    btn.disabled = true;

    const payload = {
      title: document.getElementById('c-title').value.trim(),
      version: document.getElementById('c-version').value.trim(),
      customDate: document.getElementById('c-date') ? document.getElementById('c-date').value.trim() : '',
      imageUrl: document.getElementById('c-image') ? document.getElementById('c-image').value.trim() : '',
      fileUrl: document.getElementById('c-file') ? document.getElementById('c-file').value.trim() : '',
      content: document.getElementById('c-content').value.trim(),
      authorName: (profile && profile.displayName) || user.email,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (editId) {
        await db.collection('changelogs').doc(editId).update(payload);
        showFormMsg(msg, 'Changelog updated successfully.', 'success');
      } else {
        payload.authorId = user.uid;
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('changelogs').add(payload);
        showFormMsg(msg, 'Changelog entry posted.', 'success');
      }
      form.reset();
      resetFormSubmitBtn(form, 'Post Changelog');
      loadManageList('changelogs', 'manage-changelogs', changelogRow);
    } catch (err) {
      showFormMsg(msg, err.message, 'error');
    }
    btn.disabled = false;
  });
}

/* ------------------------------------------------ Announcement Form --- */
function initAnnouncementForm(user, profile) {
  const form = document.getElementById('announcement-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('announcement-msg');
    const btn = form.querySelector('button[type="submit"]');
    const editId = form.dataset.editId;
    btn.disabled = true;

    const payload = {
      title: document.getElementById('n-title').value.trim(),
      imageUrl: document.getElementById('n-image') ? document.getElementById('n-image').value.trim() : '',
      fileUrl: document.getElementById('n-file') ? document.getElementById('n-file').value.trim() : '',
      content: document.getElementById('n-content').value.trim(),
      pinned: document.getElementById('n-pinned').checked,
      authorName: (profile && profile.displayName) || user.email,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (editId) {
        await db.collection('announcements').doc(editId).update(payload);
        showFormMsg(msg, 'Announcement updated successfully.', 'success');
      } else {
        payload.authorId = user.uid;
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('announcements').add(payload);
        showFormMsg(msg, 'Announcement posted.', 'success');
      }
      form.reset();
      resetFormSubmitBtn(form, 'Post Announcement');
      loadManageList('announcements', 'manage-announcements', announcementRow);
    } catch (err) {
      showFormMsg(msg, err.message, 'error');
    }
    btn.disabled = false;
  });
}

/* -------------------------------------------------------- Manage List --- */
function manageRowHtml(id, col, title, meta) {
  return (
    '<div class="manage-row">' +
      '<div class="info"><h4>' + escapeHtml(title) + '</h4><span>' + escapeHtml(meta) + '</span></div>' +
      '<div class="actions">' +
        '<button class="btn btn-secondary btn-sm" data-action="edit" data-col="' + col + '" data-id="' + id + '" type="button" style="margin-right: 6px;">✏️ Edit</button>' +
        '<button class="btn btn-danger btn-sm" data-action="delete" data-col="' + col + '" data-id="' + id + '" type="button">🗑️ Delete</button>' +
      '</div>' +
    '</div>'
  );
}

function addonRow(id, a) {
  return manageRowHtml(id, 'addons', a.name, 'v' + (a.version || '1.0') + (a.category ? ' · ' + a.category : ''));
}
function changelogRow(id, c) {
  return manageRowHtml(id, 'changelogs', c.title, 'v' + (c.version || '—') + ' · ' + (c.customDate || formatDate(c.createdAt)));
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

/* -------------------------------------------- Edit & Delete Click Handlers --- */
document.addEventListener('click', async function (e) {
  // DELETE
  const deleteBtn = e.target.closest('[data-action="delete"]');
  if (deleteBtn) {
    const col = deleteBtn.dataset.col;
    const id = deleteBtn.dataset.id;
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    deleteBtn.disabled = true;
    try {
      await db.collection(col).doc(id).delete();
      deleteBtn.closest('.manage-row').remove();
    } catch (err) {
      alert('Could not delete: ' + err.message);
      deleteBtn.disabled = false;
    }
    return;
  }

  // EDIT
  const editBtn = e.target.closest('[data-action="edit"]');
  if (editBtn) {
    const col = editBtn.dataset.col;
    const id = editBtn.dataset.id;
    editBtn.disabled = true;

    try {
      const docSnap = await db.collection(col).doc(id).get();
      if (!docSnap.exists) {
        alert('Could not find item to edit.');
        editBtn.disabled = false;
        return;
      }

      const data = docSnap.data();

      if (col === 'addons') {
        const form = document.getElementById('addon-form');
        if (form) {
          form.dataset.editId = id;
          document.getElementById('a-name').value = data.name || '';
          document.getElementById('a-desc').value = data.description || '';
          document.getElementById('a-category').value = data.category || '';
          document.getElementById('a-version').value = data.version || '';
          document.getElementById('a-image').value = data.imageUrl || '';
          document.getElementById('a-download').value = data.downloadUrl || '';

          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.innerText = '💾 Save DLC Changes';
            submitBtn.style.background = '#22c55e';
          }
          form.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (col === 'changelogs') {
        const form = document.getElementById('changelog-form');
        if (form) {
          form.dataset.editId = id;
          document.getElementById('c-title').value = data.title || '';
          document.getElementById('c-version').value = data.version || '';
          if (document.getElementById('c-date')) document.getElementById('c-date').value = data.customDate || '';
          if (document.getElementById('c-image')) document.getElementById('c-image').value = data.imageUrl || '';
          if (document.getElementById('c-file')) document.getElementById('c-file').value = data.fileUrl || '';
          document.getElementById('c-content').value = data.content || '';

          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.innerText = '💾 Save Changelog Changes';
            submitBtn.style.background = '#22c55e';
          }
          form.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (col === 'announcements') {
        const form = document.getElementById('announcement-form');
        if (form) {
          form.dataset.editId = id;
          document.getElementById('n-title').value = data.title || '';
          if (document.getElementById('n-image')) document.getElementById('n-image').value = data.imageUrl || '';
          if (document.getElementById('n-file')) document.getElementById('n-file').value = data.fileUrl || '';
          document.getElementById('n-content').value = data.content || '';
          document.getElementById('n-pinned').checked = !!data.pinned;

          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.innerText = '💾 Save Announcement Changes';
            submitBtn.style.background = '#22c55e';
          }
          form.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err) {
      alert('Error fetching data: ' + err.message);
    }
    editBtn.disabled = false;
  }
});

