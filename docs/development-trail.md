# Development Trail

## [Feature] 1 — Google SSO Authentication

Replaced the 100 pre-seeded demo users and manual UserSelector dropdown with proper Google OAuth 2.0 single sign-on.

**Backend changes:**
- Added `@nestjs/passport`, `passport-google-oauth20`, `@nestjs/jwt`, `passport-jwt` packages
- New `AuthModule` with Google OAuth strategy, JWT strategy, and guards
- New migration `1744000000000-AddAuthFieldsToUsers` — clears demo users/bids, adds `google_id`, `email`, `picture` columns
- Updated `User` entity with SSO fields
- Updated `UserService` — removed `findAll`, added `findById`, `findByGoogleId`, `findOrCreate`
- Removed `UserController` (no public user listing endpoint needed)
- Updated `BidController` — POST /auctions/:id/bids now requires JWT; `userId` comes from the token, not the request body
- New config namespace `auth.*` for Google credentials, JWT secret, frontend URL

**Frontend changes:**
- New `authStore` (replaces `userStore`) — stores `{ token, user }` in localStorage
- New `LoginPage` — clean "Continue with Google" button
- New `AuthCallbackPage` — handles `?token=` redirect from backend, fetches `/auth/me`, stores auth, redirects to `/`
- Updated `api/client.ts` — injects `Authorization: Bearer <token>` on all requests
- Updated `PlaceBidPayload` type — `userId` removed; backend derives it from JWT
- Updated `BidForm` — uses `authStore`, removed userId from bid payload
- Protected routes via `RequireAuth` wrapper — unauthenticated users are redirected to `/login`
- Updated `Navbar` — replaced UserSelector with user avatar (Google profile picture) and logout button
- Deleted `UserSelector`, `userStore`, `useUsers` hook
