# PencilCopy deployment: Vercel + Render

This repository contains a Vite frontend in `frontend/` and an Express/Socket.IO backend in `backend/`. Deploy the frontend to Vercel, and the backend plus PostgreSQL to Render. Keep one backend instance for this MVP; multi-instance Socket.IO needs a shared adapter.

## Before connecting Git

The root `.gitignore` excludes every `.env`, `node_modules`, build output and test results. Check `git status` before pushing. Do not upload `backend/.env`, copy its contents into a Git issue, or put Razorpay secrets in Vercel's `VITE_*` variables.

## 1. Create the Render database

In Render Dashboard choose **New → Postgres**. Select the same region you will use for the web service. Use a paid Postgres plan for real users: Render's Free Postgres expires after 30 days and has no managed backups. In the database's **Connect** page, note its **Internal Database URL**. Put that value in the backend service's `DATABASE_URL` variable; do not commit it.

## 2. Create the Render backend

Choose **New → Web Service**, connect the Git repository, and set:

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Runtime | Node.js |
| Build command | `npm ci` |
| Pre-deploy command (paid web service) | `npm run migrate` |
| Start command | `npm start` |
| Health check path | `/` |
| Instance count | 1 |

For a temporary Free web service, which has no pre-deploy command, use `npm run migrate && npm start` as its Start command. Free services sleep after idle time, so they are unsuitable for reliable scheduled contests and paid production traffic.

Set these **Environment** variables on the Render web service:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Render Postgres **internal** URL |
| `ACCESS_TOKEN_SECRET` | A new long random secret |
| `REFRESH_TOKEN_SECRET` | A different new long random secret |
| `FRONTEND_ORIGIN` | Exact public Vercel frontend origin, such as `https://your-project.vercel.app`, without trailing slash |
| `RAZORPAY_KEY_ID` | Razorpay test key for staging; live key only after go-live review |
| `RAZORPAY_KEY_SECRET` | Matching private key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Separate secret matching the webhook in the same Razorpay mode |

Render supplies `PORT` automatically. Do not use local `DB_*` values on Render when `DATABASE_URL` is set. Keep the new JWT secrets stable across redeploys or all sessions will log out. Set `FRONTEND_ORIGIN` to a planned Vercel URL initially, then update it to the exact URL you actually receive after Vercel deploys.

After deployment, open `https://YOUR-RENDER-SERVICE.onrender.com/`; it should return JSON with `status: ok`. This is only an HTTP check; test login to verify database connectivity. On a paid web service, run `npm run seed` once from the Render Shell if you want the eight starter questions and mock test. Seed is repeatable. If `rinshu` needs admin access in the new database, create that account through the deployed signup page and run `npm run admin -- rinshu` in the Render Shell. The local database's users and content do **not** appear automatically in Render Postgres; migrating real data requires a separate database export/import.

## 3. Create the Vercel frontend

In Vercel choose **Add New → Project**, import the same Git repository, and set:

| Setting | Value |
| --- | --- |
| Root directory | `frontend` |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable `VITE_API_URL` | Exact HTTPS Render backend origin, without trailing slash |

Deploy. `frontend/vercel.json` handles direct visits and refreshes on routes such as `/store` and `/contests`. If Vercel assigns a different frontend URL than planned, update Render's `FRONTEND_ORIGIN` to the exact production frontend origin and redeploy the backend. A changed Vercel `VITE_API_URL` needs a **new Vercel build/deploy** because Vite embeds it at build time.

For reliable browser login, prefer your own domain with frontend and API on sibling subdomains, for example `app.example.com` and `api.example.com`. With default `vercel.app` and `onrender.com` domains, authentication uses cross-site `Secure; SameSite=None` cookies; browsers that block third-party cookies can reject them. Test actual deployed signup/login in Chrome, Firefox and Safari before inviting users.

## 4. Connect Razorpay webhook

After the backend has a public HTTPS URL, create a webhook in the same Razorpay mode as its API keys. Use `https://YOUR-RENDER-SERVICE.onrender.com/api/payments/webhook`, subscribe to `payment.captured`, and configure the exact `RAZORPAY_WEBHOOK_SECRET` already set on Render. Enable automatic payment capture. Test one successful payment, one failed payment, a closed Checkout followed by **Check payment**, and duplicate webhook/reconciliation; each captured payment should credit coins once. Do not switch to live keys until this deployed test flow and pricing have been reviewed.

## 5. Final deployed checks

1. Sign up and log in at the Vercel URL. Refresh the page; the session should persist.
2. Unlock Complex Numbers and verify a different user cannot access its protected content.
3. Use Arena and the starter mock. Create and join a contest with two student accounts; verify live leaderboard and Elo after the end.
4. Make a Razorpay **test-mode** purchase. Confirm Paid order, wallet credit once, and webhook delivery in the Razorpay Dashboard.
5. Check direct route refresh (`/store`, `/admin`, `/contests`) and mobile layout.

Official references: [Render web services](https://render.com/docs/web-services), [Render Postgres connection](https://render.com/docs/postgresql-creating-connecting), [Render Free limitations](https://render.com/docs/free), [Vercel Vite SPA routes](https://vercel.com/docs/frameworks/frontend/vite), [Razorpay webhooks](https://razorpay.com/docs/webhooks/).
