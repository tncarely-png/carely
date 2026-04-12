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
- Verified no dangling references to deleted files
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

Stage Summary:
- Production-ready for real SMS via Firebase Phone Auth

---
Task ID: 3
Agent: Main
Task: Fix real SMS delivery after domain authorization

Stage Summary:
- Firebase Phone Auth configured for real SMS
- Domain `carely.space.z.ai` authorized in Firebase Console

---
Task ID: 4
Agent: Main
Task: Replace Firebase Phone Auth with server-side RapidAPI SMS

Stage Summary:
- Server-side RapidAPI SMS-Verify3 sends real SMS
- Full OTP flow working end-to-end

---
Task ID: 5
Agent: Main
Task: Re-add Firebase SMS OTP with invisible reCAPTCHA (OTP v2)

Stage Summary:
- OTP v2: Firebase invisible reCAPTCHA + login-only flow
- Server-side token verification via Google Identity Toolkit API
- Clean separation: firebase.ts → firebase-otp.ts → firebase-admin.ts → otp-login route

---
Task ID: 2-a
Agent: Database & SDK Setup
Task: Set up Appwrite SDK, update Prisma schema, update constants

Stage Summary:
- Appwrite SDK ready, DB schema updated, constants updated

---
Task ID: 3-a
Agent: Homepage Redesign
Task: Redesign homepage as store overview with app cards grid

Stage Summary:
- Homepage shows store overview with Qustodio + coming soon cards
- Qustodio has dedicated landing page

---
Task ID: 3-b
Agent: Checkout Flow
Task: Build new 4-step checkout wizard

Stage Summary:
- 4-step checkout: Plan → Payment → Receipt → Pending
- Receipt uploads as base64, WhatsApp CTA on every step

---
Task ID: 6
Agent: Main
Task: OTP v2 final implementation

Stage Summary:
- Invisible reCAPTCHA, login-only flow, server-side token verification
- Phone normalization to +216 XX XXX XXXX format

---
Task ID: CF-MIGRATION
Agent: Main
Task: Migrate Carely.tn from Prisma/SQLite to Cloudflare D1/KV/R2 stack

Work Log:
- Installed drizzle-orm, @opennextjs/cloudflare, @cloudflare/workers-types, drizzle-kit, wrangler
- Removed prisma, @prisma/client packages
- Created wrangler.toml with D1/KV/R2 bindings
- Created open-next.config.ts for Cloudflare adapter
- Created src/db/schema.ts — Drizzle schema (users, subscriptions, orders, licenses, whatsapp_agents, settings)
- Created src/db/index.ts — Drizzle D1 database initializer
- Created src/db/migrations/0001_initial.sql — D1 migration SQL
- Created src/lib/cf-context.ts — Cloudflare context accessor (getCloudflareContext)
- Created src/lib/verify-firebase-token.ts — Web Crypto API JWT verification (replaces firebase-admin)
- Created src/lib/session.ts — KV-based session management
- Rewrote ALL 17 API routes from Prisma to Drizzle ORM
- Created /api/upload/receipt for R2 file uploads
- Created .github/workflows/deploy.yml for CI/CD
- Updated next.config.ts with initOpenNextCloudflareForDev()
- Updated package.json scripts for CF workflow
- Deleted prisma/, src/lib/db.ts, src/lib/firebase-admin.ts, src/lib/sms.ts
- Fixed: db/ moved to src/db/ for @/ path alias resolution
- Fixed: getRequestContext → getCloudflareContext
- All API endpoints tested and working

Stage Summary:
- Full Cloudflare stack migration: D1 + KV + R2
- Firebase Admin SDK → Web Crypto API JWT verification
- All API routes functional with Drizzle ORM
- GitHub Actions CI/CD configured
- Dev server works with in-memory D1
- Lint: 0 errors
