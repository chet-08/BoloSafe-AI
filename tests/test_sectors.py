import pytest
from src.sectors.common.governance import evaluate_sector_result
from src.sectors.common.registry import SECTOR_REGISTRY, get_sector, list_sectors


def test_registry_contains_all_tertiary_sectors():
    assert "finance" in SECTOR_REGISTRY
    assert "retail" in SECTOR_REGISTRY
    assert "hospitality" in SECTOR_REGISTRY
    assert "entertainment" in SECTOR_REGISTRY
    assert len(list_sectors()) == 4


def test_finance_governance():
    # Low risk
    low = evaluate_sector_result(
        {"ai_probability": 0.1, "speaker_similarity": 0.95, "speaker_match": True},
        sector="finance",
        scenario="high_value_transfer",
        transaction_amount_inr=50000.0,
    )
    assert low["risk_level"] == "low"
    assert low["action"] == "allow"

    # High risk
    high = evaluate_sector_result(
        {"ai_probability": 0.85, "speaker_similarity": 0.2, "speaker_match": False},
        sector="finance",
        scenario="high_value_transfer",
        transaction_amount_inr=500000.0,
    )
    assert high["risk_level"] == "high"
    assert high["action"] == "hold_and_escalate"


def test_finance_governance_consumes_risk_engine_and_composite():
    # Case: AI prob = 37.2%, but ₹50L transaction yields composite risk = 53.6%
    # Must trigger step_up_verification instead of erroneously returning ALLOW
    rtgs_spoof = evaluate_sector_result(
        {
            "ai_probability": 0.372,
            "speaker_similarity": None,
            "speaker_match": None,
            "risk_level": "LOW",
            "rolling_score": 0.263,
            "alert_triggered": False,
        },
        sector="finance",
        scenario="high_value_transfer",
        transaction_amount_inr=5_000_000.0,
    )
    assert rtgs_spoof["composite_risk_score"] >= 0.50
    assert rtgs_spoof["risk_level"] == "medium"
    assert rtgs_spoof["action"] == "step_up_verification"
    assert rtgs_spoof["verification_required"] is True

    # Case: RiskEngine triggers alert
    alert_case = evaluate_sector_result(
        {
            "ai_probability": 0.35,
            "speaker_similarity": 0.9,
            "speaker_match": True,
            "risk_level": "HIGH",
            "alert_triggered": True,
        },
        sector="finance",
        scenario="high_value_transfer",
    )
    assert alert_case["risk_level"] == "high"
    assert alert_case["action"] == "hold_and_escalate"

    # Case: RiskEngine indicates medium
    medium_case = evaluate_sector_result(
        {
            "ai_probability": 0.25,
            "speaker_similarity": 0.85,
            "speaker_match": True,
            "risk_level": "MEDIUM",
            "rolling_score": 0.52,
            "alert_triggered": False,
        },
        sector="finance",
        scenario="high_value_transfer",
        transaction_amount_inr=1000.0,
    )
    assert medium_case["risk_level"] == "medium"
    assert medium_case["action"] == "step_up_verification"


def test_retail_governance():
    # High risk clone
    high = evaluate_sector_result(
        {"ai_probability": 0.88, "speaker_similarity": 0.3, "speaker_match": False},
        sector="retail",
        scenario="order_modification",
    )
    assert high["sector"] == "retail"
    assert high["risk_level"] == "high"
    assert high["action"] == "hold_and_escalate"

    # Low risk verified
    low = evaluate_sector_result(
        {"ai_probability": 0.12, "speaker_similarity": 0.92, "speaker_match": True},
        sector="retail",
        scenario="customer_care",
    )
    assert low["risk_level"] == "low"
    assert low["action"] == "allow"


def test_hospitality_governance():
    # High risk VIP spoofing
    high = evaluate_sector_result(
        {"ai_probability": 0.82, "speaker_similarity": 0.4, "speaker_match": False},
        sector="hospitality",
        scenario="vip_booking",
    )
    assert high["sector"] == "hospitality"
    assert high["risk_level"] == "high"
    assert high["action"] == "lock_folio_and_escalate"

    # Medium risk / mismatch
    med = evaluate_sector_result(
        {"ai_probability": 0.45, "speaker_similarity": 0.65, "speaker_match": False},
        sector="hospitality",
        scenario="reservation_change",
    )
    assert med["risk_level"] == "medium"
    assert med["action"] == "require_front_desk_id"


def test_entertainment_governance():
    # High risk voice cloning
    high = evaluate_sector_result(
        {"ai_probability": 0.91, "speaker_similarity": 0.35, "speaker_match": False},
        sector="entertainment",
        scenario="voice_authenticity",
    )
    assert high["sector"] == "entertainment"
    assert high["risk_level"] == "high"
    assert high["action"] == "block_rights_and_escalate"

    # Low risk certified authentic
    low = evaluate_sector_result(
        {"ai_probability": 0.08, "speaker_similarity": 0.94, "speaker_match": True},
        sector="entertainment",
        scenario="dubbing_verification",
    )
    assert low["risk_level"] == "low"
    assert low["action"] == "certify_authentic"


def test_invalid_sector_raises():
    with pytest.raises(ValueError, match="Sector governance is not implemented"):
        evaluate_sector_result(
            {"ai_probability": 0.5},
            sector="unknown_sector",
            scenario="test",
        )
