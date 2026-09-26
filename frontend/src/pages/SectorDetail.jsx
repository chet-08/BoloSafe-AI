'use client'

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'

import { getSectorMeta } from '../utils/sectorRouting'

const riskStyles = {
  low: {
    label: 'LOW RISK',
    color: 'text-[var(--status-success)]',
    bg: 'bg-[color:var(--status-success)]/10',
    border: 'border-[color:var(--status-success)]/20',
  },
  medium: {
    label: 'MEDIUM RISK',
    color: 'text-[var(--status-warning)]',
    bg: 'bg-[color:var(--status-warning)]/10',
    border: 'border-[color:var(--status-warning)]/20',
  },
  high: {
    label: 'HIGH RISK',
    color: 'text-[var(--status-danger)]',
    bg: 'bg-[color:var(--status-danger)]/10',
    border: 'border-[color:var(--status-danger)]/20',
  },
}

export default function SectorDetail({
  selected = {},
  selectedSector = 'finance',
}) {
  const meta = getSectorMeta(selectedSector)

  const decision =
    selected.governance_decision || {}

  const risk = String(
    decision.risk_level ||
      selected.risk_level ||
      'low'
  ).toLowerCase()

  const style =
    riskStyles[risk] || riskStyles.low

  const probability = Math.round(
    Math.max(
      0,
      Math.min(
        1,
        Number(
          selected.ai_probability ??
            decision.ai_probability ??
            0
        )
      )
    ) * 100
  )

  const action =
    decision.action || 'allow'

  const actionLabel =
    action === 'hold_and_escalate'
      ? 'HOLD & ESCALATE'
      : action === 'step_up_verification'
        ? 'STEP-UP VERIFICATION'
        : 'ALLOW'

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-primary-soft)]">
            Sector Security
          </p>

          <h1 className="mt-2 text-2xl font-black text-[var(--text-primary)]">
            {meta.detailTitle}
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
            {meta.responseFocus}
          </p>
        </div>

        <span className={`rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${style.border} ${style.bg} ${style.color}`}>
          {style.label}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-[var(--accent-primary-soft)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              AI Voice Risk
            </span>
          </div>

          <p className="mt-4 text-3xl font-black text-[var(--text-primary)]">
            {probability}%
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2">
            <UserCheck size={15} className="text-[var(--accent-primary-soft)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Speaker
            </span>
          </div>

          <p className="mt-4 text-xl font-black text-[var(--text-primary)]">
            {selected.speaker_match === true
              ? 'VERIFIED'
              : selected.speaker_match === false
                ? 'MISMATCH'
                : 'PENDING'}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[var(--accent-primary-soft)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Governance Action
            </span>
          </div>

          <p className="mt-4 text-xl font-black text-[var(--text-primary)]">
            {actionLabel}
          </p>
        </div>
      </div>

      <section className={`rounded-xl border ${style.border} ${style.bg} p-6`}>
        <div className="flex items-start gap-4">
          <div className={`flex size-10 items-center justify-center rounded-lg border ${style.border}`}>
            {risk === 'high' ? (
              <ShieldAlert size={18} className={style.color} />
            ) : risk === 'medium' ? (
              <AlertTriangle size={18} className={style.color} />
            ) : (
              <CheckCircle2 size={18} className={style.color} />
            )}
          </div>

          <div>
            <p className={`text-sm font-black uppercase ${style.color}`}>
              {actionLabel}
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              {decision.reason ||
                'Sector governance is monitoring the active interaction.'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Active scenario
        </p>

        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {decision.scenario || meta.primaryScenario}
            </h2>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {selected.stream_id || 'No active stream'}
            </p>
          </div>

          <ArrowRight
            size={17}
            className="text-[var(--text-subtle)]"
          />
        </div>
      </section>
    </div>
  )
}
