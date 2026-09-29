import { formatProbability, formatScore } from '../utils/helpers'
import StatusPill from './StatusPill'

export default function LiveGraph({ timeSeries = [], inputMode, selected, activeStreamId }) {
  const points = timeSeries.length > 0 ? timeSeries : [{ time: 'Waiting', prob: 0 }]
  const width = 600
  const height = 240
  const padding = 30
  const maxProb = 100

  const coords = points.map((point, index) => {
    const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2)
    const probability = Number(point.prob) || 0
    const y = height - padding - (probability / maxProb) * (height - padding * 2)
    return { x, y, ...point }
  })

  const pathString = coords.reduce((acc, curr, index) => index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`, '')
  const areaString = coords.length > 0
    ? `${pathString} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`
    : ''
  const thresholdY = height - padding - (70 / maxProb) * (height - padding * 2)

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[var(--chart-bg)] border border-[var(--border-default)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">Synthetic Voice Probability</p>
          <p className="text-[10px] text-[var(--text-muted)] font-mono mt-1">Backend Risk Engine telemetry</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="flex items-center gap-1.5 bg-[var(--accent-primary-muted)] text-[var(--accent-primary-soft)] border border-[var(--accent-primary)]/30 px-2.5 py-1 rounded-full">
            <span className="size-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
            {inputMode === 'mic' ? 'LIVE MIC' : 'AUDIO FILE'}
          </span>
          <span className="text-[var(--text-secondary)]">{selected.name || activeStreamId}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 items-center">
        <div className="relative h-[220px] w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--status-danger)" stopOpacity="0.30" />
                <stop offset="100%" stopColor="var(--status-danger)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 25, 50, 75, 100].map((value) => {
              const y = height - padding - (value / maxProb) * (height - padding * 2)
              return (
                <g key={value}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border-default)" strokeDasharray="3 3" />
                  <text x={padding - 8} y={y + 3} fill="var(--chart-axis)" fontSize="10" textAnchor="end" className="font-mono">
                    {value}%
                  </text>
                </g>
              )
            })}

            <line x1={padding} y1={thresholdY} x2={width - padding} y2={thresholdY} stroke="var(--accent-primary)" strokeDasharray="4 4" strokeWidth="1.5" />

            {coords.length > 1 && (
              <>
                <path d={areaString} fill="url(#probGradient)" />
                <path d={pathString} fill="none" stroke="var(--status-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}

            {coords.map((point, index) => {
              const isLast = index === coords.length - 1
              return (
                <g key={index}>
                  <circle cx={point.x} cy={point.y} r={isLast ? 5 : 3} fill="var(--status-danger)" opacity={isLast ? 1 : 0.8} />
                  <circle cx={point.x} cy={point.y} r={isLast ? 3 : 1.5} fill="var(--bg-surface)" />
                </g>
              )
            })}
          </svg>
          <div className="flex justify-between px-7 text-[10px] font-mono text-[var(--text-muted)]">
            <span>Live</span>
            <span>History</span>
            <span>Window stream</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">AI Probability</p>
              <p className={`text-3xl font-black font-mono ${selected.ai_probability > 0.7 ? 'text-[var(--status-danger)]' : 'text-[var(--accent-primary-soft)]'}`}>
                {formatProbability(selected.ai_probability)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">Rolling Risk Score</p>
              <p className="text-2xl font-bold font-mono text-[var(--accent-primary-soft)]">
                {formatScore(selected.rolling_score, 3)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono mb-2">Backend Risk State</p>
              <StatusPill status={selected.risk_level} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              <span className="font-bold text-[var(--accent-primary-soft)]">{selected.consecutive_flags ?? '--'}</span> current consecutive flags
            </p>
            {selected.alert_triggered && selected.alert_consecutive_flags != null && (
              <p className="mt-2 text-xs text-[var(--status-danger)] font-mono opacity-90">
                <span className="font-bold text-[var(--status-danger)]">{selected.alert_consecutive_flags}</span> consecutive flags at alert
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}