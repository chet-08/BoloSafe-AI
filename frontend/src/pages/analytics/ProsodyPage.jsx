import {
  Activity,
  AudioLines,
  Gauge,
  Waves,
  Timer,
  CheckCircle2,
  Mic2,
  TrendingUp,
} from 'lucide-react'
import StatusPill from '../../components/StatusPill'
import AnalyticsMetricCard from '../../components/analytics/AnalyticsMetricCard'
import {
  AnalyticsModuleShell,
  AnalyticsSection,
} from '../../components/analytics/AnalyticsModuleShell'

function ArcGauge({ value, tone = 'amber' }) {
  const safe = Math.max(0, Math.min(1, Number(value) || 0))
  const radius = 78
  const circumference = 2 * Math.PI * radius
  const dash = circumference * safe * 0.75
  const color =
    tone === 'red'
      ? '#D96A78'
      : tone === 'green'
        ? '#70B88A'
        : '#D5AE52'

  return (
    <div className="relative flex h-[210px] w-[210px] items-center justify-center">
      <svg
        viewBox="0 0 220 220"
        className="h-full w-full -rotate-[135deg]"
      >
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="#292E46"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
        />

        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold tracking-tight"
          style={{ color }}
        >
          {(safe * 100).toFixed(1)}%
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          ML spoof support
        </span>
      </div>
    </div>
  )
}

