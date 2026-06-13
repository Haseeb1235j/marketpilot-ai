import React from 'react';
import { Lock } from 'lucide-react';

const MARKET_ICONS = {
  forex: '💱',
  stocks: '📈',
  indices: '📊',
  commodities: '🪙',
  etfs: '🗂️',
};

export default function LockedMarketPanel({ info }) {
  if (!info) return null;

  return (
    <div className="locked-market-panel">
      <div className="locked-icon-wrapper">
        <Lock size={32} />
        <span className="market-emoji">{MARKET_ICONS[info.market] || '🔒'}</span>
      </div>
      
      <h2 className="locked-title">
        {info.market.charAt(0).toUpperCase() + info.market.slice(1)} — Provider Required
      </h2>
      
      <p className="locked-description">
        Live {info.market} charts require a connected market data provider.
        This market is not available with the current configuration.
      </p>
      
      <div className="locked-info-card">
        <div className="locked-info-row">
          <span className="locked-label">Required Provider</span>
          <span className="locked-value">{info.providerName || 'Twelve Data / Alpha Vantage / Finnhub'}</span>
        </div>
        <div className="locked-info-row">
          <span className="locked-label">Environment Key</span>
          <code className="locked-key">{info.requiresKey || 'VITE_TWELVEDATA_API_KEY'}</code>
        </div>
        <div className="locked-info-row">
          <span className="locked-label">Current Status</span>
          <span className="locked-status-badge">Not Configured</span>
        </div>
      </div>

      <div className="locked-steps">
        <div className="locked-step">
          <span className="step-num">1</span>
          <span>Get a free API key from twelvedata.com</span>
        </div>
        <div className="locked-step">
          <span className="step-num">2</span>
          <span>Add <code>VITE_TWELVEDATA_API_KEY=your_key</code> to your .env file</span>
        </div>
        <div className="locked-step">
          <span className="step-num">3</span>
          <span>Redeploy the app — {info.market} will activate automatically</span>
        </div>
      </div>

      <p className="locked-disclaimer">
        MarketPilot AI will never show fake live data for this market.
        Only real provider-backed data is displayed.
      </p>
    </div>
  );
}
