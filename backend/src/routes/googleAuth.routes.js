const express = require('express');
const router = express.Router();
const googleAuthController = require('../controllers/googleAuth.controller.js');

/**
 * Google / Firebase OAuth Routes
 *
 * All routes receive a Firebase ID token (idToken) from the frontend.
 * The frontend obtains this token after the user completes Google Sign-In
 * using the Firebase JS SDK.
 *
 * Frontend usage example:
 *   import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth';
 *   const result = await signInWithPopup(getAuth(), new GoogleAuthProvider());
 *   const idToken = await result.user.getIdToken();
 *   // POST idToken to one of these endpoints
 */

// Patient Google Sign-In / Auto Sign-Up
router.post('/patient', googleAuthController.googlePatientAuth);

// Admin Panel Google Identity Verification (admin must already exist)
router.post('/admin/verify', googleAuthController.googleAdminVerification);

// Receptionist Google Login (receptionist must already be registered)
router.post('/receptionist', googleAuthController.googleReceptionistAuth);

module.exports = router;