export default function ProsodyPage({ analytics, selected }) {
  const prosody = analytics?.prosody || {}

  const formatHz = (value) =>
    value != null && !Number.isNaN(Number(value))
      ? `${Number(value).toFixed(1)} Hz`
      : '--'

  const formatPercent = (value) =>
    value != null && !Number.isNaN(Number(value))
      ? `${Number(value).toFixed(1)}%`
      : '--'

  const formatNumber = (value) =>
    value != null && !Number.isNaN(Number(value))
      ? Number(value).toFixed(4)
      : '--'

  const flatProsody =
    prosody.flat_prosody === true
      ? 'YES'
      : prosody.flat_prosody === false
        ? 'NO'
        : '--'

  const spoofProbability =
    prosody.spoof_probability != null
      ? Number(prosody.spoof_probability)
      : null

  const spoofTone =
    spoofProbability >= 0.75
      ? 'red'
      : spoofProbability >= 0.4
        ? 'amber'
        : 'green'

  const signalColor =
    prosody.signal === 'SPOOF_SUPPORT'
      ? '#D96A78'
      : prosody.signal === 'BONAFIDE_SUPPORT'
        ? '#70B88A'
        : '#D5AE52'

  return (
    <AnalyticsModuleShell
      module="01"
      title="Prosody & Behavioral Analysis"
      description="Analyzes rhythm, temporal alignment, pitch dynamics, and supporting prosody signals to identify unnatural speech behavior."
      icon={Activity}
      tone={spoofTone}
      status={
        selected?.risk_level
          ? String(selected.risk_level).toUpperCase()
          : 'WAITING'
      }
    >
      {/* Primary visual analysis */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
          <div className="border-b border-[var(--border-default)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D5AE52]/10 text-[#D5AE52]">
                <Gauge size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Prosody support signal
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Independent supporting probability
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-6">
            {spoofProbability != null ? (
              <ArcGauge value={spoofProbability} tone={spoofTone} />
            ) : (
              <div className="flex h-[210px] items-center justify-center">
                <span className="text-2xl font-bold text-[var(--text-muted)]">
                  WAITING
                </span>
              </div>
            )}

            <div className="mt-2 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: signalColor }}
              />
              <span
                className="text-xs font-bold"
                style={{ color: signalColor }}
              >
                {
                  {
                    BONAFIDE_SUPPORT: 'Human-supporting',
                    SPOOF_SUPPORT: 'Spoof-supporting',
                    INCONCLUSIVE: 'Inconclusive',
                    UNAVAILABLE: 'Unavailable',
                  }[prosody.signal] || 'Unavailable'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Acoustic profile */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
          <div className="border-b border-[var(--border-default)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary-soft)]">
                <AudioLines size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Acoustic profile
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Pitch, timing, and voicing characteristics
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-5 xl:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <AudioLines size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                  Pitch mean
                </span>
              </div>
              <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                {formatHz(prosody.pitch_mean_hz)}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Waves size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                  Pitch variance
                </span>
              </div>
              <p className="mt-3 text-xl font-bold text-[var(--accent-primary-soft)]">
                {formatPercent(prosody.pitch_variance_percent)}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <TrendingUp size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                  Pitch std dev
                </span>
              </div>
              <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                {formatHz(prosody.pitch_std_hz)}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Timer size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                  Timing variance
                </span>
              </div>
              <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                {formatNumber(prosody.timing_variance)}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Waves size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                  Voiced ratio
                </span>
              </div>
              <p className="mt-3 text-xl font-bold text-[#70B88A]">
                {selected?.yin_analysis?.voiced_ratio != null
                  ? `${(
                      Number(selected.yin_analysis.voiced_ratio) * 100
                    ).toFixed(1)}%`
                  : '--'}
              </p>
            </div>

            <div
              className={[
                'rounded-xl border p-4',
                flatProsody === 'YES'
                  ? 'border-[#D5AE52]/30 bg-[#D5AE52]/5'
                  : 'border-[#70B88A]/25 bg-[#70B88A]/5',
              ].join(' ')}
            >
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Activity size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                  Flat prosody
                </span>
              </div>
              <p
                className={[
                  'mt-3 text-xl font-bold',
                  flatProsody === 'YES'
                    ? 'text-[#D5AE52]'
                    : 'text-[#70B88A]',
                ].join(' ')}
              >
                {flatProsody}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* YIN / supporting evidence */}
      <AnalyticsSection
        title="Supporting voice dynamics"
        subtitle="Secondary acoustic indicators from the active analysis window."
        icon={Mic2}
        tone="indigo"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AnalyticsMetricCard
            label="YIN F0 Mean"
            value={formatHz(selected?.yin_analysis?.f0_mean)}
            helper="Auxiliary fundamental-frequency estimate."
            icon={AudioLines}
            tone="indigo"
          />

          <AnalyticsMetricCard
            label="YIN F0 Std Dev"
            value={formatHz(selected?.yin_analysis?.f0_std)}
            helper="Pitch variability from the auxiliary YIN analyzer."
            icon={Gauge}
            tone="indigo"
          />

          <AnalyticsMetricCard
            label="YIN Voiced Ratio"
            value={
              selected?.yin_analysis?.voiced_ratio != null
                ? `${(
                    Number(selected.yin_analysis.voiced_ratio) * 100
                  ).toFixed(1)}%`
                : '--'
            }
            helper="Proportion of the analysis window classified as voiced."
            icon={Waves}
            tone="green"
          />
        </div>
      </AnalyticsSection>

      {/* Model evidence */}
      <AnalyticsSection
        title="Prosody model evidence"
        subtitle="Supporting ML interpretation and current analysis state."
        icon={CheckCircle2}
        tone={
          spoofProbability >= 0.75
            ? 'red'
            : spoofProbability >= 0.4
              ? 'amber'
              : 'green'
        }
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  Language-independent supporting model
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  This signal supports the primary detector but does not replace it.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--accent-primary-soft)]">
                {prosody.model_version || '--'}
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--border-default)]">
              <div
                className={
                  spoofTone === 'red'
                    ? 'h-full rounded-full bg-[#D96A78]'
                    : spoofTone === 'amber'
                      ? 'h-full rounded-full bg-[#D5AE52]'
                      : 'h-full rounded-full bg-[#70B88A]'
                }
                style={{
                  width:
                    spoofProbability != null
                      ? `${spoofProbability * 100}%`
                      : '0%',
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
              <span>Supporting strength</span>
              <span>
                {spoofProbability != null
                  ? `${(spoofProbability * 100).toFixed(1)}%`
                  : '--'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Current assessment
            </p>

            <div className="mt-3">
              <StatusPill status={selected?.risk_level || '--'} />
            </div>

            <div className="mt-4 border-t border-[var(--border-default)] pt-4">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Window
              </p>
              <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                {selected?.window_id ?? '--'}
              </p>
            </div>
          </div>
        </div>
      </AnalyticsSection>
    </AnalyticsModuleShell>
  )
}
