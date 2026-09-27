import { useState } from 'react'
import {
  Activity,
  UserCheck,
  Fingerprint,
  GitBranch,
  Layers,
  BarChart3,
} from 'lucide-react'

import ProsodyPage from './analytics/ProsodyPage'
import SpeakerPage from './analytics/SpeakerPage'
import VocoderPage from './analytics/VocoderPage'
import ExplainabilityPage from './analytics/ExplainabilityPage'
import DualStreamPage from './analytics/DualStreamPage'

export default function Analytics({
  analytics,
  selected,
}) {
  const [subPage, setSubPage] = useState('prosody')

  const tabs = [
    {
      id: 'prosody',
      label: 'Prosody & Behavior',
      icon: Activity,
    },
    {
      id: 'speaker',
      label: 'Speaker Verification',
      icon: UserCheck,
    },
    {
      id: 'vocoder',
      label: 'Vocoder Fingerprint',
      icon: Fingerprint,
    },
    {
      id: 'explainability',
      label: 'Explainability / SHAP',
      icon: GitBranch,
    },
    {
      id: 'dual_stream',
      label: 'Dual-Stream Fusion',
      icon: Layers,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="border-l-[3px] border-[var(--accent-primary)] px-5 py-5 md:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <BarChart3
                  size={16}
                  className="text-[var(--accent-primary-soft)]"
                />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent-primary-soft)]">
                  Deep Analytics
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
                Behavioral & Acoustic Analytics
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                Inspect acoustic behavior, speaker identity, vocoder signatures,
                model explainability, and trilingual neural fusion.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Analytics tabs */}
      <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-5">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = subPage === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSubPage(id)}
                className={[
                  'flex min-h-[76px] items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                  active
                    ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10'
                    : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover,#1C2033)]',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                    active
                      ? 'border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary-soft)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)]',
                  ].join(' ')}
                >
                  <Icon size={17} />
                </span>

                <span
                  className={[
                    'text-xs font-semibold leading-4',
                    active
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)]',
                  ].join(' ')}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Active analytics module */}
      <section>
        {subPage === 'prosody' && (
          <ProsodyPage analytics={analytics} selected={selected} />
        )}

        {subPage === 'speaker' && (
          <SpeakerPage selected={selected} />
        )}

        {subPage === 'vocoder' && (
          <VocoderPage selected={selected} />
        )}

        {subPage === 'explainability' && (
          <ExplainabilityPage
            analytics={analytics}
            selected={selected}
          />
        )}

        {subPage === 'dual_stream' && (
          <DualStreamPage
            analytics={analytics}
            selected={selected}
          />
        )}
      </section>
    </div>
  )
}
