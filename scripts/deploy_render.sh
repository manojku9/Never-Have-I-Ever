#!/usr/bin/env bash
set -e

echo "Deploy helper for Render — Single Web Service (backend serves frontend)"

# Check for Render CLI
if ! command -v render &> /dev/null; then
  echo "Render CLI not found. Installing @render/cli globally (requires npm)..."
  if ! command -v npm &> /dev/null; then
    echo "npm not found. Please install Node.js and npm first: https://nodejs.org/"
    exit 1
  fi
  npm install -g @render/cli
  echo "Installed render CLI. You may need to open a new shell to pick up PATH changes."
fi

echo "\nIf you already have a Render account, log in now. This will open a browser window for auth."
read -p "Press Enter to run 'render login' (or Ctrl+C to cancel)" dummy
render login

echo "\nNow you'll create the service in Render. You can either use the web UI or the CLI." 
echo "The repo root contains 'render.yaml' (service name: nhie-backend)."

echo "\nOption A — Use the Render web UI (recommended):"
echo "  1) Open https://dashboard.render.com"
echo "  2) New -> Web Service -> Connect your GitHub repo -> Select this repo"
echo "  3) Set Root Directory: backend"
echo "  4) Build Command: npm ci"
echo "  5) Start Command: npm start"
echo "  6) Set environment variables (MONGODB_URI, NODE_ENV=production, CLIENT_URL) before deploy"
echo "  7) Create the service and click Deploy"

echo "\nOption B — Try with Render CLI (advanced):"
echo "  Note: CLI commands and flags may change. If you prefer automation, use the web UI or consult Render docs."
echo "  Example (you may need to edit):"
echo "    render services create --name nhie-backend --repo <GIT_REPO_URL> --branch main --env node --build-command 'cd backend && npm ci' --start-command 'cd backend && npm start'"

echo "\nAfter creating the service, set the secrets in the Render dashboard or via CLI, for example:\n"
echo "  render services env set nhie-backend MONGODB_URI=\"your_mongo_uri\""
echo "  render services env set nhie-backend CLIENT_URL=\"https://<your-frontend-domain>\""

echo "\nOnce env vars are set, trigger a deploy (via UI or run):"
echo "  render deploy --service nhie-backend"

echo "\nTail logs with: render logs --service nhie-backend"

echo "\nIf you'd like, paste the output of 'render version' here or tell me any errors and I'll help troubleshoot."

exit 0
