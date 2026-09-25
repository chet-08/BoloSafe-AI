import React, { useState } from 'react';
import {
  ShoppingBag,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  PhoneCall,
  Lock,
  ArrowRight,
  Package,
  CreditCard,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
  FileText
} from 'lucide-react';
import SectorAudioPlayer from '../../components/SectorAudioPlayer';
import EnterpriseWebhookDrawer from '../../components/EnterpriseWebhookDrawer';

export default function RetailSecurity({
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
  const [stepUpStatus, setStepUpStatus] = useState(null); // 'pending' | 'sent' | 'verified' | 'failed'
  const [orderHold, setOrderHold] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  const samples = [
    {
      label: "Customer Support Inquiry",
      isSpoof: false,
      language: "English",
      description: "Legitimate order tracking & query",
      url: "/sector_audio/retail/bonafide/retail_bonafide_inquiry_en.wav",
      scenario: "customer_care"
    },
    {
      label: "Delivery Address Spoof",
      isSpoof: true,
      language: "Hindi",
      description: "Cloned voice reroutes shipment",
      url: "/sector_audio/retail/spoof/retail_spoof_address_change_hi.wav",
      scenario: "order_modification"
    },
    {
      label: "Refund Diversion Attack",
      isSpoof: true,
      language: "Tamil",
      description: "Cloned voice requests bank reroute",
      url: "/sector_audio/retail/spoof/retail_spoof_refund_redirect_ta.wav",
      scenario: "order_modification"
    }
  ];

  // Extract ML & Governance metrics from stream data
  const aiProbability = selected.ai_probability ?? 0.0;
  const speakerSimilarity = selected.speaker_similarity ?? null;
  const speakerMatch = selected.speaker_match ?? null;
  const governance = selected.governance_decision || {};

  const riskLevel = governance.risk_level || (aiProbability >= 0.75 ? 'high' : aiProbability >= 0.40 ? 'medium' : 'low');
  const action = governance.action || (riskLevel === 'high' ? 'hold_and_escalate' : riskLevel === 'medium' ? 'step_up_verification' : 'allow');
  const recommendedActions = governance.recommended_actions || [
    riskLevel === 'high'
      ? 'Place requested order modification on hold immediately.'
      : riskLevel === 'medium'
      ? 'Trigger secondary OTP challenge to registered mobile.'
      : 'Caller authenticated. Normal retail workflow permitted.'
  ];

  const handleStepUp = () => {
    setStepUpStatus('sent');
    setTimeout(() => {
      setStepUpStatus(riskLevel === 'high' ? 'failed' : 'verified');
    }, 2000);
  };

  const handleHoldOrder = () => {
    setOrderHold(!orderHold);
  };

  const handleEscalate = () => {
    setEscalated(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/40 via-violet-950/30 to-slate-900/50 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  Retail Call Security & Order Defense
                </h1>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                  Tertiary Sector · Retail & E-Commerce
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Detects synthetic voice clones attempting customer care impersonation, fraudulent address changes, and refund rerouting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono">
              <span className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-300">{isConnected ? 'LIVE MONITORING' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Live Audio Controller & 1-Click Samples */}
      <SectorAudioPlayer
        title="Retail Call Center Audio Streamer & Attack Simulator"
        sector="retail"
        scenario={governance.scenario || "order_modification"}
        samples={samples}
        onPlaySample={(url, scn) => streamAudioFromUrl?.(url, 'retail', scn || 'order_modification')}
        onStartMic={startMicrophoneStream}
        onStopMic={stopMicrophoneStream}
        onFileUpload={handleFileUpload}
        isStreaming={isStreaming}
        micStatus={micStatus}
        micLevel={micLevel}
        accentColor="cyan"
      />

      {/* Main Grid: Active Call Context + Real-time Biometrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Simulated Retail Order & Customer Context */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
            <PhoneCall className="size-4 text-cyan-400" />
            Inbound Call Metadata
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Customer ID</span>
              <span className="font-semibold text-white">RET-IN-90824</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Caller Line</span>
              <span className="font-semibold text-white">+91 98765-XXXXX</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Active Scenario</span>
              <span className="font-semibold text-cyan-300 capitalize">
                {(governance.scenario || selected.notification_scenario || 'order_modification').replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Order ID in Question</span>
              <span className="font-semibold text-white">#BLS-4489-IND</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Shipment Value</span>
              <span className="font-semibold text-emerald-400">₹ 48,990.00</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Caller Request</span>
              <span className="font-semibold text-amber-300">Re-route Delivery Address</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="size-4 shrink-0 text-amber-400" />
              High-Risk Vector
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-300/80">
              Mid-transit address change requests during live calls account for 64% of high-value electronics delivery theft.
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
              <div className="text-xs uppercase tracking-wider opacity-80">Security Risk State</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-bold uppercase">
                {riskLevel === 'high' ? (
                  <>
                    <XCircle className="size-5 text-rose-400" />
                    AI Suspected
                  </>
                ) : riskLevel === 'medium' ? (
                  <>
                    <AlertTriangle className="size-5 text-amber-400" />
                    Mismatch
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    Verified
                  </>
                )}
              </div>
              <div className="mt-1 text-xs opacity-75 font-mono">
                Level: {riskLevel.toUpperCase()}
              </div>
            </div>

            {/* AI Clone Probability */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-slate-400">AI Clone Probability</div>
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
              <div className="text-xs uppercase tracking-wider text-slate-400">Voiceprint Similarity</div>
              <div className="mt-2 text-2xl font-mono font-bold text-white">
                {speakerSimilarity !== null ? `${(speakerSimilarity * 100).toFixed(1)}%` : 'No Profile'}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                <UserCheck className="size-3.5 text-cyan-400" />
                <span>
                  {speakerMatch === true
                    ? 'Known Customer Match'
                    : speakerMatch === false
                    ? 'Biometric Mismatch'
                    : 'Awaiting Audio'}
                </span>
              </div>
            </div>
          </div>

          {/* Decision & Action Workflow Panel */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Automated Retail Governance Workflow
            </h2>

            <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-400">Policy Assessment:</div>
              <div className="mt-1 text-sm font-medium text-slate-200">
                {governance.reason || (riskLevel === 'high' ? 'High voice-AI risk detected during retail interaction.' : 'Call is within normal trust boundaries.')}
              </div>
              
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recommended Next Steps:</div>
                {recommendedActions.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <ArrowRight className="size-3.5 mt-0.5 shrink-0 text-cyan-400" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleStepUp}
                disabled={stepUpStatus === 'sent'}
                className="flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-4 py-2.5 text-xs font-semibold text-cyan-200 transition-all hover:bg-cyan-500/30 active:scale-95 disabled:opacity-50"
              >
                <Lock className="size-4" />
                {stepUpStatus === 'sent'
                  ? 'Dispatching OTP...'
                  : stepUpStatus === 'verified'
                  ? 'OTP Verified ✓'
                  : stepUpStatus === 'failed'
                  ? 'OTP Failed ✗'
                  : 'Trigger Step-Up OTP'}
              </button>

              <button
                onClick={handleHoldOrder}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                  orderHold
                    ? 'border-amber-400/50 bg-amber-500/30 text-amber-200'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <Truck className="size-4" />
                {orderHold ? 'Shipment Frozen (On Hold)' : 'Hold Shipment & Address'}
              </button>

              <button
                onClick={handleEscalate}
                disabled={escalated}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                  escalated
                    ? 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                <ShieldAlert className="size-4" />
                {escalated ? 'Escalated to Fraud Supervisor' : 'Escalate to Fraud Team'}
              </button>

              <button
                onClick={() => setShowWebhook(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <span>&lt;/&gt;</span>
                Inspect Logistics Webhook
              </button>
            </div>
          </div>
        </div>
      </div>

      <EnterpriseWebhookDrawer
        isOpen={showWebhook}
        onClose={() => setShowWebhook(false)}
        sector="retail"
        scenario={governance.scenario || "order_modification"}
        riskLevel={riskLevel}
        action={action}
        aiProbability={aiProbability}
        speakerMatch={speakerMatch}
        metadata={{ orderId: "#BLS-4489-IND", customerId: "RET-IN-90824" }}
      />
    </div>
  );
}
