# Deployment guide

This file documents simple ways to deploy this monorepo (React frontend + Express backend + Socket.IO).

Prerequisites
- A MongoDB database (MongoDB Atlas recommended) and its connection string.
- Node.js (v18+ recommended) on target machine or CI.

Environment variables (required)
- `MONGODB_URI` — MongoDB connection string
- `NODE_ENV=production` — enables backend to serve the frontend build
- `CLIENT_URL` — optional, used for socket.io CORS origin

Quick local test (Windows PowerShell)

```powershell
cd .\frontend
npm ci
npm run build

cd ..\backend
npm ci
$env:MONGODB_URI = "your_mongo_uri"
$env:NODE_ENV = "production"
node server.js
```

Then open http://localhost:5000/ (or whatever PORT you set).

Deploy options

1) Render / Railway (recommended)
- Create a new Web Service.
- Set the Build command (optional): leave empty, Render will run `npm install`.
- Set the Start command: `cd backend && npm start`.
- Add environment variables in the dashboard: `MONGODB_URI`, `NODE_ENV=production`, `CLIENT_URL` if needed.

The `backend/package.json` contains `postinstall` and `heroku-postbuild` scripts that will run `npm ci` and `npm run build` in `../frontend` automatically when the backend dependencies are installed.

2) Heroku
- Add this `Procfile` (already included in repo):

```
web: cd backend && npm start
```

- Create a Heroku app, set Config Vars (`MONGODB_URI`, etc.). Push your repo or connect GitHub.

3) VPS (Ubuntu) with Nginx + pm2
- Install Node, nginx and pm2.
- Build frontend on server and install backend deps, then run backend with pm2.
- Use an Nginx site config to reverse-proxy to `http://127.0.0.1:5000` and include the websocket upgrade headers:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "Upgrade";
```

CI / GitHub Actions
- The `.github/workflows/ci.yml` included in this repo will build the frontend and backend on push to main; you can extend it to deploy to Heroku or Render by adding secrets and deployment steps.

Deploying frontend to Vercel (recommended for the React app)

This repo contains a `vercel.json` that instructs Vercel to build the React app from the `frontend` directory. Vercel is a great fit for the static SPA.

Steps:
1. Go to https://vercel.com and create/connect your GitHub account.
2. Create a new project and import this repository.
3. In the project settings, set the "Root Directory" to `frontend` (or leave empty if you prefer to use the `vercel.json`).
4. Set the Framework Preset to "Create React App" (Vercel should detect it automatically).
5. Build Command: `npm run build` (default). Output Directory: `build` (default).
6. Add the following Environment Variables in Vercel (Project Settings > Environment Variables):
	- `REACT_APP_API_URL` = `https://<your-backend-domain>/api` (example: `https://my-backend.onrender.com/api`)
	- `REACT_APP_SOCKET_URL` = `https://<your-backend-domain>` (example: `https://my-backend.onrender.com`)

Important: Socket.IO is a long-lived WebSocket server. Vercel's serverless functions are not suitable to host a Socket.IO server reliably. So you should host the backend (the Socket.IO + Express server) on a platform that supports persistent sockets (Render, Railway, Heroku, or a VPS). Then point the frontend's environment variables to that backend URL as shown above.

Deploying backend (socket server)

Render YAML (optional)

There is a `render.yaml` template at the repo root that describes a single Web Service which builds the `backend` (the backend's `postinstall` builds the frontend). To use it:

- Update `render.yaml` and change the `name` field under `services` to a unique Render service name (for example `my-app-backend`).
- You can either create the service through the Render dashboard (recommended) or use the Render CLI to create/update the service from this file.

If using the Render dashboard, follow the UI steps below for a single-service deployment. If you prefer CLI, install Render CLI and use it to apply the configuration (CLI usage may change over time; consult Render docs if needed).

CI auto-deploy (GitHub Actions) — Vercel + Fly

I added a GitHub Actions workflow at `.github/workflows/deploy.yml` that will:
- Build and deploy the frontend to Vercel.
- Build and deploy the backend to Fly (uses the provided `fly.toml` / Dockerfile).

Required GitHub Secrets (repository Settings → Secrets → Actions):
- `VERCEL_TOKEN` — your Vercel personal token (create at https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` — your Vercel organization ID (you can find it in the project settings or via the Vercel CLI)
- `VERCEL_PROJECT_ID` — your Vercel project ID (found in project settings)
- `FLY_API_TOKEN` — Fly API token (create at https://fly.io/account/personal_access_tokens)

Optional DockerHub secrets (only if you want to push images to Docker Hub as part of CI):
- `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (the workflow logs in if provided)

How to use
1. Add the secrets above to your GitHub repo.
2. Push to `main`.
3. The workflow will run and deploy the frontend to Vercel and the backend to Fly.

Notes
- You must have created the Vercel project beforehand or know its org/project IDs.
- For Fly, ensure `fly.toml` exists at the repo root or update the workflow to pass `--app <your-app-name>` in the deploy args.
- If you prefer manual/developer-first deploys, you can skip adding these secrets and instead run the explicit `flyctl` and Vercel CLI commands locally as shown earlier.

Testing after deploy
1. Deploy backend to Render/Heroku and copy its public URL (e.g. `https://my-backend.onrender.com`).
2. In Vercel, set `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` to point to that backend (see variables above), then redeploy the frontend.
3. Visit your Vercel domain and test creating/joining rooms — sockets should connect to the backend host.

If you want, I can prepare a short `deploy-backend-to-render.md` with exact Render settings and copy-paste environment values. Tell me which host you prefer for the backend and I will generate the exact per-provider instructions and any config files needed.

Notes & troubleshooting
- If sockets fail after proxying, confirm Nginx forwards upgrade headers and the backend is listening on the expected port.
- Use `pm2 logs <name>` or Heroku/Render logs to diagnose runtime errors.

If you want I can add a ready-to-run GitHub Actions workflow that deploys directly to Heroku (requires HEROKU_API_KEY and HEROKU_APP_NAME secrets) — tell me which provider and I will add it next.
