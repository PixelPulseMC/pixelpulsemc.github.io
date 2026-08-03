/*
  PixelPulse — auth.js
  Included on every page. Handles:
   - keeping the nav's login/user-chip area in sync with auth state
   - showing/hiding .staff-link nav items based on the user's role
   - the signup and login form submissions (if present on the page)
   - a small onAuthReady()/isStaff() helper other page scripts can use
*/

let authInitialized = false;
let currentUser = null;
let currentProfile = null;

function renderNavAuth() {
  const slot = document.getElementById('nav-auth');
  if (!slot) return;

  if (currentUser) {
    const staff = isStaff();
    const label = (currentProfile && currentProfile.displayName) || currentUser.email;
    slot.innerHTML =
      '<span class="user-chip">' + escapeHtml(label) +
      (staff ? '<span class="role-tag">Staff</span>' : '') +
      '</span>' +
      '<button class="btn btn-ghost btn-sm" id="logout-btn" type="button">Log out</button>';
    document.getElementById('logout-btn').addEventListener('click', function () {
      auth.signOut();
    });
  } else {
    slot.innerHTML =
      '<a href="login.html" class="btn btn-ghost btn-sm">Log in</a>' +
      '<a href="signup.html" class="btn btn-primary btn-sm">Sign up</a>';
  }

  document.querySelectorAll('.staff-link').forEach(function (el) {
    el.classList.toggle('hidden', !isStaff());
  });
}

function isStaff() {
  return !!(currentProfile && currentProfile.role === 'staff');
}

function onAuthReady(cb) {
  if (authInitialized) { cb(currentUser, currentProfile); return; }
  document.addEventListener('pixelpulse:auth-ready', function handler() {
    document.removeEventListener('pixelpulse:auth-ready', handler);
    cb(currentUser, currentProfile);
  });
}

auth.onAuthStateChanged(async function (user) {
  currentUser = user;
  currentProfile = null;
  if (user) {
    try {
      const snap = await db.collection('users').doc(user.uid).get();
      currentProfile = snap.exists ? snap.data() : null;
    } catch (err) {
      console.error('PixelPulse: could not load user profile', err);
    }
  }
  renderNavAuth();
  authInitialized = true;
  document.dispatchEvent(new CustomEvent('pixelpulse:auth-ready'));
});

function showFormMsg(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = 'form-msg ' + (type || 'error');
  el.classList.remove('hidden');
}

/* ---------------------------------------------------------- signup --- */
document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const msg = document.getElementById('signup-msg');
      const name = document.getElementById('su-name').value.trim();
      const email = document.getElementById('su-email').value.trim();
      const password = document.getElementById('su-password').value;
      const confirm = document.getElementById('su-confirm').value;
      const btn = signupForm.querySelector('button[type="submit"]');

      if (password !== confirm) {
        showFormMsg(msg, "Passwords don't match.", 'error');
        return;
      }
      if (password.length < 6) {
        showFormMsg(msg, 'Password needs to be at least 6 characters.', 'error');
        return;
      }

      btn.disabled = true;
      try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name || email.split('@')[0] });
        await db.collection('users').doc(cred.user.uid).set({
          email: email,
          displayName: name || email.split('@')[0],
          role: 'member',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        window.location.href = 'index.html';
      } catch (err) {
        showFormMsg(msg, err.message, 'error');
        btn.disabled = false;
      }
    });
  }

  /* ------------------------------------------------------------ login  */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const msg = document.getElementById('login-msg');
      const email = document.getElementById('li-email').value.trim();
      const password = document.getElementById('li-password').value;
      const btn = loginForm.querySelector('button[type="submit"]');

      btn.disabled = true;
      try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'index.html';
      } catch (err) {
        showFormMsg(msg, err.message, 'error');
        btn.disabled = false;
      }
    });
  }
});
