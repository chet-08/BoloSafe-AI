'use client'

import React from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  X,
  Lock,
  UserX,
  Activity,
  Server,
  Radio,
  FileText,
  Zap,
  Database,
  Gauge,
  Network,
  ScanSearch,
  Clock3,
  BrainCircuit,
  AudioWaveform,
  CheckCircle2,
  ArrowRight,
  Landmark,
  ShoppingBag,
  Hotel,
  Film,
  UserCheck,
  ClipboardCheck,
  BadgeCheck,
} from 'lucide-react'
import { useSecurity } from '../context/SecurityContext'

const COLORS = {
  indigo: '#5863D6',
  indigoSoft: '#7079E0',
  green: '#70B88A',
  amber: '#D5AE52',
  red: '#D96A78',
  text: '#F4F5FA',
  muted: '#858BA3',
  border: '#292E46',
}

const SECTORS = {
  finance: {
    label: 'Financial Services',
    short: 'Finance',
    icon: Landmark,
    tone: 'red',
    description: 'Protect high-value transfers, account recovery, and sensitive banking actions.',
    threatTitle: 'Synthetic Voice Impersonation Detected',
    workflowLabel: 'High-value transaction protection',
    actions: [
      {
        title: 'Halt Wire',
        description: 'Stop the active transfer before funds can leave the account.',
        icon: Lock,
        tone: 'red',
        tag: 'Priority',
        key: 'HALT_WIRE',
      },
      {
        title: 'Video-KYC',
        description: 'Trigger step-up identity verification for the customer.',
        icon: UserCheck,
        tone: 'indigo',
        tag: 'Verify',
        key: 'VIDEO_KYC',
      },
      {
        title: 'Escalate',
        description: 'Route the incident to the relationship manager or fraud queue.',
        icon: AlertTriangle,
        tone: 'amber',
        tag: 'Escalation',
        key: 'ESCALATE_FINANCE',
      },
      {
        title: 'Quarantine Evidence',
        description: 'Preserve the voice sample for controlled forensic review.',
        icon: Database,
        tone: 'green',
        tag: 'Forensics',
        key: 'QUARANTINE_AUDIO',
      },
    ],
  },

  retail: {
    label: 'Retail Security',
    short: 'Retail',
    icon: ShoppingBag,
    tone: 'amber',
    description: 'Protect customer accounts, orders, refunds, and sensitive workflow changes.',
    threatTitle: 'Synthetic Voice Impersonation Detected',
    workflowLabel: 'Customer / order protection',
    actions: [
      {
        title: 'Hold Order',
        description: 'Freeze the order workflow until customer verification completes.',
        icon: Lock,
        tone: 'red',
        tag: 'Priority',
        key: 'HOLD_ORDER',
      },
      {
        title: 'Send OTP',
        description: 'Require step-up customer verification before continuing.',
        icon: UserCheck,
        tone: 'indigo',
        tag: 'Verify',
        key: 'SEND_OTP',
      },
      {
        title: 'Escalate',
        description: 'Route the event to the retail security or supervisor queue.',
        icon: AlertTriangle,
        tone: 'amber',
        tag: 'Escalation',
        key: 'ESCALATE_RETAIL',
      },
      {
        title: 'Inspect OMS',
        description: 'Inspect the affected order state and downstream actions.',
        icon: ClipboardCheck,
        tone: 'green',
        tag: 'Operations',
        key: 'INSPECT_OMS',
      },
    ],
  },

  hospitality: {
    label: 'Hospitality Security',
    short: 'Hospitality',
    icon: Hotel,
    tone: 'green',
    description: 'Protect reservations, guest identity, VIP workflows, and booking changes.',
    threatTitle: 'Synthetic Voice Impersonation Detected',
    workflowLabel: 'Guest & reservation protection',
    actions: [
      {
        title: 'Hold Reservation',
        description: 'Prevent booking changes until guest verification completes.',
        icon: Lock,
        tone: 'red',
        tag: 'Priority',
        key: 'HOLD_RESERVATION',
      },
      {
        title: 'Verify Guest',
        description: 'Require identity verification before a sensitive action proceeds.',
        icon: UserCheck,
        tone: 'indigo',
        tag: 'Verify',
        key: 'VERIFY_GUEST',
      },
      {
        title: 'Escalate',
        description: 'Route the event to guest security or duty management.',
        icon: AlertTriangle,
        tone: 'amber',
        tag: 'Escalation',
        key: 'ESCALATE_HOSPITALITY',
      },
      {
        title: 'Quarantine Evidence',
        description: 'Preserve the interaction for controlled forensic analysis.',
        icon: Database,
        tone: 'green',
        tag: 'Forensics',
        key: 'QUARANTINE_AUDIO',
      },
    ],
  },

  entertainment: {
    label: 'Entertainment Security',
    short: 'Entertainment',
    icon: Film,
    tone: 'indigo',
    description: 'Protect artist identity, voice authenticity, content provenance, and licensing workflows.',
    threatTitle: 'Synthetic Voice / Content Authenticity Alert',
    workflowLabel: 'Artist & provenance protection',
    actions: [
      {
        title: 'Flag Provenance',
        description: 'Mark the media or voice event for provenance review.',
        icon: ScanSearch,
        tone: 'red',
        tag: 'Priority',
        key: 'FLAG_PROVENANCE',
      },
      {
        title: 'Verify Artist',
        description: 'Run speaker or artist identity verification.',
        icon: BadgeCheck,
        tone: 'indigo',
        tag: 'Verify',
        key: 'VERIFY_ARTIST',
      },
      {
        title: 'Escalate',
        description: 'Route the event to the content authenticity team.',
        icon: AlertTriangle,
        tone: 'amber',
        tag: 'Escalation',
        key: 'ESCALATE_CONTENT',
      },
      {
        title: 'Quarantine Evidence',
        description: 'Preserve the affected voice sample or asset for review.',
        icon: Database,
        tone: 'green',
        tag: 'Forensics',
        key: 'QUARANTINE_AUDIO',
      },
    ],
  },
}

