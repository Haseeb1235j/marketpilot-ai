import React, { useState } from 'react';
import { Compass, BookOpen, ChevronRight, ShieldAlert, Sparkles, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import { TOOLS_DIRECTORY } from '../data/toolsDirectory';

export default function ToolsDirectoryPage({
  setSelectedTool,
  setActiveSection
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories list
  const categories = [
    'All',
    'Most Used',
    'Beginner Friendly',
    'Live Demo',
    'Trend Tools',
    'Momentum Indicators',
    'Volume Indicators',
    'Volatility Indicators',
    'Support & Resistance Tools',
    'Price Action Tools',
    'Pattern Tools',
    'Risk Tools',
    'Sentiment / News Tools',
    'Advanced / Smart Money Tools',
    'Coming Soon',
    'Needs Data'
  ];

  // Group items by category for counting
  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat === 'All') {
      acc[cat] = TOOLS_DIRECTORY.length;
    } else if (cat === 'Most Used') {
      acc[cat] = TOOLS_DIRECTORY.filter(t => t.isMostUsed).length;
    } else if (cat === 'Beginner Friendly') {
      acc[cat] = TOOLS_DIRECTORY.filter(t => t.difficulty === 'Beginner Friendly').length;
    } else if (cat === 'Live Demo') {
      acc[cat] = TOOLS_DIRECTORY.filter(t => t.supportStatus === 'Live Demo').length;
    } else if (cat === 'Coming Soon') {
      acc[cat] = TOOLS_DIRECTORY.filter(t => t.supportStatus === 'Coming Soon').length;
    } else if (cat === 'Needs Data') {
      acc[cat] = TOOLS_DIRECTORY.filter(t => t.supportStatus === 'Needs Data').length;
    } else {
      acc[cat] = TOOLS_DIRECTORY.filter(t => t.category === cat).length;
    }
    return acc;
  }, {});

  // Filters logic
  const filteredTools = TOOLS_DIRECTORY.filter(tool => {
    // 1. Search Query (matches name, subtitle, aliases, category, description, bestFor, requiredData)
    const query = searchQuery.trim().toLowerCase();
    let matchesSearch = true;
    if (query) {
      const nameMatch = tool.name.toLowerCase().includes(query);
      const subtitleMatch = (tool.subtitle || '').toLowerCase().includes(query);
      const categoryMatch = tool.category.toLowerCase().includes(query);
      const descMatch = tool.description.toLowerCase().includes(query);
      const bestForMatch = (tool.bestFor || '').toLowerCase().includes(query);
      const reqDataMatch = tool.requiredData.toLowerCase().includes(query);
      const aliasMatch = tool.aliases && tool.aliases.some(alias => alias.toLowerCase().includes(query));
      
      matchesSearch = nameMatch || subtitleMatch || categoryMatch || descMatch || bestForMatch || reqDataMatch || aliasMatch;
    }

    // 2. Category Filter
    let matchesCategory = true;
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'Most Used') {
      matchesCategory = tool.isMostUsed === true;
    } else if (selectedCategory === 'Beginner Friendly') {
      matchesCategory = tool.difficulty === 'Beginner Friendly';
    } else if (selectedCategory === 'Live Demo') {
      matchesCategory = tool.supportStatus === 'Live Demo';
    } else if (selectedCategory === 'Coming Soon') {
      matchesCategory = tool.supportStatus === 'Coming Soon';
    } else if (selectedCategory === 'Needs Data') {
      matchesCategory = tool.supportStatus === 'Needs Data';
    } else {
      matchesCategory = tool.category === selectedCategory;
    }

    return matchesSearch && matchesCategory;
  });

  // Handle active click
  const handleAnalyzeWithTool = (toolId) => {
    setSelectedTool(toolId);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('mp_selected_tool_message', 'Tool selected. Click Run Scan Analysis to generate breakdown.');
    }
    setActiveSection('scan'); // switch to chart scan
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live Demo': return 'emerald';
      case 'Basic': return 'cyan';
      case 'Needs Data': return 'yellow';
      case 'Advanced': return 'purple';
      case 'Coming Soon': default: return 'gray';
    }
  };

  // Starter pack IDs
  const starterToolIds = [
    'horizontal_sr',
    'trendline',
    'rsi',
    'macd',
    'ema',
    'sma',
    'volume',
    'bollinger_bands',
    'candlestick_patterns',
    'risk_reward'
  ];
  const sortedStarterTools = starterToolIds
    .map(id => TOOLS_DIRECTORY.find(t => t.id === id))
    .filter(Boolean);

  // Helper to render individual tool card
  const renderToolCard = (tool, isStarterCard = false) => {
    const isExecutable = tool.supportStatus !== 'Coming Soon';
    const variant = getStatusColor(tool.supportStatus);
    
    return (
      <Card
        key={tool.id + (isStarterCard ? '-starter' : '')}
        className={`flex flex-col justify-between border-darkBorder/60 hover:shadow-lg transition-all ${
          isExecutable ? 'hover:border-cyan-500/30' : ''
        } ${isStarterCard ? 'bg-[#0c1224] border-cyan-500/20' : ''}`}
      >
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h4 className="text-sm font-bold text-white leading-tight font-sans tracking-tight">
                {tool.name}
              </h4>
              {tool.subtitle && (
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{tool.subtitle}</span>
              )}
            </div>
            <Badge variant={variant}>{tool.supportStatus}</Badge>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              {tool.category}
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">•</span>
            <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-wider">
              {tool.difficulty}
            </span>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            {tool.description}
          </p>

          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-darkBorder/40 text-[10px] space-y-1 text-slate-400">
            <div>🎯 <strong>Best for:</strong> {tool.bestFor || 'General technical study'}</div>
            <div>📊 <strong>Required data:</strong> {tool.requiredData}</div>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-darkBorder/40 flex items-center justify-end gap-3">
          {isExecutable ? (
            <Button
              variant="glass"
              size="sm"
              onClick={() => handleAnalyzeWithTool(tool.id)}
              className="text-[11px] font-bold py-1 px-3 text-cyan-400 hover:bg-cyan-500/15"
            >
              Analyze Chart
            </Button>
          ) : (
            <span className="text-[10px] font-bold text-slate-600 font-mono italic">
              Coming Soon
            </span>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row grow w-full gap-5 h-full p-4 md:p-6 overflow-hidden">
      
      {/* Sidebar categories panel */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        <Card className="max-h-[500px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Indicator Library</CardTitle>
            <CardDescription>Filter library by category</CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto pr-1 flex-1">
            <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500 shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-950/80 text-slate-500'
                    }`}>
                      {categoryCounts[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Informative helper block */}
        <div className="p-4 bg-slate-950/80 border border-darkBorder rounded-2xl text-[11px] text-slate-400 space-y-2 leading-relaxed shrink-0">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h5 className="font-bold text-white text-xs">Educational Cataloging</h5>
          <p>
            Each card details the theoretical concept, standard math inputs, and simulator status. Live overlays integrate directly with active chart candlestick series.
          </p>
        </div>
      </div>

      {/* Main Tools Catalog Grid */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0 h-full">
        
        {/* Educational Warning Header */}
        <div className="p-3.5 bg-cyan-950/15 border border-cyan-500/20 text-cyan-300 rounded-2xl text-xs flex gap-2.5 items-start shrink-0">
          <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Educational Disclaimer:</strong> These tools are for educational chart study. No tool guarantees profit or prediction accuracy. Use tools together with risk planning.
          </p>
        </div>

        {/* Search & Statistics */}
        <div className="p-4 bg-slate-950 border border-darkBorder rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <Input
            placeholder="Search indicator names, subtitles, aliases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-xs"
          />
          <div className="text-xs text-slate-400 font-semibold font-mono">
            Showing <span className="text-cyan-400">{filteredTools.length}</span> indicators
          </div>
        </div>

        {/* Scrollable Tool Cards List */}
        <div className="flex-1 overflow-y-auto pr-1">
          
          {/* Best Starter Tools Section */}
          {selectedCategory === 'All' && !searchQuery && (
            <div className="mb-6 space-y-3 shrink-0">
              <div className="flex items-center gap-2 border-b border-darkBorder/40 pb-2">
                <Star className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-xs font-extrabold text-white tracking-wider uppercase">
                  Best Starter Tools for Learning Chart Analysis
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedStarterTools.map(tool => renderToolCard(tool, true))}
              </div>
            </div>
          )}

          {/* Full library section title */}
          {selectedCategory === 'All' && !searchQuery && (
            <div className="flex items-center gap-2 border-b border-darkBorder/40 pb-2 mb-4 shrink-0">
              <Compass className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">
                Explore Full Directory Library
              </h3>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.map((tool) => renderToolCard(tool, false))}
          </div>

          {filteredTools.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-slate-950/20 border border-darkBorder/40 rounded-2xl mt-4">
              <span className="text-2xl">🔍</span>
              <div>
                <h4 className="text-sm font-bold text-slate-300">No Indicators Found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  No matching tool found. Try searching RSI, MACD, Support, Trendline, Volume, or Bollinger.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
