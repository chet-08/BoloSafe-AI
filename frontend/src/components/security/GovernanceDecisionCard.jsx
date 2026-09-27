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
    iconClass: 'text-[#70B88A]',
    border: 'border-[#70B88A]/30',
    bg: 'bg-[#70B88A]/[0.06]',
    label: 'ALLOW',
  },
  verify: {
    icon: ShieldCheck,
    iconClass: 'text-[#D5AE52]',
    border: 'border-[#D5AE52]/30',
    bg: 'bg-[#D5AE52]/[0.06]',
    label: 'VERIFY',
  },
  hold: {
    icon: Lock,
    iconClass: 'text-[#D96A78]',
    border: 'border-[#D96A78]/30',
    bg: 'bg-[var(--state-danger)]/[0.045]',
    label: 'HOLD',
  },
  escalate: {
    icon: ShieldAlert,
    iconClass: 'text-[#D96A78]',
    border: 'border-[#D96A78]/35',
    bg: 'bg-[#D96A78]/[0.08]',
    label: 'ESCALATE',
  },
  pending: {
    icon: ShieldCheck,
    iconClass: 'text-[#858BA3]',
    border: 'border-[#292E46]',
    bg: 'bg-[#171A2D]/60',
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
                    className="flex items-start gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface,#121526)] px-3 py-2.5 text-xs text-[var(--text-primary)]"
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
