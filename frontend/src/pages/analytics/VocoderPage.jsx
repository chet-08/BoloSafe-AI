import {
  Fingerprint,
  ShieldCheck,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import StatusPill from '../../components/StatusPill'
import AnalyticsMetricCard from '../../components/analytics/AnalyticsMetricCard'
import {
  AnalyticsModuleShell,
  AnalyticsSection,
} from '../../components/analytics/AnalyticsModuleShell'
import { formatProbability } from '../../utils/helpers'

export default function VocoderPage({ selected }) {
  const vocoder = selected?.vocoder_fingerprint || {}
  const confidence =
    vocoder.confidence != null ? Number(vocoder.confidence) : null

  const flagged = Boolean(selected?.vocoder_flag)
  const tone = flagged
    ? 'red'
    : confidence != null && confidence >= 0.4
      ? 'amber'
      : 'green'

  return (
    <AnalyticsModuleShell
      module="03"
      title="Vocoder Fingerprinting"
      description="Examines spectral artifacts and reconstruction patterns associated with neural speech synthesis pipelines."
      icon={Fingerprint}
      tone={tone}
      status={flagged ? 'ANOMALOUS' : confidence != null ? 'NORMAL' : 'WAITING'}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <AnalyticsMetricCard
          label="Detected Architecture"
          value={vocoder.detected_tool || 'None Flagged'}
          helper="Vocoder family or reconstruction signature identified in the active window."
          icon={Fingerprint}
          tone={flagged ? 'red' : 'indigo'}
        />

        <AnalyticsMetricCard
          label="Artifact Confidence"
          value={formatProbability(confidence)}
          helper="Confidence associated with the detected vocoder signature."
          icon={Activity}
          tone={tone}
          progress={confidence != null ? confidence * 100 : null}
        />

        <AnalyticsMetricCard
          label="Vocoder Flag"
          value={flagged ? 'ANOMALOUS' : 'NORMAL'}
          helper="Supporting forensic signal from the vocoder fingerprint layer."
          icon={flagged ? AlertTriangle : ShieldCheck}
          tone={flagged ? 'red' : 'green'}
        />

        <AnalyticsMetricCard
          label="Detection Window"
          value={selected?.window_id ?? '--'}
          helper="Active inference window used for the fingerprint assessment."
          icon={Activity}
          tone="indigo"
        />
      </div>

      <AnalyticsSection
        title="Synthetic signature analysis"
        subtitle="Vocoder evidence is a supporting signal, not the sole decision criterion."
        icon={Fingerprint}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center gap-3">
              <div
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  flagged
                    ? 'bg-[var(--state-danger)]/10 text-[var(--state-danger)]'
                    : 'bg-[var(--state-success)]/10 text-[var(--state-success)]',
                ].join(' ')}
              >
                {flagged ? (
                  <AlertTriangle size={17} />
                ) : (
                  <ShieldCheck size={17} />
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Vocoder flag status
                </h4>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  High-frequency and phase-consistency evidence
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-6 text-[var(--text-muted)]">
              Neural text-to-speech systems can leave recognizable periodic or
              spectral reconstruction artifacts. This module exposes those cues
              as forensic support for the primary detection model.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Current verdict
            </p>

            <div className="mt-3">
              <StatusPill status={flagged ? 'ANOMALOUS' : 'NORMAL'} />
            </div>

            <div className="mt-4 border-t border-[var(--border-default)] pt-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Architecture
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {vocoder.detected_tool || 'None flagged'}
              </p>
            </div>
          </div>
        </div>
      </AnalyticsSection>
    </AnalyticsModuleShell>
  )
}
