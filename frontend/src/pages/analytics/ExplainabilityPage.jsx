import { GitBranch, CheckCircle2, ShieldAlert, Activity } from 'lucide-react'
import StatusPill from '../../components/StatusPill'
import AnalyticsMetricCard from '../../components/analytics/AnalyticsMetricCard'
import {
  AnalyticsModuleShell,
  AnalyticsSection,
} from '../../components/analytics/AnalyticsModuleShell'
import { formatProbability, formatScore } from '../../utils/helpers'
import {
  AnalyticsEvidenceRadar,
  AnalyticsContributionDonut,
} from '../../components/analytics/AnalyticsEvidenceVisuals'

export default function ExplainabilityPage({ analytics, selected }) {
  const rawFeatures = Array.isArray(analytics?.shap_features)
    ? analytics.shap_features
    : []

  const shapFeatures = rawFeatures
    .map((feature, index) => {
      const value = Number(feature?.value)
      const absValue = Number(feature?.abs_value)

      return {
        ...feature,
        name: feature?.name || `Feature ${feature?.index ?? index}`,
        value,
        absValue: Number.isFinite(absValue) ? Math.abs(absValue) : Math.abs(value),
      }
    })
    .filter((feature) => Number.isFinite(feature.value))
    .sort((a, b) => b.absValue - a.absValue)
    .slice(0, 6)

  const maxContribution = Math.max(
    ...shapFeatures.map((feature) => feature.absValue),
    1
  )

  const cues = Array.isArray(selected?.diagnostic_cues)
    ? selected.diagnostic_cues
    : []

  const aiProbability =
    selected?.ai_probability != null
      ? Number(selected.ai_probability)
      : null

  const riskTone =
    selected?.risk_level === 'high'
      ? 'red'
      : selected?.risk_level === 'medium'
        ? 'amber'
        : 'indigo'

  return (
    <AnalyticsModuleShell
      module="04"
      title="Explainability & Audit Trail"
      description="Translate model behavior into transparent evidence using SHAP contributions, diagnostic cues, and inference metadata."
      icon={GitBranch}
      tone={riskTone}
      status={selected?.risk_level ? String(selected.risk_level).toUpperCase() : 'WAITING'}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <AnalyticsMetricCard
          label="AI Probability"
          value={formatProbability(aiProbability, 1)}
          helper="Primary synthetic-voice probability for the active window."
          icon={Activity}
          tone={riskTone}
          progress={aiProbability != null ? aiProbability * 100 : null}
        />

        <AnalyticsMetricCard
          label="Risk Level"
          value={
            selected?.risk_level
              ? String(selected.risk_level).toUpperCase()
              : 'WAITING'
          }
          helper="Backend risk state associated with this window."
          icon={ShieldAlert}
          tone={riskTone}
        />

        <AnalyticsMetricCard
          label="Confirmations"
          value={selected?.consecutive_flags ?? '--'}
          helper="Consecutive suspicious windows contributing to confirmation."
          icon={CheckCircle2}
          tone="indigo"
        />

        <AnalyticsMetricCard
          label="Feature Latency"
          value={
            analytics?.feature_latency_ms != null
              ? `${analytics.feature_latency_ms} ms`
              : '--'
          }
          helper="Feature-analysis latency reported by the analytics layer."
          icon={Activity}
          tone="green"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.75fr]">
        <AnalyticsEvidenceRadar features={shapFeatures} />
        <AnalyticsContributionDonut features={shapFeatures} />
      </div>

      <AnalyticsSection
        title="Model evidence"
        subtitle="Top SHAP contributions explain which features pushed the model toward or away from synthetic speech."
        icon={GitBranch}
        tone={riskTone}
        right={
          <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Top {shapFeatures.length}
          </span>
        }
      >
        {shapFeatures.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center">
            <GitBranch
              size={22}
              className="mx-auto text-[var(--text-muted)]"
            />
            <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
              SHAP explanation not available
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Evidence will appear when the active inference window produces a
              SHAP explanation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shapFeatures.map((feature, index) => {
              const width = Math.max(
                Math.round((feature.absValue / maxContribution) * 100),
                6
              )
              const positive = feature.value >= 0

              return (
                <div
                  key={`${feature.name}-${index}`}
                  className={[
                    'relative overflow-hidden rounded-xl border bg-[var(--bg-surface)] p-4',
                    positive
                      ? 'border-[#D96A78]/25'
                      : 'border-[#70B88A]/25',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'absolute inset-y-0 left-0 w-[3px]',
                      positive ? 'bg-[#D96A78]' : 'bg-[#70B88A]',
                    ].join(' ')}
                  />

                  <div className="flex items-center justify-between gap-4 pl-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            'h-2 w-2 rounded-full',
                            positive ? 'bg-[#D96A78]' : 'bg-[#70B88A]',
                          ].join(' ')}
                        />
                        <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                          {feature.name}
                        </p>
                      </div>

                      <p
                        className={[
                          'mt-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
                          positive
                            ? 'text-[#D96A78]'
                            : 'text-[#70B88A]',
                        ].join(' ')}
                      >
                        {positive
                          ? 'Pushes toward synthetic'
                          : 'Pushes away from synthetic'}
                      </p>
                    </div>

                    <span
                      className={[
                        'shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-bold',
                        positive
                          ? 'bg-[#D96A78]/10 text-[#D96A78]'
                          : 'bg-[#70B88A]/10 text-[#70B88A]',
                      ].join(' ')}
                    >
                      {feature.value > 0 ? '+' : ''}
                      {formatScore(feature.value, 2)}
                    </span>
                  </div>

                  <div className="mt-3 pl-1">
                    <div
                      className={[
                        'h-2 overflow-hidden rounded-full',
                        positive
                          ? 'bg-[#D96A78]/10'
                          : 'bg-[#70B88A]/10',
                      ].join(' ')}
                    >
                      <div
                        className={[
                          'h-full rounded-full',
                          positive
                            ? 'bg-[#D96A78]'
                            : 'bg-[#70B88A]',
                        ].join(' ')}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </AnalyticsSection>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
        <AnalyticsSection
          title="Signals detected"
          subtitle="Diagnostic cues reported by the active model window."
          icon={CheckCircle2}
          tone="green"
        >
          {cues.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {cues.map((cue, index) => (
                <div
                  key={`${cue}-${index}`}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2.5"
                >
                  <CheckCircle2
                    size={15}
                    className="shrink-0 text-[var(--state-success)]"
                  />
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    {String(cue).replaceAll('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-center text-xs text-[var(--text-muted)]">
              No diagnostic signals reported for this window.
            </div>
          )}
        </AnalyticsSection>

        <AnalyticsSection
          title="Audit metadata"
          subtitle="Traceability for the active assessment."
          icon={Activity}
          tone="indigo"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Window
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                {selected?.window_id ?? '--'}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Confirmations
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                {selected?.consecutive_flags ?? '--'}
              </p>
            </div>

            <div className="col-span-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Model version
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-[var(--accent-primary-soft)]">
                {selected?.model_version || '--'}
              </p>
            </div>
          </div>
        </AnalyticsSection>
      </div>
    </AnalyticsModuleShell>
  )
}