function Badge({ children, tone = 'indigo' }) {
  const color =
    tone === 'red'
      ? COLORS.red
      : tone === 'amber'
        ? COLORS.amber
        : tone === 'green'
          ? COLORS.green
          : COLORS.indigoSoft

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.11em]"
      style={{
        color,
        borderColor: `${color}44`,
        background: `${color}10`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {children}
    </span>
  )
}

function MetricCard({ label, value, helper, icon: Icon, tone = 'indigo' }) {
  const color =
    tone === 'red'
      ? COLORS.red
      : tone === 'amber'
        ? COLORS.amber
        : tone === 'green'
          ? COLORS.green
          : COLORS.indigoSoft

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--text-muted)]">
            {label}
          </p>

          <p
            className="mt-2 text-2xl font-bold tracking-tight"
            style={{ color: tone === 'indigo' ? COLORS.text : color }}
          >
            {value}
          </p>

          <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">
            {helper}
          </p>
        </div>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg border"
          style={{
            color,
            borderColor: `${color}44`,
            background: `${color}10`,
          }}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  )
}

function ActionCard({
  title,
  description,
  icon: Icon,
  tone = 'indigo',
  tag,
  onClick,
}) {
  const color =
    tone === 'red'
      ? COLORS.red
      : tone === 'amber'
        ? COLORS.amber
        : tone === 'green'
          ? COLORS.green
          : COLORS.indigoSoft

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-surface)]"
    >
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg border"
          style={{
            color,
            borderColor: `${color}44`,
            background: `${color}10`,
          }}
        >
          <Icon size={16} />
        </div>

        <span
          className="rounded-md border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em]"
          style={{
            color,
            borderColor: `${color}44`,
            background: `${color}10`,
          }}
        >
          {tag}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-bold text-[var(--text-primary)]">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">
        {description}
      </p>

      <div
        className="mt-3 flex items-center gap-2 text-[9px] font-bold"
        style={{ color }}
      >
        Open response control
        <ArrowRight
          size={12}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </button>
  )
}

