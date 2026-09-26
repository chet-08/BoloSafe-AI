import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  RadioTower,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  Network,
  ScanSearch,
  AudioWaveform,
  BrainCircuit,
  Workflow,
} from 'lucide-react'

const COLORS = {
  indigo: '#5863D6',
  indigoSoft: '#7079E0',
  green: '#70B88A',
  amber: '#D5AE52',
  red: '#D96A78',
  text: '#F4F5FA',
  muted: '#858BA3',
  border: '#292E46',
  card: '#171A2D',
  surface: '#121526',
}

const riskConfig = {
  HIGH: {
    color: COLORS.red,
    soft: 'bg-[#D96A78]/10',
    border: 'border-[#D96A78]/30',
    label: 'HIGH RISK',
  },
  MEDIUM: {
    color: COLORS.amber,
    soft: 'bg-[#D5AE52]/10',
    border: 'border-[#D5AE52]/30',
    label: 'MEDIUM RISK',
  },
  CLEAR: {
    color: COLORS.green,
    soft: 'bg-[#70B88A]/10',
    border: 'border-[#70B88A]/30',
    label: 'CLEAR',
  },
}

function RiskGauge({ value = 0, risk = 'CLEAR' }) {
  const safeValue = Math.max(0, Math.min(1, Number(value) || 0))
  const config = riskConfig[risk] || riskConfig.CLEAR

  const radius = 72
  const circumference = 2 * Math.PI * radius
  const progress = circumference * safeValue

  return (
    <div className="relative flex h-[210px] w-[210px] items-center justify-center">
      <svg
        viewBox="0 0 190 190"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="95"
          cy="95"
          r={radius}
          fill="none"
          stroke={COLORS.border}
          strokeWidth="12"
          strokeLinecap="round"
        />

        <circle
          cx="95"
          cy="95"
          r={radius}
          fill="none"
          stroke={config.color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="text-4xl font-bold tracking-tight"
          style={{ color: config.color }}
        >
          {(safeValue * 100).toFixed(0)}%
        </div>

        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Composite risk
        </div>

        <div
          className="mt-2 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
          style={{
            color: config.color,
            borderColor: `${config.color}55`,
            background: `${config.color}12`,
          }}
        >
          {config.label}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, helper, icon: Icon, color }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {label}
            </span>
          </div>

          <div className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
            {value}
          </div>

          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            {helper}
          </p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl border"
          style={{
            color,
            borderColor: `${color}44`,
            background: `${color}10`,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

function PipelineNode({ icon: Icon, label, sublabel, tone = 'indigo', active = false }) {
  const color =
    tone === 'red'
      ? COLORS.red
      : tone === 'green'
        ? COLORS.green
        : tone === 'amber'
          ? COLORS.amber
          : COLORS.indigoSoft

  return (
    <div
      className={[
        'relative flex min-w-[150px] flex-1 items-center gap-3 rounded-xl border px-4 py-3',
        'bg-[var(--bg-card)]',
        active ? 'border-[#D96A78]/35' : 'border-[var(--border-default)]',
      ].join(' ')}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
        style={{
          color,
          borderColor: `${color}44`,
          background: `${color}10`,
        }}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold text-[var(--text-primary)]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
          {sublabel}
        </p>
      </div>

      {active && (
        <span
          className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  )
}

function ProtectionCard({
  number,
  title,
  description,
  icon: Icon,
  tone = 'indigo',
  status,
}) {
  const color =
    tone === 'red'
      ? COLORS.red
      : tone === 'green'
        ? COLORS.green
        : tone === 'amber'
          ? COLORS.amber
          : COLORS.indigoSoft

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: color }}
      />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border"
              style={{
                color,
                borderColor: `${color}44`,
                background: `${color}10`,
              }}
            >
              <Icon size={18} />
            </div>

            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color }}
              >
                Layer {number}
              </p>
              <h3 className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                {title}
              </h3>
            </div>
          </div>

          <span
            className="rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
            style={{
              color,
              borderColor: `${color}44`,
              background: `${color}10`,
            }}
          >
            {status}
          </span>
        </div>

        <p className="mt-4 text-xs leading-6 text-[var(--text-muted)]">
          {description}
        </p>

        <div
          className="mt-4 flex items-center gap-2 border-t pt-4 text-xs font-semibold"
          style={{ borderColor: COLORS.border, color }}
        >
          <CheckCircle2 size={14} />
          Protection layer operational
        </div>
      </div>
    </div>
  )
}

export default function SecurityReport({ streams, selected }) {
  const streamList = Object.values(streams || {})

  const totalStreams = streamList.length

  const activeAlerts = streamList.filter(
    (stream) =>
      stream.alert_triggered ||
      String(stream.risk_level || '').toUpperCase() === 'HIGH'
  ).length

  const mediumStreams = streamList.filter(
    (stream) => String(stream.risk_level || '').toUpperCase() === 'MEDIUM'
  ).length

  const highStreams = streamList.filter(
    (stream) => String(stream.risk_level || '').toUpperCase() === 'HIGH'
  ).length

  const globalRisk =
    highStreams > 0 ? 'HIGH' : mediumStreams > 0 ? 'MEDIUM' : 'CLEAR'

  const riskConfigCurrent = riskConfig[globalRisk]

  const primaryStream = streamList[0] || {}
  const aiProbability =
    selected?.ai_probability != null
      ? Number(selected.ai_probability)
      : primaryStream.ai_probability != null
        ? Number(primaryStream.ai_probability)
        : 0

  const rollingScore =
    selected?.rolling_score != null
      ? Number(selected.rolling_score)
      : primaryStream.rolling_score != null
        ? Number(primaryStream.rolling_score)
        : 0

  const compositeRisk =
    selected?.governance_decision?.composite_risk_score != null
      ? Number(selected.governance_decision.composite_risk_score)
      : rollingScore

  const latency =
    selected?.feature_latency_ms != null
      ? Number(selected.feature_latency_ms)
      : null

  return (
    <section className="w-full space-y-6 pb-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div
          className="absolute inset-y-0 left-0 w-[4px]"
          style={{ backgroundColor: riskConfigCurrent.color }}
        />

        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1fr_auto] xl:items-center xl:px-8 xl:py-8">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={16}
                style={{ color: riskConfigCurrent.color }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: riskConfigCurrent.color }}
              >
                Executive Security Posture
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              System Security Report
            </h1>

            <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--text-muted)]">
              Live visibility into BoloSafe-AI's audio-security pipeline,
              threat telemetry, and automated mitigation controls.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]">
                16 kHz PCM
              </span>
              <span className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]">
                58-D Acoustic Features
              </span>
              <span className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]">
                Real-Time WebSocket
              </span>
              <span className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]">
                Automated Mitigation
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
            <RiskGauge value={compositeRisk} risk={globalRisk} />

            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: riskConfigCurrent.color }}
              />
              Live security posture
            </div>
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monitored channels"
          value={totalStreams}
          helper="Active WebSocket endpoints"
          icon={RadioTower}
          color={COLORS.indigoSoft}
        />

        <StatCard
          label="Active alerts"
          value={activeAlerts}
          helper="Synthetic-voice triggers currently latched"
          icon={AlertTriangle}
          color={activeAlerts > 0 ? COLORS.red : COLORS.green}
        />

        <StatCard
          label="AI probability"
          value={`${Math.round(aiProbability * 100)}%`}
          helper="Current synthetic-voice model signal"
          icon={BrainCircuit}
          color={
            aiProbability >= 0.75
              ? COLORS.red
              : aiProbability >= 0.4
                ? COLORS.amber
                : COLORS.green
          }
        />

        <StatCard
          label="Pipeline latency"
          value={latency != null ? `${latency.toFixed(1)} ms` : '--'}
          helper="58-D feature extraction + inference"
          icon={Cpu}
          color={COLORS.indigoSoft}
        />
      </div>

      {/* LIVE PIPELINE */}
      <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5863D6]/25 bg-[#5863D6]/10 text-[#7079E0]">
            <Workflow size={17} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Live Neural Guard Pipeline
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              From incoming voice signal to security response.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <PipelineNode
            icon={RadioTower}
            label="Audio Ingestion"
            sublabel="PCM + VAD"
            tone="indigo"
            active
          />

          <div className="hidden h-px flex-1 bg-[var(--border-default)] xl:block" />

          <PipelineNode
            icon={AudioWaveform}
            label="Feature Engine"
            sublabel="58-D acoustic DSP"
            tone="indigo"
            active
          />

          <div className="hidden h-px flex-1 bg-[var(--border-default)] xl:block" />

          <PipelineNode
            icon={BrainCircuit}
            label="AI Ensemble"
            sublabel="XGBoost + neural"
            tone="amber"
            active={aiProbability >= 0.4}
          />

          <div className="hidden h-px flex-1 bg-[var(--border-default)] xl:block" />

          <PipelineNode
            icon={Network}
            label="Risk Engine"
            sublabel={`Rolling ${rollingScore.toFixed(3)}`}
            tone={globalRisk === 'HIGH' ? 'red' : globalRisk === 'MEDIUM' ? 'amber' : 'green'}
            active
          />

          <div className="hidden h-px flex-1 bg-[var(--border-default)] xl:block" />

          <PipelineNode
            icon={ShieldAlert}
            label="Governance"
            sublabel={globalRisk === 'HIGH' ? 'Hold + escalate' : 'Policy evaluation'}
            tone={globalRisk === 'HIGH' ? 'red' : 'indigo'}
            active={globalRisk !== 'CLEAR'}
          />
        </div>
      </section>

      {/* PROTECTION LAYERS */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5863D6]/25 bg-[#5863D6]/10 text-[#7079E0]">
            <Lock size={17} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Active Protection Stack
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Security controls operating across the live voice pipeline.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ProtectionCard
            number="01"
            title="Real-Time PCM Ingestion & VAD"
            icon={RadioTower}
            tone="indigo"
            status="LIVE"
            description="Secure 16 kHz mono audio ingestion with Voice Activity Detection to isolate active speech from silence and background noise."
          />

          <ProtectionCard
            number="02"
            title="58-Dimensional Feature Extraction"
            icon={Cpu}
            tone="indigo"
            status="ACTIVE"
            description="Transforms the speech window into acoustic evidence spanning pitch, temporal rhythm, and spectral characteristics."
          />

          <ProtectionCard
            number="03"
            title="Vocoder & Deepfake Fingerprinting"
            icon={ScanSearch}
            tone="red"
            status="MONITORING"
            description="Scans for synthesis artifacts and signatures associated with modern neural vocoders and cloned-voice generation."
          />

          <ProtectionCard
            number="04"
            title="Automated Kill-Switch & Mitigation"
            icon={Zap}
            tone={activeAlerts > 0 ? 'red' : 'amber'}
            status={activeAlerts > 0 ? 'LATCHED' : 'ARMED'}
            description="When configured high-risk conditions are met, the system latches the security response and protects the active session from continued exposure."
          />
        </div>
      </section>

      {/* LIVE TELEMETRY */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] px-5 py-4 md:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5863D6]/25 bg-[#5863D6]/10 text-[#7079E0]">
                <Activity size={17} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Live Stream Telemetry
                </h2>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Current security state of monitored audio channels.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[#70B88A]/25 bg-[#70B88A]/10 px-3 py-2 text-xs font-semibold text-[#70B88A]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#70B88A]" />
              Live
            </div>
          </div>
        </div>

        {streamList.length === 0 ? (
          <div className="p-10 text-center">
            <RadioTower className="mx-auto text-[var(--text-muted)]" size={24} />
            <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
              No live streams
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-default)]">
            {streamList.map((stream, index) => {
              const level = String(stream.risk_level || 'CLEAR').toUpperCase()

              const tone =
                level === 'HIGH'
                  ? riskConfig.HIGH
                  : level === 'MEDIUM'
                    ? riskConfig.MEDIUM
                    : riskConfig.CLEAR

              const probability =
                stream.ai_probability != null
                  ? Number(stream.ai_probability) * 100
                  : null

              const rolling =
                stream.rolling_score != null
                  ? Number(stream.rolling_score) * 100
                  : null

              const displayName = `Live Stream-${String(index + 1).padStart(2, '0')}`

              return (
                <div
                  key={stream.stream_id}
                  className="relative px-5 py-5 md:px-6"
                >
                  <div
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ backgroundColor: tone.color }}
                  />

                  <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr_0.7fr_1fr_1fr] xl:items-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        Channel
                      </p>
                      <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                        {displayName}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
                        {stream.stream_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        Risk state
                      </p>

                      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
                        style={{
                          color: tone.color,
                          borderColor: `${tone.color}44`,
                          background: `${tone.color}10`,
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: tone.color }}
                        />
                        <span className="text-xs font-bold">{level}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        Window
                      </p>
                      <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                        {stream.window_id ?? selected?.window_id ?? '--'}
                      </p>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          AI probability
                        </span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {probability != null
                            ? `${Math.round(probability)}%`
                            : '--'}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[var(--border-default)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(0, Math.min(100, probability ?? 0))}%`,
                            backgroundColor: tone.color,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          Rolling score
                        </span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {rolling != null ? rolling.toFixed(1) : '--'}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[var(--border-default)]">
                        <div
                          className="h-full rounded-full bg-[#5863D6]"
                          style={{
                            width: `${Math.max(0, Math.min(100, rolling ?? 0))}%`,
                          }}
                        />
                      </div>
                    </div>
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
