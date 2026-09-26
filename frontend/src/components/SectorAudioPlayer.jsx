import React, { useMemo, useRef } from 'react'
import {
  Activity,
  Mic,
  Play,
  Radio,
  Square,
  Upload,
  Volume2,
} from 'lucide-react'

const waveformPattern = [
  18, 28, 42, 24, 58, 36, 72, 46,
  30, 64, 48, 82, 52, 34, 68, 44,
  76, 38, 54, 86, 46, 26, 62, 40,
  74, 32, 56, 88, 44, 24, 68, 38,
  52, 78, 42, 64, 30, 58, 36, 70,
  26, 48, 72, 34, 60, 42, 76, 28,
]

export default function SectorAudioPlayer({
  title = 'Sector Audio Streamer',
  sector = 'retail',
  scenario = 'order_modification',
  samples = [],
  onPlaySample,
  onStartMic,
  onStopMic,
  onFileUpload,
  isStreaming = false,
  micStatus = 'Ready',
  micLevel = 0,
}) {
  const fileInputRef = useRef(null)

  const normalizedLevel = Math.min(100, Math.max(0, Number(micLevel) || 0))

  const waveform = useMemo(
    () =>
      waveformPattern.map((value, index) => {
        const modulation = ((index * 17) % 23) - 11
        const liveBoost = isStreaming
          ? normalizedLevel * (0.35 + ((index % 5) * 0.08))
          : 0

        return Math.max(
          12,
          Math.min(96, value * 0.42 + modulation + liveBoost)
        )
      }),
    [isStreaming, normalizedLevel]
  )

  return (
    <div className="space-y-4">
      {/* Signal header */}
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface,#121526)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                isStreaming
                  ? 'border-[var(--state-success)]/20 bg-[var(--state-success)]/10 text-[var(--state-success)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-card,#171A2D)] text-[var(--text-muted)]',
              ].join(' ')}
            >
              <Radio size={15} />
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {title}
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                <span>{isStreaming ? 'Live input' : 'Ready'}</span>
                <span className="text-[var(--border-default)]">•</span>
                <span>16 kHz PCM</span>
                <span className="text-[var(--border-default)]">•</span>
                <span>WebSocket ingestion</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={[
            'flex w-fit items-center gap-2 rounded-full border px-2.5 py-1.5',
            'text-[9px] font-bold uppercase tracking-[0.14em]',
            isStreaming
              ? 'border-[var(--state-success)]/20 bg-[var(--state-success)]/10 text-[var(--state-success)]'
              : 'border-[var(--border-default)] bg-[var(--bg-card,#171A2D)] text-[var(--text-muted)]',
          ].join(' ')}
        >
          <span
            className={[
              'h-1.5 w-1.5 rounded-full',
              isStreaming
                ? 'bg-[var(--state-success)]'
                : 'bg-[var(--text-muted)]',
            ].join(' ')}
          />
          {isStreaming ? 'LIVE' : 'IDLE'}
        </div>
      </div>

      {/* Main waveform */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface,#121526)] p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#7079E0]">
            <Activity size={13} />
            Active audio signal
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
            <Volume2 size={12} />
            <span>{Math.round(normalizedLevel)}%</span>
          </div>
        </div>

        <div className="relative flex h-40 items-center md:h-44 justify-center overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card,#171A2D)] px-4">
          <div className="absolute inset-x-0 top-1/2 border-t border-[var(--border-default)]/70" />

          <div className="relative z-10 flex h-full w-full items-center justify-center gap-[3px]">
            {waveform.map((height, index) => (
              <span
                key={index}
                className={[
                  'block w-[3px] rounded-full transition-all duration-150 md:w-[4px]',
                  isStreaming
                    ? 'bg-[#7079E0]'
                    : 'bg-[#292E46]',
                ].join(' ')}
                style={{
                  height: `${height}%`,
                  opacity: isStreaming
                    ? Math.min(1, 0.42 + normalizedLevel / 120)
                    : 0.7,
                }}
              />
            ))}
          </div>

          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface,#121526)] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Waiting for audio input
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
          <span>
            Signal state:{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {micStatus}
            </span>
          </span>

          <span>
            Input level:{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {Math.round(normalizedLevel)}%
            </span>
          </span>
        </div>
      </div>

      {/* Dataset scenarios */}
      {samples.length > 0 && (
        <div className="rounded-2xl border border-[#292E46] bg-[#121526] p-4 md:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5863D6]" />
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7079E0]">
                  Detection test library
                </div>
              </div>

              <h3 className="mt-2 text-base font-semibold text-[#F4F5FA]">
                Run a sector voice scenario
              </h3>

              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#858BA3]">
                Use a real dataset sample to exercise the live audio pipeline,
                detection model, speaker verification and governance layer.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#292E46] bg-[#171A2D] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#858BA3]">
              <span>{samples.length}</span>
              <span>Scenarios</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
            {samples.map((sample, index) => {
              const spoof = Boolean(sample.isSpoof)
              const active =
                scenario && sample.scenario === scenario

              const tone = spoof
                ? {
                    border: 'border-[#D96A78]/30',
                    bg: 'bg-[#D96A78]/[0.055]',
                    accent: '#D96A78',
                    iconBg: 'bg-[#D96A78]/10',
                    label: 'SPOOF',
                    context: 'Synthetic / adversarial sample',
                  }
                : {
                    border: 'border-[#70B88A]/25',
                    bg: 'bg-[#70B88A]/[0.045]',
                    accent: '#70B88A',
                    iconBg: 'bg-[#70B88A]/10',
                    label: 'BONAFIDE',
                    context: 'Authentic reference sample',
                  }

              return (
                <button
                  key={`${sample.label}-${index}`}
                  type="button"
                  disabled={isStreaming}
                  onClick={() =>
                    onPlaySample?.(
                      sample.url,
                      sample.scenario,
                      sample.transactionAmount
                    )
                  }
                  className={[
                    'group relative overflow-hidden rounded-2xl border p-4 text-left',
                    'transition-all duration-200',
                    'hover:-translate-y-0.5',
                    tone.border,
                    tone.bg,
                    active
                      ? 'ring-1 ring-[#5863D6]/60'
                      : '',
                    'disabled:cursor-not-allowed disabled:opacity-45',
                  ].join(' ')}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{ backgroundColor: tone.accent }}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={[
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                        tone.iconBg,
                        tone.border,
                      ].join(' ')}
                    >
                      <Play
                        size={16}
                        className="ml-0.5"
                        style={{ color: tone.accent }}
                      />
                    </div>

                    <span
                      className="rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em]"
                      style={{
                        color: tone.accent,
                        borderColor: `${tone.accent}55`,
                        backgroundColor: `${tone.accent}12`,
                      }}
                    >
                      {tone.label}
                    </span>
                  </div>

                  <div className="mt-4 min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#858BA3]">
                      Scenario {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="mt-1.5 min-h-[42px] text-sm font-semibold leading-5 text-[#F4F5FA]">
                      {sample.label}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[10px] text-[#858BA3]">
                      <span>{sample.language}</span>
                      <span className="text-[#292E46]">•</span>
                      <span>{tone.context}</span>
                    </div>

                    <p className="mt-2 min-h-[34px] text-[10px] leading-4 text-[#858BA3]">
                      {sample.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#292E46] pt-3">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#858BA3]">
                      {active ? 'Selected' : 'Ready to run'}
                    </span>

                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: tone.accent }}
                    >
                      Run test →
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] uppercase tracking-[0.12em] text-[#858BA3]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#70B88A]" />
              Bonafide reference
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D96A78]" />
              Synthetic / spoof
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5863D6]" />
              Live detection pipeline
            </span>
          </div>
        </div>
      )}

      {/* Input controls */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={isStreaming ? onStopMic : onStartMic}
          className={[
            'inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold',
            'transition-colors duration-200',
            isStreaming
              ? 'border-[var(--state-danger)]/25 bg-[var(--state-danger)] text-white hover:opacity-90'
              : 'border-[var(--accent-primary)]/25 bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-soft)]',
          ].join(' ')}
        >
          {isStreaming ? (
            <>
              <Square size={13} fill="currentColor" />
              Stop active stream
            </>
          ) : (
            <>
              <Mic size={14} />
              Start live microphone
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/wav,audio/mp3,audio/ogg"
          className="hidden"
          onChange={onFileUpload}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface,#121526)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover,#1C2033)] disabled:cursor-not-allowed disabled:opacity-45 sm:min-w-[190px]"
        >
          <Upload size={14} className="text-[var(--text-muted)]" />
          Upload custom audio
        </button>
      </div>
    </div>
  )
}
