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
git clone https://github.com/badcarolwork/MytradingHelper.git
cd MytradingHelper

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

Demo login: `demo@mytradehelper.my` / `Demo1234!`

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

## Deploy to GitHub Pages

Every push to `main` auto-deploys via GitHub Actions.

Add these secrets in **Repo → Settings → Secrets → Actions**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-api.yourdomain.com/api/v1` |
| `NEXT_PUBLIC_WS_URL` | `wss://your-api.yourdomain.com/api/v1/market/ws/prices` |

Live at: `https://badcarolwork.github.io/MytradingHelper/`

---

## Scripts

```bash
npm run dev      # Dev server → http://localhost:3000
npm run build    # Static export → ./out/
npm run lint     # ESLint
```
