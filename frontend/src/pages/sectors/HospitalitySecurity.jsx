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
  BellRing
} from 'lucide-react';
import SectorAudioPlayer from '../../components/SectorAudioPlayer';
import EnterpriseWebhookDrawer from '../../components/EnterpriseWebhookDrawer';

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

  const riskLevel = governance.risk_level || (aiProbability >= 0.75 ? 'high' : aiProbability >= 0.40 ? 'medium' : 'low');
  const action = governance.action || (riskLevel === 'high' ? 'lock_folio_and_escalate' : riskLevel === 'medium' ? 'require_front_desk_id' : 'allow');
  const recommendedActions = governance.recommended_actions || [
    riskLevel === 'high'
      ? 'Immediately lock room folio and halt phone-authorized charges.'
      : riskLevel === 'medium'
      ? 'Send verification challenge and require government ID at check-in.'
      : 'Guest verified against biometric record. Normal concierge workflow allowed.'
  ];

  return (
    <div className="space-y-6">
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono">
              <span className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-300">{isConnected ? 'CONCIERGE ACTIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Live Audio Controller & 1-Click Samples */}
      <SectorAudioPlayer
        title="Hospitality Concierge Audio Streamer & Folio Protection"
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
        {/* Left Column: Simulated Hospitality Guest & Folio Context */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
            <KeyRound className="size-4 text-amber-400" />
            Guest Reservation & Folio
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Guest Name</span>
              <span className="font-semibold text-white">Oberoi Platinum Guest</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Reservation Folio</span>
              <span className="font-semibold text-white">#OBR-9921-DEL</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Assigned Suite</span>
              <span className="font-semibold text-amber-300">Suite 1402 (Presidential)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Active Scenario</span>
              <span className="font-semibold text-amber-300 capitalize">
                {(governance.scenario || selected.notification_scenario || 'vip_booking').replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Folio Credit Limit</span>
              <span className="font-semibold text-emerald-400">₹ 2,50,000.00</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Inbound Request</span>
              <span className="font-semibold text-amber-300">Charge Luxury Car Rental to Room</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="size-4 shrink-0 text-amber-400" />
              Concierge Vulnerability
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-300/80">
              High-profile guests frequently have voice samples available publicly online, making VIP phone-booking spoofing an attractive attack vector.
            </p>
          </div>
        </div>

        {/* Center Column: Live Risk & Biometric Gauges */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Risk State Pill */}
            <div className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
              riskLevel === 'high'
                ? 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                : riskLevel === 'medium'
                ? 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
            }`}>
              <div className="text-xs uppercase tracking-wider opacity-80">Guest Voice Status</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-bold uppercase">
                {riskLevel === 'high' ? (
                  <>
                    <XCircle className="size-5 text-rose-400" />
                    AI Impersonator
                  </>
                ) : riskLevel === 'medium' ? (
                  <>
                    <AlertTriangle className="size-5 text-amber-400" />
                    ID Required
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    VIP Verified
                  </>
                )}
              </div>
              <div className="mt-1 text-xs opacity-75 font-mono">
                Level: {riskLevel.toUpperCase()}
              </div>
            </div>

            {/* AI Clone Probability */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-slate-400">Deepfake Probability</div>
              <div className="mt-2 text-2xl font-mono font-bold text-white">
                {(aiProbability * 100).toFixed(1)}%
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full transition-all duration-500 ${
                    aiProbability > 0.75
                      ? 'bg-rose-500'
                      : aiProbability > 0.40
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, aiProbability * 100))}%` }}
                />
              </div>
            </div>

            {/* Speaker Biometric Match */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-slate-400">Guest Biometric Match</div>
              <div className="mt-2 text-2xl font-mono font-bold text-white">
                {speakerSimilarity !== null ? `${(speakerSimilarity * 100).toFixed(1)}%` : 'No Profile'}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                <UserCheck className="size-3.5 text-amber-400" />
                <span>
                  {speakerMatch === true
                    ? 'Matches Stored Profile'
                    : speakerMatch === false
                    ? 'Voice Profile Mismatch'
                    : 'Awaiting Audio'}
                </span>
              </div>
            </div>
          </div>

          {/* Decision & Action Workflow Panel */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Hospitality Protocol & Folio Safeguards
            </h2>

            <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-400">Front Desk Assessment:</div>
              <div className="mt-1 text-sm font-medium text-slate-200">
                {governance.reason || (riskLevel === 'high' ? 'High voice-AI likelihood detected during hospitality service request.' : 'Caller identity within authentic biometric thresholds.')}
              </div>
              
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recommended Next Steps:</div>
                {recommendedActions.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <ArrowRight className="size-3.5 mt-0.5 shrink-0 text-amber-400" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setFolioLocked(!folioLocked)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                  folioLocked
                    ? 'border-rose-400/50 bg-rose-500/30 text-rose-200'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <KeyRound className="size-4" />
                {folioLocked ? 'Room Folio Frozen (Locked)' : 'Lock Room Folio & Stop Charges'}
              </button>

              <button
                onClick={() => setDeskChallengeSent(true)}
                disabled={deskChallengeSent}
                className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-2.5 text-xs font-semibold text-amber-200 transition-all hover:bg-amber-500/30 active:scale-95 disabled:opacity-50"
              >
                <FileCheck className="size-4" />
                {deskChallengeSent ? 'Physical ID Required at Desk ✓' : 'Require Physical ID at Desk'}
              </button>

              <button
                onClick={() => setAlertSent(true)}
                disabled={alertSent}
                className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-500/20 active:scale-95 disabled:opacity-50"
              >
                <BellRing className="size-4" />
                {alertSent ? 'Duty Manager Dispatched ✓' : 'Alert Security Duty Manager'}
              </button>

              <button
                onClick={() => setShowWebhook(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <span>&lt;/&gt;</span>
                Inspect Hotel PMS Webhook
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
        metadata={{ reservationId: "#HOTEL-TAJ-9912", roomNo: "Suite 702 (Presidential)" }}
      />
    </div>
  );
}
