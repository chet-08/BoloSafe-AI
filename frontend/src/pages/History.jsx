import { Activity, Clock3, ShieldAlert, ShieldCheck, Radio } from 'lucide-react'
import { formatProbability, formatScore } from '../utils/helpers'
import StatusPill from '../components/StatusPill'

const riskMeta = {
  high: {
    label: 'HIGH',
    color: '#D96A78',
    bg: 'bg-[#D96A78]/10',
    border: 'border-[#D96A78]/25',
    bar: 'bg-[#D96A78]',
  },
  medium: {
    label: 'MEDIUM',
    color: '#D5AE52',
    bg: 'bg-[#D5AE52]/10',
    border: 'border-[#D5AE52]/25',
    bar: 'bg-[#D5AE52]',
  },
  low: {
    label: 'LOW',
    color: '#70B88A',
    bg: 'bg-[#70B88A]/10',
    border: 'border-[#70B88A]/25',
    bar: 'bg-[#70B88A]',
  },
}

export default function History({
  streams,
  activeStreamId,
  setActiveStreamId,
  currentHistory,
}) {
  const history = Array.isArray(currentHistory) ? currentHistory : []

  const highCount = history.filter(
    (item) => String(item.risk_level || '').toLowerCase() === 'high'
  ).length

  const mediumCount = history.filter(
    (item) => String(item.risk_level || '').toLowerCase() === 'medium'
  ).length

  const lowCount = history.filter(
    (item) => String(item.risk_level || '').toLowerCase() === 'low'
  ).length

  const avgProbability =
    history.length > 0
      ? history.reduce(
          (sum, item) => sum + Number(item.ai_probability || 0),
          0
        ) / history.length
      : null

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="border-l-[3px] border-[var(--accent-primary)] px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Activity
                  size={15}
                  className="text-[var(--accent-primary-soft)]"
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-primary-soft)]">
                  Incident History
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
                Recent Window Telemetry
              </h1>

              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Backend RiskResult windows for{' '}
                <span className="font-semibold text-[var(--accent-primary-soft)]">
                  {activeStreamId || 'no active stream'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2">
              <Radio size={14} className="text-[var(--accent-primary-soft)]" />
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                Live telemetry
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-2">
            <Clock3 size={14} className="text-[var(--accent-primary-soft)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Windows
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            {history.length}
          </p>
        </div>

        <div className="rounded-xl border border-[#D96A78]/25 bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-[#D96A78]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              High
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#D96A78]">
            {highCount}
          </p>
        </div>

        <div className="rounded-xl border border-[#D5AE52]/25 bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-[#D5AE52]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Medium
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#D5AE52]">
            {mediumCount}
          </p>
        </div>

        <div className="rounded-xl border border-[#70B88A]/25 bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#70B88A]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Avg. AI Risk
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#70B88A]">
            {avgProbability != null
              ? `${(avgProbability * 100).toFixed(1)}%`
              : '--'}
          </p>
        </div>
      </div>

      {/* Telemetry */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] px-5 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Window-by-window telemetry
              </h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Risk progression across the active backend stream.
              </p>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {history.length} records
            </span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-10 text-center">
            <Activity
              size={24}
              className="mx-auto text-[var(--text-muted)]"
            />
            <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
              No telemetry recorded yet
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Start a live detection session to populate window telemetry.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-default)]">
            {[...history].reverse().map((item, index) => {
              const level = String(item.risk_level || 'low').toLowerCase()
              const meta = riskMeta[level] || riskMeta.low
              const probability = Math.max(
                0,
                Math.min(100, Number(item.ai_probability || 0) * 100)
              )
              const rolling = Number(item.rolling_score || 0)

              return (
                <div
                  key={`${item.window_id}-${index}`}
                  className="relative grid gap-4 px-5 py-4 transition-colors hover:bg-[var(--bg-surface)] md:grid-cols-[90px_150px_minmax(240px,1fr)_140px_110px] md:items-center md:px-6"
                >
                  <div
                    className={`absolute inset-y-0 left-0 w-[3px] ${meta.bar}`}
                  />

                  {/* Window */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Window
                    </p>
                    <p
                      className="mt-1 text-sm font-bold"
                      style={{ color: meta.color }}
                    >
                      #{item.window_id}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Timestamp
                    </p>
                    <p className="mt-1 text-xs font-medium text-[var(--text-primary)]">
                      {item.timestamp}
                    </p>
                  </div>

                  {/* Probability */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          VAD / Probability
                        </span>
                        {item.speech_detected === false && (
                          <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-0.5 text-[9px] font-semibold text-[var(--text-muted)]">
                            SILENCE
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {item.speech_detected
                          ? formatProbability(item.ai_probability)
                          : '--'}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[var(--border-default)]">
                      <div
                        className={`h-full rounded-full ${meta.bar}`}
                        style={{ width: `${probability}%` }}
                      />
                    </div>
                  </div>

                  {/* Rolling */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        Rolling
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {formatScore(item.rolling_score)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[var(--border-default)]">
                      <div
                        className="h-full rounded-full bg-[#5863D6]"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, rolling * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Risk */}
                  <div className="flex md:justify-end">
                    <span
                      className={[
                        'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5',
                        meta.bg,
                        meta.border,
                      ].join(' ')}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />

                      <StatusPill status={item.risk_level} />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </section>
  )
}
