# PixelPulse

A static site for a Minecraft Bedrock add-on / DLC catalog, with real accounts
and a staff-only panel for posting addons, changelog entries, and
announcements.

This README is the full walkthrough, in order, start to finish. It assumes
zero prior experience with GitHub or Firebase.

## Why Firebase is involved

GitHub Pages only serves static files — it can't run a login system or a
database on its own. So this site pairs the static frontend (this folder)
with **Firebase** (Google's free-tier backend service) for:

- **Authentication** — real accounts, email + password
- **Firestore** — the database holding addons, changelog entries,
  announcements, and each user's role (`member` or `staff`)

Everything staff-only is enforced by Firestore's own security rules, not by
anything in the page's JavaScript, so it can't be bypassed from the browser
console.

---

## Step 1 — Create a GitHub account and repository

1. Go to **github.com** and sign up (or log in if you already have one).
2. Click the **+** icon top-right → **New repository**.
3. Name it. Two options:
   - Name it `pixelpulse` (or anything) → your site will live at
     `https://YOUR-USERNAME.github.io/pixelpulse/`
   - Name it exactly `YOUR-USERNAME.github.io` → your site will live at
     `https://YOUR-USERNAME.github.io/` (no extra path)
4. Set it to **Public**.
5. Leave everything else unchecked, click **Create repository**.

## Step 2 — Upload the site files

On the new repo's page you'll see a link that says **"uploading an existing
file"** — click it.

- Unzip `pixelpulse-site.zip` on your computer first.
- Drag the *contents* of the unzipped folder (index.html, addons.html, the
  `css` folder, the `js` folder, everything) onto the upload box. Modern
  browsers preserve the `css/` and `js/` subfolders when you drag folders in.
- Scroll down, add a commit message (e.g. "Initial upload"), click
  **Commit changes**.

(This step is much easier on a computer than a phone, since it's drag-and-
drop. If you're on mobile, it's easier to come back to this step later on a
laptop/desktop.)

## Step 3 — Turn on GitHub Pages

1. In your repo, click the **Settings** tab (top of the page).
2. In the left sidebar, click **Pages**.
3. Under "Build and deployment" → Source, choose **Deploy from a branch**.
4. Branch: **main**, folder: **/ (root)** → click **Save**.
5. Wait a minute, refresh the page — it'll show "Your site is live at ...".
   That URL is your site.

The site will load, but signup/login/posting won't work yet — that's Firebase.

## Step 4 — Create the Firebase project

1. Go to **console.firebase.google.com** and log in with a Google account.
2. Click **Create a project** (or "Add project"). Name it anything, e.g.
   "pixelpulse". You can skip Google Analytics if it asks. Click through to
   **Create project**. The free **Spark** plan is all you need.

## Step 5 — Register a web app and get your config

1. On your new project's overview page, click the **`</>`** icon
   ("Add app" → Web).
2. Give it a nickname (anything), click **Register app**.
3. It shows a code block containing a `firebaseConfig = { ... }` object with
   fields like `apiKey`, `authDomain`, `projectId`, etc. **Keep this page
   open** — you'll copy those values in the next step.

## Step 6 — Paste your config into the site

1. Back in your GitHub repo, open the `js` folder, click **firebase-config.js**.
2. Click the pencil (✏️) icon top-right to edit it in the browser.
3. Replace each `"REPLACE_ME"` with the matching value from the Firebase
   config you just saw (apiKey, authDomain, projectId, storageBucket,
   messagingSenderId, appId).
4. Scroll down, click **Commit changes**.

## Step 7 — Turn on email/password sign-in

1. In the Firebase console, left sidebar → **Authentication**.
2. Click **Get started**.
3. Click **Email/Password** in the provider list → toggle it **Enable** →
   **Save**.

## Step 8 — Turn on Firestore and set the security rules

1. Left sidebar → **Firestore Database** → **Create database**.
2. Choose **Production mode**, pick any region, click **Enable**.
3. Once it's created, click the **Rules** tab at the top.
4. Delete everything in the box and paste this in:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }
    function isStaff() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff';
    }

    match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || isStaff());
      allow create: if isSignedIn() && request.auth.uid == userId
                    && request.resource.data.role == 'member';
      allow update: if isStaff();
      allow delete: if false;
    }

    match /addons/{addonId} {
      allow read: if true;
      allow write: if isStaff();
    }

    match /changelogs/{entryId} {
      allow read: if true;
      allow write: if isStaff();
    }

    match /announcements/{postId} {
      allow read: if true;
      allow write: if isStaff();
    }
  }
}
```

5. Click **Publish**.

This means: anyone can create their *own* account, but only as a `member` —
nobody can grant themselves `staff` from the browser. Everyone can read the
catalog/changelog/announcements. Only `staff` accounts can post or delete
addons, changelog entries, or announcements.

## Step 9 — Sign up and make yourself staff

1. Visit your live site (the URL from Step 3) → click **Sign up** → create
   your account.
2. In the Firebase console → **Firestore Database** → **Data** tab →
   click the `users` collection → click the one document in it (it'll have
   your email as a field).
3. Click on the `role` field's value (`member`), change it to `staff`,
   press Enter/confirm.
4. Go back to your live site and refresh. A **"Staff Panel"** link now
   appears in the nav — that's where you post addons, changelog entries, and
   announcements.

To make anyone else staff later, repeat step 2–3 on their document once
they've signed up.

---

## Posting addon images and downloads

The "New addon" form takes plain URLs for the preview image and download
link, rather than uploading files. Host screenshots somewhere like Imgur, and
pack files as a GitHub Release asset, Google Drive link, or CurseForge/MCPEDL
page, then paste the links in.

## Local testing (optional)

If you want to test changes before uploading them, and you have the files on
a computer, serve the folder locally instead of opening `index.html`
directly:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## File structure

```
index.html              Home page
addons.html              Full addon catalog
changelogs.html          Version history timeline
announcements.html       Staff announcements
login.html / signup.html
admin.html                Staff-only panel (gated client-side AND by Firestore rules)
css/style.css
js/firebase-config.js    Your Firebase project keys (fill this in)
js/utils.js               Shared helpers
js/auth.js                 Account creation/login/logout, nav auth state
js/addons.js / changelogs.js / announcements.js   Read + render each collection
js/admin.js                 Staff forms + delete actions
```
