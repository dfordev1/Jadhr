# Jadhr - Arabic Root Learning App

## Cursor Cloud specific instructions

### Project Overview
This is a React + TypeScript + Vite web app wrapped with Capacitor for Android. It teaches Arabic root words via CSV/JSON import, a dictionary browser, spaced-repetition quizzes, and analytics dashboard. All data is stored locally via `localStorage` (Supabase is disabled for offline mode).

### Services
| Service | Command | Port |
|---------|---------|------|
| Vite Dev Server | `npm run dev` | 3000 |

No backend or database services are needed — the app is fully offline.

### Key Commands
- **Install deps:** `npm install`
- **Dev server:** `npm run dev` (port 3000)
- **Lint:** `npm run lint` (runs `tsc --noEmit`)
- **Build (web):** `npm run build`
- **Build (APK):** `npm run build && npx cap sync android && cd android && ./gradlew assembleDebug`
- The debug APK is output at `android/app/build/outputs/apk/debug/app-debug.apk`

### Android Build Requirements
- **JDK 21+** (pre-installed on Cloud Agent VMs)
- **Android SDK** must be installed at `/opt/android-sdk` with platforms `android-36` and build-tools `36.0.0`. Set `ANDROID_HOME=/opt/android-sdk` before building.
- `android/local.properties` must contain `sdk.dir=/opt/android-sdk` (gitignored; create manually if missing).

### Gotchas
- `isSupabaseConfigured` is hardcoded to `false` in `src/lib/supabase.ts` to force offline mode. The app uses `localStorage` for all auth and data.
- The login page shows "ENTER (MOCK MODE)" — any email works for login.
- The `.env.local` file has Supabase credentials that are intentionally unused.
- Capacitor config (`capacitor.config.ts`) sets `webDir: 'dist'`, so always run `npm run build` before `npx cap sync`.
