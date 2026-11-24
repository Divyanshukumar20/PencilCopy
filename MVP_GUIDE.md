# PencilCopy MVP

Existing landing visuals, navbar styling, chapter sidebar and Argand visualization are retained. New pages share a separate, scoped stylesheet.

## Start locally

Requires Node.js 22+, PostgreSQL, and the credentials in `backend/.env` (see [example](backend/.env.example)).

```powershell
npm install --prefix backend
npm install --prefix frontend
npm run migrate --prefix backend
npm run seed --prefix backend
npm run dev --prefix backend
# A second terminal:
npm run dev --prefix frontend
```

Open http://localhost:5173. Sign up and log in. Existing accounts work too. Migrations add tables/columns without replacing existing user data. Seed is repeatable and adds eight original practice MCQs and one PCM starter mock, not a full JEE question bank.

## Pages

| URL | Function |
|---|---|
| `/dashboard` | Wallet, solved count, attempts, rating and transaction history |
| `/chapters` | Chapter catalog and wallet balance |
| `/chapters/cn` | Protected chapter unlock and original interactive lesson |
| `/arena` | Subject/difficulty/search filters and practice questions |
| `/tests` | Published mock tests |
| `/contests` | Scheduled/live/ended contests |
| `/contests/:id` | Socket.IO leaderboard with HTTP reconnect fallback |
| `/store` | Coin packs and payment reconciliation |
| `/admin` | Questions, test/contest publishing, users, contest settlement |

## Enable your admin account

First sign up normally, then run from the project root:

```powershell
npm run admin --prefix backend -- YOUR_EXACT_USERNAME
```

Refresh the page. Admin access is checked against the database on every request. No default admin password or public role-change endpoint exists.

Create/edit questions with four options and one correct answer. Uncheck **Publish in Arena** for fresh contest-only questions. Contests require unused unpublished questions, a future start, and an end later than the start. Existing test attempts use snapshots, so editing a practice question cannot silently change their answer key. All test schedules are stored as UTC; the admin form accepts the administrator's local time.

## Test and contest rules

- +4 correct, −1 wrong, 0 skipped. One attempt per account per assessment.
- Selecting an answer saves it to PostgreSQL. Wait for the saved status before leaving. The UI reports save failures; unsaved selections are not submitted automatically.
- Resume by opening the same test or the dashboard. Server deadlines are authoritative; refreshing does not reset time.
- Final submission is immutable. Expired attempts are settled from saved answers, including after a server restart.
- Mock solutions are revealed after submission; contest solutions only after the contest end.
- Leaderboards show submitted scores, with equal-score ties. Elo uses K=32 and the mean pairwise expected score across participants, with a draw for equal scores. A solo contest has zero change. Rating history is written once per completed contest.
- A server worker settles deadlines/ratings every five seconds. The admin settlement button is also idempotent.
- This MVP runs one application server. Multiple Socket.IO instances would need a shared adapter for room broadcasts.

## Razorpay test setup

Payments remain disabled until all three Razorpay values are configured. Put test keys in `backend/.env`, never in frontend code or chat:

```dotenv
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_separate_webhook_secret
```

Restart the backend. Configure a reachable HTTPS webhook URL ending in `/api/payments/webhook`, subscribe to `payment.captured`, and enable automatic capture in Razorpay. Configure the same webhook secret locally. Provider credentials and a reachable webhook are required for end-to-end payment testing.

The sample packs are 100 coins for ₹49 and 300 for ₹129; review these before accepting real payments. Amounts are defined on the server in [payments.js](backend/routes/payments.js). The server creates the order, validates Checkout HMAC, fetches the payment to require captured status, and matches order, owner, amount and currency. A row lock and unique payment ID prevent repeated credits from retries or webhooks. **Check payment** reconciles a captured order if Checkout was closed before its callback. Failed or merely authorized payments do not add coins.

Implementation references: [Razorpay signature verification](https://github.com/razorpay/razorpay-node/blob/master/documents/paymentVerfication.md), [Socket.IO rooms](https://socket.io/docs/v4/rooms/).

## Verification

```powershell
npm test --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
npm run test:ui --prefix backend
```

Backend and UI integration tests create disposable PostgreSQL schemas, use synthetic accounts and remove only their own test schema. The database user must have permission to create schemas. UI tests use installed Google Chrome by default (set `TEST_BROWSER_CHANNEL=msedge` to use Edge) and temporary ports 3001/5174. Screenshots go to ignored `frontend/test-results/`.

## Remaining content / deployment work

- The supplied Complex Numbers dataset contains detailed material for the first module; the other eleven show a preparation message. Rotation and Atomic Structure content are not published and cannot charge coins.
- Original landing preview statistics/testimonials are static demo content. They are not live student analytics.
- The chapter's original local SVG visualization code is bundled with the frontend; protected lesson data is fetched only after backend entitlement checks. A browser client cannot prevent copying content that has already been delivered to an authorized learner.
- Chapter content editing, multi-select/numerical JEE questions, discussions and full syllabus content are outside this initial single-correct-MCQ MVP.
- For deployment set `FRONTEND_ORIGIN`, `VITE_API_URL`, production cookie settings and HTTPS. Frontend and API should be same-site for the Strict cookies. Configure SPA fallback for client routes.
- The original large videos are retained; compress them and split bundles before a bandwidth-sensitive public launch.
