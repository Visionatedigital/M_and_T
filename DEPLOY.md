# Deploying on a DigitalOcean droplet (API + web UI, Supabase DB)

## Architecture

- **Database:** Supabase Postgres. Set `DATABASE_URL` to the **connection pooler** URI (Session mode is fine for moderate traffic; use port 6543 pooler as documented in Supabase).
- **App:** Node serves the Express API (`server/index.cjs`) and the Vite production static files from `dist/`, **or** nginx serves `dist/` and proxies `/api` to Node on a local port.

## Server environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase Postgres URI (see `server/db.cjs` for SSL handling). |
| `JWT_SECRET` | Secret for signing staff JWTs (must match across restarts). |
| `PORT` | HTTP port for Express (e.g. `3000` behind nginx). |

## Frontend build (hosted API)

Build the SPA so it calls your public API:

```bash
set VITE_USE_SUPABASE=true
set VITE_REMOTE_API_URL=https://your-domain.com
npm run build
```

Deploy the `dist/` folder with the server or nginx.

## TLS

Use **Let’s Encrypt** (certbot) with nginx or Caddy so staff and clients use HTTPS. Set `VITE_REMOTE_API_URL` to the **https** origin.

## Electron vs web landing

- **Browser:** `/` shows the public marketing page (`Index`).
- **Desktop Electron:** `/` still redirects to `/staff-login` when `window.electronAPI` is present (`App.tsx`).

## Health check

After deploy, open `/staff-login`, sign in, and verify **Loan Applications** loads. Confirm a loan officer can create an application and it appears in their list (borrower `assigned_officer_id` is set on create).
