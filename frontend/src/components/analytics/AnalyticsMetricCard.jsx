import React from 'react'

const tones = {
  indigo: {
    line: 'bg-[#5863D6]',
    icon: 'text-[#7079E0]',
    iconBg: 'bg-[#5863D6]/10',
    value: 'text-[var(--text-primary)]',
    track: 'bg-[#5863D6]/18',
  },
  green: {
    line: 'bg-[#70B88A]',
    icon: 'text-[#70B88A]',
    iconBg: 'bg-[#70B88A]/10',
    value: 'text-[#70B88A]',
    track: 'bg-[#70B88A]/18',
  },
  amber: {
    line: 'bg-[#D5AE52]',
    icon: 'text-[#D5AE52]',
    iconBg: 'bg-[#D5AE52]/10',
    value: 'text-[#D5AE52]',
    track: 'bg-[#D5AE52]/18',
  },
  red: {
    line: 'bg-[#D96A78]',
    icon: 'text-[#D96A78]',
    iconBg: 'bg-[#D96A78]/10',
    value: 'text-[#D96A78]',
    track: 'bg-[#D96A78]/18',
  },
}

export default function AnalyticsMetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'indigo',
  progress,
  badge,
}) {
  const palette = tones[tone] || tones.indigo

  const validProgress =
    progress != null && Number.isFinite(Number(progress))
      ? Math.max(0, Math.min(100, Number(progress)))
      : null

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 transition-colors hover:border-[var(--accent-primary)]/35">
      <div className={`absolute inset-x-0 top-0 h-[3px] ${palette.line}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${palette.line}`} />
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--text-muted)]">
              {label}
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <p className={`text-2xl font-bold tracking-tight ${palette.value}`}>
              {value}
            </p>

            {badge && (
              <span
                className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${palette.iconBg} ${palette.icon}`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-default)]',
              palette.iconBg,
              palette.icon,
            ].join(' ')}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      {validProgress != null && (
        <div className="mt-4">
          <div className={`h-1.5 overflow-hidden rounded-full ${palette.track}`}>
            <div
              className={`h-full rounded-full ${palette.line}`}
              style={{ width: `${validProgress}%` }}
            />
          </div>
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
        {helper}
      </p>
    </div>
  )
}
