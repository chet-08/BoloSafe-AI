import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
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

const COLORS = {
  bg: '#050817',
  secondary: '#080D21',
  surface: '#0B1228',
  elevated: '#101936',
  indigo: '#4F46E5',
  indigoBright: '#6366F1',
  electric: '#4F7CFF',
  blue: '#2563EB',
  purple: '#7C3AED',
  text: '#F8FAFC',
  muted: '#94A3B8',
  border: 'rgba(99,102,241,0.24)',
  borderBright: 'rgba(99,102,241,0.48)',
  finance: '#F43F8A',
  retail: '#F59E0B',
  hospitality: '#10B981',
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
  ['01', 'Voice Ingestion', 'Live conversation', Mic2],
  ['02', 'Signal Processing', 'PCM + VAD', Waves],
  ['03', 'Feature Intelligence', '58-D acoustic DSP', AudioWaveform],
  ['04', 'AI Detection', 'Ensemble models', BrainCircuit],
  ['05', 'Risk Engine', 'Rolling security state', ShieldAlert],
  ['06', 'Action & Governance', 'Sector-specific response', Zap],
]

const capabilities = [
  [
    'Acoustic Intelligence',
    '58-dimensional analysis across pitch, rhythm, timing, and spectral behavior.',
    AudioWaveform,
    COLORS.indigoBright,
  ],
  [
    'Voice Identity',
    'Speaker verification adds identity evidence beyond synthetic probability.',
    Fingerprint,
    COLORS.hospitality,
  ],
  [
    'Risk Reasoning',
    'Rolling risk and consecutive suspicious windows stabilize security decisions.',
    ShieldAlert,
    COLORS.retail,
  ],
  [
    'Actionable Response',
    'Governance converts detection into hold, verify, escalate, or allow.',
    Zap,
    COLORS.entertainment,
  ],
]

const ease = [0.16, 1, 0.3, 1]

const reveal = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease,
    },
  },
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl border"
        style={{
          borderColor: `${COLORS.indigoBright}55`,
          background: `${COLORS.indigo}16`,
        }}
      >
        <Shield size={17} className="text-[#818CF8]" />
      </div>

      <div>
        <div className="text-[17px] font-extrabold tracking-tight text-white">
          BoloSafe<span className="text-[#818CF8]">-AI</span>
        </div>

        <div className="text-[6px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          Real-time voice security
        </div>
      </div>
    </div>
  )
}

