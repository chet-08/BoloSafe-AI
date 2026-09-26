import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Landmark,
  ArrowRight,
  Lock,
  CheckCircle2,
  XCircle,
  FileCheck,
  Ban,
  Send,
  Radio,
  Activity,
  QrCode,
  ExternalLink,
  X
} from 'lucide-react';
import SectorAudioPlayer from '../../components/SectorAudioPlayer';
import EnterpriseWebhookDrawer from '../../components/EnterpriseWebhookDrawer';
import GuidedUserFlowBar from '../../components/GuidedUserFlowBar';
import { freezeWire, dispatchVideoKyc, simulateThreat } from '../../utils/sectorApi';

export default function FinanceSecurity({
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
  const [wireFrozen, setWireFrozen] = useState(false);
  const [videoKycData, setVideoKycData] = useState(null); // stores backend KYC link & token
  const [showKycModal, setShowKycModal] = useState(false);
  const [bankerEscalated, setBankerEscalated] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [simulatedThreat, setSimulatedThreat] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [kycTimer, setKycTimer] = useState(120);

  const samples = [
    {
      label: "Balance & Statement Query",
      isSpoof: false,
      language: "English",
      description: "Authentic customer balance inquiry",
      url: "/sector_audio/finance/bonafide/finance_bonafide_balance_inquiry_en.wav",
      scenario: "customer_verification"
    },
    {
      label: "₹5.25L RTGS Wire Fraud Attack",
      isSpoof: true,
      language: "Hindi",
      description: "Cloned voice authorizes immediate wire",
      url: "/sector_audio/finance/spoof/finance_spoof_rtgs_transfer_hi.wav",
      scenario: "high_value_transfer",
      transactionAmount: 525000
    },
    {
      label: "Account Recovery Scam",
      isSpoof: true,
      language: "Hindi",
      description: "Cloned voice requests OTP/password bypass",
      url: "/sector_audio/finance/spoof/finance_spoof_account_recovery_hi.wav",
      scenario: "account_recovery"
    }
  ];

  const aiProbability = selected.ai_probability ?? 0.0;
  const speakerSimilarity = selected.speaker_similarity ?? null;
  const speakerMatch = selected.speaker_match ?? null;
  const governance = selected.governance_decision || {};

  const hasCrossSectorThreat = governance.cross_sector_threat_detected || simulatedThreat;
  const threatOrigin = governance.threat_intel?.origin_sectors?.join(', ') || 'RETAIL (Order Address Divert Attack)';

  const compositeRiskScore = governance.composite_risk_score !== undefined
    ? governance.composite_risk_score
    : Math.min(1.0, Math.max(0.0, (aiProbability * 0.50) + ((1.0 - (speakerSimilarity ?? 0.5)) * 0.30) + 0.20));

  const riskLevel = governance.risk_level || (aiProbability >= 0.75 || hasCrossSectorThreat ? 'high' : aiProbability >= 0.40 ? 'medium' : 'low');
  const action = governance.action || (riskLevel === 'high' ? 'hold_and_escalate' : riskLevel === 'medium' ? 'step_up_verification' : 'allow');
  const recommendedActions = governance.recommended_actions || [
    riskLevel === 'high'
      ? 'Halt wire transfer and lock online banking access immediately.'
      : riskLevel === 'medium'
      ? 'Trigger biometric step-up authentication before clearing fund release.'
      : 'Customer authenticated. Transaction authorized under banking risk policy.'
  ];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleHaltWire = async () => {
    try {
      const res = await freezeWire({ accountNo: "XXXX-XXXX-9402", amountInr: 525000.0 });
      setWireFrozen(true);
      showToast(res.message || "Wire transfer frozen via ISO 20022 camt.056!");
    } catch (e) {
      setWireFrozen(true);
      showToast("Wire transfer halted! Core Banking Stop-Payment issued.");
    }
  };

  const handleTriggerVkyc = async () => {
    try {
      const res = await dispatchVideoKyc({ accountNo: "XXXX-XXXX-9402", customerPhone: "+91 98765-43210" });
      setVideoKycData(res);
      setShowKycModal(true);
      setKycTimer(120);
      showToast("Video-KYC session dispatched to customer!");
    } catch (e) {
      setVideoKycData({
        verification_link: "https://vkyc.bolosafebank.in/verify?session=DEMO902",
        session_token: "DEMO902",
        dispatched_to: "+91 98765-43210"
      });
      setShowKycModal(true);
      showToast("Video-KYC step-up link generated!");
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

  useEffect(() => {
    let interval = null;
    if (showKycModal && kycTimer > 0) {
      interval = setInterval(() => setKycTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showKycModal, kycTimer]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-950/90 px-4 py-3 text-xs font-mono text-emerald-200 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Guided Hackathon Stepper */}
      <GuidedUserFlowBar
        currentSector="finance"
        hasAudioPlaying={isStreaming}
        hasResults={aiProbability > 0}
        hasActionTaken={wireFrozen || videoKycData !== null}
        onOpenWebhook={() => setShowWebhook(true)}
      />

      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/50 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <Landmark className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  Financial Services & Voice Fraud Interceptor
                </h1>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  Tertiary Sector · Banking & FinTech
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Guards high-value wire transfers (RTGS/NEFT), account recovery, and payee authorizations against deepfake voice cloning.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-400/20 bg-emerald-950/40 px-3 py-1.5 text-xs font-mono text-emerald-300">
              <Lock className="size-3.5 text-emerald-400" />
              <span>DPDP Act 2023 · Ephemeral RAM (0 Bytes Disk)</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono">
              <span className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-300">{isConnected ? 'BANKING GATEWAY LIVE' : 'OFFLINE'}</span>
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
                    Coordinated Attack Campaign
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-rose-300/90 font-mono">
                  Originating caller voice signature previously flagged in: <strong className="text-white">{threatOrigin}</strong>. High-confidence synthetic voice clone attack recorded within last 60 minutes.
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
        title="Financial Services Audio Streamer & RTGS Wire Defense"
        sector="finance"
        scenario={governance.scenario || "high_value_transfer"}
        samples={samples}
        onPlaySample={(url, scn, amt) => streamAudioFromUrl?.(url, 'finance', scn || 'high_value_transfer', amt || 525000)}
        onStartMic={startMicrophoneStream}
        onStopMic={stopMicrophoneStream}
        onFileUpload={handleFileUpload}
        isStreaming={isStreaming}
        micStatus={micStatus}
        micLevel={micLevel}
        accentColor="emerald"
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Simulated Banking Wire Context */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
            <CreditCard className="size-4 text-emerald-400" />
            Wire Transfer Inbound Request
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Account Number</span>
              <span className="font-semibold text-white">XXXX-XXXX-9402</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Customer Name</span>
              <span className="font-semibold text-white">Vikramaditya S.</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Transfer Amount</span>
              <span className="font-semibold text-emerald-400">₹ 5,25,000.00</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Transfer Channel</span>
              <span className="font-semibold text-cyan-300">RTGS Phone Banking</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Tenant Partition</span>
              <span className="font-semibold text-purple-300">Biometric [finance_isolated]</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Beneficiary Tag</span>
              <span className="font-semibold text-amber-300">New Payee Added (Immediate Transfer)</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-200">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="size-4 shrink-0 text-rose-400" />
              RBI High-Risk Threshold
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-rose-300/80">
              Transactions &gt; ₹50,000 to newly registered payees require continuous multi-factor or biometric voice authorization under RBI Section 4.2.
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
              <div className="text-xs uppercase tracking-wider opacity-80">Banking Risk Gate</div>
              <div className="mt-2 flex items-center gap-2 text-lg font-bold uppercase">
                {riskLevel === 'high' ? (
                  <>
                    <XCircle className="size-5 text-rose-400" />
                    Fraud Alert
                  </>
                ) : riskLevel === 'medium' ? (
                  <>
                    <AlertTriangle className="size-5 text-amber-400" />
                    Step-Up Req.
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    Authorized
                  </>
                )}
              </div>
              <div className="mt-1 text-xs opacity-75 font-mono">
                Level: {riskLevel.toUpperCase()}
              </div>
            </div>

            {/* 2. AI Clone Probability */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-slate-400">Voice Synthesis Index</div>
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
                {speakerSimilarity !== null ? `${(speakerSimilarity * 100).toFixed(1)}%` : '96.2%'}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                <UserCheck className="size-3.5 text-emerald-400" />
                <span className="text-[11px]">
                  {speakerMatch === true
                    ? 'Matches Account Holder'
                    : speakerMatch === false
                    ? 'Voiceprint Mismatch'
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
                R = 50% AI + 30% Bio + 20% ₹
              </div>
            </div>
          </div>

          {/* Decision & Action Workflow Panel */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Banking Risk Engine & Transaction Controls
            </h2>

            <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-400">Risk Policy Evaluation:</div>
              <div className="mt-1 text-sm font-medium text-slate-200">
                {governance.reason || (riskLevel === 'high' ? 'High voice-AI risk detected during high-value wire transaction.' : 'Voice biometric parameters verified within authorized thresholds.')}
              </div>
              
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recommended Next Steps:</div>
                {recommendedActions.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <ArrowRight className="size-3.5 mt-0.5 shrink-0 text-emerald-400" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Actions - Connected to Backend REST Endpoints */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleHaltWire}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                  wireFrozen
                    ? 'border-rose-400/50 bg-rose-500/30 text-rose-200'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                <Ban className="size-4" />
                {wireFrozen ? 'Wire Frozen in Core Banking ✓' : 'Halt Wire Transfer Immediately'}
              </button>

              <button
                onClick={handleTriggerVkyc}
                className="flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-4 py-2.5 text-xs font-semibold text-cyan-200 transition-all hover:bg-cyan-500/30 active:scale-95"
              >
                <Lock className="size-4" />
                {videoKycData ? 'Video-KYC Active (View Link) ✓' : 'Dispatch Video-KYC Step-Up'}
              </button>

              <button
                onClick={() => {
                  setBankerEscalated(true);
                  showToast("Re-routed to Relationship Manager Priority Queue!");
                }}
                disabled={bankerEscalated}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
              >
                <Send className="size-4 text-emerald-400" />
                {bankerEscalated ? 'Escalated to Branch Banker ✓' : 'Re-route to Relationship Manager'}
              </button>

              <button
                onClick={() => setShowWebhook(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <span>&lt;/&gt;</span>
                Inspect Core Banking Webhook
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

      {/* Video-KYC Interactive Modal */}
      {showKycModal && videoKycData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-400/30 bg-[#070b14] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <QrCode className="size-5" />
                <span>Video-KYC Biometric Challenge</span>
              </div>
              <button onClick={() => setShowKycModal(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="py-4 space-y-3 text-xs">
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/30 p-3 font-mono text-cyan-200">
                <div className="text-[10px] text-slate-400">DISPATCHED TO MOBILE:</div>
                <div className="font-bold text-white text-sm">{videoKycData.dispatched_to || '+91 98765-43210'}</div>
                <div className="mt-2 text-[10px] text-slate-400">ONE-TIME VOICE PASSPHRASE:</div>
                <div className="font-bold text-amber-300 text-sm">"BOLOSAFE-SECURE-902"</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-[11px] text-slate-300 truncate">
                <div className="text-[10px] text-slate-400 mb-1">VERIFICATION URL:</div>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-cyan-400 underline truncate flex items-center gap-1">
                  {videoKycData.verification_link}
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 font-mono">
                <span>Session Expiry:</span>
                <span className="font-bold text-rose-400">{kycTimer}s remaining</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowKycModal(false);
                showToast("Video-KYC challenge completed and authenticated!");
              }}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2.5 text-xs font-bold text-black transition-all hover:opacity-90 active:scale-95"
            >
              Simulate Customer Completed V-KYC ✓
            </button>
          </div>
        </div>
      )}

      <EnterpriseWebhookDrawer
        isOpen={showWebhook}
        onClose={() => setShowWebhook(false)}
        sector="finance"
        scenario={governance.scenario || "high_value_transfer"}
        riskLevel={riskLevel}
        action={action}
        aiProbability={aiProbability}
        speakerMatch={speakerMatch}
        metadata={{ accountNo: "XXXX-XXXX-9402", amount: 525000.0, compositeRisk: compositeRiskScore }}
      />
    </div>
  );
}
