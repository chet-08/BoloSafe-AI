import {
  Mic2,
  RadioTower,
  AudioWaveform,
  BrainCircuit,
  Fingerprint,
  ShieldAlert,
  GitBranch,
  LockKeyhole,
  Landmark,
  ShoppingBag,
  Hotel,
  Film,
  ArrowRight,
  CheckCircle2,
  Activity,
  Server,
  Network,
  Zap,
} from 'lucide-react'

const COLORS = {
  indigo: '#5863D6',
  indigoSoft: '#7079E0',
  green: '#70B88A',
  amber: '#D5AE52',
  red: '#D96A78',
}

const pipeline = [
  {
    n: '01',
    title: 'Voice Input',
    subtitle: 'Microphone / audio file',
    detail: 'Incoming conversation signal',
    icon: Mic2,
    tone: 'indigo',
  },
  {
    n: '02',
    title: 'Signal Processing',
    subtitle: '16 kHz PCM16 + VAD',
    detail: 'Speech-only windows',
    icon: RadioTower,
    tone: 'indigo',
  },
  {
    n: '03',
    title: 'Acoustic Intelligence',
    subtitle: '58-D feature extraction',
    detail: 'Pitch · rhythm · spectral cues',
    icon: AudioWaveform,
    tone: 'indigo',
  },
  {
    n: '04',
    title: 'AI Detection',
    subtitle: 'Calibrated ML inference',
    detail: 'Synthetic-voice probability',
    icon: BrainCircuit,
    tone: 'amber',
  },
  {
    n: '05',
    title: 'Identity & Forensics',
    subtitle: 'Speaker + vocoder + SHAP',
    detail: 'Who spoke · why suspicious',
    icon: Fingerprint,
    tone: 'amber',
  },
  {
    n: '06',
    title: 'Risk Engine',
    subtitle: 'Rolling state + alerting',
    detail: 'LOW · MEDIUM · HIGH',
    icon: ShieldAlert,
    tone: 'red',
  },
  {
    n: '07',
    title: 'Governance',
    subtitle: 'Sector policy',
    detail: 'Allow · Verify · Hold · Escalate',
    icon: GitBranch,
    tone: 'green',
  },
]

const sectors = [
  {
    title: 'Finance',
    subtitle: 'Transaction protection',
    action: 'Hold wire · KYC · Escalate',
    icon: Landmark,
    tone: 'red',
  },
  {
    title: 'Retail',
    subtitle: 'Order & account protection',
    action: 'Hold order · OTP · Escalate',
    icon: ShoppingBag,
    tone: 'amber',
  },
  {
    title: 'Hospitality',
    subtitle: 'Guest & reservation security',
    action: 'Hold booking · Verify',
    icon: Hotel,
    tone: 'green',
  },
  {
    title: 'Entertainment',
    subtitle: 'Artist & content authenticity',
    action: 'Verify · Flag provenance',
    icon: Film,
    tone: 'indigo',
  },
]

function toneColor(tone) {
  return COLORS[tone] || COLORS.indigo
}

function PipelineCard({ item }) {
  const Icon = item.icon
  const color = toneColor(item.tone)

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: color }}
      />

      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color }}
          >
            {item.n}
          </span>

          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{
              color,
              borderColor: `${color}44`,
              background: `${color}10`,
            }}
          >
            <Icon size={17} />
          </div>
        </div>

        <h3 className="mt-4 text-sm font-bold text-[var(--text-primary)]">
          {item.title}
        </h3>

        <p
          className="mt-1 text-[11px] font-semibold"
          style={{ color }}
        >
          {item.subtitle}
        </p>

        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
          {item.detail}
        </p>
      </div>
    </div>
  )
}

function Connector() {
  return (
    <div className="hidden shrink-0 items-center justify-center xl:flex">
      <div className="flex items-center">
        <div className="h-px w-5 bg-[var(--border-default)]" />
        <ArrowRight size={14} className="text-[var(--text-muted)]" />
      </div>
    </div>
  )
}


