---
Task ID: 1
Agent: Main
Task: Migrate phone OTP auth from RapidAPI to Firebase Phone Auth

Work Log:
- Installed `firebase` npm package (v12.12.0)
- Created `src/lib/firebase.ts` — Firebase app initialization with user's config (project: carely-9e601)
- Created `src/lib/firebase-auth.ts` — Client-side phone auth helpers (sendPhoneOTP, verifyPhoneOTP, resetRecaptcha, initRecaptcha) using invisible reCAPTCHA
- Created `src/app/api/auth/firebase-verify/route.ts` — Backend route that decodes Firebase ID token (JWT), verifies claims (iss, aud, exp), and handles login (find user) / register (create user)
- Added `firebaseUid String? @unique` field to Prisma User model and pushed to DB
- Rewrote `src/components/auth/LoginPage.tsx` — Now uses Firebase `signInWithPhoneNumber` + `confirmationResult.confirm(code)` instead of RapidAPI
- Rewrote `src/components/auth/RegisterPage.tsx` — Same Firebase phone auth flow, then sends ID token + name/address/wilaya to backend
- Updated `src/store/index.ts` — Replaced `otpLogin`/`otpRegister` with `firebaseLogin(idToken)`/`firebaseRegister({idToken, name, phone, ...})` + added `lastError` state
- Deleted old RapidAPI routes: `send-otp`, `verify-otp`, `otp-login`, `otp-register`
- Verified no dangling references to old auth methods
- Lint: 0 errors (1 pre-existing font warning)

Stage Summary:
- Full Firebase Phone Auth migration completed
- OTP sending and verification handled entirely by Firebase client SDK
- Backend only handles user lookup/creation after Firebase token verification
- Invisible reCAPTCHA is used for anti-abuse
- All old RapidAPI code removed
