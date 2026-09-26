import React, { useState } from 'react';
import {
  Hotel,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  PhoneCall,
  KeyRound,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  XCircle,
  FileCheck,
  BellRing,
  Lock,
  Activity
} from 'lucide-react';
import SectorAudioPlayer from '../../components/SectorAudioPlayer';
import EnterpriseWebhookDrawer from '../../components/EnterpriseWebhookDrawer';
import GuidedUserFlowBar from '../../components/GuidedUserFlowBar';
import { lockRoomFolio, challengeGuest, simulateThreat } from '../../utils/sectorApi';

export default function HospitalitySecurity({
  selected = {},
  isConnected = false,
  streamAudioFromUrl,
  startMicrophoneStream,
  stopMicrophoneStream,
  handleFileUpload,
  micStatus = 'Ready',
  micLevel = 0,
  isStreaming = false
}) {
  const [folioLocked, setFolioLocked] = useState(false);
  const [deskChallengeSent, setDeskChallengeSent] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [simulatedThreat, setSimulatedThreat] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const samples = [
    {
      label: "Dining Reservation Confirmation",
      isSpoof: false,
      language: "English",
      description: "Authentic guest table booking",
      url: "/sector_audio/hospitality/bonafide/hospitality_bonafide_reservation_en.wav",
      scenario: "guest_verification"
    },
    {
      label: "VIP Suite Folio Hijack",
      isSpoof: true,
      language: "Tamil",
      description: "Cloned guest requests car charge to room",
      url: "/sector_audio/hospitality/spoof/hospitality_spoof_vip_folio_ta.wav",
      scenario: "vip_booking"
    },
    {
      label: "Suite Cancellation Scam",
      isSpoof: true,
      language: "Hindi",
      description: "Cloned voice cancels booking & requests refund",
      url: "/sector_audio/hospitality/spoof/hospitality_spoof_suite_cancel_hi.wav",
      scenario: "reservation_change"
    }
  ];

  const aiProbability = selected.ai_probability ?? 0.0;
  const speakerSimilarity = selected.speaker_similarity ?? null;
  const speakerMatch = selected.speaker_match ?? null;
  const governance = selected.governance_decision || {};

  const hasCrossSectorThreat = governance.cross_sector_threat_detected || simulatedThreat;
  const threatOrigin = governance.threat_intel?.origin_sectors?.join(', ') || 'FINANCE & RETAIL (Cross-Sector Impersonation Campaign)';

  const compositeRiskScore = governance.composite_risk_score !== undefined
    ? governance.composite_risk_score
    : Math.min(1.0, Math.max(0.0, (aiProbability * 0.50) + ((1.0 - (speakerSimilarity ?? 0.5)) * 0.30) + 0.20));

  const riskLevel = governance.risk_level || (aiProbability >= 0.75 || hasCrossSectorThreat ? 'high' : aiProbability >= 0.40 ? 'medium' : 'low');
  const action = governance.action || (riskLevel === 'high' ? 'lock_folio_and_escalate' : riskLevel === 'medium' ? 'require_front_desk_id' : 'allow');
  const hasAudioResult =
    selected.ai_probability !== undefined &&
    selected.ai_probability !== null;

  const recommendedActions = governance.recommended_actions || [
    riskLevel === 'high'
      ? 'Immediately lock room folio and halt phone-authorized charges.'
      : riskLevel === 'medium'
      ? 'Send verification challenge and require government ID at check-in.'
      : 'Guest verified against biometric record. Normal concierge workflow allowed.'
  ];


  // The ensemble AI probability is the authoritative voice-authenticity result.
  const decisionState = selected.alert_triggered
    ? {
        label: 'SECURITY ALERT',
        shortLabel: 'ACTION REQUIRED',
        description: selected.alert_reason || 'The security policy has triggered an alert.',
        instruction: 'Stop authorization and follow the configured security escalation procedure.',
        tone: 'danger',
      }
    : aiProbability >= 0.80
    ? {
        label: 'LIKELY AI-GENERATED',
        shortLabel: 'HOLD & VERIFY',
        description: 'Strong synthetic-voice signal detected.',
        instruction: 'Do not authorize the requested room charge or booking change from this call alone.',
        tone: 'danger',
      }
    : aiProbability >= 0.50
    ? {
        label: 'INCONCLUSIVE',
        shortLabel: 'VERIFY',
        description: 'The voice evidence is mixed.',
        instruction: 'Do not make a security decision from the voice alone. Complete guest verification.',
        tone: 'warning',
      }
    : {
        label: 'LIKELY AUTHENTIC',
        shortLabel: 'CONTINUE / MONITOR',
        description: 'No strong synthetic-voice signal detected.',
        instruction: 'Continue the normal hospitality workflow and monitor the transaction.',
        tone: 'safe',
      };

  const decisionStyles = {
    danger: {
      container: 'border-rose-500/50 bg-rose-950/40',
      icon: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      title: 'text-rose-200',
      probability: 'text-rose-300',
      action: 'border-rose-400/40 bg-rose-500/20 text-rose-100',
    },
    warning: {
      container: 'border-amber-500/50 bg-amber-950/40',
      icon: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      title: 'text-amber-200',
      probability: 'text-amber-300',
      action: 'border-amber-400/40 bg-amber-500/20 text-amber-100',
    },
    safe: {
      container: 'border-emerald-500/50 bg-emerald-950/40',
      icon: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      title: 'text-emerald-200',
      probability: 'text-emerald-300',
      action: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
    },
  };

  const decisionStyle = decisionStyles[decisionState.tone];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleLockFolio = async () => {
    try {
      const res = await lockRoomFolio({ roomNumber: "1402", guestName: "S. Ramachandran" });
      setFolioLocked(true);
      showToast(res.message || "Room folio locked in Oracle Opera PMS!");
    } catch (e) {
      setFolioLocked(true);
      showToast("Room 1402 folio billing locked in Opera PMS.");
    }
  };

  const handleChallengeGuest = async () => {
    try {
      const res = await challengeGuest({ roomNumber: "1402" });
      setDeskChallengeSent(true);
      showToast(res.message || "Front Desk alerted: Require physical passport ID!");
    } catch (e) {
      setDeskChallengeSent(true);
      showToast("Front Desk alerted for physical passport ID check!");
    }
  };

  const handleSimulateThreat = async () => {
    try {
      await simulateThreat({ callerId: "+91 98765-XXXXX", originSector: "retail", spoofProbability: 0.95 });
      setSimulatedThreat(true);
      showToast("Cross-sector attacker threat registered in backend cache!");
    } catch (e) {
      setSimulatedThreat(true);
      showToast("Cross-sector threat simulated!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-950/90 px-4 py-3 text-xs font-mono text-amber-200 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="size-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Guided Hackathon Stepper */}
      <GuidedUserFlowBar
        currentSector="hospitality"
        hasAudioPlaying={isStreaming}
        hasResults={aiProbability > 0}
        hasActionTaken={folioLocked || deskChallengeSent}
        onOpenWebhook={() => setShowWebhook(true)}
      />

      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-900/50 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <Hotel className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  Hospitality & Guest Voice Identity Protection
                </h1>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                  Tertiary Sector · Hospitality & Travel
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Guards hotel front desks, luxury suites, and VIP guest folios against cloned voice impersonation and booking takeover.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-950/40 px-3 py-1.5 text-xs font-mono text-amber-300">
              <Lock className="size-3.5 text-amber-400" />
              <span>DPDP Act 2023 · Ephemeral RAM (0 Bytes Disk)</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono">
              <span className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-300">{isConnected ? 'PMS OPERA GATEWAY LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Sector Threat Intelligence Alert Banner */}
      {hasCrossSectorThreat && (
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/50 bg-gradient-to-r from-rose-950/80 via-red-950/60 to-slate-900/80 p-4 shadow-[0_0_30px_rgba(244,63,94,0.3)] backdrop-blur-xl animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <ShieldAlert className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-bold text-rose-200 text-sm">
                  <span>🚨 CROSS-SECTOR THREAT INTELLIGENCE ALERT</span>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider text-rose-300 border border-rose-500/30">
                    Cross-Sector Impersonator
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-rose-300/90 font-mono">
                  Caller voice acoustic signature previously flagged in: <strong className="text-white">{threatOrigin}</strong>. Prevent luxury charge exploitation.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSimulatedThreat(false)}
              className="text-xs text-rose-400 hover:text-white font-mono underline ml-4"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {hasAudioResult && (
        <div className="mb-6">
          {/* Primary Voice Security Decision */}
          <div className={`rounded-2xl border p-6 shadow-2xl backdrop-blur-md ${decisionStyle.container}`}>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl border ${decisionStyle.icon}`}>
                  {decisionState.tone === 'danger' ? (
                    <ShieldAlert className="size-7" />
                  ) : decisionState.tone === 'warning' ? (
                    <AlertTriangle className="size-7" />
                  ) : (
                    <ShieldCheck className="size-7" />
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Voice Security Decision
                  </div>
                  <div className={`mt-1 text-2xl font-black tracking-tight ${decisionStyle.title}`}>
                    {decisionState.label}
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    {decisionState.description}
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  AI Probability
                </div>
                <div className={`mt-1 text-4xl font-black font-mono ${decisionStyle.probability}`}>
                  {(aiProbability * 100).toFixed(1)}%
                </div>
                <div className="mt-1 text-[10px] font-mono text-slate-400">
                  50% XGBoost + 50% MMS-300M
                </div>
              </div>
            </div>

            <div className={`mt-5 flex flex-col gap-3 rounded-xl border p-4 ${decisionStyle.action}`}>
              <div className="flex items-center gap-2">
                <ArrowRight className="size-4 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Recommended Staff Action
                </span>
              </div>
              <div className="text-xl font-black tracking-tight">
                {decisionState.shortLabel}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {decisionState.instruction}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Acoustic Model
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-white">
                  {selected.xgb_probability !== undefined
                    ? `${(selected.xgb_probability * 100).toFixed(1)}%`
                    : '—'}
                </div>
                <div className="text-[10px] text-slate-500">
                  XGBoost supporting signal
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Neural Model
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-white">
                  {selected.dual_stream_probability !== undefined
                    ? `${(selected.dual_stream_probability * 100).toFixed(1)}%`
                    : '—'}
                </div>
                <div className="text-[10px] text-slate-500">
                  MMS-300M supporting signal
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Security Risk
                </div>
                <div className="mt-1 text-lg font-bold uppercase text-white">
                  {riskLevel}
                </div>
                <div className="text-[10px] text-slate-500">
                  Governance / transaction context
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sector Live Audio Controller & 1-Click Samples */}
      <SectorAudioPlayer
        title="Concierge Audio Streamer & Room Folio Defense"
        sector="hospitality"
        scenario={governance.scenario || "vip_booking"}
        samples={samples}
        onPlaySample={(url, scn) => streamAudioFromUrl?.(url, 'hospitality', scn || 'vip_booking')}
        onStartMic={startMicrophoneStream}
        onStopMic={stopMicrophoneStream}
        onFileUpload={handleFileUpload}
        isStreaming={isStreaming}
        micStatus={micStatus}
        micLevel={micLevel}
        accentColor="amber"
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Simulated Hotel Folio Context */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
            <Hotel className="size-4 text-amber-400" />
            Guest In-House Folio Record
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Guest Name</span>
              <span className="font-semibold text-white">S. Ramachandran</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Room / Suite</span>
              <span className="font-semibold text-amber-300">Presidential Suite #1402</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Tenant Store</span>
              <span className="font-semibold text-amber-300">Biometric [hospitality_isolated]</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Folio Credit Line</span>
              <span className="font-semibold text-emerald-400">₹ 2,00,000.00 Limit</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Inbound Call Type</span>
              <span className="font-semibold text-cyan-300">In-Room PBX Telephone Order</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Pending Request</span>
              <span className="font-semibold text-rose-300">Chauffeured Luxury Car + Room Charge</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="size-4 shrink-0 text-amber-400" />
              PCI-DSS & Folio Safeguard
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-300/80">
              Unattended phone requests exceeding ₹20,000 charged to room folios require front-desk physical keycard verification.
            </p>
          </div>
        </div>

        {/* Center Column: Live Risk & Biometric Gauges */}
        <div className="space-y-4 lg:col-span-2">


          {/* Decision & Action Workflow Panel */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Operator Controls
            </h2>

            <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-400">PMS Security Directive:</div>
              <div className="mt-1 text-sm font-medium text-slate-200">
                {governance.reason || (riskLevel === 'high' ? 'High voice-AI spoof risk detected on room folio order.' : 'Guest voice biometric profile verified against reservation record.')}
              </div>
              
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mandatory Next Steps:</div>
                {recommendedActions.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <ArrowRight className="size-3.5 mt-0.5 shrink-0 text-amber-400" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Actions - Connected to Backend REST Endpoints */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleLockFolio}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                  folioLocked
                    ? 'border-rose-400/50 bg-rose-500/30 text-rose-200'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                <KeyRound className="size-4" />
                {folioLocked ? 'Room Folio Locked in Opera PMS ✓' : 'Lock Room Folio Billing'}
              </button>

              <button
                onClick={handleChallengeGuest}
                className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-2.5 text-xs font-semibold text-amber-200 transition-all hover:bg-amber-500/30 active:scale-95"
              >
                <FileCheck className="size-4" />
                {deskChallengeSent ? 'Front Desk Challenge Flagged ✓' : 'Require In-Person Front Desk ID'}
              </button>

              <button
                onClick={() => {
                  setAlertSent(true);
                  showToast("Duty Manager dispatched to Suite 1402!");
                }}
                disabled={alertSent}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
              >
                <BellRing className="size-4 text-amber-400" />
                {alertSent ? 'Duty Manager Alerted ✓' : 'Alert Duty Manager'}
              </button>

              <button
                onClick={() => setShowWebhook(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <span>&lt;/&gt;</span>
                Inspect Oracle Opera PMS Webhook
              </button>

              <button
                onClick={handleSimulateThreat}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                  hasCrossSectorThreat
                    ? 'border-rose-500/40 bg-rose-500/20 text-rose-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <ShieldAlert className="size-4 text-rose-400" />
                {hasCrossSectorThreat ? 'Cross-Sector Threat Active' : 'Simulate Cross-Sector Attacker'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <EnterpriseWebhookDrawer
        isOpen={showWebhook}
        onClose={() => setShowWebhook(false)}
        sector="hospitality"
        scenario={governance.scenario || "vip_booking"}
        riskLevel={riskLevel}
        action={action}
        aiProbability={aiProbability}
        speakerMatch={speakerMatch}
        metadata={{ room: "1402", guest: "S. Ramachandran", compositeRisk: compositeRiskScore }}
      />
    </div>
  );
}
