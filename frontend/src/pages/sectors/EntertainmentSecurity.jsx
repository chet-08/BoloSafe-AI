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
  Ban
} from 'lucide-react';
import SectorAudioPlayer from '../../components/SectorAudioPlayer';
import EnterpriseWebhookDrawer from '../../components/EnterpriseWebhookDrawer';

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

  const riskLevel = governance.risk_level || (aiProbability >= 0.75 ? 'high' : aiProbability >= 0.40 ? 'medium' : 'low');
  const action = governance.action || (riskLevel === 'high' ? 'block_rights_and_escalate' : riskLevel === 'medium' ? 'flag_for_spectral_audit' : 'certify_authentic');
  const recommendedActions = governance.recommended_actions || [
    riskLevel === 'high'
      ? 'Withhold digital media rights clearance and suspend OTT distribution.'
      : riskLevel === 'medium'
      ? 'Route track for secondary vocoder artifact & spectral phase audit.'
      : 'Issue digital authenticity certificate for broadcast/dubbing release.'
  ];

  const handleExportProvenance = () => {
    setProvenanceExported(true);
    setTimeout(() => setProvenanceExported(false), 3000);
  };

  return (
    <div className="space-y-6">
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
                Voice artist IP protection, synthetic dubbing validation, and deepfake celebrity clone detection for studios and OTT platforms.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono">
              <span className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-300">{isConnected ? 'STUDIO MONITOR ACTIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Live Audio Controller & 1-Click Samples */}
      <SectorAudioPlayer
        title="Entertainment Studio Stem Streamer & Watermark Provenance"
        sector="entertainment"
        scenario={governance.scenario || "voice_authenticity"}
        samples={samples}
        onPlaySample={(url, scn) => streamAudioFromUrl?.(url, 'entertainment', scn || 'voice_authenticity')}
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
        {/* Left Column: Simulated Audio Stem Context */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
            <Fingerprint className="size-4 text-violet-400" />
            Audio Stem & Talent Metadata
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Master Stem ID</span>
              <span className="font-semibold text-white">#DUB-HIN-4089</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Licensed Talent</span>
              <span className="font-semibold text-violet-300">Registered Voice Artist #412</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Language Track</span>
              <span className="font-semibold text-white">Hindi (India) / 16kHz Mono</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Active Scenario</span>
              <span className="font-semibold text-violet-300 capitalize">
                {(governance.scenario || selected.notification_scenario || 'voice_authenticity').replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Distribution Tier</span>
              <span className="font-semibold text-emerald-400">Theatrical & OTT Pan-India</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-slate-400">Rights Verification</span>
              <span className="font-semibold text-amber-300">Commercial Dubbing Clearance</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-xs text-violet-200">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="size-4 shrink-0 text-violet-400" />
              AI Voice Cloning in Media
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-violet-300/80">
              Generative zero-shot cloning allows pirates to replicate celebrity voices in regional languages without artist consent or royalties.
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
              <div className="text-xs uppercase tracking-wider opacity-80">Media Integrity State</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-bold uppercase">
                {riskLevel === 'high' ? (
                  <>
                    <XCircle className="size-5 text-rose-400" />
                    Clone Flagged
                  </>
                ) : riskLevel === 'medium' ? (
                  <>
                    <AlertTriangle className="size-5 text-amber-400" />
                    Audit Required
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    Certified
                  </>
                )}
              </div>
              <div className="mt-1 text-xs opacity-75 font-mono">
                Level: {riskLevel.toUpperCase()}
              </div>
            </div>

            {/* AI Clone Probability */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-slate-400">Synthetic Vocoder Ratio</div>
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
              <div className="text-xs uppercase tracking-wider text-slate-400">Artist Voiceprint Match</div>
              <div className="mt-2 text-2xl font-mono font-bold text-white">
                {speakerSimilarity !== null ? `${(speakerSimilarity * 100).toFixed(1)}%` : 'No Profile'}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                <UserCheck className="size-3.5 text-violet-400" />
                <span>
                  {speakerMatch === true
                    ? 'Registered Talent Match'
                    : speakerMatch === false
                    ? 'Unregistered Vocal Stem'
                    : 'Awaiting Audio'}
                </span>
              </div>
            </div>
          </div>

          {/* Decision & Action Workflow Panel */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Studio Clearance & Digital Rights Governance
            </h2>

            <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-400">Studio Audio Assessment:</div>
              <div className="mt-1 text-sm font-medium text-slate-200">
                {governance.reason || (riskLevel === 'high' ? 'High likelihood of synthetic voice generation or unauthorized vocal deepfake.' : 'Vocal kinematics match genuine human glottal excitation.')}
              </div>
              
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recommended Next Steps:</div>
                {recommendedActions.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <ArrowRight className="size-3.5 mt-0.5 shrink-0 text-violet-400" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setRightsBlocked(!rightsBlocked)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                  rightsBlocked
                    ? 'border-rose-400/50 bg-rose-500/30 text-rose-200'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                <Ban className="size-4" />
                {rightsBlocked ? 'Rights Clearance Blocked (Flagged)' : 'Block Media Distribution'}
              </button>

              <button
                onClick={() => setCertified(true)}
                disabled={certified || riskLevel === 'high'}
                className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-200 transition-all hover:bg-emerald-500/30 active:scale-95 disabled:opacity-50"
              >
                <FileBadge2 className="size-4" />
                {certified ? 'Certificate Issued ✓' : 'Issue Authenticity Certificate'}
              </button>

              <button
                onClick={handleExportProvenance}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/10 active:scale-95"
              >
                <Download className="size-4 text-violet-400" />
                {provenanceExported ? 'Provenance JSON Exported ✓' : 'Export Cryptographic Provenance'}
              </button>

              <button
                onClick={() => setShowWebhook(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <span>&lt;/&gt;</span>
                Inspect DRM Webhook
              </button>
            </div>
          </div>
        </div>
      </div>

      <EnterpriseWebhookDrawer
        isOpen={showWebhook}
        onClose={() => setShowWebhook(false)}
        sector="entertainment"
        scenario={governance.scenario || "voice_authenticity"}
        riskLevel={riskLevel}
        action={action}
        aiProbability={aiProbability}
        speakerMatch={speakerMatch}
        metadata={{ stemId: "#DUB-HIN-4089", talentId: "Registered Voice Artist #412" }}
      />
    </div>
  );
}
