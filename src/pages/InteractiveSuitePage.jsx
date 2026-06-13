import React, { useState, useEffect } from 'react';
import { Calculator, BookOpen, Trash2, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import Tabs from '../components/Tabs';
import { TOOLS_DIRECTORY } from '../data/toolsDirectory';

export default function InteractiveSuitePage() {
  const [activeTab, setActiveTab] = useState('position');

  const tabs = [
    { value: 'position', label: 'Position Sizing', icon: Calculator },
    { value: 'risk_reward', label: 'Risk/Reward Ratio', icon: Calculator },
    { value: 'fib_pivot', label: 'Fib & Pivot Math', icon: Calculator },
    { value: 'atr_stop', label: 'ATR Stop', icon: Calculator },
    { value: 'journal', label: 'Trade Journal', icon: BookOpen },
    { value: 'comparison', label: 'Tool Comparison', icon: ArrowRightLeft }
  ];

  // 1. Position Sizing States
  const [capital, setCapital] = useState(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('mp_risk_capital');
    return saved ? Number(saved) : 10000;
  });
  const [riskPercent, setRiskPercent] = useState(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('mp_risk_percent');
    return saved ? Number(saved) : 1;
  });
  const [entryPrice, setEntryPrice] = useState(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('mp_risk_entry');
    return saved ? Number(saved) : 100;
  });
  const [stopPrice, setStopPrice] = useState(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('mp_risk_stop');
    return saved ? Number(saved) : 95;
  });
  const [posSizeResult, setPosSizeResult] = useState(null);

  // 2. Risk/Reward States
  const [rrEntry, setRrEntry] = useState(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('mp_risk_rr_entry');
    return saved ? Number(saved) : 100;
  });
  const [rrStop, setRrStop] = useState(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('mp_risk_rr_stop');
    return saved ? Number(saved) : 95;
  });
  const [rrTarget, setRrTarget] = useState(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('mp_risk_rr_target');
    return saved ? Number(saved) : 115;
  });
  const [rrResult, setRrResult] = useState(null);

  // 3. Fib & Pivot States
  const [fibLow, setFibLow] = useState(150);
  const [fibHigh, setFibHigh] = useState(250);
  const [fibDirection, setFibDirection] = useState('up');
  const [fibLevels, setFibLevels] = useState(null);

  const [prevHigh, setPrevHigh] = useState(120);
  const [prevLow, setPrevLow] = useState(100);
  const [prevClose, setPrevClose] = useState(115);
  const [pivotLevels, setPivotLevels] = useState(null);

  // 4. ATR Stop States
  const [atrEntry, setAtrEntry] = useState(150);
  const [atrVal, setAtrVal] = useState(4.5);
  const [atrMult, setAtrMult] = useState(2);
  const [atrResult, setAtrResult] = useState(null);

  // 5. Journal States
  const [journalLogs, setJournalLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('mp_journal_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [journalInput, setJournalInput] = useState({
    asset: 'BTC/USDT',
    type: 'LONG',
    entry: '',
    stop: '',
    target: '',
    notes: ''
  });

  // 6. Multi-tool Comparison States
  const [toolA, setToolA] = useState('rsi');
  const [toolB, setToolB] = useState('macd');

  // Trigger calculations on state shifts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mp_risk_capital', capital.toString());
      localStorage.setItem('mp_risk_percent', riskPercent.toString());
      localStorage.setItem('mp_risk_entry', entryPrice.toString());
      localStorage.setItem('mp_risk_stop', stopPrice.toString());
    }

    // Position Size Calculation
    const riskAmt = capital * (riskPercent / 100);
    const stopDist = Math.abs(entryPrice - stopPrice);
    if (stopDist > 0) {
      const units = riskAmt / stopDist;
      setPosSizeResult({
        riskAmount: riskAmt,
        stopDistance: stopDist,
        stopPercent: (stopDist / entryPrice) * 100,
        units: units,
        totalValue: units * entryPrice
      });
    } else {
      setPosSizeResult(null);
    }
  }, [capital, riskPercent, entryPrice, stopPrice]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mp_risk_rr_entry', rrEntry.toString());
      localStorage.setItem('mp_risk_rr_stop', rrStop.toString());
      localStorage.setItem('mp_risk_rr_target', rrTarget.toString());
    }

    // Risk Reward Calculation
    const risk = Math.abs(rrEntry - rrStop);
    const reward = Math.abs(rrTarget - rrEntry);
    if (risk > 0) {
      setRrResult({
        risk,
        reward,
        ratio: reward / risk,
        stopPercent: (risk / rrEntry) * 100,
        targetPercent: (reward / rrEntry) * 100
      });
    } else {
      setRrResult(null);
    }
  }, [rrEntry, rrStop, rrTarget]);

  useEffect(() => {
    // Fib Retracement
    const diff = fibHigh - fibLow;
    if (diff > 0) {
      const levels = [0.236, 0.382, 0.5, 0.618, 0.786];
      const calcs = levels.reduce((acc, lvl) => {
        const val = fibDirection === 'up' 
          ? fibHigh - diff * lvl 
          : fibLow + diff * lvl;
        acc[lvl * 100] = val;
        return acc;
      }, {});
      setFibLevels(calcs);
    } else {
      setFibLevels(null);
    }
  }, [fibLow, fibHigh, fibDirection]);

  useEffect(() => {
    // Pivot Points (Standard)
    const pp = (prevHigh + prevLow + prevClose) / 3;
    const r1 = 2 * pp - prevLow;
    const s1 = 2 * pp - prevHigh;
    const r2 = pp + (prevHigh - prevLow);
    const s2 = pp - (prevHigh - prevLow);
    
    setPivotLevels({
      PP: pp,
      R1: r1,
      S1: s1,
      R2: r2,
      S2: s2
    });
  }, [prevHigh, prevLow, prevClose]);

  useEffect(() => {
    // ATR Stop Calculations
    const stopDistance = atrVal * atrMult;
    setAtrResult({
      longStop: atrEntry - stopDistance,
      shortStop: parseFloat(atrEntry) + stopDistance,
      stopDistance,
      stopPercent: (stopDistance / atrEntry) * 100
    });
  }, [atrEntry, atrVal, atrMult]);

  // Handle Journal Addition
  const handleAddJournal = (e) => {
    e.preventDefault();
    if (!journalInput.entry) return;
    
    const newLog = {
      ...journalInput,
      id: Date.now(),
      date: new Date().toLocaleDateString()
    };
    const updated = [newLog, ...journalLogs];
    setJournalLogs(updated);
    localStorage.setItem('mp_journal_logs', JSON.stringify(updated));
    setJournalInput({
      asset: 'BTC/USDT',
      type: 'LONG',
      entry: '',
      stop: '',
      target: '',
      notes: ''
    });
  };

  const handleDeleteJournal = (id) => {
    const updated = journalLogs.filter(log => log.id !== id);
    setJournalLogs(updated);
    localStorage.setItem('mp_journal_logs', JSON.stringify(updated));
  };

  // Static lookups for comparison details
  const getToolCompDetails = (toolId) => {
    const tool = TOOLS_DIRECTORY.find(t => t.id === toolId);
    if (!tool) return {};
    
    // Add specific details
    const details = {
      rsi: {
        purpose: "Measures momentum speed and expansion to find limits.",
        useCase: "Consolidations or trend extreme study.",
        strengths: "Clear boundary scales (30/70). Bounces indicate momentum direction.",
        weaknesses: "Can stay overbought/oversold during strong trends.",
        mistakes: "Assuming touch of 70 is an automatic short entry.",
        combos: "EMA / SMA (to filter trade directions) or Volume."
      },
      macd: {
        purpose: "Identifies crossovers and momentum speed convergence.",
        useCase: "Trending markets.",
        strengths: "Less prone to sideways false alerts. Histogram shows rate of change.",
        weaknesses: "Lagging indicator. Sideways markets generate multiple crossings.",
        mistakes: "Buying immediately after crossover during a massive downtrend.",
        combos: "RSI (to confirm overbought range during crossover)."
      },
      bollinger_bands: {
        purpose: "Plots volatility boundaries based on standard deviations.",
        useCase: "Volatile breakouts or range channels.",
        strengths: "Adapts dynamically to quiet or explosive periods.",
        weaknesses: "Gives zero direction of breakout during narrow squeezes.",
        mistakes: "Shorting upper band when price is 'walking the band' up.",
        combos: "RSI or Candlestick patterns at bands."
      },
      sma: {
        purpose: "Identifies primary dynamic support floors.",
        useCase: "Long-term trend definitions.",
        strengths: "Extremely reliable filters. Smooths high-volatility noise.",
        weaknesses: "Heavily delayed reaction to immediate pivots.",
        mistakes: "Chasing breakouts when price is far away from average line.",
        combos: "MACD or Volume."
      },
      ema: {
        purpose: "Identifies short-term dynamic support pivots.",
        useCase: "Short-term swing study.",
        strengths: "Faster response to crossovers than simple averages.",
        weaknesses: "Generates more noise during flat consolidations.",
        mistakes: "Treating every touch as an automatic entries zone.",
        combos: "Candlestick pattern retests."
      },
      trendline: {
        purpose: "Plots sloped support and resistance vectors.",
        useCase: "Trend channels.",
        strengths: "Follows market structure directly. Visualizes slopes.",
        weaknesses: "Subjective. Connecting wrong wicks creates fake boundaries.",
        mistakes: "Forcing lines that do not have at least three swing tests.",
        combos: "Volume expansion confirmations."
      },
      volume: {
        purpose: "Tracks total transaction units to verify momentum.",
        useCase: "Breakout validation.",
        strengths: "Shows institutional presence. Leads price actions.",
        weaknesses: "Doesn't show direction. Quiet hours skew averages.",
        mistakes: "Chasing a breakout on low, declining volume.",
        combos: "Support/Resistance breakouts."
      },
      horizontal_sr: {
        purpose: "Marks historical horizontal key supply/demand block price lines.",
        useCase: "All market conditions.",
        strengths: "Highly respected floor/ceiling nodes across timeframes.",
        weaknesses: "Zones can break during heavy news catalyst events.",
        mistakes: "Forgetting that support once broken often acts as resistance.",
        combos: "RSI or Candlestick patterns."
      },
      candlestick_patterns: {
        purpose: "Identifies immediate buyer/seller absorption structures.",
        useCase: "Retests of S/R zones.",
        strengths: "Instant price indicators. Requires zero mathematical lag.",
        weaknesses: "Fails frequently when traded in isolation without zones.",
        mistakes: "Trading a hammer in the middle of a consolidation zone.",
        combos: "Horizontal Support/Resistance."
      }
    };

    return {
      ...tool,
      ...(details[toolId] || {
        purpose: "Technical analysis overlay parameter.",
        useCase: "Study market structures.",
        strengths: "Standard math indicator.",
        weaknesses: "Subject to market lag.",
        mistakes: "Isolation trading.",
        combos: "Horizontal S/R."
      })
    };
  };

  const compA = getToolCompDetails(toolA);
  const compB = getToolCompDetails(toolB);

  return (
    <div className="flex flex-col grow w-full gap-5 h-full p-4 md:p-6 overflow-hidden">
      
      {/* Top tab selector */}
      <div className="shrink-0">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Main body based on selected tab */}
      <div className="flex-1 overflow-y-auto pr-1">
        
        {/* 1. Position Sizing Tab */}
        {activeTab === 'position' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Position Sizing Calculator</CardTitle>
                <CardDescription>Calculate units based on risk parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Capital Size ($)"
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Risk Per Trade (%)"
                    type="number"
                    step="0.1"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(Number(e.target.value))}
                  />
                  <Input
                    label="Entry Price ($)"
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                  />
                </div>
                <Input
                  label="Stop Loss Price ($)"
                  type="number"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(Number(e.target.value))}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1d] border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Position Output Metrics</CardTitle>
                <CardDescription>Mathematical sizing breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {posSizeResult ? (
                  <div className="space-y-3.5 text-xs font-mono">
                    <div className="flex justify-between border-b border-darkBorder/40 pb-2">
                      <span className="text-slate-500">Total Capital Risked:</span>
                      <span className="text-white font-bold">${posSizeResult.riskAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-darkBorder/40 pb-2">
                      <span className="text-slate-500">Stop Loss Distance:</span>
                      <span className="text-white font-bold">
                        ${posSizeResult.stopDistance.toFixed(2)} ({posSizeResult.stopPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-darkBorder/40 pb-2 text-cyan-400 font-bold">
                      <span>Position Sizing (Units):</span>
                      <span>{posSizeResult.units.toFixed(4)} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Nominal Value:</span>
                      <span className="text-white font-bold">${posSizeResult.totalValue.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-3 p-3 bg-cyan-950/10 border border-cyan-500/10 rounded-lg text-[10px] text-cyan-400 font-sans leading-relaxed">
                      💡 Sizing rule: To maintain maximum risk at {riskPercent}%, keep the nominal contract size at {posSizeResult.units.toFixed(2)} units. If stop loss is hit, the losses are limited to ${posSizeResult.riskAmount.toFixed(2)}.
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    Please input a stop loss price below or above entry to compute units.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. Risk/Reward Ratio Tab */}
        {activeTab === 'risk_reward' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Risk-Reward Planner</CardTitle>
                <CardDescription>Determine reward ratio metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Entry Price ($)"
                  type="number"
                  value={rrEntry}
                  onChange={(e) => setRrEntry(Number(e.target.value))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Stop Loss ($)"
                    type="number"
                    value={rrStop}
                    onChange={(e) => setRrStop(Number(e.target.value))}
                  />
                  <Input
                    label="Take Profit Target ($)"
                    type="number"
                    value={rrTarget}
                    onChange={(e) => setRrTarget(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1d] border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Ratio Output Metrics</CardTitle>
                <CardDescription>Expectancy study parameters</CardDescription>
              </CardHeader>
              <CardContent>
                {rrResult ? (
                  <div className="space-y-3.5 text-xs font-mono">
                    <div className="flex justify-between border-b border-darkBorder/40 pb-2">
                      <span className="text-slate-500">Risk Distance:</span>
                      <span className="text-red-400 font-bold">
                        -${rrResult.risk.toFixed(2)} ({rrResult.stopPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-darkBorder/40 pb-2">
                      <span className="text-slate-500">Reward Distance:</span>
                      <span className="text-emerald-400 font-bold">
                        +${rrResult.reward.toFixed(2)} ({rrResult.targetPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-cyan-400 font-bold border-b border-darkBorder/40 pb-2 text-sm">
                      <span>Risk-to-Reward Ratio:</span>
                      <Badge variant={rrResult.ratio >= 2 ? 'emerald' : 'yellow'} className="text-xs">
                        1 : {rrResult.ratio.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="pt-3 p-3 bg-slate-950 border border-darkBorder/60 rounded-lg text-[10px] text-slate-400 font-sans leading-relaxed space-y-2">
                      <span className="font-bold text-white block uppercase tracking-wider">Expectancy Rule</span>
                      <p>
                        With a Risk-Reward ratio of 1:{rrResult.ratio.toFixed(2)}, you require a win-rate of only {((1 / (1 + rrResult.ratio)) * 100).toFixed(1)}% to mathematically break even (excluding spread and transaction slippage costs).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    Please input entry, stop loss, and target values.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3. Fib & Pivot Math Tab */}
        {activeTab === 'fib_pivot' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {/* Fibonacci Retracements */}
            <Card>
              <CardHeader>
                <CardTitle>Fibonacci Retracements</CardTitle>
                <CardDescription>Mathematical ratios between swing peaks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Swing Low ($)"
                    type="number"
                    value={fibLow}
                    onChange={(e) => setFibLow(Number(e.target.value))}
                  />
                  <Input
                    label="Swing High ($)"
                    type="number"
                    value={fibHigh}
                    onChange={(e) => setFibHigh(Number(e.target.value))}
                  />
                </div>
                <Select
                  label="Retracement Trend"
                  options={[
                    { value: 'up', label: 'Uptrend Pullback (Support)' },
                    { value: 'down', label: 'Downtrend Retrace (Resistance)' }
                  ]}
                  value={fibDirection}
                  onChange={(e) => setFibDirection(e.target.value)}
                />
                
                {fibLevels && (
                  <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-darkBorder mt-4">
                    {Object.entries(fibLevels).map(([lvl, val]) => (
                      <div key={lvl} className="flex justify-between border-b border-darkBorder/40 last:border-0 py-1">
                        <span className="text-slate-500">{lvl}% Level:</span>
                        <span className="text-white font-bold">${val.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Standard Pivot Points */}
            <Card>
              <CardHeader>
                <CardTitle>Pivot Point Calculator</CardTitle>
                <CardDescription>Standard floor pivot formulas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="Prior High"
                    type="number"
                    value={prevHigh}
                    onChange={(e) => setPrevHigh(Number(e.target.value))}
                  />
                  <Input
                    label="Prior Low"
                    type="number"
                    value={prevLow}
                    onChange={(e) => setPrevLow(Number(e.target.value))}
                  />
                  <Input
                    label="Prior Close"
                    type="number"
                    value={prevClose}
                    onChange={(e) => setPrevClose(Number(e.target.value))}
                  />
                </div>

                {pivotLevels && (
                  <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-darkBorder mt-4">
                    <div className="flex justify-between text-cyan-400 font-bold border-b border-darkBorder/40 pb-1">
                      <span>Central Pivot (PP):</span>
                      <span>${pivotLevels.PP.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-darkBorder/40 py-1 text-red-400">
                      <span>Resistance 2 (R2):</span>
                      <span>${pivotLevels.R2.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-darkBorder/40 py-1 text-red-400/80">
                      <span>Resistance 1 (R1):</span>
                      <span>${pivotLevels.R1.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-darkBorder/40 py-1 text-emerald-400/80">
                      <span>Support 1 (S1):</span>
                      <span>${pivotLevels.S1.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-emerald-400">
                      <span>Support 2 (S2):</span>
                      <span>${pivotLevels.S2.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 4. ATR Stop Tab */}
        {activeTab === 'atr_stop' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>ATR Stop Loss Calculator</CardTitle>
                <CardDescription>Determine stop distance using Average True Range volatility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Entry Price ($)"
                  type="number"
                  value={atrEntry}
                  onChange={(e) => setAtrEntry(Number(e.target.value))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Current ATR Value ($)"
                    type="number"
                    step="0.01"
                    value={atrVal}
                    onChange={(e) => setAtrVal(Number(e.target.value))}
                  />
                  <Input
                    label="ATR Multiplier"
                    type="number"
                    step="0.5"
                    value={atrMult}
                    onChange={(e) => setAtrMult(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0b0f1d] border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Volatility Outputs</CardTitle>
                <CardDescription>ATR Dynamic Bounding Box</CardDescription>
              </CardHeader>
              <CardContent>
                {atrResult ? (
                  <div className="space-y-3.5 text-xs font-mono">
                    <div className="flex justify-between border-b border-darkBorder/40 pb-2">
                      <span className="text-slate-500">ATR Stop Distance:</span>
                      <span className="text-white font-bold">
                        ${atrResult.stopDistance.toFixed(2)} ({atrResult.stopPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-darkBorder/40 pb-2">
                      <span className="text-slate-500">Long Setup Stop Level:</span>
                      <span className="text-red-400 font-bold">${atrResult.longStop.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-slate-500">Short Setup Stop Level:</span>
                      <span className="text-emerald-400 font-bold">${atrResult.shortStop.toFixed(2)}</span>
                    </div>

                    <div className="pt-3 p-3 bg-slate-950 border border-darkBorder/60 rounded-lg text-[10px] text-slate-400 font-sans leading-relaxed">
                      💡 ATR sizing method helps set stops that are outside the normal noise (volatility) of the market, reducing the chances of being stopped out prematurely. A standard multiplier is 1.5 to 2.5 times the ATR.
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    Please input Entry Price, ATR Value, and ATR Multiplier.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 5. Trade Journal Tab */}
        {activeTab === 'journal' && (
          <div className="flex flex-col gap-5 max-w-4xl mx-auto">
            {/* Input Log Form */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Educational Trade Logger</CardTitle>
                <CardDescription>Log simulated study trades for review</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddJournal} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Asset"
                    placeholder="e.g. BTC/USDT"
                    value={journalInput.asset}
                    onChange={(e) => setJournalInput({ ...journalInput, asset: e.target.value })}
                  />
                  <Select
                    label="Direction"
                    options={['LONG', 'SHORT']}
                    value={journalInput.type}
                    onChange={(e) => setJournalInput({ ...journalInput, type: e.target.value })}
                  />
                  <Input
                    label="Entry Price ($)"
                    type="number"
                    value={journalInput.entry}
                    onChange={(e) => setJournalInput({ ...journalInput, entry: e.target.value })}
                  />
                  <Input
                    label="Stop Loss ($)"
                    type="number"
                    value={journalInput.stop}
                    onChange={(e) => setJournalInput({ ...journalInput, stop: e.target.value })}
                  />
                  <Input
                    label="Target Price ($)"
                    type="number"
                    value={journalInput.target}
                    onChange={(e) => setJournalInput({ ...journalInput, target: e.target.value })}
                  />
                  <Input
                    label="Study Takeaways Notes"
                    placeholder="Why this study setup?"
                    value={journalInput.notes}
                    onChange={(e) => setJournalInput({ ...journalInput, notes: e.target.value })}
                  />
                  <div className="sm:col-span-3 flex justify-end pt-2">
                    <Button type="submit" variant="primary">
                      Log Setup to Journal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* List logs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Journal Log List</CardTitle>
                <CardDescription>Historical logged study structures</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {journalLogs.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-darkBorder text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Asset</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Entry</th>
                        <th className="py-2.5 px-3">Stop</th>
                        <th className="py-2.5 px-3">Target</th>
                        <th className="py-2.5 px-3">Study Notes</th>
                        <th className="py-2.5 px-3 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-darkBorder/40 font-mono">
                      {journalLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/60 text-slate-300">
                          <td className="py-2.5 px-3 text-slate-400 font-sans">{log.date}</td>
                          <td className="py-2.5 px-3 font-bold text-white">{log.asset}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant={log.type === 'LONG' ? 'emerald' : 'red'} className="text-[9px] py-0">
                              {log.type}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">${Number(log.entry).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-red-400">${Number(log.stop).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-emerald-400">${Number(log.target).toFixed(2)}</td>
                          <td className="py-2.5 px-3 font-sans text-slate-400 line-clamp-1 max-w-[200px]" title={log.notes}>
                            {log.notes || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteJournal(log.id)}
                              className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    No simulated setups logged. Fill out the form above to catalog your study logs.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 6. Multi-tool Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="flex flex-col gap-5 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Side-by-Side Indicator Comparison</CardTitle>
                <CardDescription>Compare two technical indicators to understand how they align</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select
                    label="Select Indicator A"
                    options={[
                      { value: 'rsi', label: 'RSI' },
                      { value: 'macd', label: 'MACD' },
                      { value: 'bollinger_bands', label: 'Bollinger Bands' },
                      { value: 'sma', label: 'SMA' },
                      { value: 'ema', label: 'EMA' },
                      { value: 'trendline', label: 'Trendlines' },
                      { value: 'volume', label: 'Volume' },
                      { value: 'horizontal_sr', label: 'Horizontal S/R' },
                      { value: 'candlestick_patterns', label: 'Candlestick Patterns' }
                    ]}
                    value={toolA}
                    onChange={(e) => setToolA(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    label="Select Indicator B"
                    options={[
                      { value: 'rsi', label: 'RSI' },
                      { value: 'macd', label: 'MACD' },
                      { value: 'bollinger_bands', label: 'Bollinger Bands' },
                      { value: 'sma', label: 'SMA' },
                      { value: 'ema', label: 'EMA' },
                      { value: 'trendline', label: 'Trendlines' },
                      { value: 'volume', label: 'Volume' },
                      { value: 'horizontal_sr', label: 'Horizontal S/R' },
                      { value: 'candlestick_patterns', label: 'Candlestick Patterns' }
                    ]}
                    value={toolB}
                    onChange={(e) => setToolB(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Matrix layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs">
                  {/* Left Column: Tool A */}
                  <div className="space-y-4 bg-slate-950 p-4 border border-darkBorder/60 rounded-xl">
                    <div className="border-b border-darkBorder pb-2 flex justify-between items-center">
                      <h4 className="text-sm font-bold text-white font-mono tracking-tight uppercase">{compA.name}</h4>
                      <Badge variant="cyan">{compA.category}</Badge>
                    </div>
                    
                    <div className="space-y-3 leading-relaxed">
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Purpose</span>
                        <p className="text-slate-300">{compA.purpose}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Best Use Case</span>
                        <p className="text-slate-300">{compA.useCase}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Strengths</span>
                        <p className="text-slate-300">{compA.strengths}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Weaknesses</span>
                        <p className="text-slate-300">{compA.weaknesses}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Common Mistake</span>
                        <p className="text-red-400/90">{compA.mistakes}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Synergy Combo</span>
                        <p className="text-cyan-400 font-medium">Combines well with: {compA.combos}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tool B */}
                  <div className="space-y-4 bg-slate-950 p-4 border border-darkBorder/60 rounded-xl">
                    <div className="border-b border-darkBorder pb-2 flex justify-between items-center">
                      <h4 className="text-sm font-bold text-white font-mono tracking-tight uppercase">{compB.name}</h4>
                      <Badge variant="emerald">{compB.category}</Badge>
                    </div>

                    <div className="space-y-3 leading-relaxed">
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Purpose</span>
                        <p className="text-slate-300">{compB.purpose}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Best Use Case</span>
                        <p className="text-slate-300">{compB.useCase}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Strengths</span>
                        <p className="text-slate-300">{compB.strengths}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Weaknesses</span>
                        <p className="text-slate-300">{compB.weaknesses}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Common Mistake</span>
                        <p className="text-red-400/90">{compB.mistakes}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Synergy Combo</span>
                        <p className="text-cyan-400 font-medium">Combines well with: {compB.combos}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Combos synergy educational note */}
                <div className="mt-4 p-3 bg-cyan-950/10 border border-cyan-500/10 rounded-lg text-[10px] text-cyan-400 flex items-start gap-2 select-none leading-relaxed">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white uppercase text-[9px] mb-0.5">Educational Synergy Guide</span>
                    Avoid combining indicators that track the same characteristic. For example, plotting RSI + Stochastic RSI is redundant (both are momentum speed gauges) and creates confirmation bias. A better combination is one Trend tool (e.g. EMA) + one Momentum tool (e.g. RSI) + Volume.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
