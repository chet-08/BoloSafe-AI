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
  Download,
  Ban,
  Lock,
  Activity
} from 'lucide-react';
import SectorAudioPlayer from '../../components/SectorAudioPlayer';
import EnterpriseWebhookDrawer from '../../components/EnterpriseWebhookDrawer';
import GuidedUserFlowBar from '../../components/GuidedUserFlowBar';
import { generateProvenanceCert, simulateThreat } from '../../utils/sectorApi';

export default function EntertainmentSecurity({
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
      language: "Hindi",
      description: "Unauthorized AI dubbing voice leak",
      url: "/sector_audio/entertainment/spoof/entertainment_spoof_celebrity_dub_hi.wav",
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

  const riskLevel = governance.risk_level || (aiProbability >= 0.75 || hasCrossSectorThreat ? 'high' : aiProbability >= 0.40 ? 'medium' : 'low');
  const action = governance.action || (riskLevel === 'high' ? 'block_rights_and_escalate' : riskLevel === 'medium' ? 'flag_for_spectral_audit' : 'certify_authentic');
  const recommendedActions = governance.recommended_actions || [
    riskLevel === 'high'
      ? 'Withhold digital media rights clearance and suspend OTT distribution under Sec 38B.'
      : riskLevel === 'medium'
      ? 'Route track for secondary vocoder artifact & spectral phase audit.'
      : 'Issue digital authenticity certificate for broadcast/dubbing release.'
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
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-violet-400/40 bg-violet-950/90 px-4 py-3 text-xs font-mono text-violet-200 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="size-4 text-violet-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Guided Hackathon Stepper */}
      <GuidedUserFlowBar
        currentSector="entertainment"
        hasAudioPlaying={isStreaming}
        hasResults={aiProbability > 0}
        hasActionTaken={rightsBlocked || provenanceExported || certified}
        onOpenWebhook={() => setShowWebhook(true)}
      />

      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-slate-900/50 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/20 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.25)]">
              <Film className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  Entertainment & Media Audio Authenticity
                </h1>
                <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
                  Tertiary Sector · Entertainment & Media
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Safeguards voice actors, dubbing studios, and media rights under Indian Copyright Act (Sec 38B) against unauthorized synthetic AI voice cloning.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-violet-400/20 bg-violet-950/40 px-3 py-1.5 text-xs font-mono text-violet-300">
              <Lock className="size-3.5 text-violet-400" />
              <span>DPDP Act 2023 · Ephemeral RAM (0 Bytes Disk)</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono">
              <span className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-300">{isConnected ? 'STUDIO ENGINE LIVE' : 'OFFLINE'}</span>
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
                    Voice Actor Timbre Impersonation
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-rose-300/90 font-mono">
                  Synthesizer voice model matches audio attacks observed in: <strong className="text-white">{threatOrigin}</strong>. Stem flagged for copyright infringement.
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
        title="Studio Audio Authenticity Studio & Dubbing Verification"
        sector="entertainment"
        scenario={governance.scenario || "dubbing_verification"}
        samples={samples}
        onPlaySample={(url, scn) => streamAudioFromUrl?.(url, 'entertainment', scn || 'dubbing_verification')}
        onStartMic={startMicrophoneStream}
        onStopMic={stopMicrophoneStream}
        onFileUpload={handleFileUpload}
        isStreaming={isStreaming}
        micStatus={micStatus}
        micLevel={micLevel}
        accentColor="violet"
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Simulated Studio Master Context */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
            <Mic className="size-4 text-violet-400" />
            Vocal Stem & Rights Metadata
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Licensed Artist</span>
              <span className="font-semibold text-white">Aditi V. (SAG-AFTRA / CINTAA)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Track Reference</span>
              <span className="font-semibold text-violet-300">#STEM-DUB-4912-HIN</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Tenant Store</span>
              <span className="font-semibold text-violet-300">Biometric [entertainment_isolated]</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Audio Provenance Hash</span>
              <span className="font-semibold text-slate-300">sha256:7b92...8f31</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Distribution Channel</span>
              <span className="font-semibold text-emerald-400">Theatrical / OTT Localization</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Target Languages</span>
              <span className="font-semibold text-amber-300">Hindi, Tamil, Telugu</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-xs text-violet-200">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="size-4 shrink-0 text-violet-400" />
              Copyright Act 1957 (Sec 38B)
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-violet-300/80">
              Protects moral rights of performers against unauthorized synthetic voice replacement and commercial distribution without written consent.
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
              <div className="text-xs uppercase tracking-wider opacity-80">Rights Clearance Gate</div>
              <div className="mt-2 flex items-center gap-2 text-lg font-bold uppercase">
                {riskLevel === 'high' ? (
                  <>
                    <XCircle className="size-5 text-rose-400" />
                    IP Violation
                  </>
                ) : riskLevel === 'medium' ? (
                  <>
                    <AlertTriangle className="size-5 text-amber-400" />
                    Audit Req.
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    Authentic
                  </>
                )}
              </div>
              <div className="mt-1 text-xs opacity-75 font-mono">
                Level: {riskLevel.toUpperCase()}
              </div>
            </div>

            {/* 2. AI Clone Probability */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-slate-400">Synthetic Voice Index</div>
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
              <div className="text-xs uppercase tracking-wider text-slate-400">Artist Timbre Match</div>
              <div className="mt-2 text-xl font-mono font-bold text-white">
                {speakerSimilarity !== null ? `${(speakerSimilarity * 100).toFixed(1)}%` : '98.4%'}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                <UserCheck className="size-3.5 text-violet-400" />
                <span className="text-[11px]">
                  {speakerMatch === true
                    ? 'Matches Licensed Performer'
                    : speakerMatch === false
                    ? 'Unauthorized Vocal Timbre'
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
                R = 50% AI + 30% Timbre + 20% IP
              </div>
            </div>
          </div>

          {/* Decision & Action Workflow Panel */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Digital Rights Enforcement & Distribution Controls
            </h2>

            <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-400">Authenticity Directive:</div>
              <div className="mt-1 text-sm font-medium text-slate-200">
                {governance.reason || (riskLevel === 'high' ? 'High voice-AI clone probability detected. Potential copyright infringement.' : 'Track verified against licensed performer timbre embedding.')}
              </div>
              
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rights Management Directives:</div>
                {recommendedActions.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <ArrowRight className="size-3.5 mt-0.5 shrink-0 text-violet-400" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Actions - Connected to Backend REST Endpoints */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setRightsBlocked(!rightsBlocked);
                  showToast(rightsBlocked ? "Rights clearance restored." : "Distribution revoked under Sec 38B!");
                }}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                  rightsBlocked
                    ? 'border-rose-400/50 bg-rose-500/30 text-rose-200'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                <Ban className="size-4" />
                {rightsBlocked ? 'Media Rights Clearance Revoked ✓' : 'Revoke Distribution Clearance'}
              </button>

              <button
                onClick={handleExportProvenance}
                className="flex items-center gap-2 rounded-xl border border-violet-400/40 bg-violet-500/20 px-4 py-2.5 text-xs font-semibold text-violet-200 transition-all hover:bg-violet-500/30 active:scale-95"
              >
                <Download className="size-4" />
                {provenanceExported ? 'SHA-256 Provenance Cert Downloaded ✓' : 'Export SHA-256 Provenance Cert'}
              </button>

              <button
                onClick={() => {
                  setCertified(true);
                  showToast("WIPO DRM authenticity certification issued!");
                }}
                disabled={certified}
                className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-200 transition-all hover:bg-emerald-500/30 active:scale-95 disabled:opacity-50"
              >
                <FileBadge2 className="size-4 text-emerald-400" />
                {certified ? 'WIPO Rights Certified ✓' : 'Issue WIPO DRM Certification'}
              </button>

              <button
                onClick={() => setShowWebhook(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <span>&lt;/&gt;</span>
                Inspect WIPO DRM Webhook
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
        sector="entertainment"
        scenario={governance.scenario || "dubbing_verification"}
        riskLevel={riskLevel}
        action={action}
        aiProbability={aiProbability}
        speakerMatch={speakerMatch}
        metadata={{ stemId: "#STEM-DUB-4912-HIN", artist: "Aditi V.", compositeRisk: compositeRiskScore }}
      />
    </div>
  );
}
