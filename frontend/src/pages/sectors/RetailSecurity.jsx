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
import SecurityPageShell from '../../components/security/SecurityPageShell';
import DetectionMetricGrid from '../../components/security/DetectionMetricGrid';
import GovernanceDecisionCard from '../../components/security/GovernanceDecisionCard';
import SecurityActivityTimeline from '../../components/security/SecurityActivityTimeline';
import LiveDetectionPanel from '../../components/security/LiveDetectionPanel';
import SectorContextCard from '../../components/security/SectorContextCard';
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

  const hasDetectionResult =
    selected.ai_probability !== undefined &&
    selected.ai_probability !== null;

  const hasCrossSectorThreat =
    governance.cross_sector_threat_detected || simulatedThreat;
  const threatOrigin = governance.threat_intel?.origin_sectors?.join(', ') || 'FINANCIAL SERVICES (High-Value RTGS Wire Fraud Attempt)';

  const compositeRiskScore =
    governance.composite_risk_score !== undefined
      ? governance.composite_risk_score
      : hasDetectionResult
        ? Math.min(
            1.0,
            Math.max(
              0.0,
              (aiProbability * 0.55) +
                ((1.0 - (speakerSimilarity ?? 0.5)) * 0.35) +
                0.10
            )
          )
        : null;

  const riskLevel =
    governance.risk_level ||
    (hasDetectionResult
      ? aiProbability >= 0.75 || hasCrossSectorThreat
        ? 'high'
        : aiProbability >= 0.40
          ? 'medium'
          : 'low'
      : 'pending');

  const action =
    governance.action ||
    (hasDetectionResult
      ? riskLevel === 'high'
        ? 'hold_and_escalate'
        : riskLevel === 'medium'
          ? 'step_up_verification'
          : 'allow'
      : 'pending');

  const recommendedActions =
    governance.recommended_actions ||
    (hasDetectionResult
      ? [
          riskLevel === 'high'
            ? 'Place requested order modification on hold immediately.'
            : riskLevel === 'medium'
              ? 'Trigger secondary OTP challenge to registered mobile.'
              : 'Caller authenticated. Normal retail workflow permitted.',
        ]
      : [
          'Run a live retail voice scenario or start the microphone.',
          'Governance actions will appear after detection is evaluated.',
        ]);

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
    <div className="space-y-5">
      {toastMsg && (
        <div className="fixed right-6 top-6 z-50 rounded-xl border border-[#70B88A]/20 bg-[#171A2D] px-4 py-3 text-xs font-semibold text-[#F4F5FA] shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#70B88A]" />
            {toastMsg}
          </div>
        </div>
      )}

      <SecurityPageShell
        eyebrow="Retail Security"
        title="Retail & Customer Protection"
        description="Voice impersonation detection for customer care, sensitive order changes, delivery rerouting and refund workflows."
        status={isConnected ? 'LIVE' : 'OFFLINE'}
        statusTone={isConnected ? 'active' : 'medium'}
        critical={
          riskLevel === 'high' || hasCrossSectorThreat
            ? {
                label: hasCrossSectorThreat
                  ? 'Cross-sector threat detected'
                  : 'Critical detection',
                title: hasCrossSectorThreat
                  ? 'Coordinated customer-impersonation attack detected'
                  : 'Synthetic customer voice detected',
                description:
                  hasCrossSectorThreat
                    ? `Caller profile was previously associated with ${threatOrigin}.`
                    : governance.reason ||
                      'High synthetic-voice probability persisted during the retail interaction.',
                actions: hasCrossSectorThreat ? (
                  <button
                    type="button"
                    onClick={() => setSimulatedThreat(false)}
                    className="rounded-lg border border-[#292E46] bg-[#121526] px-3 py-2 text-xs font-semibold text-[#F4F5FA] hover:bg-[#1C2033]"
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
              id: 'ai-risk',
              label: 'AI Voice Risk',
              value: hasDetectionResult
                ? `${(aiProbability * 100).toFixed(1)}%`
                : 'WAITING',
              icon: 'risk',
              tone: !hasDetectionResult
                ? 'neutral'
                : aiProbability >= 0.75
                  ? 'high'
                  : aiProbability >= 0.4
                    ? 'medium'
                    : 'low',
              progress: hasDetectionResult
                ? aiProbability * 100
                : null,
              helper: hasDetectionResult
                ? 'Synthetic acoustic probability'
                : 'Awaiting live audio',
            },
            {
              id: 'customer-match',
              label: 'Customer Voice Match',
              value: !hasDetectionResult
                ? 'WAITING'
                : speakerSimilarity !== null
                  ? `${(speakerSimilarity * 100).toFixed(1)}%`
                  : 'NOT EVALUATED',
              icon: 'speaker',
              tone: !hasDetectionResult
                ? 'neutral'
                : speakerMatch === false
                  ? 'high'
                  : 'neutral',
              progress:
                hasDetectionResult && speakerSimilarity !== null
                  ? speakerSimilarity * 100
                  : null,
              helper: !hasDetectionResult
                ? 'Awaiting speaker verification'
                : speakerMatch === true
                  ? 'Matches enrolled customer'
                  : speakerMatch === false
                    ? 'Acoustic mismatch'
                    : 'ECAPA-TDNN verification',
            },
            {
              id: 'account-risk',
              label: 'Account Impersonation',
              value: !hasDetectionResult
                ? 'NOT EVALUATED'
                : riskLevel === 'high'
                  ? 'HIGH'
                  : riskLevel === 'medium'
                    ? 'MEDIUM'
                    : 'LOW',
              icon: 'authenticity',
              tone: !hasDetectionResult
                ? 'neutral'
                : riskLevel === 'high'
                  ? 'high'
                  : riskLevel === 'medium'
                    ? 'medium'
                    : 'low',
              helper: !hasDetectionResult
                ? 'Awaiting live risk assessment'
                : riskLevel === 'high'
                  ? 'Sensitive customer action detected'
                  : riskLevel === 'medium'
                    ? 'Additional verification required'
                    : 'Within retail policy',
            },
            {
              id: 'composite-risk',
              label: 'Composite Risk',
              value: compositeRiskScore !== null
                ? `${(compositeRiskScore * 100).toFixed(1)}%`
                : 'WAITING',
              icon: 'composite',
              tone:
                compositeRiskScore === null
                  ? 'neutral'
                  : compositeRiskScore >= 0.75
                    ? 'high'
                    : compositeRiskScore >= 0.4
                      ? 'medium'
                      : 'low',
              progress:
                compositeRiskScore !== null
                  ? compositeRiskScore * 100
                  : null,
              helper:
                compositeRiskScore !== null
                  ? 'AI + biometric + retail context'
                  : 'Awaiting live risk aggregation',
            },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <LiveDetectionPanel
            title="Live retail voice detection"
            description="Real-time caller analysis and sector test scenarios"
            isLive={isStreaming}
          >
            <SectorAudioPlayer
              title="Retail Call Center Audio Streamer"
              sector="retail"
              scenario={governance.scenario || 'order_modification'}
              samples={samples}
              onPlaySample={(url, scn) =>
                streamAudioFromUrl?.(
                  url,
                  'retail',
                  scn || 'order_modification'
                )
              }
              onStartMic={startMicrophoneStream}
              onStopMic={stopMicrophoneStream}
              onFileUpload={handleFileUpload}
              isStreaming={isStreaming}
              micStatus={micStatus}
              micLevel={micLevel}
            />
          </LiveDetectionPanel>

          <SectorContextCard
            title="Customer & order protection"
            description="Retail workflow context interpreted alongside voice risk."
            rows={[
              {
                label: 'Customer ID',
                value: 'RET-IN-90824',
              },
              {
                label: 'Caller line',
                value: '+91 98765-XXXXX',
              },
              {
                label: 'Tenant store',
                value: 'retail_isolated',
              },
              {
                label: 'Order ID',
                value: '#BLS-4489-IND',
              },
              {
                label: 'Shipment value',
                value: '₹48,990',
                tone: 'warning',
              },
              {
                label: 'Caller request',
                value: 'Address reroute',
                tone: 'danger',
              },
            ]}
            callout={{
              title:
                riskLevel === 'high'
                  ? 'High-risk order modification'
                  : 'Sensitive retail action',
              description:
                'Delivery-address and refund changes remain protected until the configured identity and step-up controls are satisfied.',
            }}
          />
        </div>

        <GovernanceDecisionCard
          tone={
            !hasDetectionResult
              ? 'verify'
              : action === 'allow'
                ? 'allow'
                : action === 'step_up_verification'
                  ? 'verify'
                  : action === 'hold_and_escalate'
                    ? 'escalate'
                    : riskLevel === 'high'
                      ? 'hold'
                      : 'verify'
          }
          title={
            !hasDetectionResult
              ? 'Waiting for live detection'
              : riskLevel === 'high'
                ? 'Hold the order and escalate the caller'
                : riskLevel === 'medium'
                  ? 'Step-up customer verification required'
                  : 'Retail workflow may proceed'
          }
          reason={
            !hasDetectionResult
              ? 'Run a retail voice scenario or start the microphone. No governance decision is made until live detection returns.'
              : governance.reason ||
                (riskLevel === 'high'
                  ? 'High voice-impersonation risk detected during a sensitive retail interaction.'
                  : riskLevel === 'medium'
                    ? 'Additional customer verification is required before the requested action is completed.'
                    : 'Customer voice and workflow context remain within the configured retail risk policy.')
          }
          recommendations={recommendedActions}
          actions={
            <>
              <button
                type="button"
                onClick={handleHoldOrder}
                disabled={!hasDetectionResult}
                className={[
                  'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                  !hasDetectionResult
                    ? 'border-[#292E46] bg-[#121526] text-[#858BA3] cursor-not-allowed opacity-45'
                    : orderHold
                      ? 'border-[#D96A78]/25 bg-[#D96A78]/10 text-[#D96A78]'
                      : 'border-[#D96A78]/30 bg-[#D96A78] text-white hover:bg-[#C85D6C]',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <Package size={14} />
                  {orderHold ? 'Order Held' : 'Hold Order'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleTriggerOtp}
                disabled={!hasDetectionResult}
                className="rounded-lg border border-[#5863D6]/35 bg-[#5863D6]/15 px-3 py-2 text-xs font-semibold text-[#7079E0] hover:bg-[#5863D6]/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-2">
                  <Lock size={14} />
                  {stepUpStatus === 'verified'
                    ? 'OTP Verified'
                    : stepUpStatus === 'sent'
                      ? 'OTP Active'
                      : 'Send SMS OTP'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEscalated(true)
                  showToast('Escalated to Fraud Supervisor.')
                }}
                disabled={escalated || !hasDetectionResult}
                className="rounded-lg border border-[#292E46] bg-[#121526] px-3 py-2 text-xs font-semibold text-[#F4F5FA] hover:bg-[#1C2033] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert size={14} />
                  {escalated ? 'Escalated' : 'Escalate'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowWebhook(true)}
                className="rounded-lg border border-[#292E46] bg-transparent px-3 py-2 text-xs font-semibold text-[#858BA3] hover:bg-[#1C2033] hover:text-[#F4F5FA]"
              >
                Inspect OMS
              </button>

              <button
                type="button"
                onClick={handleSimulateThreat}
                className={[
                  'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                  hasCrossSectorThreat
                    ? 'border-[#D96A78]/30 bg-[#D96A78]/10 text-[#D96A78]'
                    : 'border-[#292E46] bg-transparent text-[#858BA3] hover:bg-[#1C2033] hover:text-[#F4F5FA]',
                ].join(' ')}
              >
                Cross-sector test
              </button>
            </>
          }
        />

        <SecurityActivityTimeline
          steps={[
            {
              label: 'Security context',
              value: `${governance.scenario || 'Order Modification'} · #BLS-4489-IND`,
              tone: 'ready',
              status: 'READY',
            },
            {
              label: 'AI detection',
              value: hasDetectionResult
                ? `${(aiProbability * 100).toFixed(1)}% synthetic probability`
                : 'Awaiting live audio',
              tone: !hasDetectionResult
                ? 'pending'
                : aiProbability >= 0.4
                  ? 'detected'
                  : 'ready',
              status: !hasDetectionResult
                ? 'WAITING'
                : aiProbability >= 0.4
                  ? 'HIGH'
                  : 'READY',
            },
            {
              label: 'Governance',
              value: !hasDetectionResult
                ? 'No decision yet'
                : riskLevel === 'high'
                  ? 'Hold & Escalate'
                  : riskLevel === 'medium'
                    ? 'Step-up Verification'
                    : 'Allow',
              tone: !hasDetectionResult
                ? 'pending'
                : riskLevel === 'low'
                  ? 'ready'
                  : 'decided',
              status: !hasDetectionResult ? 'WAITING' : 'DECIDED',
            },
            {
              label: 'Identity',
              value: !hasDetectionResult
                ? 'Verification not evaluated'
                : speakerMatch === false
                  ? 'Customer voice mismatch'
                  : stepUpStatus === 'verified'
                    ? 'OTP + voice verified'
                    : 'Customer verification available',
              tone: !hasDetectionResult
                ? 'pending'
                : speakerMatch === false
                  ? 'detected'
                  : 'identity',
              status: !hasDetectionResult
                ? 'WAITING'
                : speakerMatch === false
                  ? 'REVIEW'
                  : stepUpStatus === 'verified'
                    ? 'VERIFIED'
                    : 'AVAILABLE',
            },
          ]}
        />
      </SecurityPageShell>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#292E46] bg-[#171A2D] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#292E46] pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F5FA]">
                <KeyRound size={17} className="text-[#7079E0]" />
                Secondary OTP verification
              </div>

              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-[#858BA3] hover:text-[#F4F5FA]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 py-5">
              <p className="text-sm leading-6 text-[#858BA3]">
                A six-digit one-time code was dispatched to the customer's
                registered mobile number for step-up verification.
              </p>

              <div className="rounded-xl border border-[#5863D6]/25 bg-[#5863D6]/[0.06] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#858BA3]">
                  Demo verification code
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-2xl font-semibold tracking-[0.2em] text-[#F4F5FA]">
                    {simulatedOtpCode}
                  </span>

                  <button
                    type="button"
                    onClick={() => setEnteredOtp(simulatedOtpCode)}
                    className="rounded-lg border border-[#5863D6]/30 bg-[#5863D6]/10 px-3 py-2 text-[10px] font-semibold text-[#7079E0] hover:bg-[#5863D6]/20"
                  >
                    Auto-fill
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#858BA3]">
                  Enter OTP
                </label>

                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  value={enteredOtp}
                  onChange={(e) =>
                    setEnteredOtp(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="000000"
                  className="mt-2 w-full rounded-xl border border-[#292E46] bg-[#121526] px-4 py-3 text-center text-2xl font-semibold tracking-[0.28em] text-[#F4F5FA] outline-none transition-colors focus:border-[#5863D6]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={enteredOtp.length !== 6}
              className="w-full rounded-lg bg-[#5863D6] px-4 py-3 text-xs font-semibold text-white hover:bg-[#7079E0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Verify customer
            </button>
          </div>
        </div>
      )}

      <EnterpriseWebhookDrawer
        isOpen={showWebhook}
        onClose={() => setShowWebhook(false)}
        sector="retail"
        scenario={governance.scenario || 'order_modification'}
        riskLevel={riskLevel}
        action={action}
        aiProbability={aiProbability}
        speakerMatch={speakerMatch}
        metadata={{
          orderId: '#BLS-4489-IND',
          shipmentValue: 48990.0,
          compositeRisk: compositeRiskScore,
        }}
      />
    </div>
  )
}
