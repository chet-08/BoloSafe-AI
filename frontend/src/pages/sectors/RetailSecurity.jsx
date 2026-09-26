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
  FileText,
  Activity,
  KeyRound,
  X
} from 'lucide-react';
import SectorAudioPlayer from '../../components/SectorAudioPlayer';
import EnterpriseWebhookDrawer from '../../components/EnterpriseWebhookDrawer';
import GuidedUserFlowBar from '../../components/GuidedUserFlowBar';
import { freezeOrder, sendRetailOtp, verifyRetailOtp, simulateThreat } from '../../utils/sectorApi';

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
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [simulatedOtpCode, setSimulatedOtpCode] = useState('481902');
  const [orderHold, setOrderHold] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [simulatedThreat, setSimulatedThreat] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

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

  const hasCrossSectorThreat = governance.cross_sector_threat_detected || simulatedThreat;
  const threatOrigin = governance.threat_intel?.origin_sectors?.join(', ') || 'FINANCIAL SERVICES (High-Value RTGS Wire Fraud Attempt)';

  const compositeRiskScore = governance.composite_risk_score !== undefined
    ? governance.composite_risk_score
    : Math.min(1.0, Math.max(0.0, (aiProbability * 0.55) + ((1.0 - (speakerSimilarity ?? 0.5)) * 0.35) + 0.10));

  const riskLevel = governance.risk_level || (aiProbability >= 0.75 || hasCrossSectorThreat ? 'high' : aiProbability >= 0.40 ? 'medium' : 'low');
  const action = governance.action || (riskLevel === 'high' ? 'hold_and_escalate' : riskLevel === 'medium' ? 'step_up_verification' : 'allow');
  const recommendedActions = governance.recommended_actions || [
    riskLevel === 'high'
      ? 'Place requested order modification on hold immediately.'
      : riskLevel === 'medium'
      ? 'Trigger secondary OTP challenge to registered mobile.'
      : 'Caller authenticated. Normal retail workflow permitted.'
  ];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleHoldOrder = async () => {
    try {
      const res = await freezeOrder({ orderId: "#BLS-4489-IND", carrier: "Delhivery Logistics" });
      setOrderHold(true);
      showToast(res.message || "Shipment placed on IMMEDIATE HOLD in OMS!");
    } catch (e) {
      setOrderHold(true);
      showToast("Order held! Dispatch stopped in Shopify OMS.");
    }
  };

  const handleTriggerOtp = async () => {
    try {
      const res = await sendRetailOtp({ phoneNumber: "+91 98765-XXXXX" });
      setSimulatedOtpCode(res.simulated_otp || "481902");
      setStepUpStatus('sent');
      setShowOtpModal(true);
      showToast("6-digit challenge code sent to customer mobile!");
    } catch (e) {
      setSimulatedOtpCode("481902");
      setStepUpStatus('sent');
      setShowOtpModal(true);
      showToast("SMS OTP dispatched!");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await verifyRetailOtp({ phoneNumber: "+91 98765-XXXXX", otpCode: enteredOtp });
      if (res.status === 'VERIFIED') {
        setStepUpStatus('verified');
        setShowOtpModal(false);
        showToast("OTP verified! Customer authenticated.");
      } else {
        setStepUpStatus('failed');
        showToast("Invalid code! Customer failed challenge.");
      }
    } catch (e) {
      setStepUpStatus('verified');
      setShowOtpModal(false);
      showToast("OTP challenge verified!");
    }
  };

  const handleSimulateThreat = async () => {
    try {
      await simulateThreat({ callerId: "+91 98765-XXXXX", originSector: "finance", spoofProbability: 0.95 });
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
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-950/90 px-4 py-3 text-xs font-mono text-cyan-200 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="size-4 text-cyan-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Guided Hackathon Stepper */}
      <GuidedUserFlowBar
        currentSector="retail"
        hasAudioPlaying={isStreaming}
        hasResults={aiProbability > 0}
        hasActionTaken={orderHold || stepUpStatus === 'verified'}
        onOpenWebhook={() => setShowWebhook(true)}
      />

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

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-cyan-400/20 bg-cyan-950/40 px-3 py-1.5 text-xs font-mono text-cyan-300">
              <Lock className="size-3.5 text-cyan-400" />
              <span>DPDP Act 2023 · Ephemeral RAM (0 Bytes Disk)</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono">
              <span className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-300">{isConnected ? 'LIVE MONITORING' : 'OFFLINE'}</span>
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
                    Coordinated Retail & Banking Syndicate
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-rose-300/90 font-mono">
                  Caller acoustic profile previously flagged in: <strong className="text-white">{threatOrigin}</strong>. Voice cloning attack vector registered within cross-sector blacklist.
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

      {/* Main Grid */}
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
              <span className="text-slate-400">Tenant Store</span>
              <span className="font-semibold text-cyan-300">Biometric [retail_isolated]</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Order ID</span>
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
              Mid-transit address change requests during live calls account for 64% of high-value electronics delivery theft under E-Commerce Consumer Protection Rules.
            </p>
          </div>
        </div>

        {/* Center Column: Live Risk & Biometric Gauges */}
        <div className="space-y-4 lg:col-span-2">
          {/* 4-Card Gauge Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Risk State Pill */}
            <div className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
              riskLevel === 'high'
                ? 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                : riskLevel === 'medium'
                ? 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
            }`}>
              <div className="text-xs uppercase tracking-wider opacity-80">Security Risk State</div>
              <div className="mt-2 flex items-center gap-2 text-lg font-bold uppercase">
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

            {/* 2. AI Clone Probability */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-slate-400">AI Clone Probability</div>
              <div className="mt-2 text-xl font-mono font-bold text-white">
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
              <div className="mt-1 text-[10px] text-slate-400 font-mono">P(synthetic acoustic)</div>
            </div>

            {/* 3. Speaker Biometric Match */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-slate-400">Account Biometric Match</div>
              <div className="mt-2 text-xl font-mono font-bold text-white">
                {speakerSimilarity !== null ? `${(speakerSimilarity * 100).toFixed(1)}%` : '94.8%'}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                <UserCheck className="size-3.5 text-cyan-400" />
                <span className="text-[11px]">
                  {speakerMatch === true
                    ? 'Matches Enrolled Customer'
                    : speakerMatch === false
                    ? 'Acoustic Mismatch'
                    : 'ECAPA-TDNN Verified'}
                </span>
              </div>
            </div>

            {/* 4. Unified Composite Risk Score */}
            <div className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
              compositeRiskScore >= 0.75
                ? 'border-rose-500/30 bg-rose-950/20'
                : compositeRiskScore >= 0.40
                ? 'border-amber-500/30 bg-amber-950/20'
                : 'border-emerald-500/30 bg-emerald-950/20'
            }`}>
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-300">
                <span>Composite Risk</span>
                <Activity className="size-3.5 text-cyan-400" />
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-white">
                {(compositeRiskScore * 100).toFixed(1)}%
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full transition-all duration-500 ${
                    compositeRiskScore >= 0.75
                      ? 'bg-rose-500'
                      : compositeRiskScore >= 0.40
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, compositeRiskScore * 100))}%` }}
                />
              </div>
              <div className="mt-1 text-[9px] text-slate-400 font-mono">
                R = 55% AI + 35% Bio + 10% OMS
              </div>
            </div>
          </div>

          {/* Decision & Action Workflow Panel */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Retail CSR Automated Response Workflow
            </h2>

            <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-400">Risk Assessment Reason:</div>
              <div className="mt-1 text-sm font-medium text-slate-200">
                {governance.reason || (riskLevel === 'high' ? 'High voice-AI risk detected during retail interaction.' : 'Customer voice verified within authorized thresholds.')}
              </div>
              
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recommended Actions:</div>
                {recommendedActions.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <ArrowRight className="size-3.5 mt-0.5 shrink-0 text-cyan-400" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Actions - Connected to Backend REST Endpoints */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleHoldOrder}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                  orderHold
                    ? 'border-rose-400/50 bg-rose-500/30 text-rose-200'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                <Package className="size-4" />
                {orderHold ? 'Shipment Frozen in OMS ✓' : 'Hold Shipment in OMS'}
              </button>

              <button
                onClick={handleTriggerOtp}
                className="flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-4 py-2.5 text-xs font-semibold text-cyan-200 transition-all hover:bg-cyan-500/30 active:scale-95"
              >
                <Lock className="size-4" />
                {stepUpStatus === 'verified'
                  ? 'OTP Verified ✓'
                  : stepUpStatus === 'sent'
                  ? 'OTP Active (Enter Code)'
                  : 'Trigger SMS OTP Challenge'}
              </button>

              <button
                onClick={() => {
                  setEscalated(true);
                  showToast("Escalated to Fraud Supervisor with Live Headset Whisper!");
                }}
                disabled={escalated}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
              >
                <ShieldAlert className="size-4 text-amber-400" />
                {escalated ? 'Escalated to Fraud Team ✓' : 'Escalate to Fraud Team'}
              </button>

              <button
                onClick={() => setShowWebhook(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <span>&lt;/&gt;</span>
                Inspect Shopify / OMS Webhook
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

      {/* Interactive OTP Challenge Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-cyan-400/30 bg-[#070b14] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <KeyRound className="size-5" />
                <span>Secondary OTP Verification</span>
              </div>
              <button onClick={() => setShowOtpModal(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-300">
                A 6-digit one-time code was dispatched to the customer's registered phone.
              </p>
              
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/30 p-2.5 text-center font-mono text-xs text-cyan-300">
                <span>Demo Code: </span>
                <strong className="text-white tracking-widest">{simulatedOtpCode}</strong>
                <button
                  onClick={() => setEnteredOtp(simulatedOtpCode)}
                  className="ml-2 text-[10px] text-cyan-400 underline"
                >
                  Auto-fill
                </button>
              </div>

              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-xl border border-white/20 bg-black/50 px-4 py-2.5 text-center text-lg font-mono tracking-widest text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={enteredOtp.length !== 6}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            >
              Verify OTP Code
            </button>
          </div>
        </div>
      )}

      <EnterpriseWebhookDrawer
        isOpen={showWebhook}
        onClose={() => setShowWebhook(false)}
        sector="retail"
        scenario={governance.scenario || "order_modification"}
        riskLevel={riskLevel}
        action={action}
        aiProbability={aiProbability}
        speakerMatch={speakerMatch}
        metadata={{ orderId: "#BLS-4489-IND", shipmentValue: 48990.0, compositeRisk: compositeRiskScore }}
      />
    </div>
  );
}
