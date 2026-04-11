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

---
Task ID: 4
Agent: Main
Task: Replace Firebase Phone Auth with server-side RapidAPI SMS (reCAPTCHA doesn't work in sandbox)

Work Log:
- Firebase Phone Auth fundamentally broken in sandbox/proxy env (Caddy gateway iframe blocks invisible reCAPTCHA)
- Abandoned Firebase Phone Auth entirely — removed `firebase.ts`, `firebase-auth.ts`, `firebase-verify/route.ts`
- Created `src/lib/sms.ts` — Server-side SMS module with RapidAPI SMS-Verify3 (key: 87032edf23msh...), OTP store, cooldowns, phone normalization
- Recreated `src/app/api/auth/send-otp/route.ts` — Server sends real SMS via RapidAPI, stores OTP in memory
- Recreated `src/app/api/auth/verify-otp/route.ts` — Server verifies OTP code, max 5 attempts, 5-min TTL
- Recreated `src/app/api/auth/otp-login/route.ts` — Login by phone after OTP verified
- Recreated `src/app/api/auth/otp-register/route.ts` — Register new user after OTP verified
- Rewrote `src/store/index.ts` — `sendOtp`, `verifyOtp`, `otpLogin`, `otpRegister` all call server APIs
- Rewrote `src/components/auth/LoginPage.tsx` — Pure server-side OTP flow (no Firebase, no reCAPTCHA)
- Rewrote `src/components/auth/RegisterPage.tsx` — Same pure server-side OTP flow
- Zero Firebase imports remain anywhere in the project
- Verified with curl: SMS sent to +216 26 107 128 successfully ✅
- Verified OTP verification works ✅
- Lint: 0 errors

Stage Summary:
- Firebase Phone Auth removed completely (reCAPTCHA incompatible with sandbox)
- Server-side RapidAPI SMS-Verify3 sends real SMS — NO reCAPTCHA needed
- Full OTP flow: Frontend → /api/auth/send-otp (sends SMS) → /api/auth/verify-otp → /api/auth/otp-login or /api/auth/otp-register
- Real SMS tested and confirmed working with +21626107128
