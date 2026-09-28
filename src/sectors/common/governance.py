"""
governance.py
BoloSafe-AI Unified Sector Governance Router (Person 1 — Core Architecture).

Orchestrates multi-sector risk policies, computes dynamic Composite Risk:
    R_composite = w1 * P_synth + w2 * (1 - S_bio) + w3 * T_monetary
and maintains a real-time, in-memory Cross-Sector Threat Intelligence Network.

Zero extra inference latency:
    Governance policies execute in < 0.2ms as deterministic rule evaluations
    over already-computed upstream acoustic and biometric representations.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any

from src.sectors.finance.router import evaluate_financial_result
from src.sectors.retail.router import evaluate_retail_result
from src.sectors.hospitality.router import evaluate_hospitality_result
from src.sectors.entertainment.router import evaluate_entertainment_result


# Maps external dataset or scenario slugs to valid sector schema literals
SCENARIO_MAPPING: dict[str, dict[str, str]] = {
    "finance": {
        "high_value_transfer": "high_value_transfer",
        "account_recovery": "account_recovery",
        "customer_verification": "customer_verification",
        "fin_rtgs_transfer": "high_value_transfer",
        "fin_high_value_wire": "high_value_transfer",
        "fin_beneficiary_add": "account_recovery",
        "fin_kyc_verification": "customer_verification",
        "default": "high_value_transfer",
    },
    "retail": {
        "order_modification": "order_modification",
        "customer_care": "customer_care",
        "account_assistance": "account_assistance",
        "ret_address_divert": "order_modification",
        "ret_fake_return": "customer_care",
        "ret_account_takeover": "account_assistance",
        "order_modify": "order_modification",
        "default": "customer_care",
    },
    "hospitality": {
        "guest_verification": "guest_verification",
        "vip_booking": "vip_booking",
        "reservation_change": "reservation_change",
        "hosp_vip_suite_charge": "vip_booking",
        "hosp_reservation_cancel": "reservation_change",
        "hosp_concierge_request": "guest_verification",
        "default": "guest_verification",
    },
    "entertainment": {
        "dubbing_verification": "dubbing_verification",
        "voice_authenticity": "voice_authenticity",
        "speaker_comparison": "speaker_comparison",
        "ent_voice_actor_clone": "speaker_comparison",
        "ent_dubbing_stem_audit": "dubbing_verification",
        "ent_podcast_screening": "voice_authenticity",
        "default": "voice_authenticity",
    },
}


@dataclass
class ThreatRecord:
    caller_id: str
    source_sector: str
    spoof_probability: float
    attack_type: str
    timestamp: float = field(default_factory=time.time)


class ThreatIntelligenceNetwork:
    """
    Cross-Sector Threat Intelligence Network.
    Propagates detected acoustic impersonation attacks across tertiary sectors.
    If an attacker attacks Retail, Banking and Hospitality endpoints are alerted.
    """

    def __init__(self, ttl_seconds: float = 3600.0):
        self._threats: dict[str, list[ThreatRecord]] = {}
        self._ttl_seconds = ttl_seconds

    def register_threat(
        self,
        caller_id: str,
        sector: str,
        spoof_probability: float,
        attack_type: str = "SYNTHETIC_VOICE_CLONE",
    ) -> None:
        """Register a confirmed spoof attack into cross-sector threat intelligence."""
        if not caller_id:
            return

        record = ThreatRecord(
            caller_id=caller_id,
            source_sector=sector,
            spoof_probability=spoof_probability,
            attack_type=attack_type,
        )
        if caller_id not in self._threats:
            self._threats[caller_id] = []
        self._threats[caller_id].append(record)

    def lookup_threat(self, caller_id: str | None) -> dict[str, Any]:
        """
        Check if caller_id has recent attack records in any sector.
        Returns threat intelligence metadata.
        """
        if not caller_id or caller_id not in self._threats:
            return {
                "is_cross_sector_threat": False,
                "threat_count": 0,
                "origin_sectors": [],
                "highest_spoof_prob": 0.0,
                "global_alert": None,
            }

        now = time.time()
        # Filter active within TTL
        active_records = [
            r for r in self._threats[caller_id]
            if (now - r.timestamp) <= self._ttl_seconds
        ]

        if not active_records:
            return {
                "is_cross_sector_threat": False,
                "threat_count": 0,
                "origin_sectors": [],
                "highest_spoof_prob": 0.0,
                "global_alert": None,
            }

        sectors = list({r.source_sector for r in active_records})
        max_prob = max(r.spoof_probability for r in active_records)

        return {
            "is_cross_sector_threat": True,
            "threat_count": len(active_records),
            "origin_sectors": sectors,
            "highest_spoof_prob": round(max_prob, 3),
            "global_alert": f"Active threat flagged in: {', '.join(sectors).upper()}",
        }

    def clear(self) -> None:
        """Clear threat cache (used in testing)."""
        self._threats.clear()


# Global Singleton for in-memory threat intelligence
GLOBAL_THREAT_NETWORK = ThreatIntelligenceNetwork()


def calculate_composite_risk(
    p_synth: float,
    s_bio: float | None = None,
    transaction_amount_inr: float | None = None,
) -> float:
    """
    Compute unified composite risk score [0.0, 1.0].
    Weights:
        w_synth = 0.50
        w_bio   = 0.30
        w_amt   = 0.20
    """
    w_synth = 0.50
    w_bio = 0.30
    w_amt = 0.20

    # 1. Acoustic synthetic component
    c_synth = max(0.0, min(1.0, float(p_synth)))

    # 2. Biometric mismatch component (1.0 - similarity)
    if s_bio is not None:
        c_bio = max(0.0, min(1.0, 1.0 - float(s_bio)))
    else:
        c_bio = 0.5  # Neutral when unverified

    # 3. Monetary risk factor
    if transaction_amount_inr is not None:
        if transaction_amount_inr >= 50000:
            c_amt = 1.0
        elif transaction_amount_inr >= 10000:
            c_amt = 0.5
        else:
            c_amt = 0.1
    else:
        c_amt = 0.0
        # Renormalize weights when monetary factor is absent
        w_synth = 0.65
        w_bio = 0.35
        w_amt = 0.0

    raw_score = (w_synth * c_synth) + (w_bio * c_bio) + (w_amt * c_amt)
    return round(max(0.0, min(1.0, raw_score)), 3)


VALID_SECTOR_SCENARIOS: dict[str, set[str]] = {
    "finance": {"high_value_transfer", "account_recovery", "customer_verification"},
    "retail": {"order_modification", "customer_care", "account_assistance"},
    "hospitality": {"reservation_change", "guest_verification", "vip_booking"},
    "entertainment": {"voice_authenticity", "speaker_comparison", "dubbing_verification"},
}


def _resolve_scenario(sector: str, scenario: str) -> str:
    """Normalize and resolve scenario slug to valid sector enum literal."""
    norm_sector = sector.lower().strip()
    mapping = SCENARIO_MAPPING.get(norm_sector, {})
    if scenario in mapping:
        return mapping[scenario]
    valid = VALID_SECTOR_SCENARIOS.get(norm_sector, set())
    if scenario in valid:
        return scenario
    return mapping.get("default", "default")


def evaluate_sector_result(
    result: dict[str, Any],
    *,
    sector: str,
    scenario: str,
    transaction_amount_inr: float | None = None,
    caller_id: str | None = None,
) -> dict[str, Any]:
    """
    Route an already-computed BoloSafe-AI result to the
    appropriate sector governance policy, inject composite risk scoring,
    and cross-reference with the Cross-Sector Threat Intelligence Network.
    """
    norm_sector = sector.lower().strip()
    resolved_scenario = _resolve_scenario(norm_sector, scenario)

    # Adapt upstream result fields (ensure ai_probability is populated)
    adapted_result = dict(result)
    p_synth = float(
        result.get("ai_probability")
        if result.get("ai_probability") is not None
        else (
            result.get("synthetic_probability")
            or result.get("spoof_probability")
            or result.get("probability")
            or 0.0
        )
    )
    adapted_result["ai_probability"] = p_synth

    # Biometric similarity & transaction amount
    s_bio = result.get("speaker_similarity")
    eff_tx_amount = (
        transaction_amount_inr
        if transaction_amount_inr is not None
        else result.get("transaction_amount_inr")
    )
    if eff_tx_amount is not None:
        adapted_result["transaction_amount_inr"] = eff_tx_amount

    # Compute Composite Risk Score BEFORE sector policy evaluation
    composite_risk = calculate_composite_risk(
        p_synth=p_synth,
        s_bio=s_bio,
        transaction_amount_inr=eff_tx_amount,
    )
    adapted_result["composite_risk_score"] = composite_risk

    # Check Cross-Sector Threat Intelligence Network
    effective_caller = caller_id or result.get("caller_id") or result.get("speaker_id")
    threat_info = GLOBAL_THREAT_NETWORK.lookup_threat(effective_caller)
    adapted_result["is_cross_sector_threat"] = threat_info["is_cross_sector_threat"]
    adapted_result["threat_intel"] = threat_info

    if norm_sector == "finance":
        decision = evaluate_financial_result(
            adapted_result,
            scenario=resolved_scenario,
            transaction_amount_inr=eff_tx_amount,
        )
    elif norm_sector == "retail":
        decision = evaluate_retail_result(
            adapted_result,
            scenario=resolved_scenario,
        )
    elif norm_sector == "hospitality":
        hospitality_scenarios = {
            "reservation_change",
            "guest_verification",
            "vip_booking",
        }

        hospitality_scenario = (
            resolved_scenario
            if resolved_scenario in hospitality_scenarios
            else "guest_verification"
        )

        decision = evaluate_hospitality_result(
            adapted_result,
            scenario=hospitality_scenario,
            transaction_amount_inr=transaction_amount_inr,
        )
    elif norm_sector == "entertainment":
        decision = evaluate_entertainment_result(
            adapted_result,
            scenario=resolved_scenario,
        )
    else:
        raise ValueError(
            f"Sector governance is not implemented for: {sector!r}"
        )

    decision_dict = decision.model_dump()
    decision_dict["sector"] = norm_sector
    decision_dict["composite_risk_score"] = composite_risk

    if threat_info["is_cross_sector_threat"]:
        decision_dict["cross_sector_threat_detected"] = True
        decision_dict["threat_intel"] = threat_info
        # Flag in recommended actions
        rec_actions = decision_dict.get("recommended_actions", [])
        alert_msg = f"CROSS-SECTOR ALERT: Originating attacker previously flagged in {', '.join(threat_info['origin_sectors']).upper()}"
        if alert_msg not in rec_actions:
            rec_actions.insert(0, alert_msg)
            decision_dict["recommended_actions"] = rec_actions
    else:
        decision_dict["cross_sector_threat_detected"] = False
        decision_dict["threat_intel"] = threat_info

    # If this call itself is a strong spoof, register into global threat intelligence
    if p_synth >= 0.70 and effective_caller:
        GLOBAL_THREAT_NETWORK.register_threat(
            caller_id=effective_caller,
            sector=norm_sector,
            spoof_probability=p_synth,
            attack_type="SYNTHETIC_VOICE_CLONE",
        )

    return decision_dict
