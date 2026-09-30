import os
import sys
import json
import joblib
import numpy as np
import soundfile as sf
import librosa

# Add project root to sys.path
sys.path.insert(0, '/mnt/d/aakriti/BoloSafe-AI/BoloSafe-AI')
os.chdir('/mnt/d/aakriti/BoloSafe-AI/BoloSafe-AI')

from src.features import extract_features
from src.sectors.common.governance import evaluate_sector_result

MODEL_PATH = "reports/xgboost_58d_calibrated.joblib"
print(f"Loading calibrated XGBoost model from {MODEL_PATH}...")
model = joblib.load(MODEL_PATH)
print("Model loaded successfully.")

scenarios = [
    # --- FINANCE ---
    {
        "sector": "finance",
        "scenario": "customer_verification",
        "label": "Balance & Statement Query",
        "is_spoof": False,
        "path": "frontend/public/sector_audio/finance/bonafide/finance_bonafide_balance_inquiry_en.wav",
        "tx_amount": None,
    },
    {
        "sector": "finance",
        "scenario": "high_value_transfer",
        "label": "₹5.25L RTGS Wire Fraud Attack (NEW AUDIO)",
        "is_spoof": True,
        "path": "frontend/public/sector_audio/finance/spoof/finance_spoof_rtgs_transfer_hi.wav",
        "tx_amount": 525000,
    },
    {
        "sector": "finance",
        "scenario": "account_recovery",
        "label": "Account Recovery Scam",
        "is_spoof": True,
        "path": "frontend/public/sector_audio/finance/spoof/finance_spoof_account_recovery_hi.wav",
        "tx_amount": None,
    },
    # --- RETAIL ---
    {
        "sector": "retail",
        "scenario": "customer_care",
        "label": "Customer Support Inquiry",
        "is_spoof": False,
        "path": "frontend/public/sector_audio/retail/bonafide/retail_bonafide_inquiry_en.wav",
        "tx_amount": None,
    },
    {
        "sector": "retail",
        "scenario": "order_modification",
        "label": "Delivery Address Spoof (NEW AUDIO)",
        "is_spoof": True,
        "path": "frontend/public/sector_audio/retail/spoof/retail_spoof_address_change_en.wav",
        "tx_amount": None,
    },
    {
        "sector": "retail",
        "scenario": "order_modification",
        "label": "Refund Diversion Attack",
        "is_spoof": True,
        "path": "frontend/public/sector_audio/retail/spoof/retail_spoof_refund_redirect_ta.wav",
        "tx_amount": None,
    },
    # --- HOSPITALITY ---
    {
        "sector": "hospitality",
        "scenario": "guest_verification",
        "label": "Dining Reservation Confirmation",
        "is_spoof": False,
        "path": "frontend/public/sector_audio/hospitality/bonafide/hospitality_bonafide_reservation_en.wav",
        "tx_amount": None,
    },
    {
        "sector": "hospitality",
        "scenario": "reservation_change",
        "label": "Reservation Change Scam (NEW AUDIO)",
        "is_spoof": True,
        "path": "frontend/public/sector_audio/hospitality/spoof/hospitality_spoof_reservation_change_ta.wav",
        "tx_amount": None,
    },
    {
        "sector": "hospitality",
        "scenario": "vip_booking",
        "label": "VIP Suite Folio Hijack",
        "is_spoof": True,
        "path": "frontend/public/sector_audio/hospitality/spoof/hospitality_spoof_vip_folio_ta.wav",
        "tx_amount": None,
    },
    # --- ENTERTAINMENT ---
    {
        "sector": "entertainment",
        "scenario": "dubbing_verification",
        "label": "Studio ADR Voice Stem",
        "is_spoof": False,
        "path": "frontend/public/sector_audio/entertainment/bonafide/entertainment_bonafide_studio_stem_en.wav",
        "tx_amount": None,
    },
    {
        "sector": "entertainment",
        "scenario": "voice_authenticity",
        "label": "Celebrity Dubbing Clone (NEW AUDIO)",
        "is_spoof": True,
        "path": "frontend/public/sector_audio/entertainment/spoof/entertainment_spoof_celebrity_dub_en.wav",
        "tx_amount": None,
    },
    {
        "sector": "entertainment",
        "scenario": "speaker_comparison",
        "label": "Artist IP Infringement Clone",
        "is_spoof": True,
        "path": "frontend/public/sector_audio/entertainment/spoof/entertainment_spoof_artist_clone_ta.wav",
        "tx_amount": None,
    },
]

results = []

print("=" * 80)
print(f"{'SECTOR':<14} | {'SCENARIO LABEL':<36} | {'EXP':<5} | {'AI PROB':<7} | {'DECISION':<18} | {'ACTION'}")
print("=" * 80)

for s in scenarios:
    path = s["path"]
    if not os.path.exists(path):
        print(f"MISSING: {path}")
        continue

    # Load audio as 16kHz float32
    y, sr = librosa.load(path, sr=16000, mono=True)
    duration = len(y) / sr

    # Extract 58-D features
    features = extract_features(y)
    features_2d = features.reshape(1, -1)

    # Inference
    proba = model.predict_proba(features_2d)[0]
    ai_prob = float(proba[1]) if len(proba) > 1 else float(proba[0])

    # Governance evaluation
    raw_result = {
        "ai_probability": ai_prob,
        "speaker_similarity": 0.45 if s["is_spoof"] else 0.88,
        "speaker_match": not s["is_spoof"],
        "caller_id": "+91-9876543210" if s["is_spoof"] else "+91-9123456780",
    }
    
    gov_decision = evaluate_sector_result(
        raw_result,
        sector=s["sector"],
        scenario=s["scenario"],
        transaction_amount_inr=s["tx_amount"],
    )

    action = gov_decision.get("action") or gov_decision.get("policy_action") or gov_decision.get("decision")
    status = gov_decision.get("status") or gov_decision.get("risk_level") or ("ALERT" if ai_prob >= 0.5 else "CLEAR")

    expected_str = "SPOOF" if s["is_spoof"] else "BONA"
    print(f"{s['sector'].upper():<14} | {s['label'][:35]:<36} | {expected_str:<5} | {ai_prob*100:>5.1f}% | {status:<18} | {action}")

    results.append({
        "sector": s["sector"],
        "scenario": s["scenario"],
        "label": s["label"],
        "is_spoof": s["is_spoof"],
        "duration": round(duration, 2),
        "ai_probability": round(ai_prob, 4),
        "governance": gov_decision,
    })

print("=" * 80)

# Save audit results
out_path = "reports/scenario_audio_audit.json"
os.makedirs("reports", exist_ok=True)
with open(out_path, "w") as f:
    json.dump(results, f, indent=2)

print(f"\nAudit complete. Detailed report saved to {out_path}.")
