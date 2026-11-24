> Historical Phase 1?2 notes. The current implemented features, setup and verification instructions are in [MVP_GUIDE.md](MVP_GUIDE.md). The status lists below describe the earlier baseline.

# PencilCopy — Phase 1–2 MVP patch
This is your original project with node_modules and real .env stripped out. Your uploaded code is preserved except for the targeted changes.

## Install / run
1. Create a PostgreSQL database named `pencilcopy` (or update DB_NAME).
2. In `backend`, copy `.env.example` to `.env`, set DB credentials and two independent random JWT secrets.
3. Apply `backend/schema.sql` to that database (psql -U postgres -d pencilcopy -f backend/schema.sql from project root).
4. `cd backend && npm install && npm start`
5. In separate terminal: `cd frontend && npm install && npm run dev`
6. Sign up, log in, go to `http://localhost:5173/chapters`, unlock Complex Numbers with starter coins.

## What's implemented
Existing UI, authentication with public-only user payloads, dev-compatible httpOnly cookie settings, JWT refresh-on-expiry, chapter catalog, chapter lock, wallet, atomic coin debit and unlock record with transaction log. The first Complex Numbers module renders its existing content. Other modules remain placeholders because uploaded data has no content.

## Not yet implemented
No live Razorpay payments, no verified coin purchases, no Prisma migration, no actual test engine or Socket.IO contest engine, no real admin dashboard. Existing Problem Arena and contest previews are static.

## Safety / production TODO
- Review auth flows, error handling, CSRF protection on cookie-based mutations, rate limiting, cookie production domain/SameSite, secure deployment HTTPS, unique constraint races on usernames and refresh rotation, and user permission checks.
- Replace starter 100 coins with explicit campaign/ledger entry and remove demo allocation for production.
- Chapter lesson data was moved to backend/content, served only by the authenticated, unlock-checked `/api/chapters/cn/content` endpoint. Further commercial hardening is still required.
- Coins must only be issued from server-side verified Razorpay payment events with idempotency and audit records.
- Never commit `.env` and rotate any credentials that were shared.
