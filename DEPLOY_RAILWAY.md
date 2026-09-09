# Deploy to Railway

Two services from the same repo (`qodily-dz/`), because the monorepo contains both apps:

| Service   | Root Directory  | Build                | Start                  |
|-----------|-----------------|----------------------|------------------------|
| qodily-dz | `qodily-dz`     | Dockerfile (auto)    | `node server.js` (image) |
| qodily-api| `qodily-dz/server` | `npm run build` (tsc) | `node dist/index.js`  |

Supabase stays hosted — nothing to deploy there. The migration + seed only need to be run once against Supabase (see step 5).

## 1. Push the repo to GitHub

```sh
cd "E:\Qodily\Projects\Company Portfolio\Code\qodily-dz"
git add -A && git commit -m "prepare railway deploy"
git branch -M main
git remote add origin https://github.com/Qodily-dz/Company_portfolio.git  # if not set
git push -u origin main
```

Make sure `server/.env*` and `qodily-dz/.env.local` are gitignored (they hold secrets).

## 2. Create the web service (Next.js)

1. Railway → **New Project** → **Deploy from GitHub repo** → pick `Company_portfolio`.
2. Add a service from the repo and set **Root Directory** to `qodily-dz`.
   Railway auto-detects the `Dockerfile` and builds the standalone Next.js server.
3. Set the Web service variables (below).

## 3. Create the API service (Express)

1. In the same project: **New Service** → **GitHub Repo**, set **Root Directory** to `qodily-dz/server`.
2. **Settings → Build**: Command `npm run build` (default is fine).
3. **Settings → Deploy**: Start Command `node dist/index.js`.
4. Set the API service variables (below).

## 4. Wire services together

1. Copy the API service URL (`https://<api-name>.up.railway.app`).
2. In the **Web service** envs, set `NEXT_PUBLIC_API_URL` to that URL.
3. Copy the Web service URL (`https://<web-name>.up.railway.app`).
4. In the **API service** envs, set `CORS_ORIGIN` to that URL.
5. Redeploy the Web service — `NEXT_PUBLIC_*` vars are baked in at build time, so any change to them requires a rebuild.
6. Optional: generate the `/api/contact` email domain is unrelated; Resend must verify your sender domain (`hello@qodily.dz`) separately.

## 5. Run once against Supabase (not on Railway)

The schema and seed must exist before the API boots:

```sh
cd server
# 1) apply supabase/migration_add.sql in the Supabase SQL editor (after the base migration)
# 2) seed real content + the admin user
npm run seed
```

Seed enforces RLS-ignoring service role, so run it locally/CI, not on Railway.

## 6. Environments

### Web service (`qodily-dz`)

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | `re_...` from your Resend account (same as local `server/.env`) |
| `CONTACT_TO_EMAIL` | inbox receiving contact form submissions, e.g. `ouail.khenfer@gmail.com` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `qodily.dz` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mpgttyxvwiwxtayzushg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your publishable key |
| `NEXT_PUBLIC_API_URL` | `https://<api-name>.up.railway.app` |

| Variable | Suggested Value |
|---|---|
| `PORT` | `3000` |
| `HOSTNAME` | `0.0.0.0` |

### API service (`qodily-api`)

| Variable | Value |
|---|---|
| `PORT` | `4000` (Railway overrides with `$PORT`) |
| `SUPABASE_URL` | `https://mpgttyxvwiwxtayzushg.supabase.co` |
| `SUPABASE_ANON_KEY` | your publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service-role key (keep secret, bypasses RLS) |
| `JWT_SECRET` | long random string (generate: `openssl rand -hex 32`) |
| `RESEND_API_KEY` | `re_...` (API also sends transactional emails) |
| `CONTACT_TO_EMAIL` | e.g. `ouail.khenfer@gmail.com` |
| `CORS_ORIGIN` | `https://<web-name>.up.railway.app` |

> The real values already exist locally in `server/.env` (API) and `qodily-dz/.env.local` (web). Copy them over; only `NEXT_PUBLIC_API_URL` and `CORS_ORIGIN` change to the Railway URLs.

## 7. Verify

- `https://<web-name>.up.railway.app/en` — site loads.
- `https://<api-name>.up.railway.app/api/health` (or `/api/packs?locale=en`) — API answers.
- `https://<web-name>.up.railway.app/admin` → login with `admin@qodily.dz` / the seeded password.

## Notes

- **Healthcheck** (optional): Settings → Health Check Path `/api/health`.
- **Custom domain**: Settings → Networking → Generate Domain (Railway `app.railway.app`) or add your own `qodily.dz`.
- **CORS**: if the API ever rejects admin traffic, re-check `CORS_ORIGIN` on the API service.
- `NEXT_PUBLIC_*` changes always need a **rebuild deploy** of the web service.