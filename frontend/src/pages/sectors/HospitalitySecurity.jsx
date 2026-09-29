import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
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
  Activity,
  Clock
} from 'lucide-react';
import SectorAudioPlayer from '../../components/SectorAudioPlayer';
import EnterpriseWebhookDrawer from '../../components/EnterpriseWebhookDrawer';
import { lockRoomFolio, challengeGuest, simulateThreat } from '../../utils/sectorApi';
import SecurityPageShell from '../../components/security/SecurityPageShell';
import DetectionMetricGrid from '../../components/security/DetectionMetricGrid';
import LiveDetectionPanel from '../../components/security/LiveDetectionPanel';
import SectorContextCard from '../../components/security/SectorContextCard';
import GovernanceDecisionCard from '../../components/security/GovernanceDecisionCard';
import SecurityActivityTimeline from '../../components/security/SecurityActivityTimeline';

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
  const { setEscalatedIncident } = useSecurity();

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

  const hasDetectionResult =
    selected?.ai_probability != null ||
    selected?.rolling_score != null ||
    governance?.action != null ||
    governance?.risk_level != null;

  const hasAudioResult =
    selected?.ai_probability != null ||
    selected?.rolling_score != null ||
    selected?.audio_features != null ||
    selected?.risk_score != null ||
    hasDetectionResult;

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
    ? (governance.action || (riskLevel === 'high' ? 'lock_folio_and_escalate' : riskLevel === 'medium' ? 'require_front_desk_id' : 'allow'))
    : 'standby';

  const recommendedActions = !hasDetectionResult
    ? [
        'Run a bonafide or cloned reservation scenario above.',
        'Opera PMS folio locking and front desk challenge will trigger based on live voice analysis.'
      ]
    : isSpoof
    ? [
        'Immediately lock room folio and halt phone-authorized charges.',
        'Send verification challenge and require government ID at check-in.',
        'Alert Duty Manager to inspect Suite 1402 reservation.'
      ]
    : [
        'Guest verified against biometric record. Normal concierge workflow allowed.',
        'Room 1402 folio billing authorized.',
        'No front-desk step-up ID required.'
      ];

  const decisionState = !hasDetectionResult
    ? {
        label: 'AWAITING AUDIO ANALYSIS',
        shortLabel: 'STANDBY — AWAITING GUEST VOICE',
        description: 'Select a guest voice scenario from the library above or start the microphone to evaluate voice authenticity against Opera PMS.',
        instruction: 'Select a scenario above to test guest verification and PMS folio controls.',
        tone: 'pending',
      }
    : isSpoof
    ? {
        label: 'CRITICAL SECURITY ALERT',
        shortLabel: 'LOCK ROOM FOLIO & VERIFY GUEST',
        description: 'A synthetic voice cloning attack was detected on Suite 1402. Lock the room folio and challenge the caller with in-person front desk ID verification.',
        instruction: 'Lock the room folio immediately and require physical government ID challenge before authorizing any room charges.',
        tone: 'danger',
      }
    : {
        label: 'GUEST AUTHENTICATED',
        shortLabel: 'CONTINUE NORMAL WORKFLOW',
        description: 'Guest voice verified against registered reservation profile. Acoustic signals verified authentic with no cloning artifacts.',
        instruction: 'No security escalation required. Continue normal hospitality concierge and room folio workflow.',
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
      container: 'border-indigo-500/50 bg-indigo-950/40',
      icon: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      title: 'text-indigo-200',
      probability: 'text-indigo-300',
      action: 'border-indigo-400/40 bg-indigo-500/20 text-indigo-100',
    },
    safe: {
      container: 'border-emerald-500/50 bg-emerald-950/40',
      icon: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      title: 'text-emerald-200',
      probability: 'text-emerald-300',
      action: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
    },
    pending: {
      container: 'border-slate-700/60 bg-slate-900/40',
      icon: 'bg-slate-700/20 text-slate-400 border-slate-700/40',
      title: 'text-slate-300',
      probability: 'text-slate-400',
      action: 'border-slate-600/40 bg-slate-700/20 text-slate-300',
    },
  };

  const decisionStyle = decisionStyles[decisionState.tone] || decisionStyles.pending;

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

  const handleMediumRiskAction = () => {
    setAlertSent(true);

    setEscalatedIncident({
      ...selected,
      sector: 'hospitality',
      action_state: 'DUTY_MANAGER_ALERTED',
      protection_state: 'MONITORING',
      escalation_state: 'ALERTED',
      action_detail: 'Duty Manager notified',
    });

    showToast("Duty Manager Alerted — Suite 1402");
  };

  const handlePrimaryDecisionAction = async () => {
    if (decisionState.tone === 'danger') {
      await handleLockFolio();
      await handleChallengeGuest();

      setEscalatedIncident({
        ...selected,
        sector: 'hospitality',
        action_state: 'FOLIO_LOCKED',
        protection_state: 'LATCHED',
        escalation_state: 'CONTAINMENT_ACTIVE',
        action_detail:
          'Room 1402 folio locked · Front Desk ID verification required',
      });

      return;
    }

    if (decisionState.tone === 'warning') {
      await handleChallengeGuest();
      return;
    }

    showToast("Continue normal hospitality workflow. No security escalation required.");
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
    <div className="space-y-5">

      {toastMsg && (
        <div className="fixed right-6 top-6 z-50 rounded-xl border border-indigo-400/20 bg-slate-950/90 px-4 py-3 text-xs font-semibold text-slate-200 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-indigo-400" />
            {toastMsg}
          </div>
        </div>
      )}

      <SecurityPageShell
        eyebrow="Hospitality Security"
        title="Hospitality & Guest Voice Identity Protection"
        description="Guards hotel folio, luxury travel, and VIP guest voice identities against social-engineering and booking takeover."
        status={isConnected ? "LIVE" : "OFFLINE"}
        statusTone={isConnected ? "active" : "medium"}
        critical={
          riskLevel === "high" ||
          riskLevel === "medium" ||
          hasCrossSectorThreat
            ? {
                label: hasCrossSectorThreat
                  ? "Cross-sector threat detected"
                  : riskLevel === "high"
                    ? "Critical detection"
                    : "Security warning",
                tone: riskLevel === "medium" ? "medium" : "high",
                title: hasCrossSectorThreat
                  ? "Coordinated hospitality voice attack detected"
                  : "Synthetic guest voice detected",
                description:
                  hasCrossSectorThreat
                    ? `Voice signature associated with ${threatOrigin}.`
                    : governance.reason ||
                      (riskLevel === "high"
                        ? "High synthetic-voice probability detected during a guest folio interaction."
                        : "Medium synthetic-voice probability detected during a guest service request. Duty Manager notification is required."),
                actions: (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={
                        riskLevel === "medium"
                          ? handleMediumRiskAction
                          : handlePrimaryDecisionAction
                      }
                      disabled={riskLevel === "medium" && alertSent}
                      className={
                        riskLevel === "medium"
                          ? "rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                          : "rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/25"
                      }
                    >
                      {riskLevel === "medium" && alertSent
                        ? "Duty Manager Alerted ✓"
                        : "Take Action"}
                    </button>

                    {hasCrossSectorThreat && (
                      <button
                        type="button"
                        onClick={() => setSimulatedThreat(false)}
                        className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ),
              }
            : null
        }
      >

        <DetectionMetricGrid
          metrics={[
            {
              id: "synthetic-voice",
              label: "Synthetic Voice Probability",
              value: hasDetectionResult
                ? `${(aiProbability * 100).toFixed(1)}%`
                : "WAITING",
              icon: "risk",
              tone: !hasDetectionResult
                ? "neutral"
                : aiProbability >= 0.75
                  ? "high"
                  : aiProbability >= 0.4
                    ? "medium"
                    : "low",
              progress: hasDetectionResult ? aiProbability * 100 : undefined,
              helper: hasDetectionResult
                ? "AI acoustic detection"
                : "Awaiting live audio analysis",
            },
            {
              id: "speaker-match",
              label: "Guest Voice Match",
              value:
                hasDetectionResult && speakerSimilarity !== null
                  ? `${(speakerSimilarity * 100).toFixed(1)}%`
                  : "WAITING",
              icon: "speaker",
              tone:
                hasDetectionResult && speakerMatch === false
                  ? "high"
                  : "neutral",
              progress:
                hasDetectionResult && speakerSimilarity !== null
                  ? speakerSimilarity * 100
                  : undefined,
              helper: !hasDetectionResult
                ? "Awaiting guest voice verification"
                : speakerMatch === true
                  ? "Matches registered guest"
                  : speakerMatch === false
                    ? "Voiceprint mismatch"
                    : "Voice verification",
            },
            {
              id: "composite-risk",
              label: "Composite Risk",
              value: hasDetectionResult
                ? `${(compositeRiskScore * 100).toFixed(1)}%`
                : "WAITING",
              icon: "composite",
              tone: !hasDetectionResult
                ? "neutral"
                : compositeRiskScore >= 0.75
                  ? "high"
                  : compositeRiskScore >= 0.4
                    ? "medium"
                    : "low",
              progress:
                hasDetectionResult
                  ? compositeRiskScore * 100
                  : undefined,
              helper: hasDetectionResult
                ? "AI + voice match + guest context"
                : "Awaiting complete risk evaluation",
            },
            {
              id: "identity-gate",
              label: "Guest Identity Gate",
              value: !hasDetectionResult
                ? "NOT EVALUATED"
                : riskLevel === "high"
                  ? "SECURITY ALERT"
                  : riskLevel === "medium"
                    ? "VERIFY GUEST"
                    : "AUTHORIZED",
              icon: "authenticity",
              tone: !hasDetectionResult
                ? "neutral"
                : riskLevel === "high"
                  ? "high"
                  : riskLevel === "medium"
                    ? "medium"
                    : "low",
              helper: !hasDetectionResult
                ? "Policy state · WAITING"
                : `Policy state · ${riskLevel.toUpperCase()}`,
            },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.85fr]">

          <LiveDetectionPanel
            title="Live hospitality voice detection"
            description="Real-time audio ingestion and hotel guest verification"
            isLive={isStreaming}
          >
            <SectorAudioPlayer
              title="Concierge Audio Streamer & Room Folio Defense"
              sector="hospitality"
              scenario={governance.scenario || "vip_booking"}
              samples={samples}
              onPlaySample={(url, scn) =>
                streamAudioFromUrl?.(
                  url,
                  "hospitality",
                  scn || "vip_booking"
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
            title="Guest & folio protection"
            description="Hotel guest and room-folio context interpreted alongside voice risk."
            rows={[
              {
                label: "Guest",
                value: "S. Ramachandran",
              },
              {
                label: "Room / Suite",
                value: "Presidential Suite #1402",
              },
              {
                label: "Folio Credit Line",
                value: "₹2,00,000.00 Limit",
                tone: "warning",
              },
              {
                label: "Channel",
                value: "In-Room PBX Telephone Order",
              },
              {
                label: "Pending Request",
                value: "Chauffeured Luxury Car + Room Charge",
                tone: "danger",
              },
              {
                label: "Tenant",
                value: "hospitality_isolated",
              },
            ]}
            callout={{
              title: "PCI-DSS & Folio Safeguard",
              description:
                "Unattended phone requests exceeding ₹20,000 charged to room folios require front-desk physical keycard verification.",
            }}
          />

        </div>

        <GovernanceDecisionCard
          tone={
            !hasDetectionResult
              ? "pending"
              : isSpoof
                ? "escalate"
                : "allow"
          }
          title={
            !hasDetectionResult
              ? "Awaiting Live Voice Analysis"
              : isSpoof
                ? "CRITICAL: Synthetic Guest Voice Detected — Room Folio Protected"
                : "Guest Authenticated — Concierge Workflow Cleared"
          }
          reason={
            !hasDetectionResult
              ? "Select a hospitality scenario from the library or start the microphone to evaluate guest voice authenticity."
              : isSpoof
                ? (
                    governance.reason ||
                    "Synthetic guest voice detected during a high-value room-folio request."
                  )
                : (
                    governance.reason ||
                    "Guest voice authenticity verified against the hospitality identity profile."
                  )
          }
          recommendations={recommendedActions}
          actions={
            <>
              <button
                onClick={handleLockFolio}
                disabled={!hasDetectionResult || folioLocked || isGenuine}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="size-4" />
                  {folioLocked
                    ? "Room Folio Locked ✓"
                    : "Lock Room Folio Billing"}
                </span>
              </button>

              <button
                onClick={handleChallengeGuest}
                disabled={!hasDetectionResult || isGenuine}
                className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-2">
                  <FileCheck className="size-4" />
                  {deskChallengeSent
                    ? "Front Desk Challenge Flagged ✓"
                    : "Require In-Person Front Desk ID"}
                </span>
              </button>

              <button
                onClick={() => {
                  setAlertSent(true)
                  showToast("Duty Manager dispatched to Suite 1402!")
                }}
                disabled={!hasDetectionResult || alertSent || isGenuine}
                className="rounded-lg border border-indigo-400/20 bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-2">
                  <BellRing className="size-4 text-indigo-400" />
                  {alertSent ? "Duty Manager Alerted ✓" : "Alert Duty Manager"}
                </span>
              </button>

              <button
                onClick={() => setShowWebhook(true)}
                className="rounded-lg border border-indigo-400/15 bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-300"
              >
                Inspect Oracle Opera PMS Webhook
              </button>

              <button
                onClick={handleSimulateThreat}
                className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="size-4" />
                  {hasCrossSectorThreat
                    ? "Cross-Sector Threat Active"
                    : "Simulate Cross-Sector Attacker"}
                </span>
              </button>
            </>
          }
        />

        <SecurityActivityTimeline
          steps={[
            {
              label: "Security context",
              value: hasDetectionResult
                ? `${governance.scenario || "Guest Verification"} · Suite #1402`
                : "Session Standby · High-Value Guest Request",
              tone: !hasDetectionResult
                ? "pending"
                : isSpoof
                  ? "detected"
                  : "ready",
              status: !hasDetectionResult
                ? "STANDBY"
                : isSpoof
                  ? "THREAT"
                  : "VERIFIED",
            },
            {
              label: "AI detection",
              value: !hasDetectionResult
                ? "Awaiting audio ingestion"
                : `${(aiProbability * 100).toFixed(1)}% synthetic probability`,
              tone: !hasDetectionResult
                ? "pending"
                : isSpoof
                  ? "detected"
                  : "ready",
              status: !hasDetectionResult
                ? "WAITING"
                : isSpoof
                  ? "CRITICAL"
                  : "AUTHENTIC",
            },
            {
              label: "Governance",
              value: !hasDetectionResult
                ? "Awaiting policy evaluation"
                : isSpoof
                  ? "Lock Folio · Front Desk Verification"
                  : "Allow · Concierge Workflow Cleared",
              tone: !hasDetectionResult
                ? "pending"
                : isSpoof
                  ? "detected"
                  : "ready",
              status: !hasDetectionResult
                ? "PENDING"
                : isSpoof
                  ? "ESCALATED"
                  : "CLEARED",
            },
            {
              label: "Identity",
              value: !hasDetectionResult
                ? "Awaiting guest voiceprint"
                : isSpoof
                  ? "Guest voice mismatch"
                  : "Registered guest voice confirmed",
              tone: !hasDetectionResult
                ? "pending"
                : isSpoof
                  ? "detected"
                  : "ready",
              status: !hasDetectionResult
                ? "STANDBY"
                : isSpoof
                  ? "MISMATCH"
                  : "MATCHED",
            },
          ]}
        />
      </SecurityPageShell>

      <EnterpriseWebhookDrawer
        isOpen={showWebhook}
        onClose={() => setShowWebhook(false)}
        sector="hospitality"
        scenario={governance.scenario || "vip_booking"}
        riskLevel={riskLevel}
        action={action}
        aiProbability={aiProbability}
        speakerMatch={speakerMatch}
        metadata={{
          room: "1402",
          guest: "S. Ramachandran",
          compositeRisk: compositeRiskScore,
        }}
      />
    </div>
  )
}
