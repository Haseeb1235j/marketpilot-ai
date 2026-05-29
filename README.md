# MarketPilot AI

MarketPilot AI is a comprehensive educational candlestick scanning and technical analysis simulator. It is designed to assist traders and learners in analyzing chart patterns, evaluating key indicators, and building mock scenario risk assessments without using real capital or live broker interfaces.

> [!IMPORTANT]
> **EDUCATIONAL-ONLY DISCLAIMER**
> MarketPilot AI is strictly an educational tool and simulator. It does not provide real financial advice, execute live trades, connect to trading broker accounts, or support real money operations. All trade scanning and pattern detections are simulated and designed for educational research only.

---

## Technical Stack

- **Core**: HTML5 & React (v19)
- **Styling**: Tailwind CSS & Vanilla CSS modules
- **Charts**: Lightweight Charts (TradingView) for interactive canvas drawing
- **State & Animations**: React hooks & Framer Motion
- **Build Tooling**: Vite for fast bundling and Hot Module Replacement (HMR)
- **Indicators**: `technicalindicators` for client-side mathematical calculations

---

## Key Features

1. **Interactive Charting Canvas**: Fast Lightweight Charts integration supporting zoom, pan, and real-time updates.
2. **Double Feeds Engine**:
   - **Demo Feed Mode**: Uses custom seeded candle data to run offline without any API keys.
   - **Binance Public Market Data**: Loads historical REST spot candles and updates the latest candle in real time via public WebSockets.
3. **Multi-Timeframe Analysis**: Full validation and charting for `1m`, `5m`, `15m`, `30m`, `1h`, `4h`, `1D`, `1W`, and `1M`.
4. **Tool-Specific Scan Engine**: Scans charts with 50+ technical tools (Support/Resistance, EMAs, Bollinger Bands, RSI, Candlestick Patterns) and outputs observations, risk parameters, and watch zones.
5. **Scenario Assessments**: Compiles automated upside, downside, and sideways path risk guides.
6. **Download Report**: Generates and downloads plain-text structural scan reports based on frozen snapshot candles.
7. **API Readiness Status**: Client-side monitoring card showcasing which APIs are connected or require proxy/backend integrations.
8. **Interactive Suite**: Educational guides, lessons, and interactive quiz sheets.

---

## Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application will start locally at `http://localhost:5173/`.

### 3. Build for Production
```bash
npm run build
```
This generates optimized static files in the `/dist` directory.

---

## Environment Variables

Copy `.env.example` to `.env` or `.env.local` to customize settings.

```env
# Set 'demo' or 'binance' mode
VITE_MARKET_DATA_MODE=binance
VITE_ENABLE_DEMO_FEED=true
VITE_BINANCE_PUBLIC_MODE=true
```

---

## Security Guidelines

- **No Secrets in Frontend**: Never place private credentials, Supabase service role keys, or OpenAI API keys inside client-side environment configurations.
- **Backend Proxies**: Route AI Vision requests, payment processing, or database management tasks through a secure backend server to keep keys protected.

---

## Future Roadmap

- **Phase 5A**: Production Deployment Preparation.
- **Phase 5B**: Integrate Twelve Data APIs for Stocks, Forex, and Market Indices.
- **Phase 5C**: Enable AI Vision analysis via backend-proxied OpenAI API connections.
- **Phase 5D**: Add Supabase auth systems for user profile syncs.
- **Phase 5E**: Integrate Razorpay payment flow tests.
