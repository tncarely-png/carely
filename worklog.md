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

---
Task ID: 2
Agent: Main
Task: Fix Firebase Phone Auth to send real SMS

Work Log:
- Removed test mode (`appVerificationDisabledForTesting = false`) to enable real SMS
- Fixed `firebase-auth.ts`: added `resetRecaptcha` export back, removed dev/test mode branching
- Removed all `IS_FIREBASE_TEST_MODE` references from LoginPage and RegisterPage
- Added detailed Firebase error code handling (invalid-phone, too-many-requests, captcha-check-failed, unauthorized-domain)
- Removed dev-only test code banner
- Production-ready code: requires domain to be whitelisted in Firebase Console

Stage Summary:
- Code is production-ready for real SMS via Firebase Phone Auth
- REQUIREMENT: User must add the sandbox/deployment domain to Firebase Console > Authentication > Settings > Authorized domains before real SMS will work
- reCAPTCHA uses invisible mode — domain must be authorized in Firebase
- Lint: 0 errors

---
Task ID: 3
Agent: Main
Task: Fix real SMS delivery after domain authorization in Firebase Console

Work Log:
- User added `carely.space.z.ai` to Firebase authorized domains
- Rewrote `src/lib/firebase-auth.ts` — Added `initRecaptcha()` with explicit `await recaptchaVerifier.render()` to ensure reCAPTCHA widget is fully loaded before sending OTP
- `sendPhoneOTP()` now calls `initRecaptcha()` internally, creating a fresh verifier each time with proper async initialization
- Removed redundant `resetRecaptcha()` calls from LoginPage and RegisterPage (now handled internally by `initRecaptcha`)
- Kept `resetRecaptcha()` for cleanup on unmount and when navigating back from OTP step
- `firebase.ts` confirmed: `appVerificationDisabledForTesting = false` (real SMS mode)
- Lint: 0 errors, dev server running clean

Stage Summary:
- Firebase Phone Auth is now configured to send real SMS (not test mode)
- Domain `carely.space.z.ai` is authorized in Firebase Console
- reCAPTCHA initializes explicitly with `await render()` for reliability
- User can test with `+21626107128` — real SMS should be delivered
