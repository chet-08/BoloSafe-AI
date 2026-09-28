'use client'

import { useMemo, useState, useEffect, useRef } from 'react'

import {
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  History as HistoryIcon,
  CircleHelp,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Hotel,
  Film,
  Landmark,
  Sun,
  Moon,
  Shield,
  ChevronLeft,
} from 'lucide-react'// Sub-components
import Overview from './pages/Overview'
import Analytics from './pages/Analytics'
import History from './pages/History'
import Architecture from './pages/Architecture'
import AdversarialRobustness from './components/AdversarialRobustness'
import SecurityReport from './pages/SecurityReport'
import Hero from "./pages/Hero";
import Admin from "./pages/Admin";
import RetailSecurity from './pages/sectors/RetailSecurity';
import HospitalitySecurity from './pages/sectors/HospitalitySecurity'
import EntertainmentSecurity from './pages/sectors/EntertainmentSecurity'
import FinanceSecurity from './pages/sectors/FinanceSecurity'
import {
  getSectorFromResult,
  getSectorRoute,
} from './utils/sectorRouting'

// Utilities
import { initialHistories, getAnalyticsData } from './utils/helpers'

// 1. Import the provider
import { SecurityProvider } from './context/SecurityContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'


function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      <span className="hidden text-xs font-semibold sm:inline">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}

const PAGE_LABELS = {
  overview: 'Live Dashboard',
  finance: 'Financial Security',
  retail: 'Retail Security',
  adversarial: 'Adversarial Testing',
  analytics: 'Deep Analytics',
  history: 'Incident History',
  security: 'Security Report',
  how: 'Architecture',
  admin: 'Administration',
}

function ConsoleTopBar({ activePage, isBackendOnline, isConnected }) {
  return (
    <header className="sticky top-0 z-30 -mx-5 mb-6 border-b border-[var(--border-default)] bg-[var(--bg-page)]/95 px-5 py-3 backdrop-blur-md lg:-mx-10 lg:px-10">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-medium text-[var(--text-muted)] sm:inline">
              BoloSafe-AI
            </span>
            <ChevronRight
              size={13}
              className="hidden text-[var(--text-subtle)] sm:inline"
            />
            <span className="truncate text-sm font-bold text-[var(--text-primary)]">
              {PAGE_LABELS[activePage] || 'Security Console'}
            </span>
          </div>
        </div>

        <div className="hidden min-w-[240px] max-w-md flex-1 md:block">
          <div className="flex h-9 items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-xs text-[var(--text-muted)]">
            <span className="mr-2 text-[var(--text-subtle)]">⌕</span>
            Search anything...
            <span className="ml-auto rounded border border-[var(--border-default)] px-1.5 py-0.5 text-[9px]">
              /
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 sm:flex">
            <span
              className={`size-1.5 rounded-full ${
                isBackendOnline
                  ? 'bg-[var(--status-success)]'
                  : 'bg-[var(--status-warning)]'
              }`}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {isConnected
                ? 'Live'
                : isBackendOnline
                  ? 'Online'
                  : 'Offline'}
            </span>
          </div>

          <ThemeToggle />

          <div className="flex size-9 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-bold text-[var(--text-secondary)]">
            CB
          </div>
        </div>
      </div>
    </header>
  )
}

