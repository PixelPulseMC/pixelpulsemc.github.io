/*
  PixelPulse — Firebase configuration
  ------------------------------------------------------------------
  GitHub Pages only serves static files, so it can't run a real login
  system by itself. This project pairs the static site with Firebase
  (free tier) for authentication + the addons/changelog/announcement
  database. Setup:

  1. Go to https://console.firebase.google.com and create a project.
  2. Click the </> "Web app" icon to register a web app, and copy the
     firebaseConfig object it shows you.
  3. Paste those values below, replacing every "REPLACE_ME".
  4. In the Firebase console: Authentication > Sign-in method, enable
     "Email/Password".
  5. In the Firebase console: Firestore Database, click "Create
     database" (production mode is fine), then go to the Rules tab
     and paste in the rules from README.md.
  6. See README.md for how to promote your own account to "staff".
*/

const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
