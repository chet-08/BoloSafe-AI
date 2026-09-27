import React from 'react'

const tones = {
  indigo: {
    border: 'border-[#5863D6]/45',
    rail: 'bg-[#5863D6]',
    icon: 'text-[#7079E0]',
    iconBg: 'bg-[#5863D6]/12',
    badge: 'bg-[#5863D6]/12 text-[#7079E0] border-[#5863D6]/25',
  },
  green: {
    border: 'border-[#70B88A]/40',
    rail: 'bg-[#70B88A]',
    icon: 'text-[#70B88A]',
    iconBg: 'bg-[#70B88A]/10',
    badge: 'bg-[#70B88A]/10 text-[#70B88A] border-[#70B88A]/25',
  },
  amber: {
    border: 'border-[#D5AE52]/40',
    rail: 'bg-[#D5AE52]',
    icon: 'text-[#D5AE52]',
    iconBg: 'bg-[#D5AE52]/10',
    badge: 'bg-[#D5AE52]/10 text-[#D5AE52] border-[#D5AE52]/25',
  },
  red: {
    border: 'border-[#D96A78]/45',
    rail: 'bg-[#D96A78]',
    icon: 'text-[#D96A78]',
    iconBg: 'bg-[#D96A78]/10',
    badge: 'bg-[#D96A78]/10 text-[#D96A78] border-[#D96A78]/25',
  },
}

export function AnalyticsModuleShell({
  module,
  title,
  description,
  icon: Icon,
  tone = 'indigo',
  status,
  children,
}) {
  const palette = tones[tone] || tones.indigo

  return (
    <div className="space-y-5">
      <section
        className={[
          'relative overflow-hidden rounded-2xl border bg-[var(--bg-surface)]',
          palette.border,
        ].join(' ')}
      >
        <div
          className={`absolute inset-y-0 left-0 w-[3px] rounded-l-2xl ${palette.rail}`}
        />

        <div className="flex flex-col gap-4 px-5 py-5 md:px-6 md:py-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={[
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
                palette.iconBg,
                palette.border,
                palette.icon,
              ].join(' ')}
            >
              <Icon size={20} />
            </div>

            <div>
              <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${palette.icon}`}>
                Module {module}
              </div>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--text-primary)] md:text-2xl">
                {title}
              </h2>

              <p className="mt-1.5 max-w-4xl text-xs leading-5 text-[var(--text-muted)] md:text-sm">
                {description}
              </p>
            </div>
          </div>

          {status && (
            <div
              className={[
                'self-start rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] xl:self-center',
                palette.badge,
              ].join(' ')}
            >
              {status}
            </div>
          )}
        </div>
      </section>

      {children}
    </div>
  )
}

export function AnalyticsSection({
  title,
  subtitle,
  icon: Icon,
  children,
  right,
  tone = 'indigo',
}) {
  const palette = tones[tone] || tones.indigo

  return (
    <section
      className={[
        'overflow-hidden rounded-2xl border bg-[var(--bg-card)]',
        palette.border,
      ].join(' ')}
    >
      <div className="flex flex-col gap-2 border-b border-[var(--border-default)] px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={[
                'flex h-8 w-8 items-center justify-center rounded-lg border',
                palette.iconBg,
                palette.border,
                palette.icon,
              ].join(' ')}
            >
              <Icon size={15} />
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {right}
      </div>

      <div className="p-5 md:p-6">{children}</div>
    </section>
  )
}
