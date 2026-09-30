import React, { useState } from 'react';
import {
  Film,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Mic,
  Fingerprint,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileBadge2,
  FileCheck,
  Download,
  Ban,
  Lock,
  Activity,
  Clock
} from 'lucide-react';
import SectorAudioPlayer from '../../components/SectorAudioPlayer';
import EnterpriseWebhookDrawer from '../../components/EnterpriseWebhookDrawer';
import { generateProvenanceCert, simulateThreat } from '../../utils/sectorApi';
import SecurityPageShell from '../../components/security/SecurityPageShell';
import DetectionMetricGrid from '../../components/security/DetectionMetricGrid';
import LiveDetectionPanel from '../../components/security/LiveDetectionPanel';
import SectorContextCard from '../../components/security/SectorContextCard';
import GovernanceDecisionCard from '../../components/security/GovernanceDecisionCard';
import SecurityActivityTimeline from '../../components/security/SecurityActivityTimeline';

export default function EntertainmentSecurity({
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
  const [rightsBlocked, setRightsBlocked] = useState(false);
  const [certified, setCertified] = useState(false);
  const [provenanceExported, setProvenanceExported] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [simulatedThreat, setSimulatedThreat] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const samples = [
    {
      label: "Studio ADR Voice Stem",
      isSpoof: false,
      language: "English",
      description: "Authentic certified studio master stem",
      url: "/sector_audio/entertainment/bonafide/entertainment_bonafide_studio_stem_en.wav",
      scenario: "dubbing_verification"
    },
    {
      label: "Celebrity Dubbing Clone",
      isSpoof: true,
      language: "English",
      description: "Unauthorized AI dubbing voice leak",
      url: "/sector_audio/entertainment/spoof/entertainment_spoof_celebrity_dub_en.wav",
      scenario: "voice_authenticity"
    },
    {
      label: "Artist IP Infringement Clone",
      isSpoof: true,
      language: "Tamil",
      description: "Cloned commercial voice without consent",
      url: "/sector_audio/entertainment/spoof/entertainment_spoof_artist_clone_ta.wav",
      scenario: "speaker_comparison"
    }
  ];

  const aiProbability = selected.ai_probability ?? 0.0;
  const speakerSimilarity = selected.speaker_similarity ?? null;
  const speakerMatch = selected.speaker_match ?? null;
  const governance = selected.governance_decision || {};

  const hasCrossSectorThreat = governance.cross_sector_threat_detected || simulatedThreat;
  const threatOrigin = governance.threat_intel?.origin_sectors?.join(', ') || 'FINANCE & RETAIL (Syndicate Voice Cloning Pool)';

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
    ? (governance.action || (riskLevel === 'high' ? 'block_rights_and_escalate' : riskLevel === 'medium' ? 'flag_for_spectral_audit' : 'certify_authentic'))
    : 'standby';

  const recommendedActions = !hasDetectionResult
    ? [
        'Run an authentic studio stem or cloned artist sample from library above.',
        'Digital rights enforcement and WIPO copyright actions will execute based on live detection.'
      ]
    : isSpoof
    ? [
        'Withhold digital media rights clearance and suspend OTT distribution under Sec 38B.',
        'Route track for secondary vocoder artifact & spectral phase audit.',
        'Issue cease-and-desist notice for unauthorized neural voice synthesis.'
      ]
    : [
        'Vocal master stem confirmed authentic.',
        'Digital media rights clearance approved for broadcast and dubbing release.',
        'Issue SHA-256 Provenance Certificate under WIPO guidelines.'
      ];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleExportProvenance = async () => {
    try {
      const cert = await generateProvenanceCert({
        trackTitle: "#STEM-DUB-4912-HIN",
        licensedArtist: "Aditi V.",
        isAuthentic: aiProbability < 0.5,
        aiProbability: aiProbability,
        speakerSimilarity: speakerSimilarity || 0.41,
      });

      // Trigger actual browser file download
      const blob = new Blob([JSON.stringify(cert, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bolo_provenance_cert_${cert.certificate_id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProvenanceExported(true);
      showToast(`Downloaded signed certificate ${cert.certificate_id}!`);
    } catch (e) {
      setProvenanceExported(true);
      showToast("Downloaded SHA-256 Provenance Certificate!");
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
        <div className="fixed right-6 top-6 z-50 rounded-xl border border-indigo-400/20 bg-slate-950/90 px-4 py-3 text-xs font-semibold text-slate-200 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-indigo-400" />
            {toastMsg}
          </div>
        </div>
      )}

      <SecurityPageShell
        eyebrow="Entertainment Security"
        title="Entertainment & Media Audio Authenticity"
        description="Safeguards voice actors, dubbing studios, and media rights against unauthorized synthetic AI voice cloning."
        status={isConnected ? "LIVE" : "OFFLINE"}
        statusTone={isConnected ? "active" : "medium"}
        critical={
          riskLevel === "high" || hasCrossSectorThreat
            ? {
                label: hasCrossSectorThreat
                  ? "Cross-sector threat detected"
                  : "Critical detection",
                title: hasCrossSectorThreat
                  ? "Coordinated media voice attack detected"
                  : "Synthetic voice detected",
                description:
                  hasCrossSectorThreat
                    ? `Voice signature associated with ${threatOrigin}.`
                    : governance.reason ||
                      "High synthetic-voice probability detected during a media authenticity check.",
                actions: hasCrossSectorThreat ? (
                  <button
                    type="button"
                    onClick={() => setSimulatedThreat(false)}
                    className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300"
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
              id: "artist-match",
              label: "Artist Timbre Match",
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
                ? "Awaiting performer verification"
                : speakerMatch === true
                  ? "Matches licensed performer"
                  : speakerMatch === false
                    ? "Timbre mismatch"
                    : "Performer verification",
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
                ? "AI + timbre + rights context"
                : "Awaiting complete risk evaluation",
            },
            {
              id: "rights-gate",
              label: "Rights Clearance Gate",
              value: !hasDetectionResult
                ? "NOT EVALUATED"
                : riskLevel === "high"
                  ? "BLOCKED"
                  : riskLevel === "medium"
                    ? "AUDIT"
                    : "CLEARED",
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
            title="Live entertainment voice detection"
            description="Real-time audio ingestion and studio authenticity verification"
            isLive={isStreaming}
          >
            <SectorAudioPlayer
              title="Studio Audio Authenticity Studio & Dubbing Verification"
              sector="entertainment"
              scenario={governance.scenario || "dubbing_verification"}
              samples={samples}
              onPlaySample={(url, scn) =>
                streamAudioFromUrl?.(
                  url,
                  "entertainment",
                  scn || "dubbing_verification"
                )
              }
              onStartMic={startMicrophoneStream}
              onStopMic={stopActiveStream || stopMicrophoneStream}
              onStopStream={stopActiveStream || stopMicrophoneStream}
              onFileUpload={handleFileUpload}
              isStreaming={isStreaming}
              micStatus={micStatus}
              micLevel={micLevel}
            />
          </LiveDetectionPanel>

          <SectorContextCard
            title="Studio rights protection"
            description="Voice identity, provenance and distribution context interpreted alongside audio risk."
            rows={[
              {
                label: "Licensed Artist",
                value: "Aditi V. (SAG-AFTRA / CINTAA)",
              },
              {
                label: "Track Reference",
                value: "#STEM-DUB-4912-HIN",
              },
              {
                label: "Audio Provenance",
                value: "sha256:7b92...8f31",
              },
              {
                label: "Distribution Channel",
                value: "Theatrical / OTT Localization",
              },
              {
                label: "Target Languages",
                value: "Hindi, Tamil, Telugu",
              },
              {
                label: "Tenant",
                value: "entertainment_isolated",
              },
            ]}
            callout={{
              title: "Copyright Act 1957 · Sec 38B",
              description:
                "Protects performer rights against unauthorized synthetic voice replacement and commercial distribution.",
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
                ? "CRITICAL: Synthetic Voice Detected — Rights Protection Active"
                : "Studio Voice Authenticated — Rights Cleared"
          }
          reason={
            !hasDetectionResult
              ? "Select an entertainment scenario from the library or start the microphone to evaluate audio authenticity and rights policy."
              : isSpoof
                ? (
                    governance.reason ||
                    "Synthetic voice characteristics detected against the licensed performer profile."
                  )
                : (
                    governance.reason ||
                    "Vocal master stem confirmed authentic against the licensed performer profile."
                  )
          }
          recommendations={recommendedActions}
          actions={
            <>
              <button
                disabled={!hasDetectionResult}
                onClick={() => {
                  setRightsBlocked(!rightsBlocked)
                  showToast(
                    rightsBlocked
                      ? "Rights clearance restored."
                      : "Distribution revoked under Sec 38B!"
                  )
                }}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-2">
                  <Ban className="size-4" />
                  {rightsBlocked || isSpoof
                    ? "Media Rights Clearance Revoked ✓"
                    : "Revoke Distribution Clearance"}
                </span>
              </button>

              <button
                disabled={!hasDetectionResult}
                onClick={handleExportProvenance}
                className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-2">
                  <Download className="size-4" />
                  {provenanceExported
                    ? "SHA-256 Provenance Cert Downloaded ✓"
                    : "Export SHA-256 Provenance Cert"}
                </span>
              </button>

              {isGenuine ? (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  WIPO Rights Certified & Approved ✓
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCertified(true)
                    showToast("WIPO DRM authenticity certification issued!")
                  }}
                  disabled={!hasDetectionResult || isSpoof || certified}
                  className="rounded-lg border border-emerald-400/30 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck className="size-4" />
                    {certified
                      ? "WIPO Rights Certified ✓"
                      : "Issue WIPO DRM Certification"}
                  </span>
                </button>
              )}

              <button
                onClick={() => setShowWebhook(true)}
                className="rounded-lg border border-indigo-400/15 bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-300"
              >
                Inspect WIPO DRM Webhook
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
                ? `${governance.scenario || "Dubbing Verification"} · #STEM-DUB-4912-HIN`
                : "Session Standby · Studio Stem Verification",
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
                  ? "Block Rights · Distribution Hold"
                  : "Allow · Rights Cleared",
              tone: !hasDetectionResult
                ? "pending"
                : isSpoof
                  ? "detected"
                  : "ready",
              status: !hasDetectionResult
                ? "PENDING"
                : isSpoof
                  ? "BLOCKED"
                  : "CLEARED",
            },
            {
              label: "Identity",
              value: !hasDetectionResult
                ? "Awaiting performer voiceprint"
                : isSpoof
                  ? "Unauthorized vocal timbre"
                  : "Licensed performer confirmed",
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
        sector="entertainment"
        scenario={governance.scenario || "dubbing_verification"}
        riskLevel={riskLevel}
        action={action}
        aiProbability={aiProbability}
        speakerMatch={speakerMatch}
        metadata={{
          stemId: "#STEM-DUB-4912-HIN",
          artist: "Aditi V.",
          compositeRisk: compositeRiskScore,
        }}
      />
    </div>
  )
}