function Panel({ title, subtitle, icon: Icon, children, tone = 'indigo' }) {
  const color =
    tone === 'red'
      ? COLORS.red
      : tone === 'amber'
        ? COLORS.amber
        : tone === 'green'
          ? COLORS.green
          : COLORS.indigoSoft

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
      <div className="border-b border-[var(--border-default)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border"
            style={{
              color,
              borderColor: `${color}44`,
              background: `${color}10`,
            }}
          >
            <Icon size={15} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              {title}
            </h2>
            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  )
}

function ContextRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border-default)] py-2.5 last:border-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
        {label}
      </span>

      <span className="max-w-[65%] truncate text-right text-xs font-semibold text-[var(--text-primary)]">
        {String(value)}
      </span>
    </div>
  )
}

export default function Admin({
  selected,
  activeStreamId,
  escalatedIncident: propIncident,
  onResolveIncident,
}) {
  const {
    escalatedIncident: contextIncident,
    setEscalatedIncident,
  } = useSecurity()

  const incident = propIncident
    ? { ...propIncident, ...(contextIncident || {}) }
    : contextIncident

  const sector =
    String(
      selected?.governance_decision?.sector ||
      selected?.sector ||
      incident?.sector ||
      'finance'
    ).toLowerCase()

  const config = SECTORS[sector] || SECTORS.finance
  const SectorIcon = config.icon

  const scenario =
    selected?.governance_decision?.scenario ||
    selected?.scenario ||
    incident?.scenario ||
    null

  const isAiVoiceDetected =
    incident !== null ||
    selected?.risk_level === 'HIGH' ||
    selected?.alert_triggered === true ||
    Number(selected?.ai_probability || 0) > 0.7

  const aiProbability = Number(
    selected?.ai_probability ??
      incident?.ai_probability ??
      0
  )

  const rollingScore = Number(selected?.rolling_score || 0)

  const riskLevel =
    String(
      selected?.risk_level ||
      (isAiVoiceDetected ? 'HIGH' : 'LOW')
    ).toUpperCase()

  const windowId =
    selected?.window_id ??
    incident?.window_id ??
    '--'

  const streamId =
    incident?.streamId ||
    activeStreamId ||
    selected?.id ||
    'ACTIVE_STREAM'

  const tone =
    riskLevel === 'HIGH'
      ? 'red'
      : riskLevel === 'MEDIUM'
        ? 'amber'
        : 'green'

  const context =
    selected?.sector_context ||
    selected?.context ||
    selected?.governance_decision?.context ||
    {}

  const contextRows =
    sector === 'finance'
      ? [
          ['Account', context.account || selected?.account],
          ['Customer', context.customer || selected?.customer],
          ['Transfer', context.transfer_amount || selected?.transfer_amount || selected?.transaction_amount_inr],
          ['Channel', context.channel || selected?.channel],
          ['Beneficiary', context.beneficiary || selected?.beneficiary],
        ]
      : sector === 'retail'
        ? [
            ['Customer', context.customer_id || selected?.customer_id],
            ['Order', context.order_id || selected?.order_id],
            ['Request', context.request || selected?.request],
            ['Shipment value', context.shipment_value || selected?.shipment_value],
          ]
        : sector === 'hospitality'
          ? [
              ['Guest', context.guest || selected?.guest],
              ['Reservation', context.reservation_id || selected?.reservation_id],
              ['Action', context.action || selected?.action],
              ['Property', context.property || selected?.property],
            ]
          : [
              ['Artist', context.artist || selected?.artist],
              ['Asset', context.asset || selected?.asset],
              ['Content type', context.content_type || selected?.content_type],
              ['Provenance', context.provenance || selected?.provenance],
            ]

  const handleAction = (actionType) => {
    if (sector === 'hospitality') {
      const hospitalityActions = {
        HOLD_RESERVATION: {
          action_state: 'RESERVATION_HELD',
          protection_state: 'CONTAINMENT_ACTIVE',
          escalation_state: 'PENDING_VERIFICATION',
          action_detail: 'Reservation changes held until guest verification completes',
        },
        VERIFY_GUEST: {
          action_state: 'GUEST_VERIFICATION_REQUIRED',
          protection_state: 'MONITORING',
          escalation_state: 'VERIFICATION_REQUIRED',
          action_detail: 'Front Desk ID verification required before sensitive action',
        },
        ESCALATE_HOSPITALITY: {
          action_state: 'DUTY_MANAGER_ALERTED',
          protection_state: 'MONITORING',
          escalation_state: 'ALERTED',
          action_detail: 'Duty Manager notified for hospitality security review',
        },
        QUARANTINE_AUDIO: {
          action_state: 'EVIDENCE_QUARANTINED',
          protection_state: 'LATCHED',
          escalation_state: 'FORENSIC_REVIEW',
          action_detail: 'Voice interaction preserved for controlled forensic analysis',
        },
      }

      const action = hospitalityActions[actionType]

      if (action && typeof setEscalatedIncident === 'function') {
        setEscalatedIncident({
          ...(incident || {}),
          sector: 'hospitality',
          ...action,
        })
      }

      return
    }

    if (typeof onResolveIncident === 'function') {
      onResolveIncident(actionType)
    }

    if (typeof setEscalatedIncident === 'function') {
      setEscalatedIncident(null)
    }
  }

  const actionState = incident?.action_state || null

  const hospitalityActionDisplay = {
    RESERVATION_HELD: {
      value: 'HELD',
      helper: 'Reservation changes blocked',
      tone: 'red',
    },
    GUEST_VERIFICATION_REQUIRED: {
      value: 'VERIFY',
      helper: 'Front Desk ID required',
      tone: 'amber',
    },
    DUTY_MANAGER_ALERTED: {
      value: 'MONITORING',
      helper: 'Duty Manager alerted',
      tone: 'amber',
    },
    EVIDENCE_QUARANTINED: {
      value: 'QUARANTINED',
      helper: 'Evidence preserved',
      tone: 'green',
    },
    FOLIO_LOCKED: {
      value: 'LATCHED',
      helper: 'Folio locked · ID verification',
      tone: 'red',
    },
  }

  const hospitalityAction =
    sector === 'hospitality' ? hospitalityActionDisplay[actionState] : null

  const protectionValue =
    hospitalityAction?.value ||
    (isAiVoiceDetected ? 'LATCHED' : 'ARMED')

  const protectionHelper =
    hospitalityAction?.helper ||
    (isAiVoiceDetected ? 'Incident response active' : 'Ready')

  const protectionTone =
    hospitalityAction?.tone ||
    (isAiVoiceDetected ? 'red' : 'green')

  return (
    <section className="w-full space-y-6 pb-10">
      {/* TOP HEADER */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div
          className="border-l-[3px] px-6 py-6 md:px-7"
          style={{ borderColor: config.tone === 'red' ? COLORS.red : COLORS.indigo }}
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
                style={{
                  color:
                    config.tone === 'red'
                      ? COLORS.red
                      : config.tone === 'amber'
                        ? COLORS.amber
                        : config.tone === 'green'
                          ? COLORS.green
                          : COLORS.indigoSoft,
                  borderColor:
                    `${tone === 'red' ? COLORS.red : COLORS.indigoSoft}44`,
                  background:
                    `${tone === 'red' ? COLORS.red : COLORS.indigoSoft}10`,
                }}
              >
                <SectorIcon size={22} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={config.tone}>{config.short}</Badge>
                  <Badge tone={isAiVoiceDetected ? 'red' : 'green'}>
                    {isAiVoiceDetected ? 'Threat response active' : 'Sec-ops active'}
                  </Badge>
                  <Badge tone="indigo">Live telemetry</Badge>
                </div>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
                  {config.label} Command Center
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                  {config.description}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Active channel
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                Live Stream-01
              </p>
              <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                {streamId}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INCIDENT */}
      {isAiVoiceDetected && (
        <section
          className="overflow-hidden rounded-2xl border"
          style={{
            borderColor: `${COLORS.red}50`,
            background: `${COLORS.red}07`,
          }}
        >
          <div className="grid xl:grid-cols-[1fr_auto]">
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="red">Critical incident</Badge>
                <Badge tone={config.tone}>{config.short}</Badge>
                <Badge tone="amber">
                  {scenario ? String(scenario).replaceAll('_', ' ') : config.workflowLabel}
                </Badge>
                <Badge tone="red">Latched</Badge>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
                {config.threatTitle}
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--text-muted)]">
                {config.workflowLabel} has entered a high-risk security state.
                Review the sector-specific response path below.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard
                  label="AI probability"
                  value={`${Math.round(aiProbability * 100)}%`}
                  helper="Primary model signal"
                  icon={BrainCircuit}
                  tone="red"
                />

                <MetricCard
                  label="Risk level"
                  value={riskLevel}
                  helper="Current security state"
                  icon={ShieldAlert}
                  tone={tone}
                />

                <MetricCard
                  label="Rolling score"
                  value={rollingScore.toFixed(3)}
                  helper="Windowed risk state"
                  icon={Activity}
                  tone="amber"
                />

                <MetricCard
                  label="Window"
                  value={windowId}
                  helper="Latest processing window"
                  icon={Gauge}
                  tone="indigo"
                />
              </div>
            </div>

            <div className="flex min-h-[230px] items-center justify-center border-t border-[#D96A78]/15 px-7 xl:min-w-[270px] xl:border-l xl:border-t-0">
              <div className="flex flex-col items-center">
                <div className="relative flex h-40 w-40 items-center justify-center">
                  <svg
                    viewBox="0 0 160 160"
                    className="h-full w-full -rotate-90"
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r="57"
                      fill="none"
                      stroke={COLORS.border}
                      strokeWidth="11"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="57"
                      fill="none"
                      stroke={COLORS.red}
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 57 * aiProbability} ${2 * Math.PI * 57}`}
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[#D96A78]">
                      {Math.round(aiProbability * 100)}%
                    </span>
                    <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      synthetic risk
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <Badge tone="red">High confidence threat</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Sector context */}
          <div className="border-t border-[#D96A78]/15 p-5 md:p-6">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg border"
                    style={{
                      color:
                        config.tone === 'red'
                          ? COLORS.red
                          : config.tone === 'amber'
                            ? COLORS.amber
                            : config.tone === 'green'
                              ? COLORS.green
                              : COLORS.indigoSoft,
                      borderColor: `${COLORS.indigoSoft}33`,
                      background: `${COLORS.indigoSoft}0A`,
                    }}
                  >
                    <SectorIcon size={17} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Sector context
                    </p>
                    <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                      {config.workflowLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
                  {contextRows.some(([, value]) => value !== undefined && value !== null && value !== '') ? (
                    contextRows.map(([label, value]) => (
                      <ContextRow key={label} label={label} value={value} />
                    ))
                  ) : (
                    <p className="text-xs leading-5 text-[var(--text-muted)]">
                      Sector context will populate from the active governance
                      result when available.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#D96A78]">
                    Sector response playbook
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Controls aligned to the active sector workflow.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {config.actions.map((action) => (
                    <ActionCard
                      key={action.key}
                      {...action}
                      onClick={() => handleAction(action.key)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--border-default)] pt-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone="green">Detection complete</Badge>
                <Badge tone="amber">Governance required</Badge>
                <Badge tone="red">Protection active</Badge>
              </div>

              <button
                type="button"
                onClick={() => setEscalatedIncident(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
                title="Dismiss incident"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Detection"
          value={
            selected?.risk_level
              ? String(selected.risk_level).toUpperCase()
              : 'READY'
          }
          helper={`${config.short} model state`}
          icon={BrainCircuit}
          tone={tone}
        />

        <MetricCard
          label="AI probability"
          value={`${Math.round(aiProbability * 100)}%`}
          helper="Synthetic-voice signal"
          icon={AudioWaveform}
          tone={
            aiProbability >= 0.75
              ? 'red'
              : aiProbability >= 0.4
                ? 'amber'
                : 'green'
          }
        />

        <MetricCard
          label="Window"
          value={windowId}
          helper="Latest inference window"
          icon={Gauge}
          tone="indigo"
        />

        <MetricCard
          label="Protection"
          value={protectionValue}
          helper={protectionHelper}
          icon={ShieldCheck}
          tone={protectionTone}
        />
      </div>

      {/* HEALTH + GOVERNANCE + AUDIT */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          title="System Infrastructure"
          subtitle="Core runtime health"
          icon={Server}
          tone="green"
        >
          <div className="space-y-3">
            {[
              ['XGBoost Engine (58-D)', 'ONLINE', COLORS.green, Server],
              ['Dual MMS-300M Model', 'ACTIVE', COLORS.green, BrainCircuit],
              ['WebSocket Ingestion', 'CONNECTED', COLORS.green, Radio],
            ].map(([label, state, color, Icon]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-[var(--border-default)] pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Icon size={14} className="text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">
                    {label}
                  </span>
                </div>

                <span className="text-[10px] font-bold" style={{ color }}>
                  {state}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title={`${config.short} Governance`}
          subtitle="Sector-specific policy layer"
          icon={Network}
          tone={config.tone}
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Workflow
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                {config.workflowLabel}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-[#70B88A]/20 bg-[#70B88A]/5 p-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  Low
                </p>
                <p className="mt-1 text-xs font-bold text-[#70B88A]">
                  Allow / Proceed
                </p>
              </div>

              <div className="rounded-lg border border-[#D5AE52]/20 bg-[#D5AE52]/5 p-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  Medium
                </p>
                <p className="mt-1 text-xs font-bold text-[#D5AE52]">
                  Verify / Step-up
                </p>
              </div>

              <div className="col-span-2 rounded-lg border border-[#D96A78]/20 bg-[#D96A78]/5 p-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  High
                </p>
                <p className="mt-1 text-xs font-bold text-[#D96A78]">
                  Sector-specific containment + escalation
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="Compliance & Audit"
          subtitle="Current protection posture"
          icon={FileText}
          tone="green"
        >
          <div className="space-y-3">
            {[
              ['Privacy mode', 'Feature-Only', COLORS.indigoSoft],
              ['Data retention', '24 Hours', COLORS.amber],
              ['Encryption', 'TLS 1.3 / AES-256', COLORS.green],
            ].map(([label, value, color]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3"
              >
                <span className="text-xs text-[var(--text-muted)]">
                  {label}
                </span>
                <span className="text-xs font-bold" style={{ color }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* OPERATIONAL READINESS */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#5863D6]/25 bg-[#5863D6]/10 text-[#7079E0]">
              <Activity size={15} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Operational Readiness
              </h2>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                {config.short} security workflow status
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
          {[
            ['Detection', 'Continuous', 'Window-level inference', COLORS.indigoSoft, ScanSearch],
            ['Governance', 'Policy-driven', config.workflowLabel, COLORS.amber, Network],
            ['Protection', isAiVoiceDetected ? 'Latching' : 'Armed', 'Sector response controls', isAiVoiceDetected ? COLORS.red : COLORS.green, ShieldCheck],
          ].map(([label, value, helper, color, Icon]) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4"
            >
              <div className="flex items-center gap-2" style={{ color }}>
                <Icon size={14} />
                <span className="text-[9px] font-bold uppercase tracking-[0.12em]">
                  {label}
                </span>
              </div>

              <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                {value}
              </p>

              <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">
                {helper}
              </p>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}