function NeuralFlowDiagram() {
  const nodes = [
    { x: 85,  label: 'VOICE', sub: 'PCM / VAD', color: '#5863D6' },
    { x: 245, label: 'FEATURES', sub: '58-D DSP', color: '#5863D6' },
    { x: 405, label: 'MODEL', sub: 'AI ENSEMBLE', color: '#D5AE52' },
    { x: 565, label: 'RISK', sub: 'STATE ENGINE', color: '#D96A78' },
    { x: 725, label: 'ACTION', sub: 'GOVERNANCE', color: '#70B88A' },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--accent-primary)]/25 bg-[var(--bg-card)]">
      <div className="border-b border-[var(--border-default)] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--accent-primary-soft)]">
              Live architecture view
            </p>
            <h3 className="mt-1 text-sm font-bold text-[var(--text-primary)]">
              Neural Guard Signal Flow
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              One conversation window moving through detection, risk, and response.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[var(--status-success)]/25 bg-[var(--status-success)]/10 px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--status-success)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--status-success)]">
              Pipeline active
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <svg
          viewBox="0 0 810 230"
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M 55 115 H 755"
            stroke="var(--border-default)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />

          {nodes.slice(0, -1).map((node, index) => (
            <g key={node.label}>
              <line
                x1={node.x + 55}
                y1="115"
                x2={nodes[index + 1].x - 55}
                y2="115"
                stroke="var(--border-strong)"
                strokeWidth="2"
              />

              <polygon
                points={`${nodes[index + 1].x - 61},109 ${nodes[index + 1].x - 50},115 ${nodes[index + 1].x - 61},121`}
                fill="var(--accent-primary-soft)"
              />
            </g>
          ))}

          {nodes.map((node, index) => (
            <g key={node.label}>
              <rect
                x={node.x - 55}
                y="68"
                width="110"
                height="94"
                rx="14"
                fill="var(--bg-surface)"
                stroke={node.color}
                strokeOpacity="0.45"
              />

              <rect
                x={node.x - 55}
                y="68"
                width="110"
                height="3"
                rx="2"
                fill={node.color}
              />

              <circle
                cx={node.x}
                cy="104"
                r="14"
                fill={`${node.color}18`}
                stroke={`${node.color}55`}
              />

              <circle
                cx={node.x}
                cy="104"
                r="4"
                fill={node.color}
              />

              <text
                x={node.x}
                y="137"
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize="10"
                fontWeight="700"
              >
                {node.label}
              </text>

              <text
                x={node.x}
                y="151"
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="8"
              >
                {node.sub}
              </text>

              {index < nodes.length - 1 && (
                <circle r="5" fill={node.color} filter="url(#softGlow)">
                  <animateMotion
                    dur={`${2.4 + index * 0.35}s`}
                    repeatCount="indefinite"
                    path={`M ${node.x + 62} 115 H ${nodes[index + 1].x - 62}`}
                  />
                </circle>
              )}
            </g>
          ))}

          <text
            x="405"
            y="33"
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="9"
            fontWeight="700"
            letterSpacing="2"
          >
            LIVE SECURITY PATH
          </text>

          <text
            x="405"
            y="204"
            textAnchor="middle"
            fill="var(--accent-primary)"
            fontSize="9"
            fontWeight="700"
            letterSpacing="1.5"
          >
            DETECT → EXPLAIN → DECIDE → PROTECT
          </text>
        </svg>
      </div>
    </div>
  )
}

