import React, { useRef } from 'react';
import { Play, Square, Mic, Upload, Volume2, ShieldAlert, Sparkles, Radio } from 'lucide-react';

export default function SectorAudioPlayer({
  title = "Sector Audio Streamer",
  sector = "retail",
  scenario = "order_modification",
  samples = [],
  onPlaySample,
  onStartMic,
  onStopMic,
  onFileUpload,
  isStreaming = false,
  micStatus = "Ready",
  micLevel = 0,
  accentColor = "cyan"
}) {
  const fileInputRef = useRef(null);

  const colorStyles = {
    cyan: {
      border: "border-cyan-400/20",
      bg: "bg-cyan-950/20",
      buttonBg: "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/30",
      activeText: "text-cyan-400",
      progressBg: "bg-cyan-400",
    },
    amber: {
      border: "border-amber-400/20",
      bg: "bg-amber-950/20",
      buttonBg: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/30",
      activeText: "text-amber-400",
      progressBg: "bg-amber-400",
    },
    violet: {
      border: "border-violet-400/20",
      bg: "bg-violet-950/20",
      buttonBg: "bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border-violet-400/30",
      activeText: "text-violet-400",
      progressBg: "bg-violet-400",
    },
    emerald: {
      border: "border-emerald-400/20",
      bg: "bg-emerald-950/20",
      buttonBg: "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/30",
      activeText: "text-emerald-400",
      progressBg: "bg-emerald-400",
    },
  }[accentColor] || {
    border: "border-cyan-400/20",
    bg: "bg-cyan-950/20",
    buttonBg: "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/30",
    activeText: "text-cyan-400",
    progressBg: "bg-cyan-400",
  };

  return (
    <div className={`rounded-2xl border ${colorStyles.border} ${colorStyles.bg} p-5 shadow-2xl backdrop-blur-xl transition-all`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
            <Radio className={`size-5 ${isStreaming ? `${colorStyles.activeText} animate-pulse` : 'text-slate-400'}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              {title}
              {isStreaming && (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  STREAMING REAL PCM
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Status: <span className="text-slate-200">{micStatus}</span>
            </p>
          </div>
        </div>

        {/* Live Audio Level Meter */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <Volume2 size={16} className={isStreaming ? colorStyles.activeText : "text-slate-500"} />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all duration-100 ${colorStyles.progressBg}`}
              style={{ width: `${Math.min(100, Math.max(0, micLevel))}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
            {Math.round(micLevel)}%
          </span>
        </div>
      </div>

      {/* 1-Click Interactive Test Samples */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
          <span>⚡ Live Sector Test Audio Triggers (Real Dataset Files)</span>
          <span className="text-[10px] text-slate-500">16kHz PCM · WebSocket Ingestion</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {samples.map((sample, idx) => (
            <button
              key={idx}
              disabled={isStreaming}
              onClick={() => onPlaySample(sample.url, sample.scenario, sample.transactionAmount)}
              className={`group flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                sample.isSpoof
                  ? 'border-rose-500/20 bg-rose-950/20 hover:border-rose-500/40 hover:bg-rose-950/40 text-rose-200'
                  : 'border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/40 hover:bg-emerald-950/40 text-emerald-200'
              }`}
            >
              <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg border ${
                sample.isSpoof ? 'border-rose-400/30 bg-rose-500/20 text-rose-300' : 'border-emerald-400/30 bg-emerald-500/20 text-emerald-300'
              }`}>
                <Play className="size-3.5 ml-0.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                  <span>{sample.label}</span>
                  <span className={`text-[9px] font-mono px-1 rounded ${sample.isSpoof ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {sample.isSpoof ? 'SPOOF' : 'BONAFIDE'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {sample.language} · {sample.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input Controls: Live Mic & Custom Audio Upload */}
      <div className="mt-3 flex flex-wrap items-center gap-2.5 pt-3 border-t border-white/5">
        <button
          onClick={isStreaming ? onStopMic : onStartMic}
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${
            isStreaming
              ? 'border-rose-400/40 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30'
              : `${colorStyles.buttonBg}`
          }`}
        >
          {isStreaming ? (
            <>
              <Square className="size-3.5 fill-current" />
              Stop Active Stream
            </>
          ) : (
            <>
              <Mic className="size-3.5" />
              Stream Live Microphone
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/wav,audio/mp3,audio/ogg"
          className="hidden"
          onChange={onFileUpload}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <Upload className="size-3.5 text-slate-400" />
          Upload Custom Sector Audio
        </button>
      </div>
    </div>
  );
}
