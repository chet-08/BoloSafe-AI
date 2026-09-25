# BoloSafe-AI — Autonomous Multilingual Voice Security for India's Tertiary Economy

> **Smart India Hackathon (SIH) — Problem Statement 26199**  
> *Student Innovation in Tertiary Sectors: Hospitality, Financial Services, Entertainment, and Retail.*

---

## 1. Executive Summary

**BoloSafe-AI** is an autonomous, real-time voice fraud detection and identity governance platform specifically engineered to defend India's high-stakes tertiary industries against generative AI voice cloning, deepfake social engineering, and unauthorized vocal impersonation.

By pairing **multilingual foundation models (MMS-300M in Hindi, Tamil, and English)** with **58-dimensional handcrafted acoustic physics** and **sub-15ms inference latency**, BoloSafe-AI intercepts voice clone attacks before financial loss, delivery rerouting, room folio theft, or digital piracy can occur.

```
                           ┌────────────────────────────────────────────────────────┐
                           │          INBOUND MULTILINGUAL AUDIO STREAM             │
                           │       16 kHz Mono • WebRTC VAD • Window Geometry       │
                           └──────────────────────────┬─────────────────────────────┘
                                                      │
                                                      ▼
                           ┌────────────────────────────────────────────────────────┐
                           │               BOLOSAFE ACOUSTIC CORE                   │
                           │   • 58-D DSP Physics (MFCC, Formants, Rolloff, YIN F0) │
                           │   • MMS-300M Trilingual Foundation Model (HI, TA, EN)  │
                           │   • Calibrated XGBoost (P_ens = 0.5 P_XGB + 0.5 P_Dual)│
                           │   • SpeechBrain ECAPA-TDNN Speaker Biometric Match     │
                           └──────────────────────────┬─────────────────────────────┘
                                                      │
                                                      ▼
                           ┌────────────────────────────────────────────────────────┐
                           │           UNIFIED SECTOR GOVERNANCE ROUTER             │
                           │           (Zero-Latency Policy Evaluation)             │
                           └──────┬───────────────┬──────────────┬───────────────┬──┘
                                  │               │              │               │
        ┌─────────────────────────┘               │              │               └─────────────────────────┐
        ▼                                         ▼              ▼                                         ▼
┌───────────────────────┐    ┌─────────────────────────┐   ┌────────────────────────┐    ┌─────────────────────────┐
│ 💳 Financial Services │    │   🛍️ Retail & E-Commerce │   │ 🏨 Hospitality & Travel│    │ 🎬 Entertainment & Media│
│ • RTGS Wire Transfer  │    │ • Address Reroute Scam  │   │ • VIP Suite Concierge  │    │ • Voice Artist IP Rights│
│ • Dynamic ₹50k Gating │    │ • Refund Diversion Scam │   │ • Room Folio Lock      │    │ • Dubbing Verification  │
│ • RBI Master Direct.  │    │ • Consumer Protection   │   │ • PCI-DSS v4 Standard  │    │ • WIPO Provenance Stamp │
└───────────────────────┘    └─────────────────────────┘   └────────────────────────┘    └─────────────────────────┘
```

---

## 2. The 4 Tertiary Sector Architectures

### 💳 1. Financial Services (`src/sectors/finance/`)
* **Primary Threat**: Callers using cloned voices of high-net-worth account holders to authorize high-value RTGS/NEFT wire transfers or bypass net-banking password resets.
* **Autonomous Governance**:
  * Dynamic monetary gating: Transactions $> ₹50,000$ to newly registered payees trigger continuous acoustic verification.
  * $P_{\text{AI}} \ge 0.75 \rightarrow$ Action: `hold_and_escalate` (Immediate core banking stop-payment on outgoing wire batches).
  * Webhook Actuator: Dispatches ISO 20022 payment halt payload to Core Banking Systems (Finacle / TCS BaNCS).

### 🛍️ 2. Retail & E-Commerce (`src/sectors/retail/`)
* **Primary Threat**: Attackers using AI-cloned voices to impersonate customers on customer-care lines and request urgent mid-transit delivery address changes on high-value electronics.
* **Autonomous Governance**:
  * Flags address modification vectors during live calls.
  * $P_{\text{AI}} \ge 0.75 \rightarrow$ Action: `hold_and_escalate` (Freezes shipment fulfillment in OMS).
  * Webhook Actuator: Dispatches instant order hold to Shopify / Logistics OMS API and triggers SMS OTP step-up challenge.

