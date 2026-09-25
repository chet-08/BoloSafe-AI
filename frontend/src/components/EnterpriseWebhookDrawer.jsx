import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, Copy, ExternalLink, X, ShieldCheck } from 'lucide-react';

export default function EnterpriseWebhookDrawer({
  isOpen,
  onClose,
  sector = "retail",
  scenario = "order_modification",
  riskLevel = "high",
  action = "hold_and_escalate",
  aiProbability = 0.88,
  speakerMatch = false,
  metadata = {}
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const payloads = {
    retail: {
      target_system: "Shopify OMS & Logistics API",
      endpoint_url: "https://api.retail-logistics.internal/v2/orders/hold",
      event: "ORDER_SECURITY_HOLD_TRIGGERED",
      payload: {
        timestamp: new Date().toISOString(),
        sector: "retail",
        order_id: metadata.orderId || "#BLS-4489-IND",
        customer_id: metadata.customerId || "RET-IN-90824",
        threat_vector: "SYNTHETIC_VOICE_DELIVERY_REROUTE",
        voice_ai_probability: aiProbability,
        speaker_match: speakerMatch,
        governance_action: action,
        risk_level: riskLevel,
        fulfillment_action: "FREEZE_SHIPMENT_IN_TRANSIT",
        step_up_challenge: "SMS_OTP_DISPATCHED",
        operator_notes: "Inbound voice clone impersonating account owner to reroute parcel."
      }
    },
    finance: {
      target_system: "Core Banking Engine (TCS BaNCS / Finacle API)",
      endpoint_url: "https://cbs.hdfc.internal/v1/fraud/wire-halt",
      event: "RTGS_WIRE_TRANSFER_FROZEN",
      payload: {
        timestamp: new Date().toISOString(),
        sector: "finance",
        account_number: metadata.accountNo || "XXXX-XXXX-9402",
        transaction_amount_inr: metadata.amount || 525000.0,
        threat_vector: "HIGH_VALUE_VOICE_CLONE_FRAUD",
        voice_ai_probability: aiProbability,
        speaker_match: speakerMatch,
        rbi_rule: "RBI Master Direction Sec 4.2 (High-Risk Threshold > ₹50,000)",
        governance_action: action,
        risk_level: riskLevel,
        core_banking_action: "HARD_FREEZE_OUTWARD_REMITTANCE",
        biometric_step_up: "MANDATORY_VIDEO_KYC_LINK_GENERATED",
        operator_notes: "Immediate stop-payment placed on pending RTGS batch."
      }
    },
    hospitality: {
      target_system: "Hotel Property Management System (Opera PMS v5.6)",
      endpoint_url: "https://pms.tajhotels.internal/api/guest/folio-lock",
      event: "GUEST_FOLIO_CREDIT_LOCKED",
      payload: {
        timestamp: new Date().toISOString(),
        sector: "hospitality",
        reservation_id: metadata.reservationId || "#HOTEL-TAJ-9912",
        room_number: metadata.roomNo || "Suite 702 (Presidential)",
        threat_vector: "VIP_CONCIERGE_VOICE_SPOOFING",
        voice_ai_probability: aiProbability,
        speaker_match: speakerMatch,
        governance_action: action,
        risk_level: riskLevel,
        pms_action: "SUSPEND_PHONE_AUTHORIZED_BILLING",
        front_desk_action: "REQUIRE_PHYSICAL_GOVT_ID_AT_CHECKIN",
        duty_manager_alerted: true,
        operator_notes: "Unauthorized phone caller attempting luxury vehicle charge to room."
      }
    },
    entertainment: {
      target_system: "Digital Rights DRM & WIPO Provenance Registry",
      endpoint_url: "https://drm.starmedia.internal/v3/rights/withhold",
      event: "AUDIO_RIGHTS_CLEARANCE_DENIED",
      payload: {
        timestamp: new Date().toISOString(),
        sector: "entertainment",
        master_stem_id: metadata.stemId || "#DUB-HIN-4089",
        talent_id: metadata.talentId || "Registered Voice Artist #412",
        threat_vector: "UNAUTHORIZED_GENERATIVE_AI_DUBBING",
        voice_ai_probability: aiProbability,
        speaker_match: speakerMatch,
        legal_basis: "Indian Copyright Act 1957 (Sec 38B - Moral Rights)",
        governance_action: action,
        risk_level: riskLevel,
        distribution_action: "WITHHOLD_THEATRICAL_OTT_RELEASE",
        provenance_hash_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        operator_notes: "Neural vocoder artifacts confirmed; voiceprint mismatch against registered artist baseline."
      }
    }
  }[sector] || {};

  const jsonString = JSON.stringify(payloads.payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-[#070b14] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/20 text-cyan-300">
              <Terminal className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Enterprise Webhook Actuator
                <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  HTTP 200 OK
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Target: <span className="text-cyan-300">{payloads.target_system}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Endpoint Banner */}
        <div className="border-b border-white/5 bg-[#03060c] px-6 py-2.5 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 truncate text-slate-300">
            <span className="font-bold text-emerald-400">POST</span>
            <span className="text-slate-400 truncate">{payloads.endpoint_url}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            {copied ? <CheckCircle2 className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6">
          <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-cyan-300 overflow-x-auto max-h-[360px] leading-relaxed shadow-inner">
            <pre>{jsonString}</pre>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>Cryptographically signed by BoloSafe-AI Risk Governance Core</span>
            </div>
            <span className="font-mono text-slate-500">Latency: 4.8ms</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-white/[0.02] px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