function GlassButton({ children, primary = false, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{
        y: -2,
        boxShadow: primary
          ? '0 18px 48px rgba(79,70,229,.28)'
          : '0 18px 40px rgba(79,124,255,.10)',
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3',
        'text-[11px] font-semibold transition-all duration-300',
        primary
          ? 'bg-[#4F46E5] text-white hover:bg-[#6366F1]'
          : 'border border-white/10 bg-white/[0.025] text-white hover:border-[#6366F1]/40 hover:bg-[#4F46E5]/[0.06]',
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
        y: -7,
        scale: 1.018,
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
            <Icon size={15} strokeWidth={1.8} />
          </div>

          <div className="sector-reference-label">
            <div>{sector.eyebrow}</div>
            <span>Sector attack surface</span>
          </div>

          <span className="sector-reference-risk">
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
            <ArrowRight size={12} />
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

      {/* ambient field */}
      <div className="final-hero-ambient" />

      {/* continuous waveform */}
      <svg
        className="final-hero-wave"
        viewBox="0 0 1100 420"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="finalHeroWave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0" />
            <stop offset="18%" stopColor="#4C6FFF" />
            <stop offset="42%" stopColor="#6366F1" />
            <stop offset="58%" stopColor="#8B5CF6" />
            <stop offset="82%" stopColor="#4C6FFF" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </linearGradient>

          <filter id="finalWaveBlur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <path
          d="M0 258 C72 220 110 304 176 267 S286 145 362 222 S470 332 548 251 S660 136 740 220 S852 327 930 244 S1018 182 1100 220"
          fill="none"
          stroke="url(#finalHeroWave)"
          strokeWidth="24"
          opacity=".22"
          filter="url(#finalWaveBlur)"
        />

        <motion.path
          d="M0 258 C72 220 110 304 176 267 S286 145 362 222 S470 332 548 251 S660 136 740 220 S852 327 930 244 S1018 182 1100 220"
          fill="none"
          stroke="url(#finalHeroWave)"
          strokeWidth="3"
          strokeDasharray="15 13"
          animate={{ strokeDashoffset: [0, -110] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <path
          d="M0 270 C78 232 116 316 184 279 S292 157 370 234 S478 344 556 263 S668 148 748 232 S860 339 938 256 S1026 194 1100 232"
          fill="none"
          stroke="#AAB6FF"
          strokeWidth="1"
          opacity=".38"
        />
      </svg>

      {/* floating particles */}
      <div className="final-hero-particles">
        {Array.from({ length: 46 }).map((_, i) => (
          <motion.span
            key={i}
            style={{
              left: `${(i * 67 + 8) % 100}%`,
              top: `${(i * 43 + 5) % 94}%`,
              width: i % 8 === 0 ? 3 : 2,
              height: i % 8 === 0 ? 3 : 2,
            }}
            animate={{
              opacity: [0.05, i % 8 === 0 ? 0.55 : 0.3, 0.05],
              scale: [0.7, 1.2, 0.7],
            }}
            transition={{
              duration: 3 + (i % 5) * .45,
              repeat: Infinity,
              delay: (i % 9) * .18,
            }}
          />
        ))}
      </div>

      {/* live input */}
      <motion.div
        className="final-hero-live-card"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
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
                  5 + (i % 3) * 3,
                  13 + (i % 6) * 4,
                  7 + (i % 4) * 3,
                ],
              }}
              transition={{
                duration: 1.1 + (i % 4) * .1,
                repeat: Infinity,
                delay: i * .025,
              }}
            />
          ))}
        </div>

        <div className="final-hero-micro-labels">
          <span>PCM16</span>
          <span>VAD</span>
          <span>ANALYZING</span>
        </div>
      </motion.div>

      {/* =====================================================
          NEURAL GUARD — LIVING SECURITY CORE
          ===================================================== */}
      <motion.div
        className="final-hero-core"
        animate={{
          y: [0, -4, 0],
          scale: [1, 1.025, 1],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* atmospheric aura */}
        <motion.div
          className="ng-aura"
          animate={{
            scale: [0.92, 1.08, 0.92],
            opacity: [0.45, 0.8, 0.45],
          }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* rotating orbital HUD */}
        <motion.div
          className="ng-orbit ng-orbit-outer"
          animate={{ rotate: 360 }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <motion.div
          className="ng-orbit ng-orbit-middle"
          animate={{ rotate: -360 }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <motion.div
          className="ng-orbit ng-orbit-inner"
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* orbital energy nodes */}
        <motion.span
          className="ng-orbit-node ng-node-blue"
          animate={{ rotate: 360 }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <motion.span
          className="ng-orbit-node ng-node-violet"
          animate={{ rotate: -360 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <motion.span
          className="ng-orbit-node ng-node-white"
          animate={{ rotate: 360 }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* radial scanning sweep */}
        <motion.div
          className="ng-scan"
          animate={{ rotate: 360 }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* pulse shells */}
        <motion.div
          className="ng-pulse ng-pulse-a"
          animate={{
            scale: [0.78, 1.32],
            opacity: [0.55, 0],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        <motion.div
          className="ng-pulse ng-pulse-b"
          animate={{
            scale: [0.72, 1.24],
            opacity: [0.42, 0],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            delay: 1.15,
            ease: 'easeOut',
          }}
        />

        {/* core shell */}
        <div className="ng-core-shell">

          {/* inner technical ring */}
          <motion.div
            className="ng-hud-ring"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* central volumetric glow */}
          <motion.div
            className="ng-core-light"
            animate={{
              scale: [0.9, 1.08, 0.9],
              opacity: [0.45, 0.85, 0.45],
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* shield */}
          <motion.div
            className="final-hero-shield ng-shield"
            animate={{
              scale: [1, 1.06, 1],
              boxShadow: [
                '0 0 12px rgba(99,102,241,.08)',
                '0 0 32px rgba(99,102,241,.28)',
                '0 0 12px rgba(99,102,241,.08)',
              ],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ShieldAlert size={27} strokeWidth={1.7} />
          </motion.div>

          <div className="final-hero-brand ng-brand">
            BOLOSAFE-AI
          </div>

          <div className="final-hero-neural ng-neural">
            NEURAL GUARD
          </div>

          <div className="final-hero-core-status ng-status">
            <span />
            LIVE ANALYSIS
          </div>
        </div>

        {/* tiny HUD ticks */}
        <span className="ng-tick tick-1" />
        <span className="ng-tick tick-2" />
        <span className="ng-tick tick-3" />
        <span className="ng-tick tick-4" />
      </motion.div>

      {/* curved connection network */}
      <svg
        className="final-hero-connections"
        viewBox="0 0 1100 470"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="orbitPink" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#EC4899" stopOpacity=".35" />
            <stop offset=".45" stopColor="#EC4899" />
            <stop offset="1" stopColor="#EC4899" stopOpacity=".05" />
          </linearGradient>

          <linearGradient id="orbitAmber" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#F59E0B" stopOpacity=".25" />
            <stop offset=".5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#F59E0B" stopOpacity=".05" />
          </linearGradient>

          <linearGradient id="orbitGreen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#10B981" stopOpacity=".25" />
            <stop offset=".5" stopColor="#10B981" />
            <stop offset="1" stopColor="#10B981" stopOpacity=".05" />
          </linearGradient>

          <linearGradient id="orbitViolet" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8B5CF6" stopOpacity=".25" />
            <stop offset=".5" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#8B5CF6" stopOpacity=".05" />
          </linearGradient>

          <filter id="orbitGlow">
            <feGaussianBlur stdDeviation="2.8" />
          </filter>
        </defs>

        {/* =================================================
            NEURAL GUARD → HEADLINE SIGNAL FIELD
            ================================================= */}

        {/* broad atmospheric beams */}
        <path
          d="M640 265 C560 205 475 205 390 235 S235 270 110 220"
          className="hero-left-beam beam-blue"
        />

        <path
          d="M642 275 C555 245 485 252 405 278 S255 320 125 292"
          className="hero-left-beam beam-violet"
        />

        <path
          d="M642 285 C555 302 490 315 405 324 S260 348 125 344"
          className="hero-left-beam beam-indigo"
        />

        {/* fine neural filaments */}
        <path
          d="M635 258 C565 185 488 178 415 210 S270 272 145 205"
          className="hero-left-filament filament-a"
        />

        <path
          d="M635 269 C560 222 495 216 420 248 S290 298 170 252"
          className="hero-left-filament filament-b"
        />

        <path
          d="M635 280 C555 270 490 278 410 300 S275 332 150 320"
          className="hero-left-filament filament-c"
        />

        <path
          d="M635 292 C560 320 495 342 420 342 S280 350 165 370"
          className="hero-left-filament filament-d"
        />

        {/* dotted micro-network */}
        <path
          d="M618 252 C545 198 475 186 405 218 S270 250 205 220"
          className="hero-left-dotted dotted-a"
        />

        <path
          d="M620 300 C545 328 478 348 400 338 S265 350 205 378"
          className="hero-left-dotted dotted-b"
        />

        {/* moving energy particles traveling toward the headline */}
        <circle r="3.5" fill="#4C6FFF">
          <animateMotion
            dur="4.2s"
            repeatCount="indefinite"
            path="M640 265 C560 205 475 205 390 235 S235 270 110 220"
          />
        </circle>

        <circle r="3" fill="#8B5CF6">
          <animateMotion
            dur="4.8s"
            begin=".7s"
            repeatCount="indefinite"
            path="M642 275 C555 245 485 252 405 278 S255 320 125 292"
          />
        </circle>

        <circle r="3" fill="#6366F1">
          <animateMotion
            dur="5.1s"
            begin="1.3s"
            repeatCount="indefinite"
            path="M642 285 C555 302 490 315 405 324 S260 348 125 344"
          />
        </circle>

        {/* glow nodes leaving the core */}
        <circle
          cx="638"
          cy="265"
          r="5"
          className="hero-left-node node-blue"
        />

        <circle
          cx="640"
          cy="278"
          r="4"
          className="hero-left-node node-violet"
        />

        <circle
          cx="638"
          cy="292"
          r="4"
          className="hero-left-node node-indigo"
        />

        {/* =================================================
            NEURAL GUARD → LEFT SIGNAL FIELD
            Multi-wave / particle / signal-spine system
            ================================================= */}

        {/* broad glowing wave layers */}
        <path
          d="M645 250
             C570 178 500 180 425 228
             S285 315 190 250
             S78 172 0 220"
          className="hero-neural-wave wave-01"
        />

        <path
          d="M645 263
             C565 208 500 215 420 260
             S285 345 185 278
             S72 215 0 256"
          className="hero-neural-wave wave-02"
        />

        <path
          d="M645 278
             C565 244 498 250 415 286
             S278 360 180 308
             S70 275 0 300"
          className="hero-neural-wave wave-03"
        />

        <path
          d="M642 291
             C566 290 500 304 422 326
             S290 365 190 342
             S80 320 0 336"
          className="hero-neural-wave wave-04"
        />

        <path
          d="M638 302
             C562 330 495 345 415 349
             S270 370 172 378
             S70 382 0 365"
          className="hero-neural-wave wave-05"
        />

        {/* fine secondary waves */}
        <path
          d="M635 238
             C570 158 500 160 430 205
             S290 285 200 225
             S90 155 15 205"
          className="hero-neural-fine fine-01"
        />

        <path
          d="M633 310
             C565 352 495 364 420 360
             S275 385 185 396
             S70 405 5 390"
          className="hero-neural-fine fine-02"
        />

        {/* dotted travelling traces */}
        <path
          d="M640 248
             C565 190 500 192 425 232
             S290 305 200 248
             S90 185 15 225"
          className="hero-neural-dotted dotted-01"
        />

        <path
          d="M638 298
             C560 330 500 343 420 340
             S280 357 190 370
             S75 380 15 360"
          className="hero-neural-dotted dotted-02"
        />

        {/* vertical signal spines */}
        <g className="hero-signal-spines">
          <line x1="455" y1="150" x2="455" y2="335" />
          <line x1="485" y1="170" x2="485" y2="350" />
          <line x1="515" y1="185" x2="515" y2="365" />
          <line x1="545" y1="165" x2="545" y2="350" />
          <line x1="575" y1="145" x2="575" y2="338" />
          <line x1="605" y1="175" x2="605" y2="325" />
        </g>

        {/* illuminated points riding the waves */}
        <circle r="4" fill="#4C6FFF">
          <animateMotion
            dur="3.8s"
            repeatCount="indefinite"
            path="M645 250 C570 178 500 180 425 228 S285 315 190 250 S78 172 0 220"
          />
        </circle>

        <circle r="3.5" fill="#8B5CF6">
          <animateMotion
            dur="4.6s"
            begin=".4s"
            repeatCount="indefinite"
            path="M645 263 C565 208 500 215 420 260 S285 345 185 278 S72 215 0 256"
          />
        </circle>

        <circle r="3" fill="#6366F1">
          <animateMotion
            dur="5.1s"
            begin="1s"
            repeatCount="indefinite"
            path="M642 291 C566 290 500 304 422 326 S290 365 190 342 S80 320 0 336"
          />
        </circle>

        <circle r="2.7" fill="#6D7CFF">
          <animateMotion
            dur="5.4s"
            begin="1.7s"
            repeatCount="indefinite"
            path="M638 302 C562 330 495 345 415 349 S270 370 172 378 S70 382 0 365"
          />
        </circle>

        {/* bright anchor particles near core */}
        <circle cx="640" cy="250" r="6" className="hero-neural-anchor anchor-blue" />
        <circle cx="640" cy="264" r="5" className="hero-neural-anchor anchor-violet" />
        <circle cx="638" cy="278" r="4" className="hero-neural-anchor anchor-indigo" />
        <circle cx="638" cy="292" r="4" className="hero-neural-anchor anchor-blue" />

        {/* =================================================
            TEXT → NEURAL GUARD → SECTOR SIGNAL SPINE
            ================================================= */}

        {/* primary incoming signal */}
        <path
          className="neural-spine neural-spine-main"
          d="M20 330
             C155 300 270 306 375 325
             C350 344 400 318 430 287"
        />

        {/* upper incoming signal */}
        <path
          className="neural-spine neural-spine-upper"
          d="M30 305
             C170 275 285 286 390 310
             C360 332 405 304 430 287"
        />

        {/* lower incoming signal */}
        <path
          className="neural-spine neural-spine-lower"
          d="M30 360
             C170 335 290 348 400 340
             C370 332 410 300 430 287"
        />

        {/* very fine secondary incoming trace */}
        <path
          className="neural-spine neural-spine-fine"
          d="M70 385
             C205 360 320 365 420 350
             C380 335 420 304 430 287"
        />

        {/* bright convergence line directly into the core */}
        <path
          className="neural-core-spine"
          d="M170 332
             C305 320 420 330 505 312
             C390 298 420 289 430 287"
        />

        {/* central convergence glow */}
        <circle
          cx="430"
          cy="287"
          r="7"
          className="neural-junction"
        />

        <circle
          cx="430"
          cy="287"
          r="18"
          className="neural-junction-aura"
        />

        {/* PRIMARY ATTACK PATHS */}
        <motion.path
          className="sector-link sector-link-finance"
          d="M430 287 C650 238 830 86 1048 52"
          stroke="#EC4899"
          strokeWidth="2.2"
          fill="none"
          animate={{
            opacity: [0.58, 0.82, 0.58],
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.path
          className="sector-link sector-link-retail"
          d="M430 287 C650 270 840 178 1048 153"
          stroke="#F59E0B"
          strokeWidth="2.2"
          fill="none"
          animate={{
            opacity: [0.56, 0.80, 0.56],
          }}
          transition={{
            duration: 4.1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.path
          className="sector-link sector-link-hospitality"
          d="M430 287 C650 292 850 270 1048 255"
          stroke="#10B981"
          strokeWidth="2.2"
          fill="none"
          animate={{
            opacity: [0.54, 0.78, 0.54],
          }}
          transition={{
            duration: 4.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.path
          className="sector-link sector-link-entertainment"
          d="M430 287 C650 322 835 360 1048 356"
          stroke="#8B5CF6"
          strokeWidth="2.2"
          fill="none"
          animate={{
            opacity: [0.58, 0.84, 0.58],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* SECONDARY NEURAL FILAMENTS */}
        <path
          d="M642 267 C700 214 748 118 835 92"
          className="orbit-filament filament-pink"
        />

        <path
          d="M645 276 C712 240 758 190 842 172"
          className="orbit-filament filament-blue"
        />

        <path
          d="M646 290 C715 305 766 302 846 286"
          className="orbit-filament filament-green"
        />

        <path
          d="M642 301 C700 338 760 372 840 382"
          className="orbit-filament filament-violet"
        />

        {/* FINE SATELLITE LINES */}
        <path
          d="M636 257 C692 220 730 176 790 150"
          className="orbit-satellite"
        />

        <path
          d="M638 309 C700 340 735 355 795 360"
          className="orbit-satellite"
        />

        {/* luminous moving nodes */}
        <circle r="4" fill="#EC4899">
          <animateMotion
            dur="3.6s"
            repeatCount="indefinite"
            path="M430 287 C650 230 770 70 900 52"
          />
        </circle>

        <circle r="4" fill="#F59E0B">
          <animateMotion
            dur="4s"
            begin=".4s"
            repeatCount="indefinite"
            path="M430 287 C650 262 780 150 900 150"
          />
        </circle>

        <circle r="4" fill="#10B981">
          <animateMotion
            dur="4.2s"
            begin=".8s"
            repeatCount="indefinite"
            path="M430 287 C650 286 790 250 900 250"
          />
        </circle>

        <circle r="4" fill="#8B5CF6">
          <animateMotion
            dur="4.4s"
            begin="1.2s"
            repeatCount="indefinite"
            path="M430 287 C650 325 790 345 900 350"
          />
        </circle>
      </svg>

      {/* sector attack cards */}
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
                opacity: { duration: .5, delay: i * .08 },
                x: { duration: .5, delay: i * .08 },
                y: {
                  duration: 4 + i * .35,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              whileHover={{
                y: -8,
                scale: 1.025,
              }}
            >
              <img src={attack.image} alt="" />

              <div className="final-hero-attack-image-layer" />

              <div className="final-hero-attack-content">
                <div className="final-hero-attack-icon">
                  <Icon size={17} />
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
                    <span>LIVE</span>
                    <i />
                    <span>PROTECTED</span>
                  </div>
                </div>

                <div className="final-hero-card-signal">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <span className="final-hero-status" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* AI ensemble */}
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
            {[28, 43, 36, 58, 43, 66, 51].map((h, i) => (
              <motion.span
                key={i}
                style={{ height: h }}
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * .08,
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

      {/* risk */}
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

          <div className="final-hero-alert">
            ALERT
          </div>
        </div>

        <div className="final-hero-risk-line">
          <span />
        </div>
      </motion.div>
    </div>
  )
}
function PipelineNode({ item, index }) {
  const [number, title, subtitle, Icon] = item

  return (
    <motion.div
      variants={reveal}
      whileHover={{
        y: -10,
        scale: 1.025,
        boxShadow:
          index === 4
            ? '0 28px 75px rgba(139,92,246,.24), 0 0 35px rgba(124,92,255,.14)'
            : '0 26px 70px rgba(79,70,229,.20), 0 0 30px rgba(79,124,255,.10)',
      }}
      className={[
        'pipeline-node',
        'relative overflow-visible rounded-2xl border',
        index === 4
          ? 'border-[#8B5CF6]/40'
          : 'border-white/10',
      ].join(' ')}
      data-pipeline-index={index}
    >
      {/* luminous top rim */}
      <div
        className="pipeline-node__rim absolute inset-x-0 top-0 h-[2px]"
        style={{
          background:
            index === 4
              ? 'linear-gradient(90deg,#4F46E5,#8B5CF6,#6366F1)'
              : 'linear-gradient(90deg,#6366F1,#4F7CFF,transparent)',
        }}
      />

      {/* moving light sweep */}
      <motion.div
        className="pipeline-node__sweep pointer-events-none absolute left-0 top-0 h-full w-[32%]"
        animate={{
          x: ['-120%', '360%'],
          opacity: [0, 0.55, 0],
        }}
        transition={{
          duration: 4.2,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: 'easeInOut',
          delay: index * 0.38,
        }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <span className="pipeline-node__number">
          {number}
        </span>

        <motion.div
          className="pipeline-node__icon"
          animate={{
            boxShadow: [
              '0 0 0 rgba(99,102,241,0)',
              '0 0 22px rgba(99,102,241,.22)',
              '0 0 0 rgba(99,102,241,0)',
            ],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: index * 0.42,
            ease: 'easeInOut',
          }}
        >
          <Icon size={21} strokeWidth={1.8} />
        </motion.div>
      </div>

      <div className="relative z-10 mt-6">
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
            opacity: [0.25, 1, 0.25],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: index * 0.28,
            ease: 'linear',
          }}
        />
      </div>

      {index < 5 && (
        <motion.div
          className="pipeline-node__arrow absolute -right-4 top-1/2 z-20 hidden xl:block"
          animate={{
            x: [0, 4, 0],
            opacity: [0.55, 1, 0.55],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        >
          <ArrowRight size={18} />
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
        y: -5,
        boxShadow: `0 20px 55px ${color}12`,
      }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[.02] p-5 backdrop-blur-md"
    >
      <div
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ background: color }}
      />

      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl border"
        style={{
          color,
          borderColor: `${color}3f`,
          background: `${color}0D`,
        }}
      >
        <Icon size={17} />
      </div>

      <h3 className="mt-5 text-sm font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
        {description}
      </p>

      <div
        className="mt-5 flex items-center gap-2 text-[8px] font-semibold"
        style={{ color }}
      >
        Learn more
        <ArrowRight size={11} />
      </div>
    </motion.div>
  )
}

export default function Hero({ onLogin, onDashboard }) {
  const [activeSector, setActiveSector] = useState('finance')

  const selected =
    sectors.find((item) => item.id === activeSector) || sectors[0]

  return (
    <div
      className="min-h-screen overflow-hidden text-white"
      style={{ background: COLORS.bg }}
    >
      {/* global atmospheric background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 25%, rgba(79,70,229,.12), transparent 38%), #050817',
          }}
        />

        <div
          className="absolute left-[8%] top-[20%] h-[420px] w-[420px] rounded-full blur-[130px]"
          style={{ background: 'rgba(79,70,229,.07)' }}
        />

        <div
          className="absolute right-[8%] top-[15%] h-[400px] w-[400px] rounded-full blur-[140px]"
          style={{ background: 'rgba(124,58,237,.06)' }}
        />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#050817]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 lg:px-8">
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
                className="text-[9px] font-medium text-slate-500 transition-colors hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[.04] px-3 py-2 sm:flex">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.7, repeat: Infinity }}
              />
              <span className="text-[7px] font-bold uppercase tracking-[0.12em] text-emerald-400">
                Live Demo
              </span>
            </div>

            <GlassButton
              primary
              onClick={() => onLogin && onLogin()}
            >
              Free Console
              <ArrowRight size={12} />
            </GlassButton>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section
          id="product"
          className="hero-main-stage relative mx-auto px-5 pb-20 pt-16 lg:px-8 lg:pt-20"
        >
          <motion.div
            className="relative z-10 mx-auto grid max-w-[1600px] items-center gap-6 xl:grid-cols-[.78fr_1.22fr]"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.09,
                },
              },
            }}
          >
            <motion.div variants={reveal}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6366F1]/25 bg-[#4F46E5]/10 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#A5B4FC]">
                  Real-time voice security platform
                </span>
              </div>

              <h1 className="mt-7 max-w-[680px] text-5xl font-extrabold leading-[.95] tracking-[-.05em] md:text-6xl xl:text-[78px]">
                A trusted voice
                <br />
                can become
                <br />
                <span className="text-[#6366F1]">the attack.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg font-medium leading-7 text-slate-300">
                Detect voice fraud before it changes money, orders,
                reservations, or identity.
              </p>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                BoloSafe-AI analyzes live voice signals, detects synthetic and
                cloned voices, verifies speaker identity, and turns risk into
                sector-specific action in real time.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <GlassButton
                  primary
                  onClick={() => onLogin && onLogin()}
                >
                  Enter Live Defense
                  <ArrowRight size={14} />
                </GlassButton>

                <GlassButton
                  onClick={() =>
                    onDashboard
                      ? onDashboard()
                      : onLogin && onLogin()
                  }
                >
                  <Play size={13} />
                  Explore Platform
                </GlassButton>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  'Real-time detection',
                  'Speaker verification',
                  'Explainable risk',
                  'Sector-specific action',
                ].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2 text-[8px] text-slate-600"
                  >
                    <CheckCircle2
                      size={11}
                      className="text-emerald-400"
                    />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={reveal}>
              <HeroEngine />
            </motion.div>
          </motion.div>
        </section>

        {/* METRICS */}
        <section className="mx-auto max-w-[1440px] px-5 pb-14 lg:px-8">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.14 }}
            className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#6366F1]/22 bg-[#0B1228]/90 backdrop-blur-md lg:grid-cols-4"
          >
            {[
              ['< 1s', 'Detection Window', 'Real-time analysis', AudioWaveform],
              ['58-D', 'Acoustic Intelligence', 'Signal representation', Database],
              ['4', 'Protected Sectors', 'Finance → Entertainment', Network],
              ['24/7', 'Continuous Guard', 'Live security telemetry', Shield],
            ].map(([value, title, detail, Icon], index) => (
              <div
                key={title}
                className={[
                  'flex items-center gap-4 p-5 md:p-6',
                  index !== 3 ? 'lg:border-r lg:border-white/[.07]' : '',
                  index < 2 ? 'border-b border-white/[.07] lg:border-b-0' : '',
                ].join(' ')}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6366F1]/22 bg-[#4F46E5]/[.08] text-[#A5B4FC]">
                  <Icon size={18} />
                </div>

                <div>
                  <div className="text-2xl font-extrabold text-white">
                    {value}
                  </div>

                  <div className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#818CF8]">
                    {title}
                  </div>

                  <div className="mt-1 text-[7px] text-slate-600">
                    {detail}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-y border-white/[.07] bg-[#050817]">
          <div className="mx-auto max-w-[1280px] px-5 py-7 text-center lg:px-8">
            <div className="text-[7px] font-bold uppercase tracking-[0.22em] text-[#6366F1]">
              Trusted for high-stakes voice operations
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[9px] font-bold tracking-[0.08em] text-slate-500">
              <span className="transition-opacity hover:text-white">FINANCIAL SERVICES</span>
              <span className="transition-opacity hover:text-white">RETAIL</span>
              <span className="transition-opacity hover:text-white">HOSPITALITY</span>
              <span className="transition-opacity hover:text-white">MEDIA & CONTENT</span>
              <span className="transition-opacity hover:text-white">SECURITY OPERATIONS</span>
            </div>
          </div>
        </section>

        {/* SECTORS */}
        <section
          id="sectors"
          className="sector-reference-section border-b border-white/[.06]"
        >
          <div className="sector-reference-wrap">
            {/* LEFT EDITORIAL CONTENT */}
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
                <ArrowRight size={15} />
              </button>
            </motion.div>

            {/* FOUR PORTRAIT CARDS */}
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
        {/* PIPELINE */}
        <section
          id="technology"
          className="mx-auto max-w-[1440px] px-5 py-24 lg:px-8 lg:py-28"
         data-section="process-pipeline">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            className="text-center"
          >
            <div className="text-[7px] font-bold uppercase tracking-[0.22em] text-[#6366F1]">
              How BoloSafe-AI works
            </div>

            <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
              From voice signal to regulated action.
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              A streaming architecture that converts raw acoustic signals into
              interpretable risk and sector-specific responses.
            </p>
          </motion.div>

          <motion.div
            className="relative mt-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden xl:block">
              <svg viewBox="0 0 1200 80" className="h-20 w-full">
                <defs>
                  <linearGradient id="pipelineWave" x1="0" x2="1">
                    <stop stopColor="#4F46E5" />
                    <stop offset=".5" stopColor="#4F7CFF" />
                    <stop offset="1" stopColor="#8B5CF6" />
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

            <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              {pipeline.map((item, index) => (
                <PipelineNode
                  key={item[0]}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </section>

        {/* SECURITY STACK */}
        <section
          id="security"
          className="border-y border-white/[.07] bg-[#050817]"
        >
          <div className="mx-auto max-w-[1440px] px-5 py-24 lg:px-8 lg:py-28">
            <div className="grid items-end gap-8 lg:grid-cols-[.8fr_1.2fr]">
              <motion.div
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.12 }}
              >
                <div className="text-[7px] font-bold uppercase tracking-[0.22em] text-[#6366F1]">
                  Core capabilities
                </div>

                <h2 className="mt-4 text-4xl font-extrabold leading-[1.02]">
                  More than detection.
                  <br />
                  A complete voice security stack.
                </h2>
              </motion.div>

              <p className="max-w-2xl text-sm leading-7 text-slate-500 lg:justify-self-end">
                BoloSafe-AI combines acoustic intelligence, speaker identity,
                behavioral analysis, and business context to deliver
                explainable security built for real-world operations.
              </p>
            </div>

            <motion.div
              className="mt-10 grid gap-4 sm:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08 }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08,
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

        {/* FINAL CTA */}
        <section
          className="relative min-h-[560px] overflow-hidden border-b border-white/[.06]"
          style={{
            background:
              'radial-gradient(circle at 24% 50%, rgba(79,70,229,.15), transparent 34%), radial-gradient(circle at 75% 50%, rgba(79,124,255,.06), transparent 32%), #050817',
          }}
        >
          {/* FULL-WIDTH HUMAN / WAVE ARTWORK */}
          <motion.img
            src="/assets/cta/human-particle-voice.png"
            alt="Particle-built human profile emitting an indigo voice waveform"
            className="absolute inset-0 h-full w-full object-cover object-left-center"
            initial={{ scale: 1.02, opacity: .88 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease }}
            style={{
              filter: 'brightness(.82) saturate(.88) contrast(1.05)',
            }}
          />

          {/* preserve the dark product background */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,23,.04)_0%,rgba(5,8,23,.02)_46%,rgba(5,8,23,.58)_68%,rgba(5,8,23,.94)_82%,#050817_100%)]" />

          {/* subtle indigo atmosphere */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_31%_50%,rgba(79,70,229,.08),transparent_38%),radial-gradient(ellipse_at_65%_45%,rgba(124,58,237,.05),transparent_34%)]" />

          {/* content layer */}
          <div className="relative z-10 mx-auto grid min-h-[560px] max-w-[1440px] items-center px-5 lg:grid-cols-[1.12fr_.88fr] lg:px-8">

            {/* deliberately empty left side so artwork remains dominant */}
            <div className="hidden lg:block" />

            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: .12 }}
              className="max-w-[560px] py-20"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6366F1]/25 bg-[#4F46E5]/10 px-3 py-1.5 backdrop-blur-md">
                <Shield
                  size={11}
                  className="text-[#818CF8]"
                />

                <span className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#A5B4FC]">
                  Live protection fabric
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-5xl lg:text-[58px]">
                Detect the voice.
                <br />
                <span className="text-[#6366F1]">
                  Protect what it can change.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400/80">
                See BoloSafe-AI move from acoustic signal to explainable risk,
                speaker identity, and sector-specific action in real time.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <GlassButton
                  primary
                  onClick={() => onLogin && onLogin()}
                >
                  Enter Live Defense
                  <ArrowRight size={14} />
                </GlassButton>

                <GlassButton
                  onClick={() =>
                    onDashboard
                      ? onDashboard()
                      : onLogin && onLogin()
                  }
                >
                  Explore Platform
                  <ArrowRight size={13} />
                </GlassButton>
              </div>
            </motion.div>
          </div>
        </section>

{/* FOOTER */}
      </main>
      <footer className="border-t border-white/[.07] bg-[#040610]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-5 px-5 py-7 md:flex-row lg:px-8">
          <Brand />

          <div className="flex flex-wrap justify-center gap-6 text-[7px] uppercase tracking-[0.12em] text-slate-600">
            <span>Product</span>
            <span>Sectors</span>
            <span>Technology</span>
            <span>Security</span>
            <span>Pricing</span>
          </div>

          <div className="text-[7px] uppercase tracking-[0.12em] text-slate-700">
            Detect · Verify · Protect
          </div>
        </div>
      </footer>
    </div>
  )
}
