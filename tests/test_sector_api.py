"""
tests/test_sector_api.py
Unit tests verifying interactive REST API endpoints for all 4 sectors and enterprise webhooks.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient

from src.websocket.server import app

client = TestClient(app)


def test_freeze_wire_api():
    payload = {
        "account_no": "XXXX-XXXX-9402",
        "amount_inr": 525000.0,
        "reason": "TEST_FREEZE",
        "channel": "RTGS",
    }
    response = client.post("/api/v1/sectors/finance/freeze-wire", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "FROZEN"
    assert "camt.056" in data["iso20022_message"]


def test_vkyc_challenge_api():
    payload = {
        "account_no": "XXXX-XXXX-9402",
        "customer_phone": "+91 98765-43210",
        "expiry_seconds": 120,
    }
    response = client.post("/api/v1/sectors/finance/vkyc-challenge", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "DISPATCHED"
    assert "verification_link" in data


def test_retail_order_hold_api():
    payload = {
        "order_id": "#BLS-4489-IND",
        "reason": "TEST_REROUTE_ATTACK",
        "carrier": "Delhivery Logistics",
    }
    response = client.post("/api/v1/sectors/retail/freeze-order", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SHIPMENT_ON_HOLD"


def test_retail_otp_flow_api():
    # 1. Send OTP
    send_resp = client.post("/api/v1/sectors/retail/send-otp", json={"phone_number": "+91 99999-00000"})
    assert send_resp.status_code == 200
    otp = send_resp.json()["simulated_otp"]

    # 2. Verify OTP
    verify_resp = client.post("/api/v1/sectors/retail/verify-otp", json={"phone_number": "+91 99999-00000", "otp_code": otp})
    assert verify_resp.status_code == 200
    assert verify_resp.json()["status"] == "VERIFIED"


def test_hospitality_lock_folio_api():
    payload = {
        "room_number": "1402",
        "guest_name": "S. Ramachandran",
        "reason": "TEST_SPOOF",
    }
    response = client.post("/api/v1/sectors/hospitality/lock-folio", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "FOLIO_LOCKED"
    assert data["telephone_charges_blocked"] is True


def test_entertainment_generate_cert_api():
    payload = {
        "track_title": "#STEM-DUB-4912-HIN",
        "licensed_artist": "Aditi V.",
        "is_authentic": False,
        "ai_probability": 0.942,
        "speaker_similarity": 0.410,
    }
    response = client.post("/api/v1/sectors/entertainment/generate-cert", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "audio_sha256" in data
    assert data["authenticity_status"] == "SYNTHETIC_DEEPFAKE_CLONE"


def test_webhook_dispatch_api():
    payload = {
        "sector": "finance",
        "scenario": "high_value_transfer",
        "payload": {"test": "data"},
    }
    response = client.post("/api/v1/sectors/webhook/test-dispatch", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "DELIVERED"
