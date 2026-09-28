import React from 'react'
import {
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Lock,
} from 'lucide-react'

const toneMap = {
  allow: {
    icon: CheckCircle2,
    iconClass: 'text-[var(--status-success)]',
    border: 'border-[var(--status-success)]/30',
    bg: 'bg-[var(--status-success)]/[0.06]',
    label: 'ALLOW',
  },
  verify: {
    icon: ShieldCheck,
    iconClass: 'text-[var(--status-warning)]',
    border: 'border-[var(--status-warning)]/30',
    bg: 'bg-[var(--status-warning)]/[0.06]',
    label: 'VERIFY',
  },
  hold: {
    icon: Lock,
    iconClass: 'text-[var(--status-danger)]',
    border: 'border-[var(--status-danger)]/30',
    bg: 'bg-[var(--status-danger)]/[0.045]',
    label: 'HOLD',
  },
  escalate: {
    icon: ShieldAlert,
    iconClass: 'text-[var(--status-danger)]',
    border: 'border-[var(--status-danger)]/35',
    bg: 'bg-[var(--status-danger)]/[0.08]',
    label: 'ESCALATE',
  },
  pending: {
    icon: ShieldCheck,
    iconClass: 'text-[var(--text-muted)]',
    border: 'border-[var(--border-default)]',
    bg: 'bg-[var(--bg-card)]',
    label: 'STANDBY',
  },
}

export default function GovernanceDecisionCard({
  tone = 'verify',
  title,
  reason,
  recommendations = [],
  actions,
}) {
  const config = toneMap[tone] || toneMap.verify
  const Icon = config.icon

  return (
    <section
      className={[
        'relative overflow-hidden rounded-2xl border p-5 md:p-6',
        config.border,
        config.bg,
      ].join(' ')}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${config.iconClass.replace(
          'text-',
          'bg-'
        )}`}
      />

      <div className="flex flex-col gap-6 pl-1 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon size={17} className={config.iconClass} />

            <span
              className={[
                'text-[10px] font-bold uppercase tracking-[0.16em]',
                config.iconClass,
              ].join(' ')}
            >
              Governance Decision · {config.label}
            </span>
          </div>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>

          {reason && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
              {reason}
            </p>
          )}

          {recommendations.length > 0 && (
            <div className="mt-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Recommended next steps
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {recommendations.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-start gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2.5 text-xs text-[var(--text-primary)]"
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${config.iconClass.replace(
                        'text-',
                        'bg-'
                      )}`}
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-[440px] lg:justify-end">
            {actions}
          </div>
        )}
      </div>
    </section>
  )
}