function SecurityFabricDiagram() {
  const points = [
    ['Acoustic', 50, 18, '#5863D6'],
    ['Identity', 78, 38, '#70B88A'],
    ['Forensics', 70, 72, '#D5AE52'],
    ['Risk', 30, 72, '#D96A78'],
    ['Governance', 22, 38, '#7079E0'],
  ]

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--accent-primary-soft)]">
          Security fabric
        </p>
        <h3 className="mt-1 text-sm font-bold text-[var(--text-primary)]">
          Multi-signal intelligence around one core
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Different evidence sources converge before a sector action is taken.
        </p>
      </div>

      <div className="relative mx-auto aspect-square max-w-[360px]">
        <svg viewBox="0 0 360 360" className="h-full w-full">
          {[115, 82, 48].map((r) => (
            <circle
              key={r}
              cx="180"
              cy="180"
              r={r}
              fill="none"
              stroke="var(--border-default)"
              strokeWidth="1"
            />
          ))}

          {points.map(([label, x, y, color]) => {
            const cx = x / 100 * 360
            const cy = y / 100 * 360

            return (
              <g key={label}>
                <line
                  x1="180"
                  y1="180"
                  x2={cx}
                  y2={cy}
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                />

                <circle
                  cx={cx}
                  cy={cy}
                  r="25"
                  fill={`${color}12`}
                  stroke={`${color}55`}
                  strokeWidth="1.5"
                />

                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill={color}
                />

                <text
                  x={cx}
                  y={cy + 42}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="9"
                  fontWeight="600"
                >
                  {label}
                </text>
              </g>
            )
          })}

          <circle
            cx="180"
            cy="180"
            r="42"
            fill="var(--accent-primary)"
            fillOpacity="0.10"
            stroke="var(--accent-primary-soft)"
            strokeWidth="2"
          />

          <circle
            cx="180"
            cy="180"
            r="28"
            fill="var(--bg-surface)"
            stroke="var(--accent-primary)"
          />

          <circle
            cx="180"
            cy="180"
            r="7"
            fill="var(--accent-primary-soft)"
          />

          <text
            x="180"
            y="245"
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize="11"
            fontWeight="700"
          >
            BOLOSAFE CORE
          </text>
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {points.map(([label, , , color]) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] font-semibold text-[var(--text-muted)]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectorCard({ sector }) {
  const Icon = sector.icon
  const color = toneColor(sector.tone)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start gap-3 pl-1">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
          style={{
            color,
            borderColor: `${color}44`,
            background: `${color}10`,
          }}
        >
          <Icon size={19} />
        </div>

        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {sector.title}
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {sector.subtitle}
          </p>
        </div>
      </div>

      <div
        className="mt-4 rounded-lg border px-3 py-2 text-[11px] font-semibold"
        style={{
          color,
          borderColor: `${color}33`,
          background: `${color}08`,
        }}
      >
        {sector.action}
      </div>
    </div>
  )
}

