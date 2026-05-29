import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, HelpCircle, ShieldAlert, BookOpen } from 'lucide-react';
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import Input from '../components/Input';
import Badge from '../components/Badge';

export default function ChatAssistantPage({
  selectedSymbol,
  selectedTimeframe,
  selectedTool
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your MarketPilot AI educational assistant. I can help you understand chart structures, technical indicator mathematics, and general risk models. I cannot provide trading recommendations, buy/sell targets, or financial advice.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);
  const [activeSnapshot, setActiveSnapshot] = useState(null);

  // Sync snapshot
  useEffect(() => {
    const saved = localStorage.getItem('mp_active_analysis');
    if (saved) {
      setActiveSnapshot(JSON.parse(saved));
    } else {
      setActiveSnapshot(null);
    }
  }, [selectedSymbol, selectedTimeframe, selectedTool]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const normalizeMessage = (message) => {
    if (!message) return '';
    // 1. lowercase text
    let q = message.toLowerCase();
    
    // 2. remove punctuation (replace with spaces to avoid joining words, then clean extra spaces)
    q = q.replace(/[?!.,;:]/g, ' ');
    q = q.replace(/\s+/g, ' ').trim();
    
    // 3. replace common typos with correct words
    const typoReplacements = [
      { from: "trand line", to: "trendline" },
      { from: "trend line", to: "trendline" },
      { from: "trend lines", to: "trendline" },
      { from: "trandline", to: "trendline" },
      { from: "trandlines", to: "trendline" },
      { from: "bollinger band", to: "bollinger bands" },
      { from: "bolinger band", to: "bollinger bands" },
      { from: "bolinger bands", to: "bollinger bands" },
      { from: "bolinger", to: "bollinger" },
      { from: "suport", to: "support" },
      { from: "resistence", to: "resistance" },
      { from: "volum", to: "volume" },
      { from: "candel", to: "candle" },
      { from: "candels", to: "candles" },
      { from: "candlesticks", to: "candlestick" },
      { from: "mackd", to: "macd" },
      { from: "mac-d", to: "macd" },
      { from: "marketstructures", to: "market structure" },
      { from: "break out", to: "breakout" },
      { from: "re test", to: "retest" }
    ];

    typoReplacements.forEach(({ from, to }) => {
      const regex = new RegExp(`\\b${from}\\b`, 'g');
      q = q.replace(regex, to);
    });

    return q.replace(/\s+/g, ' ').trim();
  };

  const isGreeting = (message) => {
    const q = message.toLowerCase().trim();
    const cleanQ = q.replace(/[?!.]+$/, '').trim();
    const greetingWords = ['hello', 'hi', 'hey', 'hy', 'good morning', 'good evening'];
    return greetingWords.includes(cleanQ);
  };

  const isGeneralConceptQuestion = (message) => {
    const q = message.toLowerCase().trim();
    
    // Concept keywords/phrases
    const concepts = [
      'trendline', 'support and resistance', 'support', 'resistance',
      'volume', 'rsi divergence', 'rsi', 'relative strength index',
      'macd', 'bollinger bands', 'bollinger band', 'bollinger',
      'candlestick', 'candlesticks', 'candle', 'candles',
      'market structure', 'breakout', 'retest', 'risk reward', 'risk-reward', 'risk/reward'
    ];

    const hasConcept = concepts.some(concept => q.includes(concept));
    if (!hasConcept) return false;

    // Scan specific overrides that redirect focus to current chart status instead of raw concept
    const scanOverrides = [
      'key watch zone', 'watch zone', 'what should i watch', 'what to watch',
      'important level', 'watch level', 'watch levels', 'reaction zone',
      'support level', 'resistance level', 'where is support', 'where is resistance',
      'where is', 'current', 'active', 'this scan', 'on this chart', 'on the chart',
      'upside', 'downside', 'sideways', 'risk note', 'why risk', 'main observation',
      'tool reading', 'scan report'
    ];

    const isOverride = scanOverrides.some(override => q.includes(override));
    if (isOverride) return false;

    // Any question containing the concept keyword that does not explicitly ask about scan details is a general concept query
    return true;
  };

  const getGeneralConceptAnswer = (message) => {
    const q = message.toLowerCase();

    // Priority checks (composite concepts first)
    if (q.includes('risk reward') || q.includes('risk-reward') || q.includes('risk/reward')) {
      return `### Risk/Reward Ratio (Educational Guide)

- **Definition**: The Risk/Reward (R/R) ratio compares the potential risk (loss) of a trade to its potential reward (gain).
- **Example (1:2)**: If a trade setup has a potential loss of $10 (stop loss) and a potential gain of $20 (target), the R/R ratio is 1:2.
- **Educational Usage**: Risk management structures help traders evaluate if a potential trade has sufficient reward relative to the risk. Maintaining positive R/R ratios helps manage overall exposure to market volatility.

*Note: Risk planning helps control loss size but does not guarantee trade success.*`;
    }
    if (q.includes('support and resistance') || q.includes('s/r') || q.includes('sr')) {
      return `### Support & Resistance (Educational Guide)

- **Definition**: Support and resistance (S/R) are horizontal chart zones representing historical price reaction thresholds where demand and supply have balanced.
- **Support**: Acts as a demand floor where buying interest historically increases to pause a downtrend.
- **Resistance**: Acts as a supply ceiling where selling interest historically increases to cap an uptrend.
- **Educational Usage**: S/R levels help establish watch zones. Observing price reaction (such as wick rejections or high volume breakouts) at these thresholds is key to studying chart structure.

*Note: S/R levels are subjective zones of historical interest. They do not guarantee future reactions.*`;
    }
    if (q.includes('support')) {
      return `### Support (Educational Guide)

- **Definition**: Support is a price level or area on a chart where a downtrend tends to pause due to a concentration of buying interest (demand). It acts as a floor.
- **How it Works**: As price falls toward support, buyers see the price as relatively cheap and step in, while sellers become less willing to sell, temporarily balancing demand and supply.
- **Educational Usage**: Traders look at support areas to analyze potential price stabilization or bullish rejections.

*Note: Support levels can fail. They are not guaranteed floors.*`;
    }
    if (q.includes('resistance')) {
      return `### Resistance (Educational Guide)

- **Definition**: Resistance is a price level or area on a chart where an uptrend tends to pause due to a concentration of selling interest (supply). It acts as a ceiling.
- **How it Works**: As price rises toward resistance, sellers see the price as relatively expensive and look to lock in profits, while buyers become less willing to buy, capping the upward momentum.
- **Educational Usage**: Traders study resistance areas to analyze potential supply ceiling rejections or signs of trend exhaustion.

*Note: Resistance levels can be broken. They are not guaranteed ceilings.*`;
    }
    if (q.includes('trendline') || q.includes('trend line')) {
      return `### Trendlines (Educational Guide)

- **Definition**: A trendline is a sloped line drawn across swing highs (peaks) or swing lows (troughs) to help visualize market direction.
- **Upward Trendline**: Connects a series of higher lows, representing a dynamic floor of demand.
- **Downward Trendline**: Connects a series of lower highs, representing a dynamic ceiling of supply.
- **Educational Usage**: In chart study, trendlines help identify potential reaction areas where the price might bounce or break out. A breakout below an upward trendline or above a downward trendline is often studied as a sign of potential trend shift.

*Note: Trendlines are subjective chart tools used for theoretical study. They do not guarantee price predictions.*`;
    }
    if (q.includes('volume')) {
      return `### Volume (Educational Guide)

- **Definition**: Volume measures the amount of trading activity (shares, contracts, or coins traded) during a given candle or timeframe.
- **High Volume**: Indicates strong participation and high consensus among market participants.
- **Low Volume**: Indicates weak participation and lower consensus.
- **Educational Usage**: In technical analysis, volume is used to confirm price trends. For example, a breakout accompanied by high volume is often studied as a valid breakout, whereas a breakout on low volume is sometimes considered a potential fakeout.

*Note: Volume is a historical metric. It is not a guaranteed prediction of future market interest.*`;
    }
    if (q.includes('rsi divergence')) {
      return `### RSI Divergence (Educational Guide)

- **Definition**: RSI Divergence occurs when the direction of price action and the direction of the RSI oscillator do not agree, indicating weakening momentum.
- **Bullish Divergence**: Price makes lower lows while RSI makes higher lows. This indicates that despite the price drop, the downward momentum is slowing down.
- **Bearish Divergence**: Price makes higher highs while RSI makes lower highs. This indicates that despite the price gain, the upward momentum is slowing down.
- **Educational Usage**: Divergences are studied as early warning signs of potential trend fatigue or trend reversals.

*Note: Divergences do not guarantee reversals. Price can continue its trend despite a divergence.*`;
    }
    if (q.includes('rsi') || q.includes('relative strength index')) {
      return `### Relative Strength Index (RSI) (Educational Guide)

- **Definition**: The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements on a scale from 0 to 100.
- **Overbought (>70)**: Historically indicates that the upward momentum may be extended (fatigue).
- **Oversold (<30)**: Historically indicates that the downward momentum may be extended (exhaustion).
- **Educational Usage**: RSI is used to study momentum strength, overextended ranges, and divergences against price action.

*Note: RSI is a lagging indicator. An asset can remain overbought or oversold for extended periods.*`;
    }
    if (q.includes('macd') || q.includes('moving average convergence divergence')) {
      return `### MACD (Moving Average Convergence Divergence) (Educational Guide)

- **Definition**: MACD is a trend-following momentum indicator showing the relationship between two moving averages (typically the 12 and 26 EMAs) and a signal line (9 EMA).
- **MACD Line**: The difference between the fast and slow EMAs.
- **Signal Line**: A 9-period EMA of the MACD Line.
- **Histogram**: Visualizes the distance between the MACD Line and the Signal Line.
- **Educational Usage**: Traders study crossover signals (MACD crossing above/below the Signal Line) or zero-line crossovers to analyze changes in trend direction and momentum strength.

*Note: MACD is based on moving averages and is lagging by nature. Crossovers do not guarantee future trends.*`;
    }
    if (q.includes('bollinger') || q.includes('band')) {
      return `### Bollinger Bands (Educational Guide)

- **Definition**: Bollinger Bands are volatility envelopes plotted above and below a simple moving average. The width of the bands is determined by standard deviations of the price.
- **Expansion**: Bands widen when market volatility increases.
- **Contraction (Squeeze)**: Bands narrow when market volatility decreases. A tight squeeze is often studied as a precursor to high-volatility moves.
- **Educational Usage**: Bollinger Bands help visualize volatility changes and dynamic overextended levels (price touching upper/lower bands).

*Note: Bollinger Bands adjust dynamically but do not predict the direction of volatility breakouts.*`;
    }
    if (q.includes('candlestick') || q.includes('candle')) {
      return `### Candlestick Patterns (Educational Guide)

- **Definition**: Candlestick charts visualize the open, high, low, and close prices of a specific timeframe in a single candle body and wick.
- **Wick Rejections**: Long upper or lower wicks suggest that price attempted to move in one direction but was pushed back before the candle closed.
- **Educational Usage**: Single candle shapes (e.g. Hammer, Shooting Star) or multi-candle patterns (e.g. Bullish Engulfing) are studied to interpret the immediate balance between buyers and sellers.

*Note: Candlestick patterns should be studied in combination with key structural levels (S/R) rather than in isolation.*`;
    }
    if (q.includes('market structure') || q.includes('structure')) {
      return `### Market Structure (Educational Guide)

- **Definition**: Market structure refers to the arrangement of swing highs and swing lows on a price chart, establishing the state of the market.
- **Uptrend Structure**: Defined by a repeating sequence of Higher Highs (HH) and Higher Lows (HL).
- **Downtrend Structure**: Defined by a repeating sequence of Lower Highs (LH) and Lower Lows (LL).
- **Sideways Structure**: Price fluctuates within a defined range.
- **Educational Usage**: Identifying market structure helps determine the current market phase and establishes key structural invalidation points.

*Note: Structure shifts can occur suddenly. Trends do not guarantee future continuation.*`;
    }
    if (q.includes('breakout')) {
      return `### Breakouts (Educational Guide)

- **Definition**: A breakout occurs when the price decisively moves outside an established chart boundary, such as a horizontal support/resistance level or a sloped trendline.
- **Validation**: High volume during a breakout is often studied as confirmation that the move is supported by strong market interest.
- **Educational Usage**: Breakouts are analyzed to understand potential momentum acceleration in the direction of the breach.

*Note: Fakeouts (temporary breakouts that quickly reverse) are common. Confirmation filters are crucial.*`;
    }
    if (q.includes('retest')) {
      return `### Retests (Educational Guide)

- **Definition**: A retest occurs when the price returns to touch a recently broken support or resistance level to verify it as new resistance or support.
- **Mechanism**: A broken resistance level often acts as a new support floor, while a broken support level acts as a new resistance ceiling.
- **Educational Usage**: Retests are studied to confirm that a breakout was valid and that the broken level has successfully transitioned roles.

*Note: Retests can fail, resulting in the price returning back into the original range.*`;
    }

    return "I can explain technical chart concepts such as Volume, RSI, MACD, Support, Resistance, Bollinger Bands, Trendlines, Candlestick Patterns, Market Structure, Breakouts, and Retests.";
  };

  const isScanSpecificQuestion = (message) => {
    const q = message.toLowerCase();
    return (
      q.includes('key watch zone') ||
      q.includes('watch zone') ||
      q.includes('what should i watch') ||
      q.includes('what to watch') ||
      q.includes('important level') ||
      q.includes('watch level') ||
      q.includes('watch levels') ||
      q.includes('reaction zone') ||
      q.includes('support level') ||
      q.includes('resistance level') ||
      q.includes('where is support') ||
      q.includes('where is resistance') ||
      q.includes('where is') ||
      q.includes('upside') ||
      q.includes('downside') ||
      q.includes('sideways') ||
      q.includes('risk') ||
      q.includes('why risk') ||
      q.includes('main observation') ||
      q.includes('tool reading') ||
      q.includes('reading') ||
      q.includes('observation') ||
      q.includes('explain this scan') ||
      q.includes('explain current chart') ||
      q.includes('what does this chart mean')
    );
  };

  const isFullScanQuestion = (message) => {
    const q = message.toLowerCase();
    return (
      q.includes('full scan') ||
      q.includes('full report') ||
      q.includes('explain full chart') ||
      q.includes('complete breakdown') ||
      q.includes('full explanation')
    );
  };

  const getEducationalAnswer = (question, snapshot) => {
    const normalized = normalizeMessage(question);
    const q = normalized.toLowerCase().trim();
    
    // Safety guardrails against trade execution requests
    if (q.includes('buy') || q.includes('sell') || q.includes('profit') || q.includes('trade now') || q.includes('target') || q.includes('should i enter')) {
      const details = snapshot ? `\n- Asset Symbol      : ${snapshot.symbol}\n- Selected Tool     : ${snapshot.toolName}\n- Current Reading   : ${snapshot.selectedToolReading}` : "";
      return `Based on educational safety limits, I cannot provide buy, sell, or execution targets. I can explain the general chart parameters.${details}\n\nHistorically, traders study structural levels to identify where price has previously reacted. For educational purposes, analyze wick rejections and transaction volume changes around support/resistance thresholds rather than seeking trade execution signals.`;
    }

    // 1. Greeting Intent
    if (isGreeting(normalized)) {
      return "Hi! I can help explain chart tools, indicators, watch zones, scenarios, and risk notes. Ask me about the latest scan or any indicator.";
    }

    // 2. General Concept Intent with typo/fuzzy matching
    if (isGeneralConceptQuestion(normalized)) {
      return getGeneralConceptAnswer(normalized);
    }

    // 3. Scan-Specific Intent
    if (isScanSpecificQuestion(normalized)) {
      if (!snapshot) {
        return "Run Scan Analysis first so I can explain the current chart context.";
      }
      
      if (
        q.includes('key watch zone') || 
        q.includes('watch zone') || 
        q.includes('what should i watch') || 
        q.includes('what to watch') || 
        q.includes('important level') || 
        q.includes('watch level') ||
        q.includes('watch levels') ||
        q.includes('reaction zone')
      ) {
        return `The key watch zones are: ${snapshot.keyWatchZones}. \n\nEducationally, watch how price acts here: ${snapshot.whatToWatch}`;
      }

      if (q.includes('support') && !q.includes('resistance')) {
        const supportPart = snapshot.keyWatchZones.split('|').find(p => p.toLowerCase().includes('support')) || `Floor bounds: ${snapshot.keyWatchZones}`;
        return `For **${snapshot.symbol}** (${snapshot.timeframe}), the support zone is: **${supportPart.trim()}**.`;
      }

      if (q.includes('resistance') && !q.includes('support')) {
        const resistancePart = snapshot.keyWatchZones.split('|').find(p => p.toLowerCase().includes('resistance')) || `Ceiling bounds: ${snapshot.keyWatchZones}`;
        return `For **${snapshot.symbol}** (${snapshot.timeframe}), the resistance zone is: **${resistancePart.trim()}**.`;
      }

      if (q.includes('upside')) {
        return `The simulated **Upside Case** for **${snapshot.symbol}** (${snapshot.timeframe}):\n\n- **Scenario**: ${snapshot.upsideCase?.explanation || 'No scenario details.'}\n- **Parameters**: Clarity is ${snapshot.upsideCase?.clarity || 'Medium'} | Risk is ${snapshot.upsideCase?.risk || 'Medium'} | Confirmation required: ${snapshot.upsideCase?.confirmation || 'Yes'}`;
      }

      if (q.includes('downside')) {
        return `The simulated **Downside Case** for **${snapshot.symbol}** (${snapshot.timeframe}):\n\n- **Scenario**: ${snapshot.downsideCase?.explanation || 'No scenario details.'}\n- **Parameters**: Clarity is ${snapshot.downsideCase?.clarity || 'Medium'} | Risk is ${snapshot.downsideCase?.risk || 'Medium'} | Confirmation required: ${snapshot.downsideCase?.confirmation || 'Yes'}`;
      }

      if (q.includes('sideways')) {
        return `The simulated **Sideways Case** for **${snapshot.symbol}** (${snapshot.timeframe}):\n\n- **Scenario**: ${snapshot.sidewaysCase?.explanation || 'No scenario details.'}\n- **Parameters**: Clarity is ${snapshot.sidewaysCase?.clarity || 'High'} | Risk is ${snapshot.sidewaysCase?.risk || 'Low'} | Confirmation required: ${snapshot.sidewaysCase?.confirmation || 'No'}`;
      }

      if (q.includes('risk') || q.includes('why risk')) {
        return `Risk Profile for the active scan on **${snapshot.symbol}**:\n\n- **Risk Study Note**: ${snapshot.riskNote}\n- **Scenario Risk Levels**: \n  - Upside Case: ${snapshot.upsideCase?.risk || 'Medium'} Risk\n  - Downside Case: ${snapshot.downsideCase?.risk || 'Medium'} Risk\n  - Sideways Case: ${snapshot.sidewaysCase?.risk || 'Low'} Risk`;
      }

      if (q.includes('main observation') || q.includes('observation')) {
        return `For **${snapshot.symbol}**, the main observation is:\n\n${snapshot.mainObservation}`;
      }

      if (q.includes('tool reading') || q.includes('reading')) {
        return `The active tool (**${snapshot.toolName}**) reading is:\n\n${snapshot.selectedToolReading}`;
      }

      if (q.includes('explain this scan') || q.includes('explain current chart') || q.includes('what does this chart mean')) {
        return `Here is the educational summary of the scan for **${snapshot.symbol}** (${snapshot.timeframe}) using **${snapshot.toolName}**:\n\n- **Observation**: ${snapshot.mainObservation}\n- **Structure**: ${snapshot.marketStructure}\n- **Tool Reading**: ${snapshot.selectedToolReading}\n- **Watch Zones**: ${snapshot.keyWatchZones}\n- **What to Watch**: ${snapshot.whatToWatch}`;
      }
    }

    // D. Full Scan Summary
    if (isFullScanQuestion(normalized)) {
      if (!snapshot) {
        return "Run Scan Analysis first so I can explain the current chart context.";
      }
      return `Here is the full scanned educational breakdown for **${snapshot.symbol}** (${(snapshot.marketType || 'crypto').toUpperCase()}) on the **${snapshot.timeframe}** chart using **${snapshot.toolName}**:\n\n- **Main Observation**: ${snapshot.mainObservation}\n- **Market Structure**: ${snapshot.marketStructure}\n- **Selected Tool Reading**: ${snapshot.selectedToolReading}\n- **Key Watch Zones**: ${snapshot.keyWatchZones}\n- **What To Watch**: ${snapshot.whatToWatch}\n- **Risk Study Note**: ${snapshot.riskNote}\n\nScenarios:\n- **Upside Case**: ${snapshot.upsideCase?.explanation || 'N/A'} (Risk: ${snapshot.upsideCase?.risk || 'Medium'})\n- **Downside Case**: ${snapshot.downsideCase?.explanation || 'N/A'} (Risk: ${snapshot.downsideCase?.risk || 'Medium'})\n- **Sideways Case**: ${snapshot.sidewaysCase?.explanation || 'N/A'} (Risk: ${snapshot.sidewaysCase?.risk || 'Low'})`;
    }

    // E. Fallback Clarification
    return "Advanced AI chat requires API connection. Current demo assistant can explain latest scan basics, tools, watch zones, and risk notes.";
  };

  const parseInlineMarkdown = (text) => {
    const parts = [];
    let currentIdx = 0;
    const inlineRegex = /(\*\*|`)(.*?)\1/g;
    let match;
    
    while ((match = inlineRegex.exec(text)) !== null) {
      const matchIdx = match.index;
      if (matchIdx > currentIdx) {
        parts.push(text.substring(currentIdx, matchIdx));
      }
      
      const type = match[1];
      const content = match[2];
      
      if (type === '**') {
        parts.push(<strong key={matchIdx} className="font-bold text-white">{content}</strong>);
      } else if (type === '`') {
        parts.push(<code key={matchIdx} className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-[10px] text-cyan-300 border border-darkBorder/30">{content}</code>);
      }
      
      currentIdx = inlineRegex.lastIndex;
    }
    
    if (currentIdx < text.length) {
      parts.push(text.substring(currentIdx));
    }
    
    return parts.length > 0 ? parts : text;
  };

  const renderMessageContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        const headingStyles = {
          1: 'text-base font-bold text-white mb-2 mt-1.5',
          2: 'text-sm font-bold text-white mb-2 mt-1',
          3: 'text-xs font-bold text-cyan-400 mb-1.5 mt-1',
          4: 'text-xs font-semibold text-slate-350 mb-1',
          5: 'text-[11px] font-semibold text-slate-350',
          6: 'text-[10px] font-semibold text-slate-400'
        };
        return (
          <div key={i} className={headingStyles[level] || 'font-bold'}>
            {parseInlineMarkdown(content)}
          </div>
        );
      }
      
      const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
      if (bulletMatch) {
        const indent = bulletMatch[1].length;
        const content = bulletMatch[2];
        return (
          <div key={i} className={`flex items-start gap-1.5 my-1`} style={{ paddingLeft: `${indent * 8 + 8}px` }}>
            <span className="text-cyan-500">•</span>
            <span className="flex-1">{parseInlineMarkdown(content)}</span>
          </div>
        );
      }
      
      if (line.trim() === '') {
        return <div key={i} className="h-1.5" />;
      }
      
      return (
        <p key={i} className="my-0.5 leading-relaxed text-slate-300">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText;
    const userMsg = {
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Fetch snapshot
    const saved = localStorage.getItem('mp_active_analysis');
    const snap = saved ? JSON.parse(saved) : null;
    
    // Simulate assistant typing delay
    setTimeout(() => {
      const responseText = getEducationalAnswer(userMsgText, snap);
      const assistantMsg = {
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 600);
  };

  const handleSuggestClick = (suggestion) => {
    setInputText(suggestion);
  };

  return (
    <div className="flex flex-col lg:flex-row grow w-full gap-5 h-full p-4 md:p-6 overflow-hidden">
      
      {/* Left Information Bar */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        <Card className="bg-[#0b0f1d]">
          <CardHeader className="pb-2">
            <CardTitle>AI Assistant Context</CardTitle>
            <CardDescription>Active indicator variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-darkBorder/40 pb-1.5">
                <span className="text-slate-500 font-medium">Focused Asset:</span>
                <span className="text-white font-bold font-mono">{selectedSymbol}</span>
              </div>
              <div className="flex justify-between border-b border-darkBorder/40 pb-1.5">
                <span className="text-slate-500 font-medium">Timeframe:</span>
                <span className="text-white font-bold font-mono">{selectedTimeframe}</span>
              </div>
              <div className="flex justify-between border-b border-darkBorder/40 pb-1.5">
                <span className="text-slate-500 font-medium">Technical Tool:</span>
                <Badge variant="cyan" className="font-mono">{selectedTool.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Snapshot Status:</span>
                <Badge variant={activeSnapshot ? 'emerald' : 'gray'}>
                  {activeSnapshot ? 'Freezed Active' : 'No Scan Active'}
                </Badge>
              </div>
            </div>

            {activeSnapshot && (
              <div className="bg-[#111726]/60 p-3 rounded-lg border border-darkBorder/60 text-[10px] space-y-1.5">
                <span className="font-bold text-slate-400 block uppercase tracking-wider">Scanned Report Info</span>
                <div className="text-slate-300 font-mono line-clamp-3">
                  {activeSnapshot.mainObservation}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety & Compliance Badge */}
        <div className="p-4 bg-red-950/20 border border-red-500/25 rounded-2xl text-[10px] text-red-400 flex items-start gap-2.5 select-none leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-white uppercase text-[9px] mb-0.5">Educational Guardrails</span>
            This chat interface uses safe, compliance-filtered logic. It will automatically filter request signals or buy/sell requests.
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <Card className="flex-1 flex flex-col h-full bg-[#0b0f1d]/85">
        <CardHeader className="pb-3 border-b border-darkBorder/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <CardTitle className="text-md">Educational Chat Assistant</CardTitle>
              <CardDescription>Ask questions about indicator calculations and structure</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto space-y-4 p-5">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-[#111726] text-slate-200 border border-darkBorder rounded-tl-none'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {renderMessageContent(msg.text)}
                  <span className="block text-[8px] text-slate-400/80 mt-1.5 text-right font-mono select-none">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </CardContent>

        {/* Suggestion tags */}
        <div className="px-5 py-2.5 border-t border-darkBorder/30 bg-slate-950/40 flex flex-wrap gap-2 overflow-x-auto">
          {[
            "Explain Support & Resistance",
            "What is RSI divergence?",
            "How does MACD signal crossovers?",
            "What is a Bollinger Squeeze?"
          ].map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSuggestClick(sug)}
              className="text-[10px] font-semibold text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/20 border border-darkBorder/60 hover:border-cyan-500/25 px-2.5 py-1 rounded-full cursor-pointer transition-all"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Form Input */}
        <CardFooter className="p-3 bg-slate-950/90 border-t border-darkBorder/40">
          <form onSubmit={handleSendMessage} className="w-full flex gap-2">
            <Input
              placeholder="Ask an educational chart question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary" className="px-5">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
      
    </div>
  );
}
