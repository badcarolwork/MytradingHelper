# MyTradeHelper Frontend

Mobile-first React/Next.js trading automation dashboard for Bursa Malaysia, Moomoo, Tiger Brokers, and IBKR.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (auth + market prices + trading) |
| Data fetching | TanStack React Query |
| Charts | Recharts |
| Icons | Lucide React |
| Real-time | Native WebSocket hook (auto-reconnect) |

---

## Run locally

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/tradepilot.git
cd tradepilot

# 2. Install
npm install

# 3. Configure
cp .env.example .env.local
# Edit .env.local — point to your FastAPI backend

# 4. Start backend (tradepilot-backend/)
uvicorn app.main:app --reload --port 8000

# 5. Start frontend
npm run dev
# → http://localhost:3000
```

Demo login: `demo@tradepilot.my` / `Demo1234!`

---

## Push to GitHub & go live

### First time

```bash
git init
git add .
git commit -m "feat: TradePilot frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Enable GitHub Pages

1. Repo → **Settings** → **Pages**
2. Source → **GitHub Actions** → Save
3. Every push to `main` auto-deploys to:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### Set production backend URL

Repo → **Settings** → **Secrets and variables** → **Actions** → New secret:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-api.yourdomain.com/api/v1` |
| `NEXT_PUBLIC_WS_URL` | `wss://your-api.yourdomain.com/api/v1/market/ws/prices` |

### Deploy subsequent changes

```bash
git add .
git commit -m "fix: your change"
git push
# GitHub Actions builds + deploys automatically
```

---

## Vercel (alternative — zero config)

```bash
npm i -g vercel
vercel
# Add env vars in Vercel dashboard
```

---

## Project structure

```
src/
├── app/            # Next.js App Router (layout, page, providers)
├── components/
│   ├── ui/         # Badge, Card, Metric, Toggle, Spinner
│   ├── layout/     # TopBar, BottomNav, Toast
│   ├── login/      # Login + 2FA
│   ├── dashboard/  # P&L chart, metrics, kill switch, risk gauge
│   ├── watchlist/  # Live prices, signal scanner
│   ├── strategies/ # CRUD, evaluate, toggle active/paused
│   ├── orders/     # Positions, open orders, history
│   └── settings/   # Risk controls, broker connections, security
├── hooks/          # usePriceFeed (WebSocket)
├── lib/            # api.ts (all endpoints), utils.ts
├── store/          # Zustand stores
└── types/          # All TypeScript interfaces
```

---

## Scripts

```bash
npm run dev      # Dev server → http://localhost:3000
npm run build    # Static export → ./out/
npm run lint     # ESLint
```
