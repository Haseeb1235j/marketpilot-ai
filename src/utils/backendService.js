/**
 * Backend Ready Architecture & Route Proxy Stubs
 * Note: Secret keys require a backend proxy before production.
 * Do not store OpenAI, Razorpay, or Broker execution secrets on the frontend.
 */

const BACKEND_BASE_URL = '/api';

/**
 * Future route: /api/market-data
 * Proxy live requests to protect TwelveData, AlphaVantage, or Broker APIs.
 */
export async function proxyMarketDataFetch({ symbol, timeframe, provider }) {
  console.log(`[API Ready Backend Stub]: Calling ${BACKEND_BASE_URL}/market-data for ${symbol} (${timeframe}) via ${provider}`);
  throw new Error("Requires backend integration. Switched to demo feed.");
}

/**
 * Future route: /api/vision-analysis
 * Endpoint for sending screenshot payloads to OpenAI Vision API securely.
 */
export async function proxyVisionAnalysis(imageFile, calibrationCoordinates) {
  console.log(`[API Ready Backend Stub]: Uploading image to ${BACKEND_BASE_URL}/vision-analysis`);
  throw new Error("Requires backend AI vision integration");
}

/**
 * Future route: /api/create-report
 * Generate PDF reports or compiled summaries on the backend.
 */
export async function proxyCreateReport(analysisSnapshot) {
  console.log(`[API Ready Backend Stub]: Compiling PDF report via ${BACKEND_BASE_URL}/create-report`);
  throw new Error("Report proxy not active. Using frontend client TXT download.");
}

/**
 * Future route: /api/create-payment-order
 * Initialise Razorpay/Stripe checkout orders securely.
 */
export async function proxyCreatePaymentOrder(planId) {
  console.log(`[API Ready Backend Stub]: Initialising checkout session via ${BACKEND_BASE_URL}/create-payment-order`);
  throw new Error("Payments not connected in demo MVP.");
}

/**
 * Future route: /api/user-history
 * Fetch saved preferences, journals, or watchlists from Supabase.
 */
export async function proxyGetUserHistory(userId) {
  console.log(`[API Ready Backend Stub]: Fetching user journal via ${BACKEND_BASE_URL}/user-history`);
  return {
    savedAnalyses: [], // future data structure
    reports: [],
    watchlists: [],
    tradeJournal: [],
    preferences: {}
  };
}
