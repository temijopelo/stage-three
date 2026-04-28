# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits. Built with Next.js App Router, TypeScript, Tailwind CSS, and localStorage persistence.

---

## Project Overview

Habit Tracker lets a user sign up, log in, create and manage daily habits, mark completions, and view live streak counts — all without a remote backend. Persistence is handled entirely in the browser via localStorage.

---

## Setup Instructions

**Prerequisites:** Node.js 18+

```bash
git clone <your-repo-url>
cd habit-tracker
npm install
npx playwright install chromium
```

---

## Run Instructions

```bash
npm run dev        # http://localhost:3000
npm run build && npm run start   # production
```

---

## Test Instructions

```bash
npm run test:unit          # unit tests + coverage
npm run test:integration   # component/integration tests
npm run test:e2e           # playwright e2e
npm test                   # all
```

Coverage report in `coverage/`. Minimum threshold: 80% line coverage for `src/lib/**`.

---

## Local Persistence Structure

All state lives in `localStorage` under three keys:

| Key                     | Shape             | Purpose                     |
| ----------------------- | ----------------- | --------------------------- |
| `habit-tracker-users`   | `User[]`          | All registered accounts     |
| `habit-tracker-session` | `Session \| null` | Currently logged-in user    |
| `habit-tracker-habits`  | `Habit[]`         | All habits across all users |

`completions` contains unique `YYYY-MM-DD` ISO date strings. Streak calculation deduplicates, sorts, then walks backwards from today.

---

## PWA Implementation

`public/manifest.json` declares name, icons, theme colour, start URL, and `standalone` display mode for home screen installation.

`public/sw.js` is registered by `ServiceWorkerRegistrar.tsx` in the root layout. Strategy: network-first for navigation (fresh when online, cached fallback offline), cache-first for static assets, pre-cache app shell on install.

---

## Trade-offs and Limitations

- Passwords stored plaintext in localStorage — fine for local-only stage, not production-safe
- ~5MB localStorage limit; no cross-device sync
- Session has no expiry — persists until explicit logout
- Only "daily" frequency supported (Stage 3 scope)
- `typeof window` guards needed for Next.js SSR compatibility

---

## Test File Map

| Test file                               | Behavior verified                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `tests/unit/slug.test.ts`               | `getHabitSlug` — lowercase, trim, collapse spaces, strip special chars                                              |
| `tests/unit/validators.test.ts`         | `validateHabitName` — empty/too-long rejection, trimmed valid value                                                 |
| `tests/unit/streaks.test.ts`            | `calculateCurrentStreak` — empty, broken streak, duplicates, consecutive days                                       |
| `tests/unit/habits.test.ts`             | `toggleHabitCompletion` — add/remove immutably, no duplicates                                                       |
| `tests/integration/auth-flow.test.tsx`  | Signup creates user+session; duplicate email rejected; login stores session; wrong password shows error             |
| `tests/integration/habit-form.test.tsx` | Validation, create, edit (immutable fields preserved), delete with confirmation, streak toggle                      |
| `tests/e2e/app.spec.ts`                 | Splash redirect, auth guard, signup, login, create habit, complete habit, reload persistence, logout, offline shell |
