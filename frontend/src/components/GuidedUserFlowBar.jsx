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
      status: hasActionTaken ? 'completed' : 'pending',
      icon: Code,
      action: onOpenWebhook
    }
  ];

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--status-success)]/15 text-[var(--status-success)] border border-[var(--status-success)]/25">
            <Compass className="size-4 animate-spin-slow" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Interactive Hackathon User Flow
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
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
                      ? 'border-[var(--status-success)]/35 bg-[var(--status-success)]/10 text-[var(--status-success)]'
                      : isActive
                      ? 'border-[var(--accent-primary)]/45 bg-[var(--accent-primary-muted)] text-[var(--accent-primary-soft)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-hover)] text-[var(--text-muted)]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-3.5 text-[var(--status-success)]" />
                  ) : (
                    <Icon className="size-3.5" />
                  )}
                  <span className="font-bold">{s.num}. {s.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight className="size-3 text-[var(--text-subtle)] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
