import { UserCheck, ShieldCheck, Fingerprint, Activity } from 'lucide-react'
import StatusPill from '../../components/StatusPill'
import AnalyticsMetricCard from '../../components/analytics/AnalyticsMetricCard'
import {
  AnalyticsModuleShell,
  AnalyticsSection,
} from '../../components/analytics/AnalyticsModuleShell'
import { formatProbability } from '../../utils/helpers'

export default function SpeakerPage({ selected }) {
  const speaker = selected?.speaker_verification || {}
  const matchScore =
    speaker.match_score != null ? Number(speaker.match_score) : null

  const tone =
    matchScore != null
      ? matchScore < 0.5
        ? 'red'
        : matchScore < 0.75
          ? 'amber'
          : 'green'
      : 'indigo'

  return (
    <AnalyticsModuleShell
      module="02"
      title="Speaker Verification & Identity"
      description="Validates whether the active speaker matches the enrolled voice identity using biometric embedding comparison."
      icon={UserCheck}
      tone={tone}
      status={speaker.status || (matchScore != null ? 'EVALUATED' : 'WAITING')}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <AnalyticsMetricCard
          label="Biometric Match"
          value={formatProbability(matchScore)}
          helper="Similarity between the observed voice and the enrolled speaker profile."
          icon={Fingerprint}
          tone={tone}
          progress={matchScore != null ? matchScore * 100 : null}
        />

        <AnalyticsMetricCard
          label="Verification State"
          value={
            speaker.status ||
            (matchScore != null
              ? matchScore > 0.75
                ? 'VERIFIED'
                : 'MISMATCH'
              : 'WAITING')
          }
          helper="Current identity verification state."
          icon={ShieldCheck}
          tone={tone}
        />

        <AnalyticsMetricCard
          label="Enrolled Profile"
          value={speaker.enrolled_speaker || 'Secure Profile'}
          helper="Reference identity used for cross-session biometric comparison."
          icon={UserCheck}
          tone="indigo"
        />

        <AnalyticsMetricCard
          label="Detection Window"
          value={selected?.window_id ?? '--'}
          helper="Active inference window associated with this identity assessment."
          icon={Activity}
          tone="indigo"
        />
      </div>

      <AnalyticsSection
        title="Identity guard"
        subtitle="How speaker verification contributes to the security decision."
        icon={ShieldCheck}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary-soft)]">
                <Fingerprint size={17} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Biometric matching
                </h4>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  ECAPA-TDNN speaker embedding comparison
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-6 text-[var(--text-muted)]">
              BoloSafe-AI compares the active voiceprint against an enrolled
              identity. A low biometric match combined with elevated synthetic
              voice probability can indicate a potential impersonation attempt.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Current state
            </p>
            <div className="mt-3">
              <StatusPill
                status={
                  speaker.status ||
                  (matchScore != null
                    ? matchScore > 0.75
                      ? 'VERIFIED'
                      : 'MISMATCH'
                    : 'WAITING')
                }
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
              Identity evidence should be interpreted with the primary detector
              and sector governance result.
            </p>
          </div>
        </div>
      </AnalyticsSection>
    </AnalyticsModuleShell>
  )
}
