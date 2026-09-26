import React from 'react'

function polar(cx, cy, radius, angle) {
  const radians = (angle - 90) * (Math.PI / 180)
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  }
}

function polygonPoints(cx, cy, radius, count) {
  return Array.from({ length: count }, (_, i) => {
    const p = polar(cx, cy, radius, (360 / count) * i)
    return `${p.x},${p.y}`
  }).join(' ')
}

export function AnalyticsEvidenceRadar({ features = [] }) {
  const items = features.slice(0, 6)

  if (!items.length) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)]">
        <p className="text-xs text-[var(--text-muted)]">
          Evidence profile will appear after SHAP analysis.
        </p>
      </div>
    )
  }

  const cx = 190
  const cy = 165
  const radius = 110
  const levels = [0.25, 0.5, 0.75, 1]
  const maxAbs = Math.max(...items.map((x) => x.absValue), 1)

  const pointData = items.map((feature, index) => {
    const normalized = Math.max(0.08, feature.absValue / maxAbs)
    const angle = (360 / items.length) * index
    const point = polar(cx, cy, radius * normalized, angle)
    const outer = polar(cx, cy, radius + 20, angle)

    return {
      ...feature,
      point,
      outer,
      angle,
      normalized,
    }
  })

  const valuePoints = pointData
    .map((item) => `${item.point.x},${item.point.y}`)
    .join(' ')

  return (
    <div className="rounded-2xl border border-[#5863D6]/30 bg-[var(--bg-surface)] p-4 md:p-6">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7079E0]">
          Evidence profile
        </p>
        <h4 className="mt-1 text-base font-bold text-[var(--text-primary)]">
          SHAP contribution radar
        </h4>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Relative magnitude of the strongest model features for this window.
        </p>
      </div>

      <div className="flex flex-col items-center gap-5 xl:flex-row xl:justify-between">
        <svg
          viewBox="0 0 380 330"
          className="h-[300px] w-full max-w-[380px]"
          role="img"
          aria-label="SHAP evidence radar"
        >
          {levels.map((level) => (
            <polygon
              key={level}
              points={polygonPoints(cx, cy, radius * level, items.length)}
              fill="none"
              stroke="#292E46"
              strokeWidth="1"
            />
          ))}

          {items.map((_, index) => {
            const p = polar(
              cx,
              cy,
              radius,
              (360 / items.length) * index
            )

            return (
              <line
                key={index}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke="#292E46"
                strokeWidth="1"
              />
            )
          })}

          <polygon
            points={valuePoints}
            fill="rgba(88,99,214,0.16)"
            stroke="#7079E0"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {pointData.map((item, index) => (
            <g key={`${item.name}-${index}`}>
              <circle
                cx={item.point.x}
                cy={item.point.y}
                r="5"
                fill={item.value >= 0 ? '#D96A78' : '#70B88A'}
                stroke="#0B0D18"
                strokeWidth="2"
              />

              <text
                x={item.outer.x}
                y={item.outer.y}
                textAnchor={
                  item.outer.x < cx - 10
                    ? 'end'
                    : item.outer.x > cx + 10
                      ? 'start'
                      : 'middle'
                }
                dominantBaseline="middle"
                fill="#858BA3"
                fontSize="9"
                fontWeight="600"
              >
                {item.name.length > 15
                  ? `${item.name.slice(0, 14)}…`
                  : item.name}
              </text>
            </g>
          ))}
        </svg>

        <div className="w-full max-w-[320px] space-y-2">
          {pointData.map((item, index) => (
            <div
              key={`${item.name}-legend-${index}`}
              className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={[
                    'h-2 w-2 shrink-0 rounded-full',
                    item.value >= 0
                      ? 'bg-[#D96A78]'
                      : 'bg-[#70B88A]',
                  ].join(' ')}
                />
                <span className="truncate text-xs font-medium text-[var(--text-primary)]">
                  {item.name}
                </span>
              </div>

              <span
                className={[
                  'ml-3 text-xs font-bold',
                  item.value >= 0
                    ? 'text-[#D96A78]'
                    : 'text-[#70B88A]',
                ].join(' ')}
              >
                {item.value > 0 ? '+' : ''}
                {item.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AnalyticsContributionDonut({ features = [] }) {
  const positive = features
    .filter((item) => item.value >= 0)
    .reduce((sum, item) => sum + Math.abs(item.value), 0)

  const negative = features
    .filter((item) => item.value < 0)
    .reduce((sum, item) => sum + Math.abs(item.value), 0)

  const total = positive + negative
  const positiveShare = total > 0 ? positive / total : 0
  const negativeShare = total > 0 ? negative / total : 0

  const circumference = 2 * Math.PI * 52
  const positiveLength = circumference * positiveShare
  const negativeLength = circumference * negativeShare

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 md:p-6">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Contribution balance
        </p>
        <h4 className="mt-1 text-base font-bold text-[var(--text-primary)]">
          Evidence direction
        </h4>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Positive evidence pushes toward synthetic speech; negative evidence
          pushes away.
        </p>
      </div>

      <div className="flex items-center justify-center py-3">
        <div className="relative">
          <svg viewBox="0 0 140 140" className="h-44 w-44">
            <circle
              cx="70"
              cy="70"
              r="52"
              fill="none"
              stroke="#292E46"
              strokeWidth="14"
            />

            {positiveShare > 0 && (
              <circle
                cx="70"
                cy="70"
                r="52"
                fill="none"
                stroke="#D96A78"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${positiveLength} ${circumference}`}
                transform="rotate(-90 70 70)"
              />
            )}

            {negativeShare > 0 && (
              <circle
                cx="70"
                cy="70"
                r="52"
                fill="none"
                stroke="#70B88A"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${negativeLength} ${circumference}`}
                strokeDashoffset={-positiveLength}
                transform="rotate(-90 70 70)"
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {Math.round(positiveShare * 100)}%
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#D96A78]">
              synthetic pull
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#D96A78]/20 bg-[#D96A78]/5 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D96A78]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              Toward synthetic
            </span>
          </div>
          <p className="mt-2 text-lg font-bold text-[#D96A78]">
            {positive.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-[#70B88A]/20 bg-[#70B88A]/5 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#70B88A]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              Away from synthetic
            </span>
          </div>
          <p className="mt-2 text-lg font-bold text-[#70B88A]">
            {negative.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}
