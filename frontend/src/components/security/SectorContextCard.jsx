import React from 'react'

export default function SectorContextCard({
  title,
  description,
  rows = [],
  callout,
}) {
  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card,#171A2D)] p-5">
      <div className="border-b border-[var(--border-default)] pb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Security Context
        </div>

        <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface,#121526)] px-3 py-2.5"
          >
            <span className="text-xs text-[var(--text-muted)]">
              {row.label}
            </span>

            <span
              className={[
                'text-right text-xs font-semibold',
                row.tone === 'success'
                  ? 'text-[var(--state-success)]'
                  : row.tone === 'warning'
                    ? 'text-[var(--state-warning)]'
                    : row.tone === 'danger'
                      ? 'text-[var(--state-danger)]'
                      : 'text-[var(--text-primary)]',
              ].join(' ')}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {callout && (
        <div className="mt-4 rounded-xl border border-[var(--state-warning)]/20 bg-[var(--state-warning)]/[0.06] p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--state-warning)]">
            {callout.title}
          </div>

          <p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">
            {callout.description}
          </p>
        </div>
      )}
    </section>
  )
}
