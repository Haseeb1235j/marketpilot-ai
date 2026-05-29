# Deployment Guide - MarketPilot AI

This guide outlines how to build, preview, and deploy the MarketPilot AI application to a production-ready environment.

---

## 1. Local Building & Previewing

Before deploying, always test the production bundle locally to ensure the build compiles correctly and functions without warnings.

### Build the Project
```bash
cmd.exe /c npm run build
```
This generates the static distribution assets in the `/dist` directory.

### Preview the Build Locally
To run a local web server serving the production distribution:
```bash
cmd.exe /c npm run preview
```
This hosts the compiled files locally (usually at `http://localhost:4173/`). Open this URL in your browser to verify that the app, charts, fallbacks, and tools load and execute properly.

---

## 2. Recommended Deployment Platforms

Since MarketPilot AI is built as a static client-side React single-page application (SPA), it can be deployed for free on any modern static hosting provider:

- **Vercel** (Recommended for Vite/React applications)
- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**

---

## 3. Environment Variables Configuration

Configure the following environment variables in your deployment platform's dashboard:

| Variable Name | Production Value | Description |
| :--- | :--- | :--- |
| `VITE_MARKET_DATA_MODE` | `binance` | Sets the default data feed source to Binance. |
| `VITE_ENABLE_DEMO_FEED` | `true` | Enables automatic fallback to simulated demo data. |
| `VITE_BINANCE_PUBLIC_MODE` | `true` | Allows direct CORS fetching of public spot market data. |

### Optional / Future Integrations
- `VITE_TWELVEDATA_API_KEY`: Third-party stock/forex provider.
- `VITE_ALPHAVANTAGE_API_KEY`: Third-party stock/forex provider.
- `VITE_SUPABASE_URL`: Supabase project database URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase project client anonymous key.
- `VITE_RAZORPAY_KEY_ID`: Payment gateway test key.

---

## 4. Crucial Security Requirements

> [!CAUTION]
> **PROTECT SECRET KEYS**
> - **DO NOT** add any production secret keys (such as `OPENAI_API_KEY`, Supabase service role keys, Razorpay secret keys, or broker access keys) to the frontend env variables.
> - The client bundle is public. Any key placed here can be read by visitors.
> - To integrate advanced AI, payments, or database saves securely, route requests through a secure server-side backend proxy.

---

## 5. Client-Side Routing Integrity

- MarketPilot AI utilizes a client-side React state-based router (`activeSection` persisted to `localStorage`).
- It does **not** rely on the HTML5 History API paths (e.g. `/scan`, `/chat`).
- Because of this, refreshing pages in the production environment will **never** throw a 404 error. The browser always successfully requests `index.html` at `/`, and the React runtime automatically recovers the active view. No rewrite configurations (e.g., `vercel.json` rewrites or Netlify `_redirects` files) are required.

---

## 6. Binance Stream Fallbacks & Public Access

Due to browser network security, ISP filters, or adblockers, direct access to the public Binance API endpoints (`api.binance.com` and `stream.binance.com`) may occasionally be blocked:
- **REST Fallback**: If the initial candle fetch fails, the app switches to the seed data feed and displays `"Demo Feed — Binance unavailable."`
- **WebSocket Fallback**: If the WebSocket stream fails to connect or disconnects repeatedly, it will fail gracefully after 3 attempts, showing `"Binance Spot Market Data • Historical"` and notifying: `"Live update unavailable. Historical Binance candles remain loaded."`

This ensures the user experience is stable and never crashes.

---

## 7. Current Architectural Limitations

- **Simulated Feeds for Non-Crypto**: Stocks, forex, indices, and commodities are powered by the Demo Feed generator.
- **Client-Side Assistant**: The AI Chat Assistant utilizes a local mock database. A backend proxy is required to connect to OpenAI Vision model APIs.
- **Mock Trading**: All orders and calculations in the Interactive Suite are simulated. No real broker execution exists.
