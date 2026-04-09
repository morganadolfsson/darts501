# Darts 501 — Multiplayer Scoreboard

## Overview
Real-time multiplayer darts 501 scoreboard web app. Players share a single scoreboard via a join code — no auth required.

## Live URLs
- **Production**: https://rambmo.com
- **Vercel**: https://darts501.vercel.app
- **Backend API**: https://darts-0nzt.api.codehooks.io/dev

## Architecture
- **Frontend**: React 18 + Vite + TypeScript → deployed on Vercel (free tier)
- **Backend**: Codehooks.io (`darts-0nzt` project, `dev` space) — session CRUD + Pusher triggers
- **Real-time**: Pusher Channels (free tier, cluster `eu`) — broadcasts state changes
- **Session model**: Client-authoritative, last-write-wins. Join via 6-char code.

## Key Design Decisions
- `useReducer` for all game state (fixes stale-state bugs from React batching)
- Full-state sync over Pusher (not event sourcing) — any client can join mid-game
- No auth — random UUID stored in localStorage as userId
- Backend is stateless relay: saves state to DB, triggers Pusher, returns

## Project Structure
```
dart-app/
  src/
    main.tsx              — BrowserRouter wrapper
    App.tsx               — Routes: /, /session/:id, /local
    App.css               — All styles
    lib/
      types.ts            — Player, Dart, GameState, GameAction, Session
      checkouts.ts        — Checkout suggestion lookup (2–170)
      game-logic.ts       — Pure helpers (bust, win, replay, next player)
      game-reducer.ts     — useReducer reducer + initial state factory
      api.ts              — Codehooks fetch wrappers
      pusher.ts           — Pusher client subscribe/unsubscribe
      user-id.ts          — localStorage UUID generator
    hooks/
      use-game.ts         — useReducer wrapper with convenience methods
      use-session.ts      — use-game + API sync + Pusher subscription
    components/
      HomePage.tsx        — Create/join session
      SessionPage.tsx     — Multiplayer game view
      LocalGame.tsx       — Offline single-device game
      GameSetup.tsx       — Player names, count, match format
      Scoreboard.tsx      — Scores, sets/legs, checkout hints
      DartInput.tsx       — Number pad + multiplier selector
      DartHistory.tsx     — History table with inline edit
      GameOver.tsx        — Match over + new match button
  backend/
    index.js              — Codehooks routes (sessions CRUD + Pusher)
    config.json           — { "space": "dev" }
    package.json          — codehooks-js, pusher
  vercel.json             — SPA rewrites
  .env.example            — Template for env vars
```

## External Services
| Service | Project | Dashboard |
|---------|---------|-----------|
| Vercel | darts501 (prj_lpURKTnTpaGKzwmCUG3JlXLhRTjp) | vercel.com/darts1/darts501 |
| Codehooks | darts-0nzt | codehooks.io |
| Pusher | app_id 2139312, cluster eu | dashboard.pusher.com |
| GitHub | morganadolfsson/darts501 | github.com/morganadolfsson/darts501 |

## Environment Variables
### Frontend (.env)
- `VITE_API_URL` — Codehooks API base URL
- `VITE_API_KEY` — Codehooks API token
- `VITE_PUSHER_KEY` — Pusher app key (public)
- `VITE_PUSHER_CLUSTER` — Pusher cluster

### Backend (coho set-env)
- `PUSHER_APP_ID` — Pusher app ID
- `PUSHER_KEY` — Pusher app key
- `PUSHER_SECRET` — Pusher secret (encrypted)
- `PUSHER_CLUSTER` — Pusher cluster

## Development
```bash
cd dart-app
npm install
npm run dev          # localhost:5173

cd backend
npm install
coho deploy --projectname darts-0nzt
coho logs --follow
```

## Game Rules
- Standard 501 darts: start at 501, count down to 0
- Must finish on a double or bullseye (double-out)
- Bust if score goes below 0, equals 1, or hits 0 without a double
- Configurable legs per set and sets per match
- Supports 2 or 3 players
