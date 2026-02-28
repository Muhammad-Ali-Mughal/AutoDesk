# AutoDesk

AutoDesk is a workflow automation platform with a React frontend and an Express/MongoDB backend.

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas (or local MongoDB)
- Google OAuth credentials (if using Google features)
- Gmail app password (if using email actions)
- OpenAI API key (if using AI workflow generation)

## Project Structure

- `client/` - React + Vite app
- `server/` - Express API + workflow engine

## Initial Setup

1. Install dependencies:

```bash
cd server && npm install
cd ../client && npm install
```

2. Create environment files from examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Fill real credentials in:
- `server/.env`
- `client/.env`

## Required Environment Variables

### Server (`server/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | Yes | Backend port (default `3000`) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `OPENAI_API_KEY` | Optional | Needed for AI workflow generation |
| `GMAIL_USER` | Optional | Sender email for email actions |
| `GMAIL_PASS` | Optional | Gmail app password |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Optional | OAuth callback URL |
| `SUPERADMIN_EMAIL` | Optional | Used by superadmin seeding |
| `SUPERADMIN_PASSWORD` | Optional | Used by superadmin seeding |
| `SUPERADMIN_NAME` | Optional | Used by superadmin seeding |

### Client (`client/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SERVER_URI` | Yes | Base server URL (e.g. `http://localhost:3000`) |

## Running the Project

### Start backend

```bash
cd server
npm run dev
```

Expected logs:
- `Connected to MongoDB Atlas`
- `Server running on PORT: 3000`

### Start frontend

```bash
cd client
npm run dev
```

Open: `http://localhost:5173`

## First-Run Checks

1. Confirm backend health:
   - `GET http://localhost:3000/` should return status OK JSON.
2. Sign up/login from frontend.
3. Open workflow editor and test:
   - webhook trigger setup
   - email action save/load
   - AI workflow generation (if OpenAI key set)

## Common Startup Issues

### 1) MongoDB Atlas connection error / `ReplicaSetNoPrimary`

- Ensure cluster is running (not paused).
- Ensure your current IP is whitelisted in Atlas Network Access.
- Verify username/password and DB name in `MONGODB_URI`.

### 2) OpenAI `429 insufficient_quota`

- Add billing/credits for the project tied to your API key.
- Confirm `OPENAI_API_KEY` is valid and loaded.
- Restart backend after changing `.env`.

### 3) OAuth redirect mismatch

- `GOOGLE_REDIRECT_URI` must exactly match the URI configured in Google Cloud Console.

## Notes

- Keep secrets out of git. Commit only `.env.example` files.
- Use app passwords for Gmail, not normal account password.
