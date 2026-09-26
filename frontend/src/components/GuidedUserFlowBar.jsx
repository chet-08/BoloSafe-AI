import React from 'react';
import {
  Compass,
  Play,
  Activity,
  Zap,
  CheckCircle2,
  ArrowRight,
  Code
} from 'lucide-react';

export default function GuidedUserFlowBar({
  currentSector = 'finance',
  onSelectSector,
  hasAudioPlaying = false,
  hasResults = false,
  hasActionTaken = false,
  onOpenWebhook
}) {
  const steps = [
    {
      num: 1,
      title: 'Select Sector',
      desc: 'Finance, Retail, Hospitality, Media',
      status: 'active',
      icon: Compass
    },
    {
      num: 2,
      title: 'Trigger Audio',
      desc: '1-Click Hindi/Tamil/EN Speech',
      status: hasAudioPlaying ? 'active' : hasResults ? 'completed' : 'pending',
      icon: Play
    },
    {
      num: 3,
      title: 'Live ML Detection',
      desc: '< 15ms DSP + MMS + Biometrics',
      status: hasResults ? 'completed' : 'pending',
      icon: Activity
    },
    {
      num: 4,
      title: 'Execute Governance',
      desc: 'Wire Freeze, OMS Hold, Folio Lock',
      status: hasActionTaken ? 'completed' : hasResults ? 'active' : 'pending',
      icon: Zap
    },
    {
      num: 5,
      title: 'Enterprise Dispatch',
      desc: 'Inspect ISO 20022 / OMS / PMS JSON',
      status: 'pending',
      icon: Code,
      action: onOpenWebhook
    }
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Compass className="size-4 animate-spin-slow" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Interactive Hackathon User Flow
            </div>
            <div className="text-[10px] text-slate-400">
              Follow the end-to-end evaluation flow across any of the 4 tertiary sectors
            </div>
          </div>
        </div>

        {/* Steps Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isDone = s.status === 'completed';
            const isActive = s.status === 'active';

            return (
              <React.Fragment key={s.num}>
                <div
                  onClick={s.action}
                  className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 transition-all ${
                    s.action ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
                  } ${
                    isDone
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : isActive
                      ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'border-white/5 bg-white/[0.02] text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                  ) : (
                    <Icon className="size-3.5" />
                  )}
                  <span className="font-bold">{s.num}. {s.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight className="size-3 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
