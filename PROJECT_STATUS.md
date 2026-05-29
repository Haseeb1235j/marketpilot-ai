# Project Status: MarketPilot AI

This document outlines the current milestone status, implemented features, technical limitations, and the upcoming roadmap phases for the MarketPilot AI codebase.

---

## Completed Milestones

- **Stable MVP UI & Sidebar**: Dashboard structure optimized with collapsible sidebars and responsive cards.
- **Full View Chart Canvas**: Fixed scaling, sizing, and container overlays on full view maximizing/minimizing.
- **Tools & Analysis Registry**: Standardized 50+ technical tools (Support/Resistance, EMAs, BB, RSI) and mapped calculations locally.
- **Downloadable Text Reports**: Generates structural educational summaries of calculations from frozen data snapshots.
- **Demo Feed Mode**: Stable offline data generator for stock, crypto, index, forex, and commodity mock pairs.
- **Binance Spot REST Historical Candles**: Connects and pulls up to 300 public spot candles for supported USDT crypto pairs.
- **Binance WebSocket Live Candle Updates**: Connects directly to Binance live WebSocket stream, updating or appending ticks to the chart.
- **Preserved Chart Viewport**: Viewport zoom/pan is preserved; live ticks do not force-scroll or disrupt charts.
- **Staleness Tracking Warning Banner**: Warns users if candles update after an analysis snapshot is run.
- **API Readiness Status**: Comprehensive diagnostic panel displaying live feed connection statuses.

---

## Current Working Features

- **Dashboard / Sidebars**: Quick watchlist favorites, collapse bars, custom inputs, and market selections.
- **TradingView-Style Candlestick Canvas**: Powered by Lightweight Charts, displaying OHLC stats and volume histograms.
- **Binance Spot REST + WebSocket Engine**: Live ticks for `BTC/USDT`, `ETH/USDT`, `BNB/USDT`, `SOL/USDT`, `XRP/USDT`, `DOGE/USDT`, `ADA/USDT`, `AVAX/USDT`, `DOT/USDT`, and `MATIC/USDT`.
- **Supported Timeframes**: Mapped strictly to `1m`, `5m`, `15m`, `30m`, `1h`, `4h`, `1D`, `1W`, and `1M`.
- **Run Scan Analysis Action**: Starts a 1.8-second simulation scan and renders the report.
- **AI Scan Results**: Populates technical readings, explanations, structures, and watch zones.
- **Scenario Cases Guides**: Compiles upside, downside, and sideways target guide cards.
- **Download Report Option**: Exports plain-text report files.
- **Static Video Breakdown Lesson**: High-quality lessons with static playback guides.
- **50+ Tools Directory**: Searchable registry showcasing descriptions, categories, and codes.
- **Interactive Suite**: Quiz modules, mock calculators, and guides.
- **Compliance Warnings & API Status**: Regulatory disclosures and API connection indicators.

---

## Known Limitations

- **Non-Crypto Real Feeds**: Real-time stock, index, forex, and commodity feeds require API key configuration.
- **Third-Party Key Connectors**: Twelve Data and Alpha Vantage keys are not set up by default.
- **AI Chat & Vision Assist**: Local database answers questions based on analysis calculations. OpenAI ChatGPT Vision requires a secure backend proxy to keep keys protected.
- **Supabase Authentication**: DB syncing features are ready but not active without user auth setups.
- **Razorpay Sandbox**: Public sandbox test credentials only. No actual checkout exists.
- **Trading Integration**: Strictly simulated; no broker API access or buy/sell execution logic.

---

## Next Recommended Phases

- **Phase 5A: Deployment Preparation**: Setup static hosting (Vercel/Netlify/Vite build deployment assets).
- **Phase 5B: Twelve Data Integration**: Integrate twelve data tickers for stock, forex, and index markets.
- **Phase 5C: Backend Proxy for OpenAI Vision**: Securely wrap OpenAI vision models in a server proxy.
- **Phase 5D: Supabase auth & Cloud Saves**: Activate database connections for profile syncs and saved reports.
- **Phase 5E: Razorpay Checkout Webhook**: Test payment checks on backend hooks.
