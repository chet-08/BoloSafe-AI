import React from 'react'
import { Activity, Radio } from 'lucide-react'

export default function LiveDetectionPanel({
  title,
  description,
  isLive = false,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card,#171A2D)]">
      <div className="flex flex-col gap-3 border-b border-[var(--border-default)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-[var(--accent-primary-soft)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
          </div>

          {description && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>

        <div
          className={[
            'inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1',
            'text-[9px] font-bold uppercase tracking-[0.14em]',
            isLive
              ? 'border-[var(--state-success)]/20 bg-[var(--state-success)]/10 text-[var(--state-success)]'
              : 'border-[var(--border-default)] bg-[var(--bg-surface,#121526)] text-[var(--text-muted)]',
          ].join(' ')}
        >
          <Radio size={11} />
          {isLive ? 'Streaming' : 'Idle'}
        </div>
      </div>

      <div className="p-4">
        {children}
      </div>
    </section>
  )
}
