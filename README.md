# MarketPilot AI

**Educational Crypto Chart Analysis with AI-Style Scan Reports**

> ⚠️ MarketPilot AI is an educational chart analysis tool. It does **not** provide financial advice, buy/sell signals, guaranteed predictions, or profit recommendations.

---

## What Is MarketPilot AI?

MarketPilot AI is a premium educational market chart analysis platform. It helps users study crypto charts using live Binance market data, timeframe-aware technical tools, AI-style scan reports, scenario cases, video-style explanations, and downloadable reports — all from one beautiful dark dashboard.

---

## Features

| Feature | Status |
|---|---|
| Landing Page | ✅ Complete |
| Login / Demo Auth | ✅ Complete |
| Main Dashboard | ✅ Complete |
| AI Chart Scan | ✅ Complete |
| AI Chat Assistant | ✅ Complete |
| 50+ Tools Directory | ✅ Complete |
| Interactive Suite (Calculators) | ✅ Complete |
| Reports & Export | ✅ Complete |
| Pricing Page | ✅ Complete (Coming Soon) |
| Feedback / Contact | ✅ Complete (mailto) |
| Compliance / Disclaimer | ✅ Complete |
| Settings | ✅ Complete |
| 404 Not Found | ✅ Complete |

### Core Capabilities
- **Live Binance Crypto Charts** — BTC, ETH, BNB, SOL, XRP, DOGE, ADA, AVAX, DOT, MATIC, LTC, TRX, LINK, BCH, UNI (15+ pairs)
- **Timeframes** — 1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W, 1M
- **50+ Technical Tools** — Trend, Momentum, Volume, Volatility, S/R, Price Action, Patterns, Risk Tools
- **AI-Style Scan Reports** — Timeframe-aware educational analysis
- **Scenario Clarity Cards** — Upside, Downside, Sideways educational scenarios
- **Video Breakdown** — Narrated 8-step guided lessons
- **Download Reports** — TXT educational scan reports
- **Screenshot Mode** — Visual reference upload (educational only)
- **Demo Mode** — No login required, full-featured offline experience

---

## Tech Stack

- **Framework**: Vite + React 18
- **Styling**: Tailwind CSS v4
- **Charts**: lightweight-charts (TradingView)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data**: Binance Public REST + WebSocket (no API key needed)

---

## Environment Variables

Copy `.env` and configure:

```bash
cp .env .env.local
```

### Required (Crypto Mode)
```env
VITE_MARKET_DATA_MODE=binance
VITE_ENABLE_DEMO_FEED=true
VITE_BINANCE_PUBLIC_MODE=true
```

### Optional Future Integrations
```env
VITE_TWELVEDATA_API_KEY=       # Stocks/forex (future)
VITE_ALPHAVANTAGE_API_KEY=     # Stocks (future)
VITE_SUPABASE_URL=             # Cloud login (future)
VITE_SUPABASE_ANON_KEY=        # Cloud login (future)
VITE_RAZORPAY_KEY_ID=          # Payments (future)
```

### NEVER expose in frontend
```
OPENAI_API_KEY
RAZORPAY_KEY_SECRET
SUPABASE_SERVICE_ROLE_KEY
```

---

## Local Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment (Vercel)

1. Push repository to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `VITE_MARKET_DATA_MODE=binance`
   - `VITE_ENABLE_DEMO_FEED=true`
   - `VITE_BINANCE_PUBLIC_MODE=true`
4. Deploy — no build config changes needed

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide.

---

## Architecture Limitations (v1.0)

| Feature | Status |
|---|---|
| Forex / Stocks / Commodities | Coming in future version |
| AI Vision Screenshot Analysis | Requires backend (Backend Required) |
| Cloud Saved Reports | Requires Supabase backend |
| Real Payments | Razorpay — Coming Soon |
| OpenAI Chat Assistant | Backend Required (currently local mock) |

---

## Safety & Educational Policy

MarketPilot AI strictly follows an educational-only policy:

- ❌ No buy/sell signals
- ❌ No profit guarantees
- ❌ No financial advice
- ✅ Educational chart structure study only
- ✅ Scenario "possible cases" only
- ✅ Clarity scores = chart structure quality (not win probability)

---

## Roadmap

- [ ] Cloud login (Supabase)
- [ ] Saved report history
- [ ] PDF report export
- [ ] Pro plan (Razorpay)
- [ ] Forex/Stocks via Twelve Data
- [ ] AI Vision screenshot analysis (backend)
- [ ] Mobile PWA

---

## Disclaimer

MarketPilot AI is an educational chart analysis tool. It does not provide financial advice, buy/sell signals, guaranteed predictions, or profit recommendations. All scan results, scenario cases, and clarity scores are for educational chart study only. Past chart patterns do not guarantee future market behavior. Always consult a qualified financial advisor before making investment decisions.

---

© 2025 MarketPilot AI — Educational Platform
