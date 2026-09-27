import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  AudioWaveform,
  BrainCircuit,
  CheckCircle2,
  Database,
  Fingerprint,
  Film,
  Hotel,
  Landmark,
  Mic2,
  Network,
  Play,
  Shield,
  ShieldAlert,
  ShoppingBag,
  Waves,
  Zap,
} from 'lucide-react'

// Strict global color tokens as specified
const COLORS = {
  bg: '#050817',
  secondary: '#080C1D',
  surface: '#0C1228',
  elevated: '#101936',
  indigo: '#5B5BF7',
  indigoBright: '#7370FF',
  softViolet: '#8A7CFF',
  securityGreen: '#00D9A5',
  primaryText: '#F7F8FF',
  secondaryText: '#A4ADCA',
  mutedText: '#66708F',
  border: 'rgba(120, 130, 255, 0.14)',
  borderBright: 'rgba(120, 130, 255, 0.32)',
  finance: '#F43F8A',
  retail: '#F59E0B',
  hospitality: '#00D9A5',
  entertainment: '#8B5CF6',
}

const sectors = [
  {
    id: 'finance',
    name: 'Finance',
    threat: 'Wire Fraud',
    eyebrow: 'FINANCE',
    description:
      'Stop synthetic voices before they authorize high-value transfers.',
    response: 'Halt wire · Video-KYC',
    accent: COLORS.finance,
    icon: Landmark,
    image: '/assets/sectors/finance.jpg',
  },
  {
    id: 'retail',
    name: 'Retail',
    threat: 'Order Takeover',
    eyebrow: 'RETAIL',
    description:
      'Detect voice-led account, refund, order, and address changes.',
    response: 'Hold order · OTP',
    accent: COLORS.retail,
    icon: ShoppingBag,
    image: '/assets/sectors/retail.jpg',
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    threat: 'Guest Fraud',
    eyebrow: 'HOSPITALITY',
    description:
      'Protect reservations, VIP access, and guest-account actions.',
    response: 'Hold booking · Verify',
    accent: COLORS.hospitality,
    icon: Hotel,
    image: '/assets/sectors/hospitality.jpg',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    threat: 'Voice Cloning',
    eyebrow: 'ENTERTAINMENT',
    description:
      'Protect artists, identities, media, and voice provenance.',
    response: 'Verify artist · Flag',
    accent: COLORS.entertainment,
    icon: Film,
    image: '/assets/sectors/entertainment.jpg',
  },
]

const pipeline = [
  ['01', 'Voice Ingestion', 'Live conversation stream', Mic2],
  ['02', 'Signal Processing', 'PCM + neural VAD', Waves],
  ['03', 'Feature Intelligence', '58-D acoustic DSP', AudioWaveform],
  ['04', 'AI Detection', 'Ensemble neural models', BrainCircuit],
  ['05', 'Risk Engine', 'Rolling security state', ShieldAlert],
  ['06', 'Action & Governance', 'Sector-specific response', Zap],
]

const capabilities = [
  [
    'Acoustic Intelligence',
    '58-dimensional analysis across pitch, rhythm, micro-timing, and spectral behavior to expose synthetic speech synthesis anomalies.',
    AudioWaveform,
    COLORS.indigoBright,
  ],
  [
    'Voice Identity',
    'Speaker verification adds cryptographic biometric identity evidence beyond single-window synthetic probability scores.',
    Fingerprint,
    COLORS.hospitality,
  ],
  [
    'Risk Reasoning',
    'Rolling risk assessment and multi-window temporal coherence eliminate false triggers and stabilize critical authorization decisions.',
    ShieldAlert,
    COLORS.retail,
  ],
  [
    'Actionable Response',
    'Automated enterprise policy governance converts threat detections into hold, step-up verification, escalation, or allow actions.',
    Zap,
    COLORS.entertainment,
  ],
]

const easeSmooth = [0.16, 1, 0.3, 1]

const reveal = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.75,
      ease: easeSmooth,
    },
  },
}

