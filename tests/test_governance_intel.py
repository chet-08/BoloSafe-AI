"""
tests/test_governance_intel.py
Unit tests verifying Composite Risk scoring and Cross-Sector Threat Intelligence
(Person 1 — Core Architecture).
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest

from src.sectors.common.governance import (
    calculate_composite_risk,
    evaluate_sector_result,
    GLOBAL_THREAT_NETWORK,
)


def test_composite_risk_weighting():
    # 1. Pure synthetic call with no biometric match and high amount
    score_high = calculate_composite_risk(
        p_synth=1.0,
        s_bio=0.0,
        transaction_amount_inr=100000.0,
    )
    # w_synth(0.50)*1 + w_bio(0.30)*1 + w_amt(0.20)*1 = 1.0
    assert score_high == pytest.approx(1.0, abs=1e-3)

    # 2. Bonafide call with verified biometric and micro amount
    score_low = calculate_composite_risk(
        p_synth=0.0,
        s_bio=1.0,
        transaction_amount_inr=500.0,
    )
    # w_synth*0 + w_bio*0 + w_amt(0.20)*0.1 = 0.02
    assert score_low < 0.10


def test_cross_sector_threat_propagation():
    GLOBAL_THREAT_NETWORK.clear()
    caller = "+919876543210"

    # Step 1: Attacker attempts fraud in Retail (spoof prob = 0.95)
    retail_result = {
        "synthetic_probability": 0.95,
        "is_spoof": True,
        "caller_id": caller,
    }
    decision_retail = evaluate_sector_result(
        retail_result,
        sector="retail",
        scenario="ret_address_divert",
        caller_id=caller,
    )
    assert decision_retail["composite_risk_score"] > 0.60

    # Step 2: Same attacker calls Banking / Finance
    finance_result = {
        "synthetic_probability": 0.60,
        "is_spoof": True,
        "caller_id": caller,
    }
    decision_finance = evaluate_sector_result(
        finance_result,
        sector="finance",
        scenario="fin_rtgs_transfer",
        caller_id=caller,
    )

    # Must flag cross-sector threat intelligence
    assert decision_finance["cross_sector_threat_detected"] is True
    assert "retail" in decision_finance["threat_intel"]["origin_sectors"]
    assert any("CROSS-SECTOR" in action for action in decision_finance["recommended_actions"])

    GLOBAL_THREAT_NETWORK.clear()