export default function Architecture() {
  return (
    <section className="w-full space-y-6 pb-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-[#5863D6]/35 bg-[var(--bg-surface)]">
        <div className="absolute inset-y-0 left-0 w-[4px] bg-[#5863D6]" />

        <div className="px-5 py-6 md:px-7 md:py-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#5863D6]/30 bg-[#5863D6]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#7079E0]">
              SIH Technical Architecture
            </span>

            <span className="rounded-full border border-[#70B88A]/25 bg-[#70B88A]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#70B88A]">
              Real-Time
            </span>

            <span className="rounded-full border border-[#D5AE52]/25 bg-[#D5AE52]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#D5AE52]">
              Explainable
            </span>

            <span className="rounded-full border border-[#D96A78]/25 bg-[#D96A78]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#D96A78]">
              Action-Oriented
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
            How BoloSafe-AI Guards a Conversation
          </h1>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--text-muted)] md:text-base">
            One voice signal travels through a common security core that
            combines acoustic intelligence, identity verification, risk
            evaluation, and sector-specific governance before an action is
            taken.
          </p>
        </div>
      </section>

      {/* ONE-LINE STORY */}
      <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5863D6]/25 bg-[#5863D6]/10 text-[#7079E0]">
              <Activity size={17} />
            </div>

            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                The security story
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Detect → understand → decide → act
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            <span>Voice</span>
            <ArrowRight size={12} />
            <span>Evidence</span>
            <ArrowRight size={12} />
            <span>Risk</span>
            <ArrowRight size={12} />
            <span>Governance</span>
            <ArrowRight size={12} />
            <span className="text-[var(--text-primary)]">Response</span>
          </div>
        </div>
      </section>

      {/* MAIN PIPELINE */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] px-5 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5863D6]/25 bg-[#5863D6]/10 text-[#7079E0]">
              <WorkflowIcon />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                End-to-End Neural Guard Pipeline
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                The complete journey of a live voice window.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
            {pipeline.map((item, index) => (
              <div key={item.n} className="contents">
                <PipelineCard item={item} />
                {index < pipeline.length - 1 && <Connector />}
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border-default)] pt-5 md:grid-cols-4">
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Input
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                16 kHz PCM16
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Feature layer
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                58-D acoustic DSP
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Inference
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                Calibrated AI ensemble
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Output
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                RiskResult + action
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE VISUALIZATION */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_0.75fr]">
        <NeuralFlowDiagram />
        <SecurityFabricDiagram />
      </section>

      {/* COMMON CORE */}
      <section className="relative overflow-hidden rounded-2xl border border-[#5863D6]/35 bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] px-5 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5863D6]/30 bg-[#5863D6]/10 text-[#7079E0]">
              <BrainCircuit size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Common Security Core
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                One intelligence pipeline, multiple sector responses.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1.4fr] lg:items-center">
            <div className="rounded-2xl border border-[#5863D6]/30 bg-[#5863D6]/8 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7079E0]">
                Shared intelligence
              </p>

              <h3 className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                Neural Guard
              </h3>

              <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">
                Acoustic detection, speaker identity, forensic signals,
                rolling risk, and explainability are evaluated before a
                sector-specific policy responds.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  'Acoustic DSP',
                  'Neural inference',
                  'Speaker verification',
                  'Risk engine',
                  'Explainability',
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--text-muted)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <ArrowRight size={24} className="text-[#7079E0]" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sectors.map((sector) => (
                <SectorCard key={sector.title} sector={sector} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTROL PLANE */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#70B88A]/25 bg-[#70B88A]/10 text-[#70B88A]">
              <LockKeyhole size={17} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Trust Boundary
              </h3>
              <p className="text-[10px] text-[var(--text-muted)]">
                Backend owns the security truth
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-6 text-[var(--text-muted)]">
            The backend computes model probability, rolling risk, flags, and
            final state. The frontend visualizes those results and presents
            sector actions.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D5AE52]/25 bg-[#D5AE52]/10 text-[#D5AE52]">
              <Server size={17} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Real-Time Contract
              </h3>
              <p className="text-[10px] text-[var(--text-muted)]">
                Window-level telemetry
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'ai_probability',
              'rolling_score',
              'risk_level',
              'consecutive_flags',
              'speech_detected',
              'model_version',
              'window_id',
            ].map((item) => (
              <span
                key={item}
                className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1 font-mono text-[9px] text-[#7079E0]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D96A78]/25 bg-[#D96A78]/10 text-[#D96A78]">
              <Zap size={17} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Response Path
              </h3>
              <p className="text-[10px] text-[var(--text-muted)]">
                Detection becomes action
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ['LOW', COLORS.green],
              ['VERIFY', COLORS.amber],
              ['HOLD', COLORS.red],
              ['ESCALATE', COLORS.red],
            ].map(([label, color]) => (
              <div
                key={label}
                className="rounded-lg border px-3 py-2 text-center text-[10px] font-bold"
                style={{
                  color,
                  borderColor: `${color}33`,
                  background: `${color}08`,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JUDGE HOOK */}
      <section className="rounded-2xl border border-[#5863D6]/35 bg-[#5863D6]/5 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#7079E0]">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                What makes the architecture demonstrable
              </span>
            </div>

            <h3 className="mt-2 text-lg font-bold text-[var(--text-primary)]">
              Detect the voice. Explain the evidence. Protect the workflow.
            </h3>

            <p className="mt-1 max-w-4xl text-xs leading-6 text-[var(--text-muted)]">
              The architecture is designed to connect live audio intelligence
              directly to operational security decisions instead of stopping
              at a classification score.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              ['01', 'Real-time'],
              ['02', 'Multi-signal'],
              ['03', 'Sector-aware'],
              ['04', 'Actionable'],
            ].map(([n, label]) => (
              <div
                key={n}
                className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3 text-center"
              >
                <p className="text-[10px] font-bold text-[#7079E0]">{n}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  )
}

function WorkflowIcon() {
  return <WorkflowIconSvg />
}

function WorkflowIconSvg() {
  return (
    <WorkflowGlyph />
  )
}

function WorkflowGlyph() {
  return (
    <Activity size={17} />
  )
}
