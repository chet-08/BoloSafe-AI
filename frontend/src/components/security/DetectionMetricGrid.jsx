import React from 'react'
import {
  Activity,
  Fingerprint,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

const icons = {
  risk: Activity,
  speaker: Fingerprint,
  authenticity: ShieldCheck,
  composite: TrendingUp,
}

const tones = {
  low: {
    accent: '#70B88A',
    text: 'text-[#70B88A]',
    bg: 'bg-[#70B88A]/[0.06]',
    border: 'border-[#70B88A]/25',
    iconBg: 'bg-[#70B88A]/10',
    bar: 'bg-[#70B88A]',
  },
  medium: {
    accent: '#D5AE52',
    text: 'text-[#D5AE52]',
    bg: 'bg-[#D5AE52]/[0.06]',
    border: 'border-[#D5AE52]/25',
    iconBg: 'bg-[#D5AE52]/10',
    bar: 'bg-[#D5AE52]',
  },
  high: {
    accent: '#D96A78',
    text: 'text-[#D96A78]',
    bg: 'bg-[#D96A78]/[0.07]',
    border: 'border-[#D96A78]/30',
    iconBg: 'bg-[#D96A78]/10',
    bar: 'bg-[#D96A78]',
  },
  neutral: {
    accent: '#5863D6',
    text: 'text-[#7079E0]',
    bg: 'bg-[#5863D6]/[0.06]',
    border: 'border-[#5863D6]/25',
    iconBg: 'bg-[#5863D6]/10',
    bar: 'bg-[#5863D6]',
  },
}

export default function DetectionMetricGrid({ metrics = [] }) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = icons[metric.icon] || Activity
        const tone = tones[metric.tone] || tones.neutral

        return (
          <article
            key={metric.id || metric.label}
            className={[
              'relative overflow-hidden rounded-2xl border p-4 md:p-5',
              'bg-[var(--bg-surface)] transition-all duration-200',
              tone.border,
            ].join(' ')}
          >
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ backgroundColor: tone.accent }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: tone.accent }}
                  />

                  <div className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {metric.label}
                  </div>
                </div>

                <div className="mt-3 text-[28px] font-semibold leading-none tracking-tight text-[var(--text-primary)] md:text-[30px]">
                  {metric.value}
                </div>
              </div>

              <div
                className={[
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                  tone.iconBg,
                  tone.border,
                  tone.text,
                ].join(' ')}
              >
                <Icon size={17} strokeWidth={2} />
              </div>
            </div>

            {metric.progress != null && (
              <div className="mt-5">
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-hover)]">
                  <div
                    className={`h-full rounded-full ${tone.bar} transition-all duration-500`}
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, metric.progress)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {metric.helper && (
              <div className={`mt-2.5 text-[11px] ${tone.text}`}>
                {metric.helper}
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}
