import React from 'react'
import { Check, Circle, ShieldAlert, UserCheck } from 'lucide-react'

const icons = {
  ready: Check,
  detected: ShieldAlert,
  decided: ShieldAlert,
  identity: UserCheck,
  pending: Circle,
}

const tones = {
  ready: {
    text: 'text-[var(--accent-primary-soft)]',
    bg: 'bg-[var(--accent-primary-muted)]',
    border: 'border-[var(--accent-primary)]/25',
    line: 'bg-[var(--accent-primary)]',
  },
  detected: {
    text: 'text-[var(--status-danger)]',
    bg: 'bg-[var(--status-danger)]/10',
    border: 'border-[var(--status-danger)]/25',
    line: 'bg-[var(--status-danger)]',
  },
  decided: {
    text: 'text-[var(--status-danger)]',
    bg: 'bg-[var(--status-danger)]/10',
    border: 'border-[var(--status-danger)]/25',
    line: 'bg-[var(--status-danger)]',
  },
  identity: {
    text: 'text-[var(--status-success)]',
    bg: 'bg-[var(--status-success)]/10',
    border: 'border-[var(--status-success)]/20',
    line: 'bg-[var(--status-success)]',
  },
  pending: {
    text: 'text-[var(--text-muted)]',
    bg: 'bg-[var(--bg-hover)]',
    border: 'border-[var(--border-default)]',
    line: 'bg-[var(--border-default)]',
  },
}

export default function SecurityActivityTimeline({ steps = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
      <div className="border-b border-[var(--border-default)] px-5 py-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Security Activity
        </div>

        <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
          Current protection flow
        </h2>

        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Context → detection → governance → identity
        </p>
      </div>

      <div className="grid divide-y divide-[var(--border-default)] md:grid-cols-4 md:divide-x md:divide-y-0">
        {steps.map((step, index) => {
          const Icon = icons[step.tone] || Circle
          const tone = tones[step.tone] || tones.pending

          return (
            <div
              key={`${step.label}-${index}`}
              className="relative min-w-0 p-4"
            >
              <div
                className={`absolute inset-x-0 top-0 h-[2px] ${tone.line}`}
              />

              <div className="flex items-center justify-between gap-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Step {String(index + 1).padStart(2, '0')}
                </div>

                <span
                  className={`text-[9px] font-bold uppercase tracking-[0.14em] ${tone.text}`}
                >
                  {step.status || step.tone || 'PENDING'}
                </span>
              </div>

              <div className="mt-3 flex items-start gap-3">
                <div
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                    tone.bg,
                    tone.border,
                    tone.text,
                  ].join(' ')}
                >
                  <Icon size={15} />
                </div>

                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {step.label}
                  </div>

                  <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                    {step.value}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