function SectionDivider() {
  return (
    <div className="relative mx-auto max-w-[1360px] px-6 lg:px-10">
      <div className="relative h-[1px] w-full overflow-hidden bg-gradient-to-r from-transparent via-[rgba(120,130,255,0.18)] to-transparent">
        <motion.div
          className="absolute top-0 h-[1px] w-28 bg-gradient-to-r from-transparent via-[#7370FF] to-transparent"
          animate={{ x: ['-100%', '1360%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(120,130,255,0.25)] bg-[rgba(91,91,247,0.12)] shadow-[0_0_20px_rgba(91,91,247,0.18)]"
      >
        <Shield size={20} className="text-[#7370FF]" />
      </div>

      <div>
        <div className="text-[18px] font-extrabold tracking-tight text-[#F7F8FF]">
          BoloSafe<span className="text-[#7370FF]">-AI</span>
        </div>

        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7370FF]">
          Real-time voice security
        </div>
      </div>
    </div>
  )
}

function GlassButton({ children, primary = false, onClick, className = '' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{
        y: -2,
        boxShadow: primary
          ? '0 12px 30px rgba(91,91,247,0.35)'
          : '0 12px 30px rgba(120,130,255,0.12)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={[
        'inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5',
        'text-sm font-semibold transition-all duration-300 cursor-pointer',
        primary
          ? 'bg-gradient-to-r from-[#5B5BF7] to-[#7370FF] text-[#F7F8FF] border border-[#7370FF]/50 shadow-[0_4px_20px_rgba(91,91,247,0.25)] hover:brightness-110'
          : 'border border-[rgba(120,130,255,0.18)] bg-[#0C1228]/80 text-[#F7F8FF] hover:border-[#7370FF]/50 hover:bg-[#5B5BF7]/10 backdrop-blur-md',
        className,
      ].join(' ')}
    >
      {children}
    </motion.button>
  )
}

function SectorCard({ sector, active, onClick }) {
  const Icon = sector.icon

  const risk =
    sector.id === 'hospitality'
      ? 'LOW'
      : sector.id === 'retail'
        ? 'MEDIUM'
        : 'HIGH'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{
        y: -6,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 340,
        damping: 24,
      }}
      className={`sector-reference-card ${active ? 'is-active' : ''}`}
      style={{
        '--sector-accent': sector.accent,
      }}
    >
      <img
        src={sector.image}
        alt={`${sector.name} ${sector.threat}`}
        className="sector-reference-image"
      />

      <div className="sector-reference-image-overlay" />

      <div className="sector-reference-top-glow" />

      <div className="sector-reference-content">
        <div className="sector-reference-meta">
          <div className="sector-reference-icon">
            <Icon size={16} strokeWidth={1.8} />
          </div>

          <div className="sector-reference-label">
            <div>{sector.eyebrow}</div>
            <span>Sector attack surface</span>
          </div>

          <span
            className="sector-reference-risk"
            style={{
              color: sector.accent,
              borderColor: `${sector.accent}40`,
              background: `${sector.accent}15`,
            }}
          >
            {risk}
          </span>
        </div>

        <div className="sector-reference-bottom">
          <div className="sector-reference-name">
            {sector.name}
          </div>

          <div className="sector-reference-title">
            {sector.threat}
          </div>

          <p className="sector-reference-description">
            {sector.description}
          </p>

          <div className="sector-reference-explore">
            Explore
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </motion.button>
  )
}

