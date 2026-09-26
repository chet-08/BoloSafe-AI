import React, { useMemo, useRef } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  Clock3,
  FileAudio,
  LockKeyhole,
  Mic2,
  Play,
  Radio,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Square,
  UploadCloud,
  UserCheck,
  Volume2,
} from 'lucide-react'

function pct(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return null
  }

  const n = Number(value)
  return n <= 1 ? Math.round(n * 100) : Math.round(n)
}

function getReadableStreamLabel(activeStreamId, streams) {
  if (!activeStreamId) {
    return 'Live Stream-01'
  }

  const ids = Object.keys(streams || {})
  const index = Math.max(ids.indexOf(activeStreamId), 0) + 1

  return `Live Stream-${String(index).padStart(2, '0')}`
}

function titleCase(value = '') {
  return String(value)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function actionLabel(value) {
  const map = {
    allow: 'Security Clear',
    step_up_verification: 'Step-up Verification',
    hold_and_escalate: 'Hold & Escalate',
    supervisor_escalation: 'Supervisor Escalation',
  }

  return map[value] || titleCase(value) || 'Awaiting Decision'
}

function EmptyMetric({ label = 'Awaiting data' }) {
  return (
    <span className="text-[var(--text-muted)]">
      {label}
    </span>
  )
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'neutral',
}) {
  const toneStyles = {
    neutral: {
      line: 'bg-[var(--border-default)]',
      icon: 'text-[var(--text-secondary)]',
      badge: 'bg-[var(--bg-hover)]',
    },
    success: {
      line: 'bg-[var(--status-success)]',
      icon: 'text-[var(--status-success)]',
      badge: 'bg-[var(--status-success)]/[0.08]',
    },
    warning: {
      line: 'bg-[var(--status-warning)]',
      icon: 'text-[var(--status-warning)]',
      badge: 'bg-[var(--status-warning)]/[0.08]',
    },
    danger: {
      line: 'bg-[var(--status-danger)]',
      icon: 'text-[var(--status-danger)]',
      badge: 'bg-[var(--status-danger)]/[0.08]',
    },
  }

  const colors = toneStyles[tone] || toneStyles.neutral

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/30">
      <div className={`absolute inset-x-0 top-0 h-px ${colors.line}`} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {label}
          </p>

          <div className="mt-3 text-[32px] font-extrabold leading-none tracking-[-0.045em] text-[var(--text-primary)]">
            {value}
          </div>

          {detail && (
            <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">
              {detail}
            </p>
          )}
        </div>

        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-default)] ${colors.badge}`}
        >
          <Icon size={18} strokeWidth={1.8} className={colors.icon} />
        </div>
      </div>
    </div>
  )
}

function RiskChart({ points }) {
  const width = 960
  const height = 320
  const left = 42
  const right = 28
  const top = 24
  const bottom = 42

  const data =
    points.length > 1
      ? points
      : Array.from({ length: 10 }, (_, i) => ({
          x: i,
          value: null,
        }))

  const x = (index) =>
    left +
    (index / Math.max(data.length - 1, 1)) *
      (width - left - right)

  const y = (value) =>
    top +
    (1 - Math.min(Math.max(value, 0), 100) / 100) *
      (height - top - bottom)

  const valid = data
    .map((item, index) => ({
      index,
      value: Number(item.value),
    }))
    .filter((item) => Number.isFinite(item.value))

  const latest =
    valid.length > 0 ? valid[valid.length - 1].value : null

  const colorFor = (value) =>
    value >= 75
      ? 'var(--status-danger)'
      : value >= 40
        ? 'var(--status-warning)'
        : 'var(--status-success)'

  const linePoints = valid
    .map((item) => `${x(item.index)},${y(item.value)}`)
    .join(' ')

  const areaPoints = valid.length
    ? `${left},${y(0)} ${linePoints} ${x(valid[valid.length - 1].index)},${y(0)}`
    : ''

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
      <div className="flex items-start justify-between px-6 pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Risk activity
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h3 className="display-type text-xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">
              AI voice risk over time
            </h3>

            {latest !== null && (
              <span
                className="rounded-full border px-2.5 py-1 text-[10px] font-bold"
                style={{
                  borderColor: colorFor(latest),
                  color: colorFor(latest),
                  background: `color-mix(in srgb, ${colorFor(latest)} 10%, transparent)`,
                }}
              >
                {Math.round(latest)}% current
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-bold">
          <span className="flex items-center gap-1.5 text-[var(--status-success)]">
            <span className="size-2 rounded-full bg-[var(--status-success)]" />
            LOW
          </span>

          <span className="flex items-center gap-1.5 text-[var(--status-warning)]">
            <span className="size-2 rounded-full bg-[var(--status-warning)]" />
            MEDIUM
          </span>

          <span className="flex items-center gap-1.5 text-[var(--status-danger)]">
            <span className="size-2 rounded-full bg-[var(--status-danger)]" />
            HIGH
          </span>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[285px] w-full"
          preserveAspectRatio="none"
        >
          {/* Background risk zones */}
          <rect
            x={left}
            y={y(100)}
            width={width - left - right}
            height={y(75) - y(100)}
            fill="var(--status-danger)"
            opacity="0.055"
          />

          <rect
            x={left}
            y={y(75)}
            width={width - left - right}
            height={y(40) - y(75)}
            fill="var(--status-warning)"
            opacity="0.04"
          />

          <rect
            x={left}
            y={y(40)}
            width={width - left - right}
            height={y(0) - y(40)}
            fill="var(--status-success)"
            opacity="0.025"
          />

          {/* Horizontal grid */}
          {[0, 20, 40, 60, 75, 100].map((level) => (
            <line
              key={level}
              x1={left}
              x2={width - right}
              y1={y(level)}
              y2={y(level)}
              stroke="var(--border-default)"
              strokeWidth="1"
              strokeDasharray={
                level === 40 || level === 75 ? '0' : '4 10'
              }
              opacity={level === 40 || level === 75 ? 0.85 : 0.65}
            />
          ))}

          {/* Threshold rules */}
          <line
            x1={left}
            x2={width - right}
            y1={y(75)}
            y2={y(75)}
            stroke="var(--status-danger)"
            strokeWidth="2"
            strokeDasharray="8 6"
            opacity="0.95"
          />

          <line
            x1={left}
            x2={width - right}
            y1={y(40)}
            y2={y(40)}
            stroke="var(--status-warning)"
            strokeWidth="2"
            strokeDasharray="8 6"
            opacity="0.95"
          />

          {/* Threshold labels */}
          <rect
            x={width - 148}
            y={y(75) - 17}
            width="120"
            height="18"
            rx="9"
            fill="var(--bg-card)"
            stroke="var(--status-danger)"
            strokeWidth="1"
          />
          <text
            x={width - 88}
            y={y(75) - 5}
            textAnchor="middle"
            fill="var(--status-danger)"
            fontSize="10"
            fontWeight="800"
          >
            75% HIGH RISK
          </text>

          <rect
            x={width - 156}
            y={y(40) - 17}
            width="128"
            height="18"
            rx="9"
            fill="var(--bg-card)"
            stroke="var(--status-warning)"
            strokeWidth="1"
          />
          <text
            x={width - 92}
            y={y(40) - 5}
            textAnchor="middle"
            fill="var(--status-warning)"
            fontSize="10"
            fontWeight="800"
          >
            40% MEDIUM RISK
          </text>

          {/* Y-axis labels */}
          {[100, 75, 50, 40, 25, 0].map((level) => (
            <text
              key={level}
              x="12"
              y={y(level) + 4}
              fill="var(--text-muted)"
              fontSize="9"
              fontWeight="700"
            >
              {level}
            </text>
          ))}

          {/* Area under line */}
          {areaPoints && (
            <polygon
              points={areaPoints}
              fill="var(--accent-primary)"
              opacity="0.09"
            />
          )}

          {/* Main line */}
          {linePoints && (
            <polyline
              points={linePoints}
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Risk-aware data points */}
          {valid.map((item, index) => (
            <g key={`${item.index}-${item.value}`}>
              {index === valid.length - 1 && (
                <circle
                  cx={x(item.index)}
                  cy={y(item.value)}
                  r="10"
                  fill={colorFor(item.value)}
                  opacity="0.12"
                />
              )}

              <circle
                cx={x(item.index)}
                cy={y(item.value)}
                r={index === valid.length - 1 ? 5.5 : 3.5}
                fill="var(--bg-card)"
                stroke={colorFor(item.value)}
                strokeWidth="2.5"
              />
            </g>
          ))}
        </svg>

        {!linePoints && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
              Waiting for voice analysis
            </span>
          </div>
        )}

        <div className="flex justify-between px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          <span>Earlier</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  )
}

function SectorDistribution({ sectorCounts }) {
  const sectors = [
    ['finance', 'Financial Services'],
    ['retail', 'Retail'],
    ['hospitality', 'Hospitality'],
    ['entertainment', 'Entertainment'],
  ]

  const total = Math.max(
    sectors.reduce((sum, [, label]) => sum + (sectorCounts[label] || 0), 0),
    1
  )

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Sector coverage
          </p>
          <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[var(--text-primary)]">
            Security activity
          </h3>
        </div>

        <BarChart3
          size={18}
          className="text-[var(--status-danger)]"
          strokeWidth={1.8}
        />
      </div>

      <div className="mt-6 space-y-4">
        {sectors.map(([key, label]) => {
          const count = sectorCounts[label] || 0
          const width = `${Math.max((count / total) * 100, count ? 12 : 3)}%`

          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  {label}
                </span>

                <span className="text-[11px] font-bold text-[var(--text-muted)]">
                  {count}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-surface)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500"
                  style={{ width }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ContextCard({
  selectedSector,
  setSelectedSector,
  selectedScenario,
  setSelectedScenario,
  sectorOptions,
  transactionAmountInr,
  setTransactionAmountInr,
  contextConfigured,
  configureSecurityContext,
}) {
  const activeConfig = sectorOptions?.[selectedSector] || {}
  const scenarios = activeConfig.scenarios || []

  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Security context
          </p>

          <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[var(--text-primary)]">
            Define the workflow
          </h3>
        </div>

        <div
          className={[
            'rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em]',
            contextConfigured
              ? 'border-[var(--accent-primary)]/30 bg-[var(--accent-primary-muted)] text-[var(--accent-primary-soft)]'
              : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)]',
          ].join(' ')}
        >
          {contextConfigured ? 'Configured' : 'Required'}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Sector
          </span>

          <div className="relative">
            <select
              value={selectedSector}
              onChange={(event) => setSelectedSector(event.target.value)}
              className="w-full appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] px-3.5 py-3 pr-10 text-sm font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-primary)]"
            >
              {Object.entries(sectorOptions || {}).map(([value, item]) => (
                <option key={value} value={value}>
                  {item.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Workflow
          </span>

          <div className="relative">
            <select
              value={selectedScenario}
              onChange={(event) => setSelectedScenario(event.target.value)}
              className="w-full appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] px-3.5 py-3 pr-10 text-sm font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-primary)]"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.value} value={scenario.value}>
                  {scenario.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
          </div>
        </label>
      </div>

      {selectedSector === 'finance' && (
        <label className="mt-3 block">
          <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Transaction amount · INR
          </span>

          <input
            value={transactionAmountInr}
            onChange={(event) =>
              setTransactionAmountInr(event.target.value)
            }
            inputMode="numeric"
            className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] px-3.5 py-3 text-sm font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-primary)]"
          />
        </label>
      )}

      <button
        type="button"
        onClick={configureSecurityContext}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:brightness-110"
      >
        <SlidersHorizontal size={16} />
        {contextConfigured ? 'Refresh Security Context' : 'Apply Security Context'}
      </button>
    </section>
  )
}

function LiveOperations({
  isConnected,
  isFilePlaying,
  fileName,
  micStatus,
  micLevel,
  transcript,
  toggleLiveMonitor,
  handleFileUpload,
  toggleFilePlayback,
  securityTerminated,
  selected,
}) {
  const fileInputRef = useRef(null)

  const isAlerted = selected?.alert_triggered === true

  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Live operations
          </p>
          <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[var(--text-primary)]">
            Voice security session
          </h3>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5">
          <span
            className="size-2 rounded-full bg-[var(--accent-primary-soft)]"
            aria-hidden
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {isConnected ? 'Backend live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={securityTerminated}
              onClick={toggleLiveMonitor}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isAlerted ? (
                <Square size={14} />
              ) : (
                <Mic2 size={14} />
              )}
              {isAlerted ? 'Session Halted' : 'Start Live Mic'}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]"
            >
              <UploadCloud size={14} />
              Upload audio
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {fileName && (
              <button
                type="button"
                onClick={toggleFilePlayback}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]"
              >
                {isFilePlaying ? (
                  <Square size={13} />
                ) : (
                  <Play size={13} />
                )}
                {isFilePlaying ? 'Stop audio' : 'Play file'}
              </button>
            )}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Input signal
              </span>

              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                {Math.round(micLevel || 0)}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bg-page)]">
              <div
                className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-150"
                style={{
                  width: `${Math.min(
                    Math.max(Number(micLevel || 0), 0),
                    100
                  )}%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Radio size={13} />
              {micStatus || 'Ready for security input'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center gap-2">
            <Volume2
              size={15}
              className="text-[var(--accent-primary-soft)]"
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Live transcript
            </span>
          </div>

          <p className="mt-4 min-h-[90px] text-sm leading-6 text-[var(--text-secondary)]">
            {transcript ||
              'Transcript output will appear here as the security session receives speech.'}
          </p>

          {fileName && (
            <div className="mt-4 flex items-center gap-2 border-t border-[var(--border-default)] pt-3">
              <FileAudio
                size={14}
                className="text-[var(--text-muted)]"
              />
              <span className="truncate text-xs font-medium text-[var(--text-muted)]">
                {fileName}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function SecurityActivity({ selected, contextConfigured }) {
  const action =
    selected?.governance_decision?.action ||
    selected?.governance_decision?.recommended_action ||
    selected?.retail_decision?.action

  const aiRisk =
    selected?.ai_probability !== undefined
      ? pct(selected.ai_probability)
      : null

  const riskLevel =
    selected?.risk_level ||
    selected?.governance_decision?.risk_level ||
    null

  const identityReady =
    selected?.speaker_similarity !== undefined ||
    selected?.speaker_verification ||
    selected?.speaker_match !== undefined

  const steps = [
    {
      number: '01',
      title: 'Security context',
      value: contextConfigured
        ? `${titleCase(selected?.sector || 'Security')} workflow applied`
        : 'Awaiting workflow configuration',
      icon: LockKeyhole,
      tone: contextConfigured ? 'success' : 'neutral',
      badge: contextConfigured ? 'READY' : 'WAITING',
    },
    {
      number: '02',
      title: 'AI detection',
      value:
        aiRisk !== null
          ? `${aiRisk}% synthetic voice probability`
          : 'Awaiting voice input',
      icon: Activity,
      tone:
        aiRisk === null
          ? 'neutral'
          : aiRisk >= 75
            ? 'danger'
            : aiRisk >= 40
              ? 'warning'
              : 'success',
      badge:
        aiRisk === null
          ? 'WAITING'
          : aiRisk >= 75
            ? 'HIGH'
            : aiRisk >= 40
              ? 'MEDIUM'
              : 'LOW',
    },
    {
      number: '03',
      title: 'Governance',
      value: action ? actionLabel(action) : 'Awaiting risk decision',
      icon: ShieldCheck,
      tone:
        action
          ? action === 'allow'
            ? 'success'
            : 'danger'
          : 'neutral',
      badge: action ? 'DECIDED' : 'WAITING',
    },
    {
      number: '04',
      title: 'Identity',
      value: identityReady
        ? 'Speaker verification available'
        : 'Awaiting verification',
      icon: UserCheck,
      tone: identityReady ? 'success' : 'neutral',
      badge: identityReady ? 'READY' : 'WAITING',
    },
  ]

  const tone = {
    neutral: {
      line: 'bg-[var(--border-default)]',
      icon: 'text-[var(--text-muted)]',
      badge:
        'border-[var(--border-default)] bg-[var(--bg-hover)] text-[var(--text-muted)]',
    },
    success: {
      line: 'bg-[var(--status-success)]',
      icon: 'text-[var(--status-success)]',
      badge:
        'border-[var(--status-success)]/25 bg-[var(--status-success)]/[0.08] text-[var(--status-success)]',
    },
    warning: {
      line: 'bg-[var(--status-warning)]',
      icon: 'text-[var(--status-warning)]',
      badge:
        'border-[var(--status-warning)]/25 bg-[var(--status-warning)]/[0.08] text-[var(--status-warning)]',
    },
    danger: {
      line: 'bg-[var(--status-danger)]',
      icon: 'text-[var(--status-danger)]',
      badge:
        'border-[var(--status-danger)]/25 bg-[var(--status-danger)]/[0.08] text-[var(--status-danger)]',
    },
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
      <div className="flex items-start justify-between border-b border-[var(--border-default)] px-6 py-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Security activity
          </p>

          <h3 className="display-type mt-1 text-xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">
            Current protection flow
          </h3>

          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Context → detection → governance → identity
          </p>
        </div>

        <div className="flex size-9 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
          <ArrowUpRight size={17} />
        </div>
      </div>

      <div className="grid gap-px bg-[var(--border-default)] md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => {
          const styles = tone[step.tone]

          return (
            <div
              key={step.number}
              className="relative bg-[var(--bg-card)] px-5 py-5"
            >
              <div className={`absolute inset-x-0 top-0 h-0.5 ${styles.line}`} />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      'flex size-9 shrink-0 items-center justify-center rounded-xl',
                      'border border-[var(--border-default)] bg-[var(--bg-surface)]',
                      styles.icon,
                    ].join(' ')}
                  >
                    <step.icon size={17} strokeWidth={1.8} />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      Step {step.number}
                    </p>

                    <p className="mt-0.5 text-xs font-bold text-[var(--text-secondary)]">
                      {step.title}
                    </p>
                  </div>
                </div>

                <span
                  className={[
                    'rounded-full border px-2 py-1 text-[8px] font-extrabold tracking-[0.12em]',
                    styles.badge,
                  ].join(' ')}
                >
                  {step.badge}
                </span>
              </div>

              <p className="mt-4 min-h-[40px] text-sm font-semibold leading-5 text-[var(--text-primary)]">
                {step.value}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function Overview({
  selected = {},
  streams = {},
  activeStreamId,
  isConnected = false,
  isBackendOnline = false,
  acknowledgeAlert,
  onViewSectorResponse,
  selectedSector = 'finance',
  setSelectedSector,
  sectorOptions = {},
  transactionAmountInr = '',
  setTransactionAmountInr,
  selectedScenario = '',
  setSelectedScenario,
  contextConfigured = false,
  configureSecurityContext,
  toggleLiveMonitor,
  startMicrophoneStream,
  handleFileUpload,
  isFilePlaying = false,
  toggleFilePlayback,
  fileName = '',
  transcript = '',
  micStatus = '',
  micLevel = 0,
  securityTerminated = false,
}) {
  const streamList = Object.values(streams || {})

  const aiRisk = pct(selected?.ai_probability)

  const riskLevel =
    selected?.risk_level ||
    selected?.governance_decision?.risk_level ||
    null

  const action =
    selected?.governance_decision?.action ||
    selected?.governance_decision?.recommended_action ||
    selected?.retail_decision?.action ||
    null

  const latency =
    selected?.pipeline_latency_ms ??
    selected?.latency_ms ??
    selected?.processing_latency_ms ??
    null

  const riskPoints = useMemo(() => {
    const source = selected?.timeSeries || []

    return source.map((item) => ({
      x: item.time,
      value: pct(item.prob),
    }))
  }, [selected?.timeSeries])

  const sectorCounts = useMemo(() => {
    return streamList.reduce((acc, stream) => {
      const sector = stream?.sector

      const labelMap = {
        finance: 'Financial Services',
        retail: 'Retail',
        hospitality: 'Hospitality',
        entertainment: 'Entertainment',
      }

      const label = labelMap[sector]

      if (label) {
        acc[label] = (acc[label] || 0) + 1
      }

      return acc
    }, {})
  }, [streamList])

  const attentionCount = streamList.filter(
    (stream) =>
      stream?.alert_triggered === true ||
      stream?.risk_level === 'HIGH'
  ).length

  const activeStreams = streamList.filter(
    (stream) => stream?.speech_detected === true
  ).length

  const hasActiveResult =
    selected?.ai_probability !== undefined ||
    selected?.rolling_score !== undefined

  return (
    <div
      className="mx-auto w-full max-w-[1600px] space-y-5"
      style={{
        '--overview-accent': 'var(--accent-primary)',
        '--overview-accent-soft': 'var(--accent-primary-soft)',
      }}
    >
      {/* PAGE HEADER */}
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary-soft)]">
            <CircleGauge size={14} />
            BoloSafe command center
          </div>

          <h1 className="mt-2 text-[clamp(2.2rem,3.2vw,3.4rem)] font-extrabold tracking-[-0.045em] text-[var(--text-primary)]">
            Security Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Cross-sector visibility into live voice risk, AI detection,
            security workflows and governance decisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Current sector
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
              {sectorOptions?.[selectedSector]?.label ||
                titleCase(selectedSector)}
            </p>
          </div>
        </div>
      </section>

      {/* CRITICAL ALERT */}
      {selected?.alert_triggered === true && (
        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--status-danger)]/35 bg-gradient-to-r from-[var(--status-danger)]/[0.10] via-[var(--bg-card)] to-[var(--bg-surface)] p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--status-danger)]/30 bg-[var(--status-danger)]/[0.10]">
              <AlertTriangle
                size={18}
                className="text-[var(--accent-primary-soft)]"
              />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary-soft)]">
                Critical detection
              </p>

              <h2 className="mt-1 text-base font-bold text-[var(--text-primary)]">
                Synthetic voice clone detected
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                {selected.alert_reason ===
                'persistent_high_ai_probability'
                  ? `High synthetic-voice probability persisted across ${
                      selected.alert_consecutive_flags ||
                      selected.consecutive_flags ||
                      3
                    } consecutive windows.`
                  : selected.alert_reason ||
                    'The risk engine has triggered a security alert.'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onViewSectorResponse?.()}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]"
            >
              View sector response
            </button>

            <button
              type="button"
              onClick={acknowledgeAlert}
              className="rounded-xl border border-[var(--status-danger)]/40 bg-[var(--status-danger)] px-5 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_24px_rgba(217,106,120,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_10px_28px_rgba(217,106,120,0.26)] active:translate-y-0"
            >
              Acknowledge & escalate
            </button>
          </div>
        </section>
      )}

      {/* KPI STRIP */}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="AI voice risk"
          value={aiRisk !== null ? `${aiRisk}%` : <EmptyMetric />}
          detail={
            riskLevel
              ? `${titleCase(riskLevel)} risk state`
              : 'Awaiting voice analysis'
          }
          icon={Activity}
          tone={
            aiRisk !== null && aiRisk >= 75
              ? 'danger'
              : aiRisk !== null && aiRisk >= 40
                ? 'warning'
                : aiRisk !== null
                  ? 'success'
                  : 'neutral'
          }
        />

        <MetricCard
          label="Monitored streams"
          value={streamList.length}
          detail={`${activeStreams} currently active`}
          icon={Radio}
        />

        <MetricCard
          label="Need attention"
          value={attentionCount}
          detail="High-risk or alerted streams"
          icon={ShieldAlert}
          tone={attentionCount > 0 ? 'danger' : 'success'}
        />

        <MetricCard
          label="Processing latency"
          value={
            latency !== null && latency !== undefined
              ? `${Number(latency).toFixed(1)} ms`
              : <EmptyMetric />
          }
          detail="Live pipeline telemetry"
          icon={Clock3}
        />
      </section>

      {/* ANALYTICS ROW */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
        <RiskChart points={riskPoints} />
        <SectorDistribution sectorCounts={sectorCounts} />
      </section>

      {/* CONTROL + OPERATIONS */}
      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(400px,0.75fr)]">
        <ContextCard
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          sectorOptions={sectorOptions}
          transactionAmountInr={transactionAmountInr}
          setTransactionAmountInr={setTransactionAmountInr}
          contextConfigured={contextConfigured}
          configureSecurityContext={configureSecurityContext}
        />

        <LiveOperations
          isConnected={isConnected}
          isFilePlaying={isFilePlaying}
          fileName={fileName}
          micStatus={micStatus}
          micLevel={micLevel}
          transcript={transcript}
          toggleLiveMonitor={
            toggleLiveMonitor || startMicrophoneStream
          }
          handleFileUpload={handleFileUpload}
          toggleFilePlayback={toggleFilePlayback}
          securityTerminated={securityTerminated}
          selected={selected}
        />
      </section>

      {/* CURRENT SECURITY FLOW */}
      <SecurityActivity
        selected={selected}
        contextConfigured={contextConfigured}
      />

      {/* CURRENT SESSION FOOTER */}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          [
            'Core stream',
            getReadableStreamLabel(activeStreamId, streams),
            Radio,
            'var(--accent-primary-soft)',
          ],
          [
            'Workflow',
            selected?.scenario ||
              selected?.notification_scenario ||
              selectedScenario ||
              'Awaiting context',
            SlidersHorizontal,
            'var(--accent-primary-soft)',
          ],
          [
            'Decision',
            action
              ? actionLabel(action)
              : 'Awaiting analysis',
            ShieldCheck,
            action
              ? action === 'allow'
                ? 'var(--status-success)'
                : 'var(--status-danger)'
              : 'var(--text-muted)',
          ],
          [
            'Identity',
            selected?.speaker_similarity !== undefined
              ? 'Verification available'
              : 'Awaiting voice',
            UserCheck,
            selected?.speaker_similarity !== undefined
              ? 'var(--status-success)'
              : 'var(--text-muted)',
          ],
        ].map(([label, value, Icon, iconColor]) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/25"
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: iconColor }}
            />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
                  <Icon
                    size={16}
                    strokeWidth={1.8}
                    style={{ color: iconColor }}
                  />
                </div>

                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {label}
                </span>
              </div>

              <ArrowUpRight
                size={14}
                className="text-[var(--text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>

            <p className="mt-4 truncate text-sm font-extrabold text-[var(--text-primary)]">
              {titleCase(String(value))}
            </p>
          </div>
        ))}
      </section>
    </div>
  )
}
