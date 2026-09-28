import React, { useState, useRef, useEffect } from 'react'
import {
  Mic,
  Upload,
  Database,
  Play,
  Pause,
  ShieldCheck,
  ShieldAlert,
  Flame,
  RefreshCw,
  TrendingDown,
  Shield
} from 'lucide-react'

export default function AdversarialRobustness() {
  const [sourceType, setSourceType] = useState('dataset')
  const [datasetSamples, setDatasetSamples] = useState([])
  const [selectedDatasetPath, setSelectedDatasetPath] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [attackType, setAttackType] = useState('opus')
  const [intensity, setIntensity] = useState(3)
  const [enableDefense, setEnableDefense] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [hoveredPoint, setHoveredPoint] = useState(null)

  // Audio Playback states
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)
  const audioRef = useRef(new Audio())
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  useEffect(() => {
    fetch('http://localhost:8000/api/adversarial/dataset-samples')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.samples && data.samples.length > 0) {
          setDatasetSamples(data.samples)
          setSelectedDatasetPath(data.samples[0].id)
        }
      })
      .catch(() => {})

    const audioElem = audioRef.current
    audioElem.onended = () => setCurrentlyPlaying(null)
  }, [])

  const togglePlayAudio = (url, key) => {
    if (currentlyPlaying === key) {
      audioRef.current.pause()
      setCurrentlyPlaying(null)
    } else {
      audioRef.current.src = `http://localhost:8000${url}`
      audioRef.current.play()
      setCurrentlyPlaying(key)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setRecordedBlob(blob)
      }

      recorder.start()
      setIsRecording(true)
    } catch {
      alert('Unable to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
      setIsRecording(false)
    }
  }

  const runAnalysis = async () => {
    setIsProcessing(true)
    const formData = new FormData()
    formData.append('attack_type', attackType)
    formData.append('intensity', intensity)
    formData.append('enable_defense', enableDefense)

    if (sourceType === 'dataset') {
      formData.append('dataset_path', selectedDatasetPath)
    } else if (sourceType === 'upload' && uploadedFile) {
      formData.append('file', uploadedFile)
    } else if (sourceType === 'mic' && recordedBlob) {
      formData.append('file', recordedBlob, 'mic_recording.wav')
    }

    try {
      const res = await fetch(
        'http://localhost:8000/api/adversarial/analyze',
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!res.ok) throw new Error('Analysis failed')

      const data = await res.json()
      setResults(data)
    } catch {
      alert(
        'Error running adversarial evaluation. Make sure backend is running on port 8000.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  // Dynamic Chart Geometry
  const chartWidth = 720
  const chartHeight = 250
  const pad = { top: 25, right: 30, bottom: 40, left: 45 }

  const getY = (val) =>
    chartHeight -
    pad.bottom -
    (val / 1.0) * (chartHeight - pad.top - pad.bottom)

  const getX = (idx) =>
    pad.left +
    (idx / 4) * (chartWidth - pad.left - pad.right)

  const buildPath = (points) => {
    if (!points || points.length === 0) return ''

    return points
      .map(
        (val, idx) =>
          `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`
      )
      .join(' ')
  }

  const curve = results?.curve_data

  return (
    <div className="relative mx-auto max-w-5xl space-y-7 adversarial-modern-shell">

      {/* =====================================================
          AURORA BACKGROUND GLOW — dark mode only via low opacity
      ===================================================== */}
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-[var(--accent-primary)]/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-24 h-96 w-96 rounded-full bg-[var(--accent-primary)]/[0.03] blur-3xl" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="relative flex flex-col gap-4 border-b border-[var(--border-default)] pb-5 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-primary-soft)]" />

            <p className="text-[11px] font-bold font-mono uppercase tracking-[0.18em] text-[var(--accent-primary-soft)]">
              Adversarial Security Lab
            </p>
          </div>

          <h1 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-[var(--text-primary)] md:text-3xl">
            <ShieldAlert className="shrink-0 text-[var(--accent-primary-soft)]" size={25} />
            Adversarial Attack &amp; Defense Studio
          </h1>

          <p className="mt-2 max-w-3xl text-[13px] leading-5 text-[var(--text-muted)]">
            Red-team BoloSafe-AI under real-world telecom codecs, noise &amp; pitch
            attacks — and defend in real time.
          </p>
        </div>

        {/* SHIELD STATUS */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--status-success)]/25 bg-[var(--status-success)]/[0.07] px-3.5 py-2 text-[11px] font-semibold text-[var(--status-success)]">
            <ShieldCheck className="size-3.5" />
            Active Purifier Shield Ready
          </span>
        </div>
      </div>

      {/* =====================================================
          CONTROL STUDIO
      ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-panel)]">

        {/* Accent top line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/40 to-transparent" />

        <div className="space-y-7">

          {/* =================================================
              1. AUDIO SOURCE
          ================================================= */}

          <div>
            <label className="mb-3 block text-[12px] font-bold font-mono uppercase tracking-[0.14em] text-[var(--text-muted)]">
              1. Select Audio Source
            </label>

            <div className="grid grid-cols-3 gap-3">

              {/* Dataset */}
              <button
                onClick={() => setSourceType('dataset')}
                className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-3 text-[12px] font-bold transition-all cursor-pointer ${
                  sourceType === 'dataset'
                    ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary-muted)] text-[var(--accent-primary-soft)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-hover)] text-[var(--text-muted)] hover:border-[var(--accent-primary)]/25 hover:text-[var(--text-primary)]'
                }`}
              >
                {sourceType === 'dataset' && (
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-[var(--accent-primary)]" />
                )}

                <Database
                  size={16}
                  className={
                    sourceType === 'dataset'
                      ? 'text-[var(--accent-primary-soft)]'
                      : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                  }
                />
                <span>Dataset Library</span>
              </button>

              {/* Upload */}
              <button
                onClick={() => setSourceType('upload')}
                className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-3 text-[12px] font-bold transition-all cursor-pointer ${
                  sourceType === 'upload'
                    ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary-muted)] text-[var(--accent-primary-soft)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-hover)] text-[var(--text-muted)] hover:border-[var(--accent-primary)]/25 hover:text-[var(--text-primary)]'
                }`}
              >
                {sourceType === 'upload' && (
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-[var(--accent-primary)]" />
                )}

                <Upload
                  size={16}
                  className={
                    sourceType === 'upload'
                      ? 'text-[var(--accent-primary-soft)]'
                      : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                  }
                />
                <span>Upload Audio</span>
              </button>

              {/* Mic */}
              <button
                onClick={() => setSourceType('mic')}
                className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-3 text-[12px] font-bold transition-all cursor-pointer ${
                  sourceType === 'mic'
                    ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary-muted)] text-[var(--accent-primary-soft)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-hover)] text-[var(--text-muted)] hover:border-[var(--accent-primary)]/25 hover:text-[var(--text-primary)]'
                }`}
              >
                {sourceType === 'mic' && (
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-[var(--accent-primary)]" />
                )}

                <Mic
                  size={16}
                  className={
                    sourceType === 'mic'
                      ? 'text-[var(--accent-primary-soft)]'
                      : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                  }
                />
                <span>Live Mic Recording</span>
              </button>
            </div>

            {/* SOURCE DETAILS */}
            <div className="mt-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">

              {sourceType === 'dataset' && (
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-[12px] text-[var(--text-muted)] font-mono">
                    Sample:
                  </span>
                  <select
                    value={selectedDatasetPath}
                    onChange={(e) =>
                      setSelectedDatasetPath(e.target.value)
                    }
                    className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-primary)] font-mono"
                  >
                    {datasetSamples.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.language.toUpperCase()}] {s.name} ({s.label})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sourceType === 'upload' && (
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) =>
                      setUploadedFile(e.target.files[0])
                    }
                    className="text-[12px] text-[var(--text-secondary)] file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--accent-primary-muted)] file:px-3 file:py-2 file:text-[11px] file:font-semibold file:text-[var(--accent-primary-soft)] hover:file:bg-[var(--accent-primary)]/20"
                  />
                </div>
              )}

              {sourceType === 'mic' && (
                <div className="flex flex-wrap items-center gap-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--accent-primary)]/25 bg-[var(--accent-primary-muted)] px-4 py-2 text-[12px] font-bold text-[var(--accent-primary-soft)] transition hover:border-[var(--accent-primary)]/40 hover:bg-[var(--accent-primary)]/15"
                    >
                      <Mic size={14} />
                      Start Mic Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--status-danger)]/30 bg-[var(--status-danger)]/10 px-4 py-2 text-[12px] font-bold text-[var(--status-danger)] animate-pulse transition hover:bg-[var(--status-danger)]/15"
                    >
                      <span className="h-2 w-2 rounded-full bg-[var(--status-danger)]" />
                      Stop Recording
                    </button>
                  )}

                  {recordedBlob && (
                    <span className="flex items-center gap-2 text-[12px] font-mono text-[var(--status-success)]">
                      <ShieldCheck size={14} />
                      Audio captured — ready to test
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              2. ATTACK & DEFENSE CONTROLS
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 border-t border-[var(--border-default)] pt-6 md:grid-cols-3">

            {/* Attack Type */}
            <div>
              <label className="mb-2 block text-[12px] font-bold font-mono uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Adversarial Attack
              </label>

              <select
                value={attackType}
                onChange={(e) => setAttackType(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[12px] text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-primary)] font-mono"
              >
                <option value="opus">
                  Opus VoIP Compression (WhatsApp/Cellular)
                </option>
                <option value="mp3">
                  MP3 Compression (Lossy Sub-band)
                </option>
                <option value="pink_noise">
                  Pink Noise (Cafe / Street Background)
                </option>
                <option value="white_noise">
                  White Noise (Gaussian Line Noise)
                </option>
                <option value="pitch">
                  Pitch Shift (Vocal Formant Modulation)
                </option>
              </select>
            </div>

            {/* Intensity */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[12px] font-bold font-mono uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Attack Intensity
                </label>
                <span className="rounded-md border border-[var(--accent-primary)]/20 bg-[var(--accent-primary-muted)] px-2 py-0.5 text-[11px] font-mono text-[var(--accent-primary-soft)]">
                  Level {intensity}/4
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="4"
                value={intensity}
                onChange={(e) =>
                  setIntensity(Number(e.target.value))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--bg-hover)] accent-[var(--accent-primary)]"
              />

              <div className="mt-2 flex justify-between text-[10px] font-mono text-[var(--text-subtle)]">
                <span>LOW</span>
                <span>HIGH</span>
              </div>
            </div>

            {/* Defense */}
            <div>
              <label className="mb-2 block text-[12px] font-bold font-mono uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Defense Shield
              </label>

              <button
                onClick={() => setEnableDefense(!enableDefense)}
                className={`relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border px-3.5 py-2.5 text-[12px] font-bold transition-all ${
                  enableDefense
                    ? 'border-[var(--status-success)]/25 bg-[var(--status-success)]/[0.06] text-[var(--status-success)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-hover)] text-[var(--text-muted)]'
                }`}
              >
                {enableDefense && (
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-[var(--status-success)]" />
                )}

                <span className="flex items-center gap-2">
                  <Shield size={14} />
                  {enableDefense
                    ? 'Shield Active'
                    : 'Off (Unprotected)'}
                </span>

                <span
                  className={`size-2 rounded-full ${
                    enableDefense
                      ? 'animate-pulse bg-[var(--status-success)]'
                      : 'bg-[var(--border-strong)]'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* =================================================
              3. EXECUTE
          ================================================= */}

          <button
            onClick={runAnalysis}
            disabled={isProcessing}
            className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--accent-primary)] px-4 py-3.5 text-[12px] font-bold tracking-[0.08em] text-white shadow-[var(--shadow-card)] transition-all hover:bg-[var(--accent-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50 font-mono"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="relative size-4 animate-spin" />
                <span className="relative">
                  Running DSP Defense Pipeline &amp; Plotting Response Curves...
                </span>
              </>
            ) : (
              <>
                <Flame className="relative size-4" />
                <span className="relative">
                  Run Adversarial Attack &amp; Defense Test
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          RESULTS HUD
      ===================================================== */}

      {results && (
        <div className="relative space-y-5 animate-in fade-in duration-300">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* =================================================
                CLEAN AUDIO
            ================================================= */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">

              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--accent-primary)]/40 via-[var(--accent-primary-soft)]/30 to-transparent" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] font-mono">
                  1. Original Clean
                </span>

                <span className="rounded-md border border-[var(--border-default)] bg-[var(--bg-hover)] px-2 py-1 text-[10px] text-[var(--text-muted)] font-mono">
                  Baseline
                </span>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-black text-[var(--text-primary)] font-mono">
                  {(results.clean.ai_probability * 100).toFixed(1)}%
                </p>

                <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
                  Risk:{' '}
                  <span className="text-[var(--text-primary)]">
                    {results.clean.risk_level}
                  </span>
                </p>
              </div>

              <button
                onClick={() =>
                  togglePlayAudio(results.clean.preview_url, 'clean')
                }
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--accent-primary)]/15 bg-[var(--accent-primary-muted)] py-2.5 text-[11px] font-bold text-[var(--accent-primary-soft)] transition hover:border-[var(--accent-primary)]/30 hover:bg-[var(--accent-primary)]/15 font-mono"
              >
                {currentlyPlaying === 'clean' ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} />
                )}
                {currentlyPlaying === 'clean' ? 'Pause Original' : 'Listen to Original'}
              </button>
            </div>

            {/* =================================================
                ATTACKED AUDIO
            ================================================= */}
            <div
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
                results.attacked.evasion_detected
                  ? 'border-[var(--status-danger)]/35 bg-[var(--status-danger)]/[0.055] shadow-[0_0_28px_rgba(212,85,103,0.08)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-card)]'
              }`}
            >
              {results.attacked.evasion_detected && (
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--status-danger)] to-transparent" />
              )}

              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-[0.12em] font-mono ${
                    results.attacked.evasion_detected
                      ? 'text-[var(--status-danger)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  2. Attacked Audio
                </span>

                {results.attacked.evasion_detected && (
                  <span className="animate-pulse rounded-md border border-[var(--status-danger)]/25 bg-[var(--status-danger)]/10 px-2 py-1 text-[10px] font-bold text-[var(--status-danger)] font-mono">
                    🚨 EVADED!
                  </span>
                )}
              </div>

              <div className="mt-4">
                <p className="text-3xl font-black text-[var(--text-primary)] font-mono">
                  {(results.attacked.ai_probability * 100).toFixed(1)}%
                </p>

                <p
                  className={`mt-1.5 text-[12px] ${
                    results.attacked.evasion_detected
                      ? 'text-[var(--status-danger)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  Risk:{' '}
                  <span
                    className={
                      results.attacked.evasion_detected
                        ? 'text-[var(--status-danger)]'
                        : 'text-[var(--text-primary)]'
                    }
                  >
                    {results.attacked.risk_level}
                  </span>
                </p>
              </div>

              <button
                onClick={() =>
                  togglePlayAudio(results.attacked.preview_url, 'attacked')
                }
                className={`mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border py-2.5 text-[11px] font-bold transition font-mono ${
                  results.attacked.evasion_detected
                    ? 'border-[var(--status-danger)]/20 bg-[var(--status-danger)]/[0.05] text-[var(--status-danger)] hover:bg-[var(--status-danger)]/10'
                    : 'border-[var(--border-default)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                {currentlyPlaying === 'attacked' ? <Pause size={14} /> : <Play size={14} />}
                {currentlyPlaying === 'attacked' ? 'Pause Attacked' : 'Listen to Attacked'}
              </button>
            </div>

            {/* =================================================
                DEFENDED AUDIO
            ================================================= */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--status-success)]/20 bg-[var(--status-success)]/[0.04] p-5">

              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--status-success)]/50 to-transparent" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--status-success)] font-mono">
                  3. Defended Audio
                </span>

                <span className="rounded-md border border-[var(--status-success)]/20 bg-[var(--status-success)]/[0.07] px-2 py-1 text-[10px] font-bold text-[var(--status-success)] font-mono">
                  🛡️ RESTORED
                </span>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-black text-[var(--text-primary)] font-mono">
                  {(results.defended.ai_probability * 100).toFixed(1)}%
                </p>

                <p className="mt-1.5 text-[12px] text-[var(--status-success)]">
                  Recovery:{' '}
                  {results.defended.recovery_delta_percent > 0 ? '+' : ''}
                  {results.defended.recovery_delta_percent}%
                </p>
              </div>

              <button
                onClick={() =>
                  togglePlayAudio(results.defended.preview_url, 'defended')
                }
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--status-success)]/15 bg-[var(--status-success)]/[0.05] py-2.5 text-[11px] font-bold text-[var(--status-success)] transition hover:bg-[var(--status-success)]/[0.10] font-mono"
              >
                {currentlyPlaying === 'defended' ? <Pause size={14} /> : <Play size={14} />}
                {currentlyPlaying === 'defended' ? 'Pause Defended' : 'Listen to Defended'}
              </button>
            </div>
          </div>

          {/* =================================================
              DEFENSE TELEMETRY
          ================================================= */}

          <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)] p-4 font-mono text-[11px]">

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/20 to-transparent" />

            <div>
              <span className="text-[var(--text-muted)]">Attack Signature: </span>
              <span className="font-bold text-[var(--text-primary)]">
                {results.defended.attack_detected}
              </span>
            </div>

            <div>
              <span className="text-[var(--text-muted)]">Defense Algorithm: </span>
              <span className="font-bold text-[var(--status-success)]">
                {results.defended.defense_applied}
              </span>
            </div>

            <div>
              <span className="text-[var(--text-muted)]">Purification Latency: </span>
              <span className="font-bold text-[var(--accent-primary-soft)]">
                {results.defended.defense_latency_ms} ms
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LIVE DYNAMIC 3-CURVE RESPONSE GRAPH
      ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-panel)]">

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/30 to-transparent" />

        {/* GRAPH HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg border border-[var(--accent-primary)]/20 bg-[var(--accent-primary-muted)]">
                <TrendingDown size={15} className="text-[var(--accent-primary-soft)]" />
              </span>
              <h2 className="text-[13px] font-bold text-[var(--text-primary)]">
                Live Attack Dip vs. Defense Restoration Curve
              </h2>
            </div>

            <p className="mt-1.5 text-[12px] leading-5 text-[var(--text-muted)]">
              Dynamically generated from real model evaluations on this
              specific audio file across 5 intensity levels
            </p>
          </div>
        </div>

        {/* =================================================
            LEGEND
        ================================================= */}

        <div className="my-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 border-y border-[var(--border-default)] py-3 font-mono text-[11px]">

          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--accent-primary-soft)]" />
            <span className="font-semibold text-[var(--text-secondary)]">
              1. Baseline Voice (Clean)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--status-danger)]" />
            <span className="font-semibold text-[var(--status-danger)]">
              2. The Dip (Attacked Voice)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--status-success)]" />
            <span className="font-semibold text-[var(--status-success)]">
              3. The Defense (Shield Active)
            </span>
          </div>
        </div>

        {/* =================================================
            SVG CANVAS
        ================================================= */}

        <div className="relative w-full pt-2">

          {curve ? (
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-auto w-full overflow-visible select-none"
            >
              {/* Evasion Zone */}
              <rect
                x={pad.left}
                y={getY(0.5)}
                width={chartWidth - pad.left - pad.right}
                height={getY(0.0) - getY(0.5)}
                fill="rgba(212, 85, 103, 0.04)"
              />

              <text
                x={chartWidth - pad.right - 10}
                y={getY(0.25)}
                fill="rgba(212, 85, 103, 0.45)"
                fontSize="12"
                fontWeight="bold"
                textAnchor="end"
                className="font-mono tracking-widest uppercase"
              >
                🚨 Critical Evasion Zone (AI Bypasses Detector)
              </text>

              {/* Grid Lines & Y Axis */}
              {[1.0, 0.8, 0.6, 0.5, 0.4, 0.2, 0].map((val) => {
                const y = getY(val)
                const isThresh = val === 0.5

                return (
                  <g key={val}>
                    <line
                      x1={pad.left}
                      y1={y}
                      x2={chartWidth - pad.right}
                      y2={y}
                      stroke={
                        isThresh
                          ? 'var(--status-danger)'
                          : 'var(--border-default)'
                      }
                      strokeWidth={isThresh ? 1.5 : 0.8}
                      strokeDasharray={isThresh ? '4 4' : undefined}
                      strokeOpacity={isThresh ? 0.7 : 0.6}
                    />

                    <text
                      x={pad.left - 8}
                      y={y + 3.5}
                      fill={isThresh ? 'var(--status-danger)' : 'var(--chart-axis)'}
                      fontSize="10"
                      fontWeight={isThresh ? 'bold' : 'normal'}
                      textAnchor="end"
                      className="font-mono"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                )
              })}

              {/* Decision Threshold Label */}
              <text
                x={chartWidth - pad.right}
                y={getY(0.5) - 6}
                fill="var(--status-danger)"
                fontSize="10"
                fontWeight="bold"
                textAnchor="end"
                className="font-mono"
              >
                50% Decision Threshold
              </text>

              {/* X Axis */}
              {curve.x_labels.map((lbl, idx) => {
                const x = getX(idx)
                return (
                  <g key={idx}>
                    <line
                      x1={x}
                      y1={chartHeight - pad.bottom}
                      x2={x}
                      y2={chartHeight - pad.bottom + 4}
                      stroke="var(--border-strong)"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={chartHeight - pad.bottom + 18}
                      fill="var(--chart-axis)"
                      fontSize="10"
                      textAnchor="middle"
                      className="font-mono"
                    >
                      {lbl}
                    </text>
                  </g>
                )
              })}

              {/* CURVE 1 — BASELINE */}
              <path
                d={buildPath(curve.baseline)}
                fill="none"
                stroke="var(--accent-primary-soft)"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                className="opacity-70"
              />

              {/* CURVE 2 — ATTACKED */}
              <path
                d={buildPath(curve.attacked)}
                fill="none"
                stroke="var(--status-danger)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* CURVE 3 — DEFENSE */}
              <path
                d={buildPath(curve.defended)}
                fill="none"
                stroke="var(--status-success)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* DATA POINTS */}
              {curve.x_labels.map((_, idx) => {
                const pClean = curve.baseline[idx]
                const pAtk = curve.attacked[idx]
                const pDef = curve.defended[idx]
                const isActive = idx === curve.active_level

                return (
                  <g key={idx}>
                    {/* Clean */}
                    <circle
                      cx={getX(idx)}
                      cy={getY(pClean)}
                      r="4"
                      fill="var(--bg-surface)"
                      stroke="var(--accent-primary-soft)"
                      strokeWidth="2"
                    />

                    {/* Attacked */}
                    <circle
                      cx={getX(idx)}
                      cy={getY(pAtk)}
                      r={isActive ? 7 : 5}
                      fill="var(--status-danger)"
                      stroke={isActive ? 'var(--bg-surface)' : 'none'}
                      strokeWidth={isActive ? 2 : 0}
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          x: getX(idx),
                          y: getY(pAtk),
                          text: `Attacked: ${(pAtk * 100).toFixed(1)}%`
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />

                    {/* Defended */}
                    <circle
                      cx={getX(idx)}
                      cy={getY(pDef)}
                      r={isActive ? 7 : 5}
                      fill="var(--status-success)"
                      stroke={isActive ? 'var(--bg-surface)' : 'none'}
                      strokeWidth={isActive ? 2 : 0}
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          x: getX(idx),
                          y: getY(pDef),
                          text: `Defended: ${(pDef * 100).toFixed(1)}%`
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                )
              })}

              {/* HOVER TOOLTIP */}
              {hoveredPoint && (
                <g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 12})`}>
                  <rect
                    x="-45"
                    y="-20"
                    width="90"
                    height="20"
                    rx="4"
                    fill="var(--bg-surface)"
                    stroke="var(--border-default)"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-6"
                    fill="var(--text-primary)"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {hoveredPoint.text}
                  </text>
                </g>
              )}
            </svg>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center space-y-2 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-hover)] text-[var(--text-muted)] font-mono text-[11px]">
              <span className="flex size-10 items-center justify-center rounded-full border border-[var(--accent-primary)]/15 bg-[var(--accent-primary-muted)]">
                <TrendingDown size={22} className="text-[var(--accent-primary-soft)]" />
              </span>
              <p>
                Click "Run Adversarial Attack &amp; Defense Test"
                above to generate live response curves.
              </p>
            </div>
          )}
        </div>

        {/* DYNAMIC FOOTER TELEMETRY */}
        {curve && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)] p-3.5 font-mono text-[11px] sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Shield size={14} className="shrink-0 text-[var(--accent-primary-soft)]" />
              <span>
                Live evaluated on current audio sample across 5 intensities (0..4)
              </span>
            </div>

            <span className="font-bold text-[var(--status-success)]">
              Peak Recovery: +
              {Math.max(
                0,
                ...curve.defended.map((d, i) =>
                  Math.round((d - curve.attacked[i]) * 100)
                )
              )}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