function HeroEngine() {
  const attacks = [
    {
      sector: 'Finance',
      threat: 'Wire Fraud',
      action: 'Halt transfer',
      color: COLORS.finance,
      icon: Landmark,
      image: '/assets/sectors/finance.jpg',
    },
    {
      sector: 'Retail',
      threat: 'Order Takeover',
      action: 'Hold order',
      color: COLORS.retail,
      icon: ShoppingBag,
      image: '/assets/sectors/retail.jpg',
    },
    {
      sector: 'Hospitality',
      threat: 'Guest Fraud',
      action: 'Verify guest',
      color: COLORS.hospitality,
      icon: Hotel,
      image: '/assets/sectors/hospitality.jpg',
    },
    {
      sector: 'Entertainment',
      threat: 'Voice Cloning',
      action: 'Stop provenance',
      color: COLORS.entertainment,
      icon: Film,
      image: '/assets/sectors/entertainment.jpg',
    },
  ]

  return (
    <div className="final-hero-visual">
      {/* ambient volumetric indigo movement */}
      <motion.div
        className="final-hero-ambient"
        animate={{
          opacity: [0.6, 0.9, 0.6],
          scale: [0.98, 1.03, 0.98],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* continuous dynamic waveform */}
      <svg
        className="final-hero-wave"
        viewBox="0 0 1100 420"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="finalHeroWave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5B5BF7" stopOpacity="0" />
            <stop offset="20%" stopColor="#5B5BF7" />
            <stop offset="50%" stopColor="#7370FF" />
            <stop offset="75%" stopColor="#8A7CFF" />
            <stop offset="100%" stopColor="#00D9A5" stopOpacity="0" />
          </linearGradient>

          <filter id="finalWaveBlur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <path
          d="M0 258 C72 220 110 304 176 267 S286 145 362 222 S470 332 548 251 S660 136 740 220 S852 327 930 244 S1018 182 1100 220"
          fill="none"
          stroke="url(#finalHeroWave)"
          strokeWidth="20"
          opacity=".28"
          filter="url(#finalWaveBlur)"
        />

        <motion.path
          d="M0 258 C72 220 110 304 176 267 S286 145 362 222 S470 332 548 251 S660 136 740 220 S852 327 930 244 S1018 182 1100 220"
          fill="none"
          stroke="url(#finalHeroWave)"
          strokeWidth="3"
          strokeDasharray="16 12"
          animate={{ strokeDashoffset: [0, -112] }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <path
          d="M0 270 C78 232 116 316 184 279 S292 157 370 234 S478 344 556 263 S668 148 748 232 S860 339 938 256 S1026 194 1100 232"
          fill="none"
          stroke="#A4ADCA"
          strokeWidth="1"
          opacity=".35"
        />
      </svg>

      {/* faint floating technical grid particles */}
      <div className="final-hero-particles">
        {Array.from({ length: 36 }).map((_, i) => (
          <motion.span
            key={i}
            style={{
              left: `${(i * 67 + 8) % 100}%`,
              top: `${(i * 43 + 5) % 94}%`,
              width: i % 7 === 0 ? 3.5 : 2,
              height: i % 7 === 0 ? 3.5 : 2,
            }}
            animate={{
              opacity: [0.1, i % 7 === 0 ? 0.6 : 0.3, 0.1],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3.5 + (i % 5) * 0.4,
              repeat: Infinity,
              delay: (i % 8) * 0.2,
            }}
          />
        ))}
      </div>

      {/* Live Voice Input Card */}
      <motion.div
        className="final-hero-live-card"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="final-hero-card-head">
          <span>LIVE VOICE INPUT</span>
          <b>ON AIR</b>
        </div>

        <div className="final-hero-mini-wave">
          {Array.from({ length: 22 }).map((_, i) => (
            <motion.span
              key={i}
              animate={{
                height: [
                  6 + (i % 3) * 4,
                  15 + (i % 5) * 5,
                  8 + (i % 4) * 3,
                ],
              }}
              transition={{
                duration: 1.2 + (i % 4) * 0.12,
                repeat: Infinity,
                delay: i * 0.025,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="final-hero-micro-labels">
          <span>PCM16</span>
          <span>VAD</span>
          <span className="text-[#00D9A5]">ANALYZING</span>
        </div>
      </motion.div>

      {/* Neural Guard Core */}
      <motion.div
        className="final-hero-core"
        animate={{
          y: [0, -4, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* atmospheric breathing aura */}
        <motion.div
          className="ng-aura"
          animate={{
            scale: [0.94, 1.08, 0.94],
            opacity: [0.45, 0.75, 0.45],
          }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* rotating HUD rings */}
        <motion.div
          className="ng-orbit ng-orbit-outer"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <motion.div
          className="ng-orbit ng-orbit-middle"
          animate={{ rotate: -360 }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <motion.div
          className="ng-orbit ng-orbit-inner"
          animate={{ rotate: 360 }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* radar scanning sweep */}
        <motion.div
          className="ng-scan"
          animate={{ rotate: 360 }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* pulse shell */}
        <motion.div
          className="ng-pulse ng-pulse-a"
          animate={{
            scale: [0.75, 1.3],
            opacity: [0.55, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        {/* core shell */}
        <div className="ng-core-shell">
          <motion.div
            className="ng-hud-ring"
            animate={{ rotate: -360 }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <motion.div
            className="ng-core-light"
            animate={{
              scale: [0.92, 1.08, 0.92],
              opacity: [0.45, 0.85, 0.45],
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="final-hero-shield ng-shield"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 12px rgba(115,112,255,.15)',
                '0 0 32px rgba(115,112,255,.35)',
                '0 0 12px rgba(115,112,255,.15)',
              ],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ShieldAlert size={28} strokeWidth={1.8} className="text-[#7370FF]" />
          </motion.div>

          <div className="final-hero-brand ng-brand">
            BOLOSAFE-AI
          </div>

          <div className="final-hero-neural ng-neural">
            NEURAL GUARD
          </div>

          <div className="final-hero-core-status ng-status flex items-center justify-center gap-1.5 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D9A5] shadow-[0_0_8px_#00D9A5]" />
            LIVE ANALYSIS
          </div>
        </div>

        <span className="ng-tick tick-1" />
        <span className="ng-tick tick-2" />
        <span className="ng-tick tick-3" />
        <span className="ng-tick tick-4" />
      </motion.div>

      {/* Signal connections and data paths */}
      <svg
        className="final-hero-connections"
        viewBox="0 0 1100 470"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5B5BF7" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#7370FF" />
            <stop offset="100%" stopColor="#8A7CFF" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Incoming streams from voice input to neural guard */}
        <path
          d="M170 230 C280 230 420 250 510 270"
          stroke="url(#beamGrad)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 8"
        />

        {/* Moving packet on incoming path */}
        <circle r="3" fill="#7370FF">
          <animateMotion
            dur="2.5s"
            repeatCount="indefinite"
            path="M170 230 C280 230 420 250 510 270"
          />
        </circle>

        {/* Primary sector attack paths */}
        <motion.path
          className="sector-link sector-link-finance"
          d="M570 287 C720 240 850 90 1040 52"
          stroke={COLORS.finance}
          strokeWidth="2"
          fill="none"
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.path
          className="sector-link sector-link-retail"
          d="M570 287 C720 270 850 165 1040 152"
          stroke={COLORS.retail}
          strokeWidth="2"
          fill="none"
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.path
          className="sector-link sector-link-hospitality"
          d="M570 287 C720 295 850 255 1040 252"
          stroke={COLORS.hospitality}
          strokeWidth="2"
          fill="none"
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 4.1, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.path
          className="sector-link sector-link-entertainment"
          d="M570 287 C720 325 850 355 1040 352"
          stroke={COLORS.entertainment}
          strokeWidth="2"
          fill="none"
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Flowing energy particles towards sector cards */}
        <circle r="3.5" fill={COLORS.finance}>
          <animateMotion
            dur="3.2s"
            repeatCount="indefinite"
            path="M570 287 C720 240 850 90 1040 52"
          />
        </circle>

        <circle r="3.5" fill={COLORS.retail}>
          <animateMotion
            dur="3.6s"
            begin="0.4s"
            repeatCount="indefinite"
            path="M570 287 C720 270 850 165 1040 152"
          />
        </circle>

        <circle r="3.5" fill={COLORS.hospitality}>
          <animateMotion
            dur="3.8s"
            begin="0.8s"
            repeatCount="indefinite"
            path="M570 287 C720 295 850 255 1040 252"
          />
        </circle>

        <circle r="3.5" fill={COLORS.entertainment}>
          <animateMotion
            dur="4.2s"
            begin="1.2s"
            repeatCount="indefinite"
            path="M570 287 C720 325 850 355 1040 352"
          />
        </circle>
      </svg>

      {/* Sector Attack Cards on Right */}
      <div className="final-hero-attacks">
        <div className="final-hero-attack-label">
          SECTOR ATTACK SURFACES
        </div>

        {attacks.map((attack, i) => {
          const Icon = attack.icon

          return (
            <motion.div
              key={attack.sector}
              className={`final-hero-attack-card attack-${i + 1}`}
              style={{
                '--attack-color': attack.color,
                '--attack-image': `url(${attack.image})`,
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, i % 2 === 0 ? -2 : 2, 0],
              }}
              transition={{
                opacity: { duration: 0.5, delay: i * 0.08 },
                x: { duration: 0.5, delay: i * 0.08 },
                y: {
                  duration: 4 + i * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              whileHover={{
                y: -4,
                scale: 1.02,
              }}
            >
              <img src={attack.image} alt="" />

              <div className="final-hero-attack-image-layer" />

              <div className="final-hero-attack-content">
                <div className="final-hero-attack-icon">
                  <Icon size={18} />
                </div>

                <div className="final-hero-attack-copy">
                  <div className="final-hero-attack-sector">
                    {attack.sector}
                  </div>

                  <div className="final-hero-attack-title">
                    {attack.threat}
                  </div>

                  <div className="final-hero-attack-action">
                    {attack.action}
                  </div>

                  <div className="final-hero-attack-meta">
                    <i />
                    <span>PROTECTED</span>
                  </div>
                </div>

                <span className="final-hero-status" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* AI Ensemble Card */}
      <motion.div
        className="final-hero-ensemble"
        animate={{ y: [0, 4, 0] }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="final-hero-panel-title">
          AI ENSEMBLE
        </div>

        <div className="final-hero-ensemble-body">
          <div className="final-hero-bars">
            {[32, 48, 38, 62, 45, 68, 54].map((h, i) => (
              <motion.span
                key={i}
                style={{ height: h }}
                animate={{
                  opacity: [0.55, 1, 0.55],
                  scaleY: [0.92, 1.08, 0.92],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          <div className="final-hero-legend">
            <span><i className="pink" />Synthetic Probability</span>
            <span><i className="green" />Speaker Match</span>
            <span><i className="violet" />Behavioral Anomalies</span>
            <span><i className="blue" />Composite Risk</span>
          </div>
        </div>
      </motion.div>

      {/* Risk Analysis Card */}
      <motion.div
        className="final-hero-risk"
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="final-hero-panel-title pink-text">
          RISK ANALYSIS
        </div>

        <div className="final-hero-risk-row">
          <div>
            <div className="final-hero-risk-value">87%</div>
            <div className="final-hero-risk-caption">
              synthetic probability
            </div>
          </div>

          <motion.div
            className="final-hero-alert"
            animate={{
              boxShadow: [
                '0 0 10px rgba(244,63,138,0.2)',
                '0 0 20px rgba(244,63,138,0.5)',
                '0 0 10px rgba(244,63,138,0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ALERT
          </motion.div>
        </div>

        <div className="final-hero-risk-line">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: '87%' }}
            transition={{ duration: 1.2, ease: easeSmooth, delay: 0.4 }}
          />
        </div>
      </motion.div>
    </div>
  )
}

function PipelineNode({ item, index, active, onHover }) {
  const [number, title, subtitle, Icon] = item

  return (
    <motion.div
      variants={reveal}
      onMouseEnter={onHover}
      whileHover={{
        y: -6,
      }}
      className={[
        'pipeline-node',
        'relative overflow-visible cursor-pointer',
        active ? 'is-active ring-1 ring-[#7370FF]' : '',
      ].join(' ')}
      data-pipeline-index={index}
    >
      {/* luminous top rim */}
      <div
        className="pipeline-node__rim absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: active
            ? 'linear-gradient(90deg, #5B5BF7, #7370FF, #00D9A5)'
            : 'linear-gradient(90deg, rgba(115,112,255,0.4), transparent)',
        }}
      />

      {/* light sweep on active */}
      <motion.div
        className="pipeline-node__sweep pointer-events-none absolute left-0 top-0 h-full w-[35%]"
        animate={{
          x: ['-120%', '340%'],
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.35,
        }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <span
          className="pipeline-node__number"
          style={{ color: active ? '#F7F8FF' : '#7370FF' }}
        >
          {number}
        </span>

        <motion.div
          className="pipeline-node__icon"
          animate={{
            boxShadow: active
              ? '0 0 20px rgba(115,112,255,0.4)'
              : '0 0 0 rgba(115,112,255,0)',
          }}
          transition={{ duration: 0.3 }}
        >
          <Icon size={20} strokeWidth={1.8} />
        </motion.div>
      </div>

      <div className="relative z-10 mt-5">
        <div className="pipeline-node__title">
          {title}
        </div>

        <div className="pipeline-node__subtitle">
          {subtitle}
        </div>
      </div>

      {/* animated signal trace */}
      <div className="pipeline-node__trace">
        <motion.div
          className="pipeline-node__trace-dot"
          animate={{
            x: ['0%', '100%'],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: index * 0.25,
            ease: 'linear',
          }}
        />
      </div>

      {index < 5 && (
        <motion.div
          className="pipeline-node__arrow absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 hidden xl:flex items-center justify-center text-[#7370FF]"
          animate={{
            x: [0, 3, 0],
            opacity: active ? 1 : 0.4,
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        >
          <ArrowRight size={16} />
        </motion.div>
      )}
    </motion.div>
  )
}

function CapabilityCard({ item }) {
  const [title, description, Icon, color] = item

  return (
    <motion.div
      variants={reveal}
      whileHover={{
        y: -4,
        borderColor: 'rgba(120, 130, 255, 0.35)',
        boxShadow: `0 16px 45px rgba(0, 0, 0, 0.4), 0 0 30px ${color}18`,
      }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-[rgba(120,130,255,0.14)] bg-[#0C1228]/80 p-7 backdrop-blur-xl transition-all"
    >
      {/* accent line on left */}
      <div
        className="absolute inset-y-0 left-0 w-1 transition-all duration-300 group-hover:w-1.5"
        style={{ background: color }}
      />

      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105"
        style={{
          color,
          borderColor: `${color}40`,
          background: `${color}12`,
        }}
      >
        <Icon size={22} strokeWidth={1.8} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#F7F8FF]">
        {title}
      </h3>

      <p className="mt-2.5 text-sm leading-relaxed text-[#A4ADCA]">
        {description}
      </p>

      <div
        className="mt-6 flex items-center gap-2 text-xs font-semibold tracking-wide transition-transform duration-300 group-hover:translate-x-1"
        style={{ color }}
      >
        Learn more
        <ArrowRight size={13} />
      </div>
    </motion.div>
  )
}

export default function Hero({ onLogin, onDashboard }) {
  const [activeSector, setActiveSector] = useState('finance')
  const [activePipelineStep, setActivePipelineStep] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  // Listen to scroll to adjust navbar glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-advance pipeline active stage smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePipelineStep((prev) => (prev + 1) % 6)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="min-h-screen overflow-x-hidden text-[#F7F8FF]"
      style={{ background: COLORS.bg }}
    >
      {/* Global atmospheric background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 20%, rgba(91,91,247,0.12), transparent 42%), #050817',
          }}
        />

        <div
          className="absolute left-[10%] top-[15%] h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{ background: 'rgba(91,91,247,0.08)' }}
        />

        <div
          className="absolute right-[10%] top-[25%] h-[460px] w-[460px] rounded-full blur-[150px]"
          style={{ background: 'rgba(138,124,255,0.06)' }}
        />
      </div>

      {/* NAVBAR */}
      <header
        className={[
          'sticky top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'border-b border-[rgba(120,130,255,0.16)] bg-[#050817]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            : 'border-b border-white/[0.06] bg-[#050817]/60 backdrop-blur-md',
        ].join(' ')}
      >
        <div className="mx-auto flex h-18 max-w-[1360px] items-center justify-between px-6 lg:px-10">
          <Brand />

          <nav className="hidden items-center gap-8 md:flex">
            {[
              ['Product', 'product'],
              ['Sectors', 'sectors'],
              ['Technology', 'technology'],
              ['Security', 'security'],
              ['Pricing', 'pricing'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={`#${href}`}
                className="text-[13px] font-medium text-[#A4ADCA] transition-colors hover:text-[#F7F8FF] tracking-wide"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#00D9A5]/25 bg-[#00D9A5]/10 px-3 py-1.5 sm:flex">
              <motion.span
                className="h-2 w-2 rounded-full bg-[#00D9A5]"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#00D9A5]">
                Live Demo
              </span>
            </div>

            <GlassButton
              primary
              onClick={() => onLogin && onLogin()}
              className="py-2.5 px-5 text-xs sm:text-sm"
            >
              Free Console
              <ArrowRight size={14} />
            </GlassButton>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section
          id="product"
          className="hero-main-stage relative mx-auto px-6 lg:px-10 pt-12 pb-20 lg:pt-16 lg:pb-28"
        >
          <motion.div
            className="relative z-10 mx-auto grid max-w-[1360px] items-center gap-10 xl:grid-cols-[0.85fr_1.15fr]"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {/* Left Column */}
            <motion.div variants={reveal}>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(120,130,255,0.25)] bg-[rgba(91,91,247,0.10)] px-4 py-1.5 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#00D9A5] shadow-[0_0_8px_#00D9A5]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A7CFF]">
                  Real-time voice security platform
                </span>
              </div>

              <h1 className="mt-7 text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-extrabold leading-[1.04] tracking-[-0.035em] text-[#F7F8FF]">
                A trusted voice
                <br />
                can become
                <br />
                <span className="text-[#7370FF] drop-shadow-[0_0_35px_rgba(115,112,255,0.35)]">
                  the attack.
                </span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl font-medium leading-relaxed text-[#F7F8FF]">
                Detect voice fraud before it changes money, orders,
                reservations, or identity.
              </p>

              <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-[#A4ADCA] max-w-xl">
                BoloSafe-AI analyzes live voice signals, detects synthetic and
                cloned voices, verifies speaker identity, and turns risk into
                sector-specific action in real time.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <GlassButton
                  primary
                  onClick={() => onLogin && onLogin()}
                >
                  Enter Live Defense
                  <ArrowRight size={15} />
                </GlassButton>

                <GlassButton
                  onClick={() =>
                    onDashboard
                      ? onDashboard()
                      : onLogin && onLogin()
                  }
                >
                  <Play size={14} className="text-[#7370FF] fill-[#7370FF]/30" />
                  Explore Platform
                </GlassButton>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
                {[
                  'Real-time detection',
                  'Speaker verification',
                  'Explainable risk',
                  'Sector-specific action',
                ].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2 text-xs font-medium text-[#A4ADCA]"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-[#00D9A5]"
                    />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right Column: HeroEngine */}
            <motion.div variants={reveal}>
              <HeroEngine />
            </motion.div>
          </motion.div>
        </section>

        {/* METRICS SECTION */}
        <section className="mx-auto max-w-[1360px] px-6 lg:px-10 pb-16">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[rgba(120,130,255,0.16)] bg-[#0C1228]/80 backdrop-blur-xl lg:grid-cols-4 shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
          >
            {[
              ['< 1s', 'Detection Window', 'Real-time analysis', AudioWaveform],
              ['58-D', 'Acoustic Intelligence', 'Signal representation', Database],
              ['4', 'Protected Sectors', 'Finance → Entertainment', Network],
              ['24/7', 'Continuous Guard', 'Live security telemetry', Shield],
            ].map(([value, title, detail, Icon], index) => (
              <motion.div
                key={title}
                whileHover={{
                  backgroundColor: 'rgba(18, 26, 58, 0.95)',
                }}
                className={[
                  'flex items-center gap-4.5 p-6 transition-colors duration-200 group',
                  index !== 3 ? 'lg:border-r lg:border-[rgba(120,130,255,0.12)]' : '',
                  index < 2 ? 'border-b border-[rgba(120,130,255,0.12)] lg:border-b-0' : '',
                ].join(' ')}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[rgba(120,130,255,0.22)] bg-[#5B5BF7]/10 text-[#8A7CFF] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(91,91,247,0.3)]">
                  <Icon size={20} />
                </div>

                <div>
                  <div className="text-3xl lg:text-4xl font-extrabold text-[#F7F8FF] tracking-tight">
                    {value}
                  </div>

                  <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#7370FF] mt-1">
                    {title}
                  </div>

                  <div className="mt-0.5 text-xs text-[#A4ADCA]">
                    {detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-y border-[rgba(120,130,255,0.12)] bg-[#050817]/90 py-8">
          <div className="mx-auto max-w-[1360px] px-6 text-center lg:px-10">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#7370FF]">
              Trusted for high-stakes voice operations
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-3.5 text-xs lg:text-[13px] font-semibold tracking-wider text-[#A4ADCA]">
              <span className="transition-colors hover:text-[#F7F8FF]">FINANCIAL SERVICES</span>
              <span className="transition-colors hover:text-[#F7F8FF]">RETAIL</span>
              <span className="transition-colors hover:text-[#F7F8FF]">HOSPITALITY</span>
              <span className="transition-colors hover:text-[#F7F8FF]">MEDIA & CONTENT</span>
              <span className="transition-colors hover:text-[#F7F8FF]">SECURITY OPERATIONS</span>
            </div>
          </div>
        </section>

        {/* SECTORS ATTACK SURFACES */}
        <section
          id="sectors"
          className="sector-reference-section relative py-24 lg:py-32"
        >
          <div className="sector-reference-wrap">
            {/* Left Editorial Copy */}
            <motion.div
              className="sector-reference-copy"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              <div className="sector-reference-eyebrow">
                Voice fraud is a real business threat
              </div>

              <h2>
                Same threat.
                <br />
                Different sectors.
                <br />
                <span>Higher stakes.</span>
              </h2>

              <p>
                A cloned voice can move money, reroute an order,
                change a reservation, or impersonate an artist.
                BoloSafe-AI adapts the response to the real
                business action behind the voice.
              </p>

              <button
                type="button"
                className="sector-reference-cta"
                onClick={() => {
                  document
                    .getElementById('sector-cards')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                }}
              >
                Explore Sector Surfaces
                <ArrowRight size={14} />
              </button>
            </motion.div>

            {/* 4 Portrait Cards */}
            <motion.div
              id="sector-cards"
              className="sector-reference-cards"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.10,
                  },
                },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.10 }}
            >
              {sectors.map((sector) => (
                <motion.div
                  key={sector.id}
                  variants={reveal}
                >
                  <SectorCard
                    sector={sector}
                    active={activeSector === sector.id}
                    onClick={() => setActiveSector(sector.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <SectionDivider />

        {/* HOW BOLOSAFE-AI WORKS PIPELINE */}
        <section
          id="technology"
          className="mx-auto max-w-[1360px] px-6 py-24 lg:px-10 lg:py-32"
          data-section="process-pipeline"
        >
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="text-center"
          >
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#7370FF]">
              How BoloSafe-AI works
            </div>

            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F7F8FF]">
              From voice signal to regulated action.
            </h2>

            <p className="mx-auto mt-3.5 max-w-2xl text-base leading-relaxed text-[#A4ADCA]">
              A streaming architecture that converts raw acoustic signals into
              interpretable risk and sector-specific responses.
            </p>
          </motion.div>

          <motion.div
            className="relative mt-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.10 }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            {/* Horizontal wave connector */}
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 hidden xl:block">
              <svg viewBox="0 0 1200 80" className="h-20 w-full">
                <defs>
                  <linearGradient id="pipelineWave" x1="0" x2="1">
                    <stop stopColor="#5B5BF7" />
                    <stop offset=".5" stopColor="#7370FF" />
                    <stop offset="1" stopColor="#8A7CFF" />
                  </linearGradient>
                </defs>

                <motion.path
                  d="M0 40 C80 5 145 75 225 40 S365 5 445 40 S585 75 665 40 S805 5 885 40 S1025 75 1200 40"
                  fill="none"
                  stroke="url(#pipelineWave)"
                  strokeWidth="2"
                  strokeDasharray="10 16"
                  animate={{ strokeDashoffset: [0, -52] }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </svg>
            </div>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {pipeline.map((item, index) => (
                <PipelineNode
                  key={item[0]}
                  item={item}
                  index={index}
                  active={activePipelineStep === index}
                  onHover={() => setActivePipelineStep(index)}
                />
              ))}
            </div>
          </motion.div>
        </section>

        <SectionDivider />

        {/* CORE CAPABILITIES */}
        <section
          id="security"
          className="border-y border-[rgba(120,130,255,0.12)] bg-[#050817]/95"
        >
          <div className="mx-auto max-w-[1360px] px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid items-end gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <motion.div
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
              >
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#7370FF]">
                  Core capabilities
                </div>

                <h2 className="mt-3.5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.08] text-[#F7F8FF]">
                  More than detection.
                  <br />
                  A complete voice security stack.
                </h2>
              </motion.div>

              <p className="max-w-xl text-base leading-relaxed text-[#A4ADCA] lg:justify-self-end">
                BoloSafe-AI combines acoustic intelligence, speaker identity,
                behavioral analysis, and business context to deliver
                explainable security built for real-world operations.
              </p>
            </div>

            <motion.div
              className="mt-12 grid gap-5 sm:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08 }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {capabilities.map((item) => (
                <CapabilityCard key={item[0]} item={item} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section
          className="relative min-h-[600px] overflow-hidden border-b border-[rgba(120,130,255,0.14)]"
          style={{
            background:
              'radial-gradient(circle at 24% 50%, rgba(91,91,247,0.16), transparent 36%), radial-gradient(circle at 75% 50%, rgba(138,124,255,0.08), transparent 34%), #050817',
          }}
        >
          {/* Human Profile / Waveform Artwork */}
          <motion.img
            src="/assets/cta/human-particle-voice.png"
            alt="Particle-built human profile emitting an indigo voice waveform"
            className="absolute inset-0 h-full w-full object-cover object-left-center pointer-events-none"
            initial={{ scale: 1.02, opacity: 0.88 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: easeSmooth }}
            style={{
              filter: 'brightness(.84) saturate(.92) contrast(1.06)',
            }}
          />

          {/* Smooth dark gradient preserving readability */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,23,0.06)_0%,rgba(5,8,23,0.18)_42%,rgba(5,8,23,0.72)_65%,rgba(5,8,23,0.96)_84%,#050817_100%)]" />

          {/* Indigo atmosphere layer */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(91,91,247,0.10),transparent_40%),radial-gradient(ellipse_at_70%_45%,rgba(138,124,255,0.08),transparent_35%)]" />

          {/* CTA Content Container */}
          <div className="relative z-10 mx-auto grid min-h-[600px] max-w-[1360px] items-center px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
            {/* Left side empty for human artwork dominance */}
            <div className="hidden lg:block" />

            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="max-w-[580px] py-20 lg:py-24"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(120,130,255,0.3)] bg-[rgba(91,91,247,0.12)] px-4 py-1.5 backdrop-blur-md">
                <Shield
                  size={13}
                  className="text-[#7370FF]"
                />

                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#8A7CFF]">
                  Live protection fabric
                </span>
              </div>

              <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.04] tracking-[-0.035em] text-[#F7F8FF]">
                Detect the voice.
                <br />
                <span className="text-[#7370FF] drop-shadow-[0_0_30px_rgba(115,112,255,0.35)]">
                  Protect what it can change.
                </span>
              </h2>

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#A4ADCA]">
                See BoloSafe-AI move from acoustic signal to explainable risk,
                speaker identity, and sector-specific action in real time.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <GlassButton
                  primary
                  onClick={() => onLogin && onLogin()}
                >
                  Enter Live Defense
                  <ArrowRight size={15} />
                </GlassButton>

                <GlassButton
                  onClick={() =>
                    onDashboard
                      ? onDashboard()
                      : onLogin && onLogin()
                  }
                >
                  Explore Platform
                  <ArrowRight size={14} />
                </GlassButton>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(120,130,255,0.14)] bg-[#040610]">
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row lg:px-10">
          <Brand />

          <div className="flex flex-wrap justify-center gap-8 text-xs uppercase tracking-[0.14em] text-[#A4ADCA]">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#sectors" className="hover:text-white transition-colors">Sectors</a>
            <a href="#technology" className="hover:text-white transition-colors">Technology</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7370FF]">
            Detect · Verify · Protect
          </div>
        </div>
      </footer>
    </div>
  )
}
