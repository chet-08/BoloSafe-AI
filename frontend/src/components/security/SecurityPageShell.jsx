import React from 'react'
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'

const toneClasses = {
  low: {
    badge:
      'border-[var(--state-success)]/25 bg-[var(--state-success)]/10 text-[var(--state-success)]',
  },
  medium: {
    badge:
      'border-[var(--state-warning)]/25 bg-[var(--state-warning)]/10 text-[var(--state-warning)]',
  },
  high: {
    badge:
      'border-[var(--state-danger)]/25 bg-[#D96A78]/10 text-[#D96A78]',
  },
  active: {
    badge:
      'border-[var(--accent-primary)]/25 bg-[var(--accent-primary-muted)] text-[var(--accent-primary-soft)]',
  },
}

export default function SecurityPageShell({
  eyebrow,
  title,
  description,
  status = 'ACTIVE',
  statusTone = 'active',
  children,
  critical,
}) {
  const tone = toneClasses[statusTone] || toneClasses.active

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card,#171A2D)] p-5 md:p-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-[var(--accent-primary)]" />

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 pl-2">
            {eyebrow && (
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-primary-soft)]">
                <Activity size={13} />
                {eyebrow}
              </div>
            )}

            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-[34px]">
              {title}
            </h1>

            {description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                {description}
              </p>
            )}
          </div>

          <div
            className={[
              'inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5',
              'text-[10px] font-bold uppercase tracking-[0.16em]',
              tone.badge,
            ].join(' ')}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
          </div>
        </div>
      </section>

      {critical && (
        <section className="relative overflow-hidden rounded-2xl border border-[#D96A78]/30 bg-[#D96A78]/[0.07] p-4 md:p-5">
          <div className="absolute inset-y-0 left-0 w-1 bg-[#D96A78]" />

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-3 pl-1">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--state-danger)]/20 bg-[#D96A78]/10 text-[#D96A78]">
                <ShieldAlert size={18} />
              </div>

              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D96A78]">
                  {critical.label || 'Critical Detection'}
                </div>

                <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  {critical.title}
                </div>

                {critical.description && (
                  <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                    {critical.description}
                  </p>
                )}
              </div>
            </div>

            {critical.actions}
          </div>
        </section>
      )}

      {children}
    </div>
  )
}
