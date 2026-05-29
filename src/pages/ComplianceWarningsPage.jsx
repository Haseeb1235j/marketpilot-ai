import React from 'react';
import { ShieldAlert, Info, AlertTriangle, Scale, EyeOff, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import Badge from '../components/Badge';
import { COMPLIANCE_WARNINGS } from '../data/complianceWarnings';

export default function ComplianceWarningsPage() {
  const getIcon = (id) => {
    switch (id) {
      case 1: return Info;
      case 2: return EyeOff;
      case 3: return AlertTriangle;
      case 4: return Scale;
      case 5: return ShieldAlert;
      default: return ShieldCheck;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'danger': return 'red';
      case 'warning': return 'yellow';
      case 'info': default: return 'cyan';
    }
  };

  return (
    <div className="flex flex-col grow w-full max-w-4xl mx-auto gap-6 h-full p-4 md:p-6 overflow-y-auto">
      
      {/* Header safety declaration */}
      <div className="p-6 bg-gradient-to-r from-red-950/20 to-slate-950 border border-red-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-5">
        <div className="w-12 h-12 rounded-full bg-red-900/40 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0 shadow-lg">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white font-sans tracking-tight">Compliance & Safety Safeguards</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            MarketPilot AI enforces strict guidelines to protect study environments. We build educational interpretations and simulations. Under no circumstances do we issue buy/sell suggestions, transaction signals, or speculative profit guarantees.
          </p>
        </div>
      </div>

      {/* Grid of 5 premium cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMPLIANCE_WARNINGS.map((warn) => {
          const IconComponent = getIcon(warn.id);
          const badgeColor = getSeverityBadge(warn.severity);
          
          return (
            <Card key={warn.id} className="flex flex-col justify-between border-darkBorder bg-[#0b0f1d]">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-darkBorder/40">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-darkBorder">
                      <IconComponent className={`w-4 h-4 ${
                        warn.severity === 'danger' ? 'text-red-400' : warn.severity === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                      }`} />
                    </div>
                    <h4 className="text-sm font-bold text-white font-sans tracking-tight">
                      {warn.title}
                    </h4>
                  </div>
                  <Badge variant={badgeColor} className="text-[8px] font-mono tracking-wider font-bold">
                    {warn.legalLabel}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {warn.description}
                </p>
              </div>
              
              <div className="mt-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest text-right select-none">
                Section Code: MP-CO-{warn.id}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Indemnity bottom text */}
      <div className="text-center text-[10px] text-slate-500 font-medium select-none bg-slate-950 p-4 border border-darkBorder/60 rounded-xl leading-relaxed">
        <p>
          STUDY DECLARATION: By using MarketPilot AI, you acknowledge that technical analysis parameters are calculated based on simulated back-history coordinates. All trades executed in real brokerage accounts carry significant risk of capital loss. The user remains solely responsible for all financial outcomes.
        </p>
      </div>

    </div>
  );
}
