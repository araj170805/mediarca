let firebaseAdmin;

const getFirebaseAdmin = () => {
  if (firebaseAdmin) return firebaseAdmin;

  try {
    firebaseAdmin = require('firebase-admin');
  } catch (e) {
    throw new Error('firebase-admin is not installed. Run: npm install firebase-admin');
  }

  // Use v12+ getApps() API
  if (firebaseAdmin.getApps().length > 0) {
    return firebaseAdmin;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'mediarca';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : null;

  if (clientEmail && privateKey) {
    // Full Service Account Certificate Initialization
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Project ID Only Initialization (verifies client ID tokens via Firebase public keys)
    firebaseAdmin.initializeApp({
      projectId,
    });
  }

  return firebaseAdmin;
};

/**
 * Verify a Firebase ID token received from the client (Google sign-in).
 * Returns the decoded token payload which includes: uid, email, name, picture.
 */
const verifyFirebaseToken = async (idToken) => {
  const adminInstance = getFirebaseAdmin();
  const decodedToken = await adminInstance.auth().verifyIdToken(idToken);
  return decodedToken;
};

module.exports = {
  verifyFirebaseToken,
  getFirebaseAdmin,
};
