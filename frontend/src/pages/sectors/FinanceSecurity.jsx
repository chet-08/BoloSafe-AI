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
import SecurityPageShell from '../../components/security/SecurityPageShell';
import DetectionMetricGrid from '../../components/security/DetectionMetricGrid';
import GovernanceDecisionCard from '../../components/security/GovernanceDecisionCard';
import SecurityActivityTimeline from '../../components/security/SecurityActivityTimeline';
import LiveDetectionPanel from '../../components/security/LiveDetectionPanel';
import SectorContextCard from '../../components/security/SectorContextCard';
import { freezeWire, dispatchVideoKyc, simulateThreat } from '../../utils/sectorApi';

export default function FinanceSecurity({
  selected = {},
  isConnected = false,
  streamAudioFromUrl,
  startMicrophoneStream,
  stopMicrophoneStream,
  stopActiveStream,
  handleFileUpload,
  micStatus = 'Ready',
  micLevel = 0,
  isStreaming = false
}) {
  const [wireFrozen, setWireFrozen] = useState(false);
  const [videoKycData, setVideoKycData] = useState(null); // stores backend KYC link & token
  const [showKycModal, setShowKycModal] = useState(false);
  const [bankerEscalated, setBankerEscalated] = useState(false);
  const [activeSampleScenario, setActiveSampleScenario] = useState(null);
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

  const hasDetectionResult =
    selected?.ai_probability != null ||
    selected?.rolling_score != null ||
    governance?.action != null ||
    governance?.risk_level != null;

  const isSpoof =
    hasDetectionResult &&
    (governance.risk_level === 'high' ||
      governance.risk_level === 'medium' ||
      selected.alert_triggered === true ||
      aiProbability >= 0.40 ||
      hasCrossSectorThreat);

  const isGenuine =
    hasDetectionResult && !isSpoof && (governance.risk_level === 'low' || aiProbability < 0.40);

  const riskLevel = hasDetectionResult
    ? (governance.risk_level || (aiProbability >= 0.75 || hasCrossSectorThreat ? 'high' : aiProbability >= 0.40 ? 'medium' : 'low'))
    : 'standby';

  const action = hasDetectionResult
    ? (governance.action || (riskLevel === 'high' ? 'hold_and_escalate' : riskLevel === 'medium' ? 'step_up_verification' : 'allow'))
    : 'standby';

  const recommendedActions = !hasDetectionResult
    ? [
        'Run a bonafide balance inquiry or spoof RTGS scenario from the library above.',
        'Core banking ISO 20022 stop-payment and Video-KYC countermeasures will activate dynamically upon spoof detection.'
      ]
    : isSpoof
    ? [
        'Immediate Wire Freeze: Halt ₹5,25,000 RTGS fund transfer via ISO 20022 camt.056 stop-payment.',
        'Identity Challenge: Dispatch mandatory out-of-band Video-KYC biometric step-up to customer.',
        'Account Lockdown: Temporarily freeze net banking and telephone banking access for account XXXX-XXXX-9402.',
        'Escalate Incident: Route case to Senior Fraud Operations with forensic spectrogram report.'
      ]
    : [
        'Voice confirmed authentic. Customer identity verified via acoustic feature & timbre matching.',
        'Transaction authorized under banking risk policy. Fund transfer cleared for RTGS settlement.',
        'No step-up or administrative freeze required.'
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
    <div className="space-y-5">
      {toastMsg && (
        <div className="fixed right-6 top-6 z-50 rounded-xl border border-[var(--state-success)]/20 bg-[var(--bg-card,#171A2D)] px-4 py-3 text-xs font-semibold text-[var(--text-primary)] shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[var(--state-success)]" />
            {toastMsg}
          </div>
        </div>
      )}

      <SecurityPageShell
        eyebrow="Financial Security"
        title="Financial Services"
        description="Voice-fraud interception for high-value transfers, account recovery, and sensitive banking actions."
        status={isConnected ? 'LIVE' : 'OFFLINE'}
        statusTone={isConnected ? 'active' : 'medium'}
        critical={
          riskLevel === 'high' || hasCrossSectorThreat
            ? {
                label: hasCrossSectorThreat
                  ? 'Cross-sector threat detected'
                  : 'Critical detection',
                title: hasCrossSectorThreat
                  ? 'Coordinated voice attack detected'
                  : 'Synthetic voice detected',
                description:
                  hasCrossSectorThreat
                    ? `Voice signature previously associated with ${threatOrigin}.`
                    : governance.reason ||
                      'High synthetic-voice probability persisted during the financial interaction.',
                actions: hasCrossSectorThreat ? (
                  <button
                    type="button"
                    onClick={() => setSimulatedThreat(false)}
                    className="rounded-lg border border-[#D96A78]/25 bg-[#D96A78]/[0.07] px-3 py-2 text-xs font-semibold text-[#D96A78] hover:bg-[var(--bg-hover,#1C2033)]"
                  >
                    Dismiss
                  </button>
                ) : null,
              }
            : null
        }
      >
        <DetectionMetricGrid
          metrics={[
            {
              id: 'synthetic-voice',
              label: 'Synthetic Voice Probability',
              value: hasDetectionResult
                ? `${(aiProbability * 100).toFixed(1)}%`
                : 'WAITING',
              icon: 'risk',
              tone: hasDetectionResult
                ? aiProbability >= 0.75
                  ? 'high'
                  : aiProbability >= 0.4
                    ? 'medium'
                    : 'low'
                : 'neutral',
              progress: hasDetectionResult ? aiProbability * 100 : undefined,
              helper: hasDetectionResult
                ? 'AI acoustic detection'
                : 'Awaiting live audio analysis',
            },
            {
              id: 'speaker-match',
              label: 'Account Biometric Match',
              value:
                hasDetectionResult && speakerSimilarity !== null
                  ? `${(speakerSimilarity * 100).toFixed(1)}%`
                  : 'WAITING',
              icon: 'speaker',
              tone:
                hasDetectionResult && speakerMatch === false
                  ? 'high'
                  : 'neutral',
              progress:
                hasDetectionResult && speakerSimilarity !== null
                  ? speakerSimilarity * 100
                  : undefined,
              helper:
                !hasDetectionResult
                  ? 'Awaiting ECAPA-TDNN verification'
                  : speakerMatch === true
                    ? 'Matches account holder'
                    : speakerMatch === false
                      ? 'Voiceprint mismatch'
                      : 'ECAPA-TDNN verification',
            },
            {
              id: 'composite-risk',
              label: 'Composite Risk',
              value: hasDetectionResult
                ? `${(compositeRiskScore * 100).toFixed(1)}%`
                : 'WAITING',
              icon: 'composite',
              tone: hasDetectionResult
                ? compositeRiskScore >= 0.75
                  ? 'high'
                  : compositeRiskScore >= 0.4
                    ? 'medium'
                    : 'low'
                : 'neutral',
              progress:
                hasDetectionResult
                  ? compositeRiskScore * 100
                  : undefined,
              helper: hasDetectionResult
                ? 'AI + biometric + transaction context'
                : 'Awaiting complete risk evaluation',
            },
            {
              id: 'risk-gate',
              label: 'Transaction Risk Gate',
              value: !hasDetectionResult
                ? 'NOT EVALUATED'
                : riskLevel === 'high'
                  ? 'FRAUD ALERT'
                  : riskLevel === 'medium'
                    ? 'STEP-UP'
                    : 'AUTHORIZED',
              icon: 'authenticity',
              tone: !hasDetectionResult
                ? 'neutral'
                : riskLevel === 'high'
                  ? 'high'
                  : riskLevel === 'medium'
                    ? 'medium'
                    : 'low',
              helper: !hasDetectionResult
                ? 'Policy state · WAITING'
                : `Policy state · ${riskLevel.toUpperCase()}`,
            },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <LiveDetectionPanel
            title="Live financial voice detection"
            description="Real-time audio ingestion and sector test audio"
            isLive={isStreaming}
          >
            <SectorAudioPlayer
              title="Financial Services Audio Streamer"
              sector="finance"
              scenario={activeSampleScenario}
              samples={samples}
              onPlaySample={(url, scn, amt) => {
                setActiveSampleScenario(scn || null)

                streamAudioFromUrl?.(
                  url,
                  'finance',
                  scn || 'high_value_transfer',
                  amt || 525000
                )
              }}
              onStartMic={() => {
                setActiveSampleScenario(null)
                startMicrophoneStream?.()
              }}
              onStopMic={stopActiveStream || stopMicrophoneStream}
              onStopStream={stopActiveStream || stopMicrophoneStream}
              onFileUpload={(file) => {
                setActiveSampleScenario(null)
                handleFileUpload?.(file)
              }}
              isStreaming={isStreaming}
              micStatus={micStatus}
              micLevel={micLevel}
            />
          </LiveDetectionPanel>

          <SectorContextCard
            title="Transaction protection"
            description="Banking context interpreted alongside voice risk."
            rows={[
              { label: 'Account', value: 'XXXX-XXXX-9402' },
              { label: 'Customer', value: 'Vikramaditya S.' },
              {
                label: 'Transfer amount',
                value: '₹5,25,000',
                tone: 'warning',
              },
              { label: 'Channel', value: 'RTGS Phone Banking' },
              {
                label: 'Beneficiary',
                value: 'New Payee',
                tone: 'danger',
              },
              { label: 'Tenant', value: 'finance_isolated' },
            ]}
            callout={{
              title: 'High-value transaction',
              description:
                'New-payee transfers remain protected until the applicable voice and identity controls are satisfied.',
            }}
          />
        </div>

        <GovernanceDecisionCard
          tone={
            !hasDetectionResult
              ? 'pending'
              : isSpoof
              ? 'escalate'
              : 'allow'
          }
          title={
            !hasDetectionResult
              ? 'Awaiting Live Voice Analysis'
              : isSpoof
              ? 'CRITICAL: Synthetic Voice Clone Detected — Fund Transfer Frozen'
              : 'Customer Authenticated — Transaction Cleared'
          }
          reason={
            !hasDetectionResult
              ? 'Select a financial scenario from the library above or start microphone stream to evaluate live voice authenticity and trigger core banking risk policy.'
              : isSpoof
              ? (governance.reason || 'Adversarial neural voice cloning detected on high-value transfer. Acoustic prosody and vocoder artifacts exceed fraud policy threshold.')
              : (governance.reason || 'Acoustic authenticity verified. Voiceprint matches authorized account holder with no synthetic vocoder artifacts detected.')
          }
          recommendations={recommendedActions}
          actions={
            <>
              {isGenuine && (
                <div className="flex items-center gap-1.5 rounded-lg border border-[#70B88A]/30 bg-[#70B88A]/20 px-3.5 py-2 text-xs font-bold text-[#70B88A]">
                  <CheckCircle2 size={14} />
                  Transaction Cleared & Authorized ✓
                </div>
              )}

              <button
                type="button"
                onClick={handleHaltWire}
                disabled={!hasDetectionResult || wireFrozen || isGenuine}
                className={[
                  'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                  wireFrozen
                    ? 'border-[var(--state-danger)]/25 bg-[var(--state-danger)]/10 text-[var(--state-danger)]'
                    : !hasDetectionResult || isGenuine
                      ? 'cursor-not-allowed border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)] opacity-50'
                      : 'border-[#D96A78]/30 bg-[#D96A78] text-white hover:bg-[#C85D6C]',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <Ban size={14} />
                  {wireFrozen ? 'Wire Frozen' : 'Halt Wire'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleTriggerVkyc}
                disabled={!hasDetectionResult || isGenuine}
                className={[
                  'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                  hasDetectionResult && isSpoof
                    ? 'border-[#5863D6]/35 bg-[#5863D6]/15 text-[#7079E0] hover:bg-[#5863D6]/25'
                    : 'cursor-not-allowed border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)] opacity-50',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <Lock size={14} />
                  {videoKycData ? 'View KYC' : 'Video-KYC'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBankerEscalated(true)
                  showToast('Re-routed to Relationship Manager Priority Queue!')
                }}
                disabled={!hasDetectionResult || bankerEscalated || isGenuine}
                className={[
                  'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                  bankerEscalated
                    ? 'border-[#D96A78]/25 bg-[#D96A78]/10 text-[#D96A78]'
                    : !hasDetectionResult || isGenuine
                      ? 'cursor-not-allowed border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)] opacity-50'
                      : 'border-[#D96A78]/25 bg-[#D96A78]/[0.07] text-[#D96A78] hover:bg-[var(--bg-hover,#1C2033)]',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <Send size={14} />
                  {bankerEscalated ? 'Escalated' : 'Escalate'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowWebhook(true)}
                className="rounded-lg border border-[var(--border-default)] bg-transparent px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-hover,#1C2033)] hover:text-[var(--text-primary)]"
              >
                Inspect Webhook
              </button>
            </>
          }
        />

        <SecurityActivityTimeline
          steps={[
            {
              label: 'Security context',
              value: hasDetectionResult
                ? `${governance.scenario || 'High-Value Transfer'} · ₹5,25,000`
                : 'Session Standby · High-Value Transfer (₹5,25,000)',
              tone: isSpoof ? 'detected' : 'ready',
              status: !hasDetectionResult ? 'STANDBY' : isSpoof ? 'THREAT' : 'VERIFIED',
            },
            {
              label: 'AI detection',
              value: !hasDetectionResult
                ? 'Awaiting audio ingestion'
                : `${(aiProbability * 100).toFixed(1)}% synthetic probability ${isSpoof ? '(AI Clone)' : '(Bonafide)'}`,
              tone: !hasDetectionResult ? 'pending' : isSpoof ? 'detected' : 'ready',
              status: !hasDetectionResult ? 'WAITING' : isSpoof ? 'CRITICAL' : 'AUTHENTIC',
            },
            {
              label: 'Governance',
              value: !hasDetectionResult
                ? 'Awaiting policy evaluation'
                : isSpoof
                ? 'Hold & Escalate · Stop-Payment Issued'
                : 'Allow · Fund Release Cleared',
              tone: !hasDetectionResult ? 'pending' : isSpoof ? 'decided' : 'ready',
              status: !hasDetectionResult ? 'PENDING' : isSpoof ? 'INTERCEPTED' : 'AUTHORIZED',
            },
            {
              label: 'Identity',
              value: !hasDetectionResult
                ? 'Awaiting speaker voiceprint'
                : isSpoof
                ? 'Voiceprint Mismatch / Cloned Timbre'
                : 'Voiceprint Match Confirmed (98.4%)',
              tone: !hasDetectionResult ? 'pending' : isSpoof ? 'detected' : 'identity',
              status: !hasDetectionResult ? 'STANDBY' : isSpoof ? 'FAILED' : 'VERIFIED',
            },
          ]}
        />
      </SecurityPageShell>

      {showKycModal && videoKycData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card,#171A2D)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <QrCode size={17} className="text-[var(--accent-primary-soft)]" />
                Video-KYC biometric challenge
              </div>

              <button
                type="button"
                onClick={() => setShowKycModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs">
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface,#121526)] p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Dispatched to
                </div>
                <div className="mt-1 font-semibold text-[var(--text-primary)]">
                  {videoKycData.dispatched_to || '+91 98765-43210'}
                </div>

                <div className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  One-time verification phrase
                </div>
                <div className="mt-1 font-semibold text-[var(--text-primary)]">
                  BOLOSAFE-SECURE-902
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface,#121526)] p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Verification URL
                </div>

                <div className="mt-1 truncate text-[var(--accent-primary-soft)]">
                  {videoKycData.verification_link}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-3">
                <span className="text-[var(--text-muted)]">Session expiry</span>
                <span className="font-semibold text-[var(--state-danger)]">
                  {kycTimer}s
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowKycModal(false)
                showToast('Video-KYC challenge completed and authenticated!')
              }}
              className="w-full rounded-lg bg-[var(--accent-primary)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--accent-primary-soft)]"
            >
              Simulate customer completed KYC
            </button>
          </div>
        </div>
      )}

      <EnterpriseWebhookDrawer
        isOpen={showWebhook}
        onClose={() => setShowWebhook(false)}
        sector="finance"
        scenario={governance.scenario || 'high_value_transfer'}
        riskLevel={riskLevel}
        action={action}
        aiProbability={aiProbability}
        speakerMatch={speakerMatch}
        metadata={{
          accountNo: 'XXXX-XXXX-9402',
          amount: 525000.0,
          compositeRisk: compositeRiskScore,
        }}
      />
    </div>
  )
}
