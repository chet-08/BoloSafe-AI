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
    text: 'text-[#5863D6]',
    bg: 'bg-[#5863D6]/10',
    border: 'border-[#5863D6]/20',
    line: 'bg-[#5863D6]',
  },
  detected: {
    text: 'text-[#D96A78]',
    bg: 'bg-[#D96A78]/10',
    border: 'border-[#D96A78]/25',
    line: 'bg-[#D96A78]',
  },
  decided: {
    text: 'text-[#D96A78]',
    bg: 'bg-[#D96A78]/10',
    border: 'border-[#D96A78]/25',
    line: 'bg-[#D96A78]',
  },
  identity: {
    text: 'text-[#70B88A]',
    bg: 'bg-[#70B88A]/10',
    border: 'border-[#70B88A]/20',
    line: 'bg-[#70B88A]',
  },
  pending: {
    text: 'text-[#858BA3]',
    bg: 'bg-[#858BA3]/10',
    border: 'border-[#292E46]',
    line: 'bg-[#292E46]',
  },
}

export default function SecurityActivityTimeline({ steps = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#292E46] bg-[#171A2D]">
      <div className="border-b border-[#292E46] px-5 py-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#858BA3]">
          Security Activity
        </div>

        <h2 className="mt-1 text-lg font-semibold text-[#F4F5FA]">
          Current protection flow
        </h2>

        <p className="mt-1 text-xs text-[#858BA3]">
          Context → detection → governance → identity
        </p>
      </div>

      <div className="grid divide-y divide-[#292E46] md:grid-cols-4 md:divide-x md:divide-y-0">
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
                <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#858BA3]">
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#858BA3]">
                    {step.label}
                  </div>

                  <div className="mt-1 text-sm font-semibold text-[#F4F5FA]">
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