### 🏨 3. Hospitality & Travel (`src/sectors/hospitality/`)
* **Primary Threat**: Cloned voice calls to luxury hotel front desks attempting to charge expensive concierge dining, vehicle rentals, or spa services to authorized guest room folios over the phone.
* **Autonomous Governance**:
  * Defends hotel front desks, luxury suites, and VIP guest folios.
  * $P_{\text{AI}} \ge 0.75 \rightarrow$ Action: `lock_folio_and_escalate` (Immediately suspends phone-authorized room charges).
  * Webhook Actuator: Dispatches folio lock payload to Hotel Property Management Systems (Opera PMS v5.6) and alerts Security Duty Manager.

### 🎬 4. Entertainment & Media (`src/sectors/entertainment/`)
* **Primary Threat**: Commercial voice theft, unauthorized generative AI dubbing of celebrity actors, and leaked deepfake audio stems without digital rights clearance.
* **Autonomous Governance**:
  * Compares inbound audio tracks against registered voice artist biometric baselines.
  * $P_{\text{AI}} \ge 0.75 \rightarrow$ Action: `block_rights_and_escalate` (Withholds theatrical and OTT release clearance).
  * Webhook Actuator: Dispatches clearance denial to Digital Rights DRM systems and exports cryptographic SHA-256 provenance certificates under the Indian Copyright Act 1957 (Sec 38B).

---

## 3. Core Engine Contracts & Technical Standards

| Metric / Contract | Specification | Measured Performance |
|---|---|---|
| **Audio Ingestion Standard** | 16 kHz, Mono, `float32`, normalized $[-1.0, 1.0]$ | WebRTC VAD 20ms frames |
| **Window Geometry** | 1.0-second window (16,000 samples) with 50% hop | Low-latency sliding buffer |
| **Feature Vector Dimension** | 58-D Handcrafted Acoustic Physics Vector | Extracted in **$< 4.8\text{ ms}$** |
| **Multilingual Inference** | Dual-Stream MMS-300M (English, Hindi, Tamil) | Sub-15ms real-time execution |
| **Speaker Biometrics** | SpeechBrain ECAPA-TDNN 192-D Cosine Similarity | Real-time speaker verification |
| **Privacy Architecture** | Zero-Retention Volatile RAM Policy | Audio discarded after window processing |
| **Telephony Robustness** | Tested against GSM AMR-NB (8kbps) & Pink Noise | **$> 96\%$ Accuracy** under compression |

---

## 4. Repository Structure

```
BoloSafe-AI/
├── src/
│   ├── features.py                  # 58-D acoustic DSP feature extractor
│   ├── speaker_verifier.py          # ECAPA-TDNN biometric speaker matcher
│   ├── speaker_registry.py          # Multi-tenant partitioned voiceprints
│   ├── privacy_policy.py            # Zero-retention RAM compliance contract
│   ├── websocket/server.py          # FastAPI low-latency streaming server
│   ├── risk_engine/                 # Real-time state machine & alert engine
│   └── sectors/                     # The 4 Tertiary Sector Policy Engines
│       ├── common/governance.py     # Unified zero-latency sector router
│       ├── finance/                 # Financial wire & RTGS gating
│       ├── retail/                  # E-commerce address & refund security
│       ├── hospitality/             # Hotel room folio & VIP concierge
│       └── entertainment/           # Voice actor rights & dubbing validation
├── frontend/                        # React 19 + Vite + Tailwind dashboard
│   └── src/
│       ├── components/              # SectorAudioPlayer, WebhookDrawer, LiveGraph
│       └── pages/sectors/           # Dedicated command centers for each sector
├── data/sectors/                    # Authentic sector audio datasets (HI, TA, EN)
├── reports/                         # Sector evaluation metrics & manifests
└── tests/test_sectors.py            # Automated test suite (100% passing)
```

---

## 5. Quickstart & Live Demo

### 1. Start the Backend Streaming Server
```bash
# Activate your Python virtual environment
source .venv/bin/activate

# Launch the WebSocket server
uvicorn src.websocket.server:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start the Frontend Operations Hub
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Run Automated Test Suite
```bash
pytest tests/test_sectors.py tests/risk_engine/ -v
```
All **75 automated unit tests pass** across risk policies, acoustic contracts, and sector governance.