// Renamed your original component to MainApp to keep all its internal logic intact
function MainApp() {
  // =========================================================
  // AUTHENTICATION STATE
  // =========================================================
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // =========================================================
  // DASHBOARD STATE
  // =========================================================
  const [activePage, setActivePage] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [streams, setStreams] = useState({})
  const [streamHistories, setStreamHistories] = useState(initialHistories)
  const [activeStreamId, setActiveStreamId] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [inputMode, setInputMode] = useState('mic')
  const [micStatus, setMicStatus] = useState('Disconnected')
  const [securityTerminated, setSecurityTerminated] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [transcriptLanguage, setTranscriptLanguage] = useState('')
  const [showInspector, setShowInspector] = useState(false)
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false)
  const [isFilePlaying, setIsFilePlaying] = useState(false)
  const [fileName, setFileName] = useState('')
  const [selectedSector, setSelectedSector] = useState('finance')
  const [transactionAmountInr, setTransactionAmountInr] = useState('525000')
  const [selectedScenario, setSelectedScenario] = useState('high_value_transfer')
  const [contextConfigured, setContextConfigured] = useState(false)
  
  // NEW: State to hold the incident data being sent to the Admin board
  const [escalatedIncident, setEscalatedIncident] = useState(null)

  const sectorOptions = {
    finance: {
      label: 'Financial Services',
      scenarios: [
        { value: 'high_value_transfer', label: 'High-Value Transfer' },
        { value: 'account_recovery', label: 'Account Recovery' },
        { value: 'customer_verification', label: 'Customer Verification' },
      ],
    },
    retail: {
      label: 'Retail',
      scenarios: [
        { value: 'customer_care', label: 'Customer Care' },
        { value: 'order_modification', label: 'Order Modification' },
        { value: 'account_assistance', label: 'Account Assistance' },
      ],
    },
    hospitality: {
      label: 'Hospitality',
      scenarios: [
        { value: 'reservation_change', label: 'Reservation Change' },
        { value: 'guest_verification', label: 'Guest Verification' },
        { value: 'vip_booking', label: 'VIP Booking' },
      ],
    },
    entertainment: {
      label: 'Entertainment',
      scenarios: [
        { value: 'voice_authenticity', label: 'Voice Authenticity' },
        { value: 'speaker_comparison', label: 'Speaker Comparison' },
        { value: 'dubbing_verification', label: 'Dubbing Verification' },
      ],
    },
  }

  const activeSectorConfig = sectorOptions[selectedSector]

  // Refs for WebSockets and Audio
  const monitorGainRef = useRef(null)
  const wsRef = useRef(null)
  const streamRotationRef = useRef(false)
  const wsConnectResolverRef = useRef(null)
  const wsConnectRejecterRef = useRef(null)
  const createStreamId = () =>
    `sih_live_${Math.random().toString(36).substring(2, 9)}`

  const uniqueStreamIdRef = useRef(createStreamId())
  const audioContextRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const processorRef = useRef(null)
  const sourceRef = useRef(null)
  const fileIntervalRef = useRef(null)
  const fileStreamActiveRef = useRef(false)
  const filePlaybackRef = useRef(null)
  const securityTerminatedRef = useRef(false)
  const transactionAmountRef = useRef('525000')
  const selectedScenarioRef = useRef('high_value_transfer')
  const selectedSectorRef = useRef('finance')

  // Keep the imperative refs synchronized with React state so
  // uploads always send the currently selected security context.
  useEffect(() => {
    selectedSectorRef.current = selectedSector
  }, [selectedSector])

  useEffect(() => {
    selectedScenarioRef.current = selectedScenario
  }, [selectedScenario])

  // Automatically sync sector context when navigating to sector pages from sidebar
  useEffect(() => {
    const sectorPages = ['finance', 'retail', 'hospitality', 'entertainment']
    if (sectorPages.includes(activePage)) {
      setSelectedSector(activePage)
      selectedSectorRef.current = activePage

      const defaultScenarios = {
        finance: 'high_value_transfer',
        retail: 'address_change',
        hospitality: 'guest_verification',
        entertainment: 'dubbing_verification',
      }
      const nextScenario = defaultScenarios[activePage] || 'routine_support'
      setSelectedScenario(nextScenario)
      selectedScenarioRef.current = nextScenario
    }
  }, [activePage])

  // Authoritative context for the currently configured security session.
  // Routing must never be driven by stale results from another session.
  const activeSessionRef = useRef(null)
  const contextAckResolverRef = useRef(null)

  const selected = activeStreamId
    ? (streams[activeStreamId] || {})
    : {}

  // Strict sector isolation.
  // The main dashboard keeps the global `selected` result.
  // Sector dashboards only receive results explicitly belonging
  // to that sector.
  const getSectorResult = (result, sector) => {
    if (!result) return null

    const resultSector =
      result.sector ||
      result.governance_decision?.sector ||
      null

    return resultSector === sector ? result : null
  }

  const sectorSelected = getSectorResult(selected, selectedSector)
  const retailSelected = getSectorResult(selected, 'retail')
  const financeSelected = getSectorResult(selected, 'finance')
  const hospitalitySelected = getSectorResult(selected, 'hospitality')
  const entertainmentSelected = getSectorResult(selected, 'entertainment')

  const openSectorDetails = (result = {}) => {
    const session = activeSessionRef.current

    if (!session?.streamId || !session?.sector) {
      console.warn(
        'Ignoring sector alert: no active security session is locked.'
      )
      return
    }

    const resultStreamId = result?.stream_id

    if (
      resultStreamId &&
      resultStreamId !== session.streamId
    ) {
      console.warn(
        `Ignoring stale stream alert: active=${session.streamId}, result=${resultStreamId}`
      )
      return
    }

    const resultSector = getSectorFromResult(
      result,
      session.sector
    )

    if (resultSector !== session.sector) {
      console.warn(
        `Ignoring cross-sector alert: session=${session.sector}, result=${resultSector}`
      )
      return
    }

    setSelectedSector(session.sector)
    selectedSectorRef.current = session.sector
    setActivePage(getSectorRoute(session.sector))
  }

  const analytics = getAnalyticsData(selected)
  const currentHistory = streamHistories[activeStreamId] || []

  /* =========================================================
     WEBSOCKET CONNECTION (Only runs after authentication)
     ========================================================= */
  useEffect(() => {
    // Only connect if the user is authenticated and on the dashboard
    if (!isAuthenticated) return

    let isUnmounted = false
    let reconnectTimeout = null

    const connect = () => {
      if (isUnmounted) return

      const streamId = uniqueStreamIdRef.current
      const wsUrl =
        import.meta.env.VITE_RISK_WS_URL ||
        `ws://127.0.0.1:8000/ws/audio?stream_id=${streamId}`

      console.log('Connecting Risk WebSocket:', wsUrl)

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log(
          'Risk WebSocket connected:',
          streamId
        )

        setIsConnected(true)
        setIsBackendOnline(true)
        setMicStatus('Select Security Context')
        setContextConfigured(false)

        if (wsConnectResolverRef.current) {
          wsConnectResolverRef.current(ws)
          wsConnectResolverRef.current = null
          wsConnectRejecterRef.current = null
        }
      }

      ws.onclose = () => {
        console.log('Risk WebSocket closed:', streamId)

        // Ignore sockets that are no longer the active socket.
        if (wsRef.current !== ws) {
          console.log('Ignoring stale Risk WebSocket close:', streamId)
          return
        }

        setIsConnected(false)

        /*
         * A stream rotation intentionally closes the current socket.
         * rotateRiskStream() already generated the authoritative ID.
         */
        if (streamRotationRef.current) {
          streamRotationRef.current = false

          if (!isUnmounted && !securityTerminatedRef.current) {
            reconnectTimeout = setTimeout(() => {
              console.log(
                'Reconnecting rotated Risk WebSocket with stream:',
                uniqueStreamIdRef.current
              )
              connect()
            }, 50)
          }

          return
        }

        setIsBackendOnline(securityTerminatedRef.current)

        setMicStatus(
          securityTerminatedRef.current
            ? 'STREAM TERMINATED — SECURITY ALERT'
            : 'Disconnected'
        )

        if (!isUnmounted && !securityTerminatedRef.current) {
          const reconnectStreamId = createStreamId()
          uniqueStreamIdRef.current = reconnectStreamId

          reconnectTimeout = setTimeout(() => {
            console.log(
              'Attempting WebSocket reconnect with fresh stream:',
              reconnectStreamId
            )
            connect()
          }, 2000)
        }
      }

    ws.onerror = (error) => {
      console.error('Risk WebSocket error:', error)

      // Ignore errors from stale sockets after stream rotation.
      if (wsRef.current !== ws) {
        console.log('Ignoring stale Risk WebSocket error:', streamId)
        return
      }

      setIsConnected(false)
      setIsBackendOnline(securityTerminatedRef.current)
      setMicStatus(
        securityTerminatedRef.current
          ? 'STREAM TERMINATED — SECURITY ALERT'
          : 'Backend Connection Error'
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('RiskResult:', data)

        if (data.type === 'transcript_snapshot') {
          setTranscript(data.text || '')
          setTranscriptLanguage(data.language || '')
          return
        }

        if (data.type === 'transcript_complete') {
          return
        }

        if (data.type === 'audio_end_ack') {
          console.log('Audio stream completed successfully:', data.stream_id)
          setMicStatus('Analysis Complete')
          return
        }

        if (data.type === 'session_context_ack') {
          console.log('Session context acknowledged:', data)

          securityTerminatedRef.current = false
          setSecurityTerminated(false)
          setEscalatedIncident(null)

          if (contextAckResolverRef.current) {
            contextAckResolverRef.current(data)
            contextAckResolverRef.current = null
          }

          const acknowledgedSector =
            data.sector || selectedSectorRef.current

          activeSessionRef.current = {
            streamId: data.stream_id,
            sector: acknowledgedSector,
            scenario: data.scenario,
          }

          setSelectedSector(acknowledgedSector)
          selectedSectorRef.current = acknowledgedSector

          // Start a completely clean stream object for the
          // newly acknowledged security context. Do not merge
          // the previous sector's risk/governance fields.
          setStreams((prev) => ({
            ...prev,
            [data.stream_id]: {
              stream_id: data.stream_id,
              name: inputMode === 'mic' ? 'Live Mic Stream' : 'Audio File Stream',
              sector: data.sector || selectedSectorRef.current,
              transaction_amount_inr: data.transaction_amount_inr,
              notification_scenario: data.scenario,
              scenario_source: data.scenario_source,
              response_workflow_status: 'MONITORING',
              timeSeries: [],
              ai_probability: undefined,
              rolling_score: undefined,
              risk_level: undefined,
              governance_decision: undefined,
              alert_triggered: false,
              alert_reason: null,
              alert_consecutive_flags: null
            }
          }))

          setActiveStreamId(data.stream_id)
          setContextConfigured(true)
          setMicStatus('Security Context Ready')
          return
        }

        // Once a security alert terminates the active session,
        // ignore all subsequent/stale risk windows until a new
        // security context explicitly starts a fresh session.
        if (securityTerminatedRef.current) {
          console.debug(
            'Ignoring risk result after security hard stop:',
            data.stream_id || data.type
          )
          return
        }

        if (data.alert_triggered === true) {
          console.warn('HIGH-RISK ALERT: HARD STOPPING FILE STREAM')
          securityTerminatedRef.current = true
          setSecurityTerminated(true)
          fileStreamActiveRef.current = false

          if (fileIntervalRef.current) {
            clearInterval(fileIntervalRef.current)
            fileIntervalRef.current = null
          }

          if (filePlaybackRef.current) {
            try {
              filePlaybackRef.current.pause()
            } catch (e) {}
          }

          setIsFilePlaying(false)
          setMicLevel(0)
          setMicStatus('ALERT: Synthetic Voice Clone Detected')

          // Keep the user on the command dashboard.
          // Sector navigation happens only from an explicit
          // user action on the alert.
          setEscalatedIncident({
            ...data,
            sector:
              data.governance_decision?.sector ||
              data.sector ||
              selectedSectorRef.current,
            streamId: data.stream_id || streamId,
          })

            // Keep the operator on the active sector page while
            // live detection results update.
        }

        const currentStreamId = data.stream_id || streamId
        const activeSession = activeSessionRef.current

        // Ignore results that belong to a different security session.
        if (
          activeSession?.streamId &&
          currentStreamId !== activeSession.streamId
        ) {
          return
        }

        // Never allow a result from another sector to populate
        // the currently active sector session.
        const resultSector = (
          data.governance_decision?.sector || data.sector || ''
        ).toLowerCase()
        const activeSector = (activeSession?.sector || '').toLowerCase()

        // Every live detection result must carry an explicit sector.
        // Never allow an untagged result to enter a sector session.
        if (activeSector && !resultSector) {
          console.warn(
            'Ignoring untagged result for sector session:',
            activeSector
          )
          return
        }

        // Never allow a result from another sector to populate
        // the currently active sector session.
        if (
          activeSector &&
          resultSector !== activeSector
        ) {
          console.warn(
            'Ignoring cross-sector result:',
            resultSector,
            'expected:',
            activeSector
          )
          return
        }

        console.log(
          'LIVE RESULT ROUTING:',
          JSON.stringify({
            stream_id: currentStreamId,
            active_session: activeSession,
            result_sector: resultSector,
            ai_probability: data.ai_probability,
            governance_sector: data.governance_decision?.sector,
          })
        )

        setStreams((prev) => {
          const existing = prev[currentStreamId] || {
            stream_id: currentStreamId,
            name: inputMode === 'mic' ? 'Live Mic Stream' : 'Audio File Stream',
            timeSeries: []
          }

          const probability = data.ai_probability
          const existingSeries = existing.timeSeries || []

          const newTsEntry =
            probability !== null && probability !== undefined
              ? {
                  time: `${existingSeries.length * 3}s`,
                  prob: Math.round(Number(probability) * 100)
                }
              : null

          return {
            ...prev,
            [currentStreamId]: {
              ...existing,
              ...data,

              // Persist the validated security-session sector.
              // Sector pages must never infer their sector from
              // the currently selected UI page.
              sector:
                resultSector ||
                activeSession?.sector ||
                existing.sector,

              alert_triggered:
                data.alert_triggered === true ||
                existing.alert_triggered === true,
              alert_reason:
                data.alert_reason || existing.alert_reason || null,
              alert_consecutive_flags:
                data.alert_triggered === true
                  ? (data.consecutive_flags ?? 0)
                  : (existing.alert_consecutive_flags ?? null),
              timeSeries: newTsEntry
                ? [...existingSeries, newTsEntry].slice(-60)
                : existingSeries,
              name: data.name || existing.name || currentStreamId
            }
          }
        })

        setActiveStreamId(currentStreamId)

        setStreamHistories((prev) => {
          const hist = prev[currentStreamId] || []

          const newEntry = {
            window_id: data.window_id ?? hist.length + 1,
            timestamp: data.timestamp
              ? new Date(Number(data.timestamp) * 1000).toLocaleTimeString()
              : new Date().toLocaleTimeString(),
            speech_detected:
              data.speech_detected ??
              (data.ai_probability !== null &&
                data.ai_probability !== undefined),
            ai_probability: data.ai_probability ?? null,
            rolling_score: data.rolling_score ?? null,
            risk_level: data.risk_level ?? null
          }

          return {
            ...prev,
            [currentStreamId]: [newEntry, ...hist].slice(0, 30)
          }
        })
      } catch (error) {
        console.error('Failed to parse RiskResult:', error)
      }
    }

    }

    connect()

    return () => {
      isUnmounted = true
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.CONNECTING ||
          wsRef.current.readyState === WebSocket.OPEN)
      ) {
        console.log('Cleaning up Risk WebSocket')
        wsRef.current.close()
      }

      wsRef.current = null
      stopMicrophoneStream()
    }
  }, [isAuthenticated]) // Re-run effect if authentication status changes

  /* =========================================================
     AUDIO HELPERS
     ========================================================= */

  const TARGET_SAMPLE_RATE = 16000

  const resampleTo16k = (input, inputSampleRate) => {
    if (inputSampleRate === TARGET_SAMPLE_RATE) return input

    const ratio = inputSampleRate / TARGET_SAMPLE_RATE
    const outputLength = Math.round(input.length / ratio)
    const output = new Float32Array(outputLength)

    for (let i = 0; i < outputLength; i++) {
      const position = i * ratio
      const index = Math.floor(position)
      const fraction = position - index
      const sample1 = input[index] || 0
      const sample2 =
        index + 1 < input.length ? input[index + 1] : sample1

      output[i] = sample1 + (sample2 - sample1) * fraction
    }

    return output
  }

  const float32ToPCM16 = (float32Data) => {
    const pcm16 = new Int16Array(float32Data.length)

    for (let i = 0; i < float32Data.length; i++) {
      const sample = Math.max(-1, Math.min(1, float32Data[i]))

      pcm16[i] =
        sample < 0
          ? sample * 0x8000
          : sample * 0x7fff
    }

    return pcm16
  }

  const calculateRMS = (audio) => {
    if (!audio || audio.length === 0) return 0

    let sum = 0

    for (let i = 0; i < audio.length; i++) {
      sum += audio[i] * audio[i]
    }

    return Math.sqrt(sum / audio.length)
  }

  /* =========================================================
     MICROPHONE STREAM
     ========================================================= */

  const configureSecurityContext = () => {
    const ws = wsRef.current

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setMicStatus('Backend Connection Required')
      return false
    }

    const sector = selectedSector
    const scenario = selectedScenarioRef.current

    const rawAmount = String(transactionAmountRef.current).trim()
    const parsedAmount =
      sector === 'finance' && rawAmount !== ''
        ? Number(rawAmount)
        : null

    if (
      sector === 'finance' &&
      parsedAmount !== null &&
      (!Number.isFinite(parsedAmount) || parsedAmount < 0)
    ) {
      setMicStatus('Invalid Transaction Amount')
      return false
    }

    if (
      sector === 'finance' &&
      scenario === 'high_value_transfer' &&
      parsedAmount === null
    ) {
      setMicStatus('Transaction Amount Required')
      return false
    }

    const payload = {
      type: 'session_context',
      sector,
      scenario,
      transaction_amount_inr: parsedAmount,
    }

    // Start a fresh sector-bound security session.
    activeSessionRef.current = {
      streamId: uniqueStreamIdRef.current,
      sector,
      scenario,
    }

      // Keep the current sector page while configuring its
      // security session. Navigation is explicit.
    setActiveStreamId(null)
    setSecurityTerminated(false)
    securityTerminatedRef.current = false

    ws.send(JSON.stringify(payload))

    console.log('Security context sent:', payload)
    setMicStatus(`Configuring ${activeSectorConfig.label} Context...`)

    return true
  }


  const startMicrophoneStream = async () => {
    const currentSector = selectedSectorRef.current || 'finance'
    const currentScenario = selectedScenarioRef.current || 'routine_support'

    // Auto-configure security context if not already configured for this sector
    if (!contextConfigured || activeSessionRef.current?.sector !== currentSector) {
      const ws = wsRef.current || (await waitForRiskWebSocket())
      if (ws && ws.readyState === WebSocket.OPEN) {
        const payload = {
          type: 'session_context',
          sector: currentSector,
          scenario: currentScenario,
          transaction_amount_inr:
            currentSector === 'finance'
              ? Number(transactionAmountRef.current) || 525000
              : null,
        }
        ws.send(JSON.stringify(payload))
        activeSessionRef.current = {
          streamId: uniqueStreamIdRef.current,
          sector: currentSector,
          scenario: currentScenario,
        }
        setActiveStreamId(uniqueStreamIdRef.current)
        setContextConfigured(true)
      } else {
        setMicStatus('Risk WebSocket Not Connected')
        return
      }
    }

    try {
      setInputMode('mic')
      setMicStatus('Connecting Mic...')

      const constraints = {
        audio: {
          channelCount: { ideal: 1 },
          echoCancellation: { exact: false },
          noiseSuppression: { exact: false },
          autoGainControl: { exact: false }
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      mediaStreamRef.current = mediaStream

      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioContextClass()
      audioContextRef.current = audioCtx

      const actualSampleRate = audioCtx.sampleRate
      const source = audioCtx.createMediaStreamSource(mediaStream)
      sourceRef.current = source

      const bufferSize = 4096
      const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1)
      processorRef.current = processor

      const silentGain = audioCtx.createGain()
      silentGain.gain.value = 0

      let pcmBuffer = new Int16Array(0)
      let rmsAccumulator = 0
      let rmsCount = 0
      const CHUNK_SIZE = 8000 

      processor.onaudioprocess = (event) => {
        const ws = wsRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) return

        const inputData = event.inputBuffer.getChannelData(0)
        
        rmsAccumulator += calculateRMS(inputData)
        rmsCount++

        const audio16k = resampleTo16k(inputData, actualSampleRate)
        const pcm16 = float32ToPCM16(audio16k)

        const newBuffer = new Int16Array(pcmBuffer.length + pcm16.length)
        newBuffer.set(pcmBuffer, 0)
        newBuffer.set(pcm16, pcmBuffer.length)
        pcmBuffer = newBuffer

        while (pcmBuffer.length >= CHUNK_SIZE) {
          const chunk = pcmBuffer.slice(0, CHUNK_SIZE)
          ws.send(chunk.buffer)

          const avgRms = rmsCount > 0 ? rmsAccumulator / rmsCount : 0
          setMicLevel(Math.min(Math.round(avgRms * 200), 100))

          rmsAccumulator = 0
          rmsCount = 0
          pcmBuffer = pcmBuffer.slice(CHUNK_SIZE)
        }
      }

      source.connect(processor)
      processor.connect(silentGain)
      silentGain.connect(audioCtx.destination)

      const monitorGain = audioCtx.createGain()
      monitorGain.gain.value = 0

      source.connect(monitorGain)
      monitorGain.connect(audioCtx.destination)
      monitorGainRef.current = monitorGain

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume()
      }

      setMicStatus('Live Mic Streaming...')
    } catch (error) {
      console.error('Microphone access error:', error)
      setMicStatus('Mic Permission Denied')
    }
  }

  const stopMicrophoneStream = () => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    if (monitorGainRef.current) {
      monitorGainRef.current.disconnect()
      monitorGainRef.current = null
    }

    setIsLiveMonitoring(false)

    if (mediaStreamRef.current) {
      mediaStreamRef.current
        .getTracks()
        .forEach((track) => track.stop())

      mediaStreamRef.current = null
    }

    if (
      audioContextRef.current &&
      audioContextRef.current.state !== 'closed'
    ) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (fileIntervalRef.current) {
      clearInterval(fileIntervalRef.current)
      fileIntervalRef.current = null
    }

    setMicLevel(0)

    if (isConnected) {
      setMicStatus('Connected / Ready')
    }
  }

  const toggleLiveMonitor = () => {
    if (!monitorGainRef.current) return

    const next = !isLiveMonitoring

    monitorGainRef.current.gain.value = next ? 1 : 0

    setIsLiveMonitoring(next)
  }

  const toggleFilePlayback = async () => {
    const audio = filePlaybackRef.current

    if (!audio) return

    try {
      if (audio.paused) {
        await audio.play()
      } else {
        audio.pause()
      }
    } catch (error) {
      console.error('File playback error:', error)
      setIsFilePlaying(false)
    }
  }

  /* =========================================================
     AUDIO FILE STREAMING
     ========================================================= */

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!contextConfigured) {
      setMicStatus('Configure Security Context First')
      event.target.value = ''
      return
    }

    try {
      stopMicrophoneStream()

      if (fileIntervalRef.current) {
        clearInterval(fileIntervalRef.current)
        fileIntervalRef.current = null
      }

      fileStreamActiveRef.current = false

      if (filePlaybackRef.current) {
        filePlaybackRef.current.pause()
        filePlaybackRef.current.currentTime = 0
        filePlaybackRef.current = null
      }

      /*
       * Uploaded files use the same stream lifecycle as sample audio:
       *
       * 1. Rotate to a fresh Risk Engine stream.
       * 2. Let the central WebSocket lifecycle reconnect.
       * 3. Reuse the central onmessage handler.
       * 4. Send the security context.
       * 5. Wait for session_context_ack.
       * 6. Stream PCM16 chunks through that socket.
       *
       * This is important because the central onmessage handler is what
       * updates streams -> selected -> the live Hospitality result cards.
       */
      rotateRiskStream()

      const ws = await waitForRiskWebSocket()

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error(
          'Risk WebSocket is not open after upload stream rotation'
        )
      }

      const sector =
        ['finance', 'retail', 'hospitality', 'entertainment'].includes(activePage)
          ? activePage
          : selectedSectorRef.current || 'finance'

      const defaultScenarios = {
        finance: 'high_value_transfer',
        retail: 'order_modification',
        hospitality: 'guest_verification',
        entertainment: 'dubbing_verification',
      }
      const scenario =
        selectedScenarioRef.current && selectedScenarioRef.current !== 'routine_support'
          ? selectedScenarioRef.current
          : defaultScenarios[sector] || 'routine_support'

      const contextPayload = {
        type: 'session_context',
        sector,
        scenario,
        transaction_amount_inr:
          sector === 'finance'
            ? Number.parseFloat(transactionAmountRef.current) || 525000
            : null,
      }

      const contextAck = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          contextAckResolverRef.current = null
          reject(
            new Error(
              'Timed out waiting for security context ACK'
            )
          )
        }, 10000)

        contextAckResolverRef.current = (data) => {
          clearTimeout(timeout)
          resolve(data)
        }
      })

      ws.send(JSON.stringify(contextPayload))

      const acknowledgedContext = await contextAck

      if (!acknowledgedContext) {
        throw new Error(
          'Security context was not acknowledged'
        )
      }

      const acknowledgedStreamId =
        acknowledgedContext.stream_id ||
        uniqueStreamIdRef.current

      const acknowledgedSector =
        acknowledgedContext.sector ||
        sector

      const acknowledgedScenario =
        acknowledgedContext.scenario ||
        scenario

      activeSessionRef.current = {
        streamId: acknowledgedStreamId,
        sector: acknowledgedSector,
        scenario: acknowledgedScenario,
      }

      setSelectedSector(acknowledgedSector)
      selectedSectorRef.current = acknowledgedSector
      setActiveStreamId(acknowledgedStreamId)
      setContextConfigured(true)
      setMicStatus('Security Context Ready')

      const playbackUrl = URL.createObjectURL(file)
      const playbackAudio = new Audio(playbackUrl)

      playbackAudio.onplay = () => {
        setIsFilePlaying(true)
      }

      playbackAudio.onpause = () => {
        setIsFilePlaying(false)
      }

      playbackAudio.onended = () => {
        setIsFilePlaying(false)
        URL.revokeObjectURL(playbackUrl)
      }

      filePlaybackRef.current = playbackAudio

      setFileName(file.name)
      setInputMode('file')
      setMicStatus(`Preparing: ${file.name}`)

      const arrayBuffer = await file.arrayBuffer()

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext

      const audioCtx = new AudioContextClass()

      const decodedAudio =
        await audioCtx.decodeAudioData(arrayBuffer)

      const channelData =
        decodedAudio.getChannelData(0)

      const sampleRate =
        decodedAudio.sampleRate

      const resampled =
        resampleTo16k(channelData, sampleRate)

      const pcm16 =
        float32ToPCM16(resampled)

      try {
        await playbackAudio.play()
      } catch (playbackError) {
        console.warn(
          'Uploaded audio playback could not start:',
          playbackError
        )
      }

      const chunkSize = 8000
      let offset = 0

      setMicStatus(`Streaming File: ${file.name}`)
      setMicLevel(0)
      fileStreamActiveRef.current = true

      fileIntervalRef.current = setInterval(() => {
        if (!fileStreamActiveRef.current) {
          clearInterval(fileIntervalRef.current)
          fileIntervalRef.current = null
          return
        }

        if (offset >= pcm16.length) {
          fileStreamActiveRef.current = false

          clearInterval(fileIntervalRef.current)
          fileIntervalRef.current = null

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'audio_end',
              })
            )
          }

          setMicLevel(0)
          setMicStatus(`Completed: ${file.name}`)
          return
        }

        if (ws.readyState !== WebSocket.OPEN) {
          fileStreamActiveRef.current = false

          clearInterval(fileIntervalRef.current)
          fileIntervalRef.current = null

          setMicLevel(0)
          setMicStatus('Audio File Connection Lost')
          return
        }

        const end = Math.min(
          offset + chunkSize,
          pcm16.length
        )

        const chunk = pcm16.slice(offset, end)

        ws.send(chunk.buffer)

        offset = end

        const level =
          chunk.length > 0
            ? Math.min(
                1,
                Math.sqrt(
                  chunk.reduce(
                    (sum, sample) =>
                      sum + sample * sample,
                    0
                  ) / chunk.length
                ) / 32768
              )
            : 0

        setMicLevel(level)
      }, 250)

    } catch (error) {
      console.error(
        'Audio file streaming failed:',
        error
      )

      fileStreamActiveRef.current = false

      if (fileIntervalRef.current) {
        clearInterval(fileIntervalRef.current)
        fileIntervalRef.current = null
      }

      setMicLevel(0)
      setMicStatus('Audio File Error')

      alert(
        error?.message ||
        'Failed to process audio file. Please use a valid WAV/MP3 file.'
      )
    } finally {
      event.target.value = ''
    }
  }

  const rotateRiskStream = () => {
    /*
     * This is a NEW security session.
     * Clear terminal state before creating the new stream.
     */
    securityTerminatedRef.current = false
    setSecurityTerminated(false)
    setEscalatedIncident(null)

    /*
     * Generate the authoritative stream ID FIRST.
     */
    const newStreamId = createStreamId()
    uniqueStreamIdRef.current = newStreamId

    /*
     * Tell the old socket's onclose handler that this close
     * is intentional and that it must reconnect using the ID
     * above rather than generating another one.
     */
    streamRotationRef.current = true

    activeSessionRef.current = null
    contextAckResolverRef.current = null

    if (fileIntervalRef.current) {
      clearInterval(fileIntervalRef.current)
      fileIntervalRef.current = null
    }

    if (filePlaybackRef.current) {
      try {
        filePlaybackRef.current.pause()
        filePlaybackRef.current.currentTime = 0
      } catch (e) {}
      filePlaybackRef.current = null
    }

    setIsFilePlaying(false)
    fileStreamActiveRef.current = false

    setMicLevel(0)

    const oldWs = wsRef.current

    if (oldWs) {
      try {
        if (
          oldWs.readyState === WebSocket.OPEN ||
          oldWs.readyState === WebSocket.CONNECTING
        ) {
          oldWs.close()
        }
      } catch (error) {
        console.warn(
          'Failed to close previous Risk WebSocket:',
          error
        )
      }
    }

    return newStreamId
  }

  const waitForRiskWebSocket = () => {
    const currentWs = wsRef.current

    if (
      currentWs &&
      currentWs.readyState === WebSocket.OPEN
    ) {
      return Promise.resolve(currentWs)
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (wsConnectResolverRef.current === resolve) {
          wsConnectResolverRef.current = null
          wsConnectRejecterRef.current = null

          reject(
            new Error(
              'Timed out waiting for Risk WebSocket connection'
            )
          )
        }
      }, 10000)

      wsConnectResolverRef.current = (ws) => {
        clearTimeout(timeout)
        resolve(ws)
      }

      wsConnectRejecterRef.current = (error) => {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }

  const streamAudioFromUrl = async (
    url,
    sector,
    scenario,
    transactionAmount = null
  ) => {
    try {
      stopMicrophoneStream()

      // Every sample gets a completely fresh Risk Engine stream.
      rotateRiskStream()

      // The existing WebSocket lifecycle automatically reconnects
      // using the newly generated stream ID.
      const ws = await waitForRiskWebSocket()

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error(
          'Risk WebSocket is not open after stream rotation'
        )
      }

      // 1. Configure the sector-bound security context.
      const contextPayload = {
        type: 'session_context',
        sector: sector,
        scenario: scenario,
        transaction_amount_inr:
          transactionAmount ? Number(transactionAmount) : null,
      }

      const contextAck = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (contextAckResolverRef.current) {
            contextAckResolverRef.current = null
          }
          reject(
            new Error(
              'Timed out waiting for security context acknowledgement'
            )
          )
        }, 5000)

        contextAckResolverRef.current = (data) => {
          clearTimeout(timeout)
          resolve(data)
        }

        ws.send(JSON.stringify(contextPayload))
      })

      const acknowledgedContext = await contextAck

      console.log(
        'Security context acknowledged before audio:',
        acknowledgedContext
      )

      setSelectedSector(sector)
      setSelectedScenario(scenario)
      selectedScenarioRef.current = scenario
      setContextConfigured(true)

      // Set activeSessionRef so that incoming live detection results
      // are matched and routed to this sector page
      activeSessionRef.current = {
        streamId: uniqueStreamIdRef.current,
        sector: sector,
        scenario: scenario,
      }
      setActiveStreamId(uniqueStreamIdRef.current)

      const fileDisplayName = url.split('/').pop()
      setFileName(fileDisplayName)
      setInputMode('file')
      setMicStatus(`Streaming ${sector.toUpperCase()}: ${fileDisplayName}`)

      const playbackAudio = new Audio(url)
      playbackAudio.preload = 'auto'
      playbackAudio.volume = 1.0

      playbackAudio.onplay = () => setIsFilePlaying(true)
      playbackAudio.onpause = () => setIsFilePlaying(false)
      playbackAudio.onended = () => {
        setIsFilePlaying(false)
        setMicLevel(0)
      }

      filePlaybackRef.current = playbackAudio

      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()

      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioContextClass()

      const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer)
      const channelData = decodedAudio.getChannelData(0)
      const sampleRate = decodedAudio.sampleRate
      const resampled = resampleTo16k(channelData, sampleRate)
      const pcm16 = float32ToPCM16(resampled)

      try {
        await playbackAudio.play()
      } catch (playbackError) {
        console.warn('Scenario audio playback could not start:', playbackError)
      }

      const chunkSize = 8000
      let offset = 0
      fileStreamActiveRef.current = true

      fileIntervalRef.current = setInterval(() => {
        if (!fileStreamActiveRef.current) {
          clearInterval(fileIntervalRef.current)
          fileIntervalRef.current = null
          return
        }

        if (offset >= pcm16.length) {
          fileStreamActiveRef.current = false
          clearInterval(fileIntervalRef.current)
          fileIntervalRef.current = null

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'audio_end' }))
          }

          setMicLevel(0)
          setMicStatus('Stream Complete')

          audioCtx.close().catch((error) => {
            console.warn(
              'AudioContext close failed:',
              error
            )
          })

          return
        }

        const end = Math.min(offset + chunkSize, pcm16.length)
        const chunk = pcm16.slice(offset, end)
        ws.send(chunk.buffer)

        const chunkRms = calculateRMS(
          resampled.subarray(offset, end)
        )
        setMicLevel(Math.min(Math.round(chunkRms * 200), 100))
        offset = end
      }, 500)

    } catch (error) {
      console.error('Failed to stream audio URL:', error)
      setMicStatus('Audio Stream Error')
    }
  }

  const acknowledgeAlert = () => {
    if (fileIntervalRef.current) {
      console.warn(
        'ACKNOWLEDGE ALERT: stopping active file stream'
      )

      clearInterval(fileIntervalRef.current)
      fileIntervalRef.current = null

      setMicLevel(0)
      setMicStatus('Stream frozen after alert')
    }

    // NEW: Save the incident to be displayed in the Admin panel
    setEscalatedIncident({
      ...selected,
      streamId: activeStreamId
    })

    setStreams((prev) => ({
      ...prev,
      [activeStreamId]: {
        ...prev[activeStreamId],
        alert_triggered: false
      }
    }))

    // NEW: Switch to the admin page immediately
    setActivePage('admin')
  }

  // NEW: Handler for the Admin dashboard to clear the alert
  const handleResolveIncident = (actionType) => {
    console.log(`Admin took action: ${actionType}`)
    setEscalatedIncident(null)
  }

  const summary = useMemo(() => {
    const streamList = Object.values(streams)

    const backendStreams = streamList.filter(
      (stream) =>
        stream.ai_probability !== undefined ||
        stream.rolling_score !== undefined ||
        stream.risk_level !== undefined
    )

    return {
      total: streamList.length,
      high: backendStreams.filter(
        (stream) => stream.risk_level === 'HIGH'
      ).length,
      active: backendStreams.filter(
        (stream) => stream.speech_detected === true
      ).length
    }
  }, [streams])

  // =========================================================
  // RENDER LOGIC
  // =========================================================

  // 1. Show Landing Page if not authenticated
  if (!isAuthenticated) {
    return <Hero onLogin={() => setIsAuthenticated(true)} />
  }

  // 2. Show Dashboard if authenticated
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg-page)] font-sans text-[var(--text-primary)] md:flex-row">
      <aside
        className={[
          'relative z-20 flex w-full shrink-0 flex-col border-b border-[var(--border-default)]',
          'bg-[var(--bg-surface)] md:h-screen md:border-b-0 md:border-r',
          'transition-[width] duration-300 ease-out',
          sidebarCollapsed ? 'md:w-[76px]' : 'md:w-[76px] lg:w-[236px]',
        ].join(' ')}
      >
        <div
          className={[
            'relative flex h-16 items-center border-b border-[var(--border-default)] px-4',
            sidebarCollapsed ? 'justify-center' : 'justify-between',
          ].join(' ')}
        >
          <div className="flex min-w-0 items-center">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--accent-primary-muted)]">
              <ShieldCheck
                size={18}
                className="text-[var(--accent-primary-soft)]"
              />
            </div>

            {!sidebarCollapsed && (
              <div className="ml-3 min-w-0">
                <p className="truncate text-sm font-black tracking-tight text-[var(--text-primary)]">
                  BoloSafe-AI
                </p>
                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Security Console
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute -right-3 top-1/2 z-40 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)] shadow-lg transition hover:border-[var(--accent-primary)]/50 hover:text-[var(--text-primary)] lg:flex"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>
        </div>

        <nav className="flex flex-1 flex-row gap-1 overflow-x-auto p-3 md:flex-col md:overflow-x-visible md:overflow-y-auto">
          {[
            { id: 'overview', label: 'Live Dashboard', icon: LayoutDashboard },
            { id: 'finance', label: 'Financial Services', icon: Landmark },
            { id: 'retail', label: 'Retail Security', icon: ShoppingBag },
            { id: 'hospitality', label: 'Hospitality', icon: Hotel },
            { id: 'entertainment', label: 'Entertainment', icon: Film },
            { id: 'adversarial', label: 'Adversarial Testing', icon: ShieldAlert },
            { id: 'analytics', label: 'Deep Analytics', icon: BarChart3 },
            { id: 'history', label: 'Incident History', icon: HistoryIcon },
            { id: 'security', label: 'Security Report', icon: ShieldCheck },
            { id: 'how', label: 'Architecture', icon: CircleHelp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActivePage(id)}
              title={sidebarCollapsed ? label : undefined}
              className={[
                'group flex shrink-0 items-center rounded-lg border py-2.5 text-left text-xs font-semibold',
                'transition-all duration-200 md:w-full',
                sidebarCollapsed
                  ? 'justify-center px-0'
                  : 'justify-start gap-3 px-3',
                activePage === id
                  ? 'border-[var(--accent-primary)]/25 bg-[var(--accent-primary-muted)] text-[var(--accent-primary-soft)]'
                  : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
              ].join(' ')}
            >
              <Icon
                size={18}
                strokeWidth={activePage === id ? 2.1 : 1.8}
              />
              {!sidebarCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-[var(--border-default)] p-3">
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            title={sidebarCollapsed ? 'Return to Home' : undefined}
            className={[
              'flex w-full items-center rounded-lg border border-transparent py-2.5 text-xs font-semibold',
              sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3',
              'text-[var(--text-muted)] transition-colors hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Return to Home</span>}
          </button>

          <button
            type="button"
            onClick={() => setActivePage('admin')}
            title={sidebarCollapsed ? 'Administration' : undefined}
            className={[
              'mt-1 flex w-full items-center rounded-lg border py-2.5 text-left transition-colors',
              sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3',
              activePage === 'admin'
                ? 'border-[var(--accent-primary)]/25 bg-[var(--accent-primary-muted)]'
                : 'border-transparent hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)]',
            ].join(' ')}
          >
            <div className="relative flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--bg-hover)] text-[var(--text-secondary)]">
              <UserCheck size={16} />
              <span className="absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full bg-[var(--status-success)]" />
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  Controller
                </p>
                <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">
                  Admin access
                </p>
              </div>
            )}
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex-1 overflow-y-auto md:h-screen">

        <div className="w-full px-5 py-4 lg:px-8 lg:py-5 xl:px-10">
          <ConsoleTopBar
            activePage={activePage}
            isBackendOnline={isBackendOnline}
            isConnected={isConnected}
          />

          <div className="pb-8">

          {activePage === 'overview' && (
            <Overview
              micStatus={micStatus}
              inputMode={inputMode}
              micLevel={micLevel}
              isLiveMonitoring={isLiveMonitoring}
              selected={selected}
              activeStreamId={activeStreamId}
              securityTerminated={securityTerminated}
              showInspector={showInspector}
              summary={summary}
              streams={streams}
              startMicrophoneStream={startMicrophoneStream}
              stopMicrophoneStream={stopMicrophoneStream}
              toggleLiveMonitor={toggleLiveMonitor}
              handleFileUpload={handleFileUpload}
              acknowledgeAlert={acknowledgeAlert}
              onViewSectorResponse={() => openSectorDetails(selected)}
              setActiveStreamId={setActiveStreamId}
              selectedSector={selectedSector}
              setSelectedSector={(value) => {
                setSelectedSector(value)
                selectedSectorRef.current = value

                const nextScenario =
                  sectorOptions[value]?.scenarios?.[0]?.value ||
                  'high_value_transfer'

                setSelectedScenario(nextScenario)
                selectedScenarioRef.current = nextScenario

                // A sector switch always starts a fresh UI/security session.
                activeSessionRef.current = null
                securityTerminatedRef.current = false

                setActivePage('overview')
                setSecurityTerminated(false)
                setContextConfigured(false)
                setActiveStreamId(null)
                setMicLevel(0)
                setMicStatus('Select Security Context')
              }}
              sectorOptions={sectorOptions}
              transactionAmountInr={transactionAmountInr}
              setTransactionAmountInr={(value) => {
                setTransactionAmountInr(value)
                transactionAmountRef.current = value
              }}
              selectedScenario={selectedScenario}
              setSelectedScenario={(value) => {
                setSelectedScenario(value)
                selectedScenarioRef.current = value
              }}
              contextConfigured={contextConfigured}
              configureSecurityContext={configureSecurityContext}
              isFilePlaying={isFilePlaying}
              toggleFilePlayback={toggleFilePlayback}
              fileName={fileName}
              transcript={transcript}
              transcriptLanguage={transcriptLanguage}
            />
          )}

          {activePage === 'finance' && (
            <FinanceSecurity
              selected={financeSelected || {}}
              isConnected={isConnected}
              streamAudioFromUrl={streamAudioFromUrl}
              startMicrophoneStream={startMicrophoneStream}
              stopMicrophoneStream={stopMicrophoneStream}
              handleFileUpload={handleFileUpload}
              micStatus={micStatus}
              micLevel={micLevel}
              isStreaming={fileStreamActiveRef.current || isFilePlaying}
            />
          )}

          {activePage === 'retail' && (
            <RetailSecurity
              selected={retailSelected || {}}
              isConnected={isConnected}
              streamAudioFromUrl={streamAudioFromUrl}
              startMicrophoneStream={startMicrophoneStream}
              stopMicrophoneStream={stopMicrophoneStream}
              handleFileUpload={handleFileUpload}
              micStatus={micStatus}
              micLevel={micLevel}
              isStreaming={fileStreamActiveRef.current || isFilePlaying}
            />
          )}

          {activePage === 'hospitality' && (
            <HospitalitySecurity
              selected={hospitalitySelected || {}}
              isConnected={isConnected}
              streamAudioFromUrl={streamAudioFromUrl}
              startMicrophoneStream={startMicrophoneStream}
              stopMicrophoneStream={stopMicrophoneStream}
              handleFileUpload={handleFileUpload}
              micStatus={micStatus}
              micLevel={micLevel}
              isStreaming={fileStreamActiveRef.current || isFilePlaying}
            />
          )}

          {activePage === 'entertainment' && (
            <EntertainmentSecurity
              selected={entertainmentSelected || {}}
              isConnected={isConnected}
              streamAudioFromUrl={streamAudioFromUrl}
              startMicrophoneStream={startMicrophoneStream}
              stopMicrophoneStream={stopMicrophoneStream}
              handleFileUpload={handleFileUpload}
              micStatus={micStatus}
              micLevel={micLevel}
              isStreaming={fileStreamActiveRef.current || isFilePlaying}
            />
          )}
{activePage === 'adversarial' && (
            <div className="w-full max-w-[1600px] mx-auto">
              <AdversarialRobustness />
            </div>
          )}
          {activePage === 'how' && <Architecture />}
          
          {/* UPDATED ADMIN COMPONENT W/ NEW PROPS */}
          {activePage === 'admin' && (
            <Admin 
              escalatedIncident={escalatedIncident}
              onResolveIncident={handleResolveIncident}
              selected={selected} activeStreamId={activeStreamId}
            />
          )}

          {activePage === 'analytics' && (
            <Analytics
              streams={streams}
              activeStreamId={activeStreamId}
              setActiveStreamId={setActiveStreamId}
              analytics={analytics}
              selected={selected}
            />
          )}

          {activePage === 'history' && (
            <History
              streams={streams}
              activeStreamId={activeStreamId}
              setActiveStreamId={setActiveStreamId}
              currentHistory={currentHistory}
            />
          )}

          {activePage === 'security' && (
            <SecurityReport
              streams={streams}
              selected={selected}
            />
          )}


          </div>
        </div>
      </div>
    </main>
  )
}

// 2. Wrap the entire application components/routes inside the providers
export default function App() {
  return (
    <ThemeProvider>
      <SecurityProvider>
        <MainApp />
      </SecurityProvider>
    </ThemeProvider>
  )
}
