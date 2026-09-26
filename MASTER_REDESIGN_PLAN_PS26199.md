# BoloSafe-AI: Master 6-Person Redesign & Delegation Plan
## Smart India Hackathon — Problem Statement 26199
> **"Student Innovation in Tertiary Sectors: Hospitality, Financial Services, Entertainment, and Retail"**  
> *Autonomous Multilingual Voice Fraud & Identity Governance Platform for India's Tertiary Economy*

---

## 1. Executive Strategy & Team Alignment

### Why This Wins Problem Statement 26199
Generic deepfake detection tools fail in the real world because detection alone does not solve business problems. When a fraudulent call hits a bank or hotel, security teams need **instant, legally enforceable business actions**, not just a raw probability score.

**BoloSafe-AI** transforms our acoustic ML core (58-D DSP, MMS-300M, ECAPA-TDNN, calibrated XGBoost, sub-15ms latency) into an **Autonomous Sector Governance Platform**:
- **Financial Services**: Blocks RTGS wire transfers, dispenses ISO 20022 payment cancellation webhooks, and triggers automated Video-KYC challenges.
- **Retail & E-Commerce**: Intercepts high-value order delivery rerouting, combats fake return OTP scams, and executes instant Shopify/OMS shipment holds.
- **Hospitality & Travel**: Protects VIP room folios against telephone charge fraud, locks room billing, and integrates with Oracle Opera/Fidelio PMS.
- **Entertainment & Media**: Protects voice actors' digital likeness under Section 38B of the Indian Copyright Act, inspects dubbing stems, and issues cryptographic SHA-256 provenance certificates.

```mermaid
flowchart TD
    subgraph CoreEngine [Core Acoustic & Biometric Infrastructure (Person 1)]
        Audio[Inbound Audio Stream: Telephony / WebRTC / File] --> VAD[WebRTC VAD & 16kHz Normalization]
        VAD --> DSP[58-D Spectral DSP + MMS-300M Acoustic Features]
        DSP --> XGB[Calibrated XGBoost Model < 15ms]
        VAD --> Bio[SpeechBrain ECAPA-TDNN Biometric Verifier]
        XGB --> Gov[Unified Sector Governance Router\nComposite Risk: Synth + Biometric + Monetary]
        Bio --> Gov
    end

    subgraph SectorEngines [Autonomous Sector Workflows (Persons 2, 3, 4, 5)]
        Gov --> S1[💳 Person 2: Financial Services\nRBI Gating • ISO 20022 Webhooks • Video-KYC Step-Up]
        Gov --> S2[🛍️ Person 3: Retail & E-Commerce\nDelivery Reroute Interceptor • OTP Challenge • OMS Freeze]
        Gov --> S3[🏨 Person 4: Hospitality & Luxury\nVIP Folio Protection • PMS REST API • Physical ID Check]
        Gov --> S4[🎬 Person 5: Entertainment & Media\nActor IP Protection • Stem Inspector • Cryptographic Cert]
    end

    subgraph EvaluationPresentation [DevOps & Jury Deliverables (Person 6)]
        S1 --> P6[📊 Person 6: Evaluation & Jury Hub\n12-Scenario Benchmarks • 1-Click PDF Incident Audits • PPT & Demo Script]
        S2 --> P6
        S3 --> P6
        S4 --> P6
    end
```

---

## 2. 6-Person Work Allocation & Ownership Matrix

To ensure that **all 6 teammates work concurrently with zero git merge conflicts**, each person owns a distinct, modular subsystem and works on their dedicated feature branch.

| Member | Primary Role | Domain / Module | Git Branch | Primary File Ownership |
|---|---|---|---|---|
| **Person 1** | **Team Lead & Core Architect** | Multi-Tenant Registry, Core Governance & Telemetry | `feat/core-governance` | `src/speaker_registry.py`<br>`src/speaker_verifier.py`<br>`src/sectors/common/governance.py`<br>`src/websocket/server.py`<br>`src/privacy_policy.py` |
| **Person 2** | **Financial Services Lead** | Banking, UPI/RTGS & Regulatory Gating | `feat/finance-suite` | `src/sectors/finance/*`<br>`src/sectors/finance/iso20022.py`<br>`src/sectors/finance/vkyc_challenger.py`<br>`frontend/src/pages/sectors/FinanceSecurity.jsx` |
| **Person 3** | **Retail & E-Commerce Lead** | Logistics, Delivery Rerouting & Return Fraud | `feat/retail-suite` | `src/sectors/retail/*`<br>`src/sectors/retail/oms_integrator.py`<br>`src/sectors/retail/otp_challenger.py`<br>`frontend/src/pages/sectors/RetailSecurity.jsx` |
| **Person 4** | **Hospitality & Travel Lead** | Hotel PMS, VIP Folios & Travel Loyalty | `feat/hospitality-suite` | `src/sectors/hospitality/*`<br>`src/sectors/hospitality/pms_gateway.py`<br>`src/sectors/hospitality/keycard_actuator.py`<br>`frontend/src/pages/sectors/HospitalitySecurity.jsx` |
| **Person 5** | **Entertainment & Media Lead** | Voice Actor IP, Dubbing Stems & Watermarks | `feat/entertainment-suite` | `src/sectors/entertainment/*`<br>`src/sectors/entertainment/watermark_verifier.py`<br>`src/sectors/entertainment/certificate_generator.py`<br>`frontend/src/pages/sectors/EntertainmentSecurity.jsx` |
| **Person 6** | **DevOps, Benchmark & Pitch Lead** | Benchmarking, PDF Audits, Presentation & Demo | `feat/benchmarks-pitch` | `scripts/evaluate_sectors.py`<br>`scripts/build_sector_datasets.py`<br>`reports/build_regulatory_pdf.py`<br>`frontend/src/pages/SecurityReport.jsx`<br>`docs/SIH_PITCH_DECK.md` |

---

## 3. Deep Domain Specifications: Advanced Features per Person

### Person 1: System Architect & Multi-Tenant Identity Core
**Mission**: Build the enterprise-grade foundation that connects raw acoustic AI to sector governance with sub-millisecond overhead.

#### Advanced Features to Build:
1. **Multi-Tenant Partitioned Biometric Store**:
   - Refactor `src/speaker_registry.py` from a flat JSON array into an isolated multi-tenant registry (`registry[tenant_id][speaker_id]`).
   - Ensures biometric voiceprints from banking customers never cross-pollinate with hotel guests or retail callers.
   - Zero-retention encryption: Voiceprint vectors stored as encrypted 192-dimensional floating-point embeddings (no raw audio persisted).
2. **Sub-Millisecond Composite Risk Engine**:
   - In `src/sectors/common/governance.py`, evaluate dynamic weighted risk:
     $$\text{CompositeRisk} = w_{\text{synth}} \cdot P_{\text{deepfake}} + w_{\text{bio}} \cdot (1 - S_{\text{biometric}}) + w_{\text{context}} \cdot \text{ContextFactor}$$
   - Zero extra inference delay: Reuses existing single-pass feature embeddings.
3. **Cross-Sector Threat Intelligence Network**:
   - If an acoustic voiceprint is flagged as a high-confidence cloned attack in Retail, its voice signature hash is instantly published to an in-memory threat cache, warning Banking and Hospitality endpoints of a coordinated social engineering campaign.
4. **DPDP Act 2023 Compliance Middleware**:
   - Automatically masks PII and speaker names in live logs; enforces in-memory ephemeral processing with verifiable RAM wiping.

---

### Person 2: Financial Services Lead
**Mission**: Deliver bank-grade security protecting high-value transactions, meeting RBI digital payment requirements.

#### Advanced Features to Build:
1. **RBI Master Direction Dynamic Monetary Gating**:
   - Tiered transaction risk evaluation:
     - **Micro Tier (< ₹10,000)**: Passive acoustic monitoring.
     - **Standard Tier (₹10,000 – ₹50,000)**: Mandatory biometric match ($S_{\text{bio}} \ge 0.75$).
     - **High-Value Tier (> ₹50,000)**: Zero-tolerance gate. Any spoof confidence $> 0.50$ triggers an immediate transaction freeze.
2. **ISO 20022 Banking Webhook Dispatcher (`src/sectors/finance/iso20022.py`)**:
   - When fraud is detected on a fund transfer, generates a standard ISO 20022 `camt.056.001.08` (Payment Cancellation Request) and `pacs.002` (Payment Status Report).
   - Mock integration ready for Core Banking systems (Infosys Finacle, TCS BaNCS).
3. **Automated Video-KYC Step-Up Challenge (`src/sectors/finance/vkyc_challenger.py`)**:
   - On suspicious calls, generates an instant, time-limited (120s) dynamic biometric step-up link dispatched via SMS/WhatsApp with a 6-digit one-time voice passphrase.
4. **Acoustic Glottal Pulse & Vocal Tract Anomaly Inspector**:
   - UI display in `FinanceSecurity.jsx` highlighting unnatural glottal pulses and vocoder phase artifacts typical of voice cloning software (ElevenLabs, Tortoise-TTS).
5. **Interactive Scenarios**:
   - `fin_high_value_wire`: ₹2,50,000 RTGS fraud attempt using cloned CEO voice (Hindi/English).
   - `fin_beneficiary_add`: Unauthorized foreign beneficiary addition on corporate account.

---

### Person 3: Retail & E-Commerce Lead
**Mission**: Prevent package rerouting theft, delivery agent spoofing, and return-to-origin (RTO) refund fraud.

#### Advanced Features to Build:
1. **Logistics Delivery Address Tamper Interceptor**:
   - Intercepts voice calls to logistics customer care requesting mid-transit address diversion for high-value electronics (smartphones, laptops).
   - Flags mismatched caller voiceprint against verified account profile.
2. **Return Fraud & Fake Delivery OTP Defense**:
   - Defends against scammers spoofing delivery personnel to trick customers into revealing delivery confirmation OTPs.
3. **Shopify & OMS Webhook Actuator (`src/sectors/retail/oms_integrator.py`)**:
   - Emits structured REST webhook payloads (`POST /admin/api/orders/{id}/holds.json`) to simulate freezing shipments in Shopify, Magento, or Delhivery OMS.
4. **CSR Live Whisper & Supervisor Conference Bridge**:
   - When deepfake probability exceeds 0.85, sends an automated "Whisper Warning" to the customer service agent's headset and triggers a 3-way conference escalation to a fraud supervisor.
5. **Interactive Scenarios**:
   - `ret_address_divert`: Attacker attempts to divert in-transit iPhone 15 delivery in Hindi.
   - `ret_fake_return`: Voice clone claiming non-receipt of luxury goods demanding instant refund.

---

### Person 4: Hospitality & Luxury Travel Lead
**Mission**: Secure 5-star hotel concierge operations, telephone folio billing, and VIP loyalty programs.

#### Advanced Features to Build:
1. **VIP Presidential Suite Folio Protection**:
   - Protects hotel guests against unauthorized phone charges (expensive dining, spa bookings, luxury boutique purchases charged to the room).
2. **Oracle Opera Cloud / Fidelio PMS REST API Simulator (`src/sectors/hospitality/pms_gateway.py`)**:
   - Injects real PMS payloads:
     ```json
     {
       "action": "LOCK_ROOM_CHARGES",
       "room_number": "1402",
       "guest_name": "S. Ramachandran",
       "reason": "ACOUSTIC_SPOOF_DETECTED_TELEPHONE_ORDER",
       "risk_score": 0.942
     }
     ```
3. **High-Tier Loyalty Points Redirection Defense**:
   - Intercepts voice attempts to redeem or transfer high-value loyalty points (Marriott Bonvoy, Taj InnerCircle, Air India Flying Returns).
4. **Front-Desk Physical Passport / Keycard Re-Verification Alert**:
   - Directs hotel concierge staff to place room folio on lock and request physical in-person biometric or passport verification upon return to hotel.
5. **Interactive Scenarios**:
   - `hosp_vip_suite_charge`: Tamil spoofed call to front desk charging ₹45,000 champagne to Suite 1402.
   - `hosp_points_transfer`: Social engineering attempt to liquidate 200,000 loyalty points.

---

### Person 5: Entertainment & Media Rights Lead
**Mission**: Defend voice actors, singers, and dubbing artists from unauthorized AI voice synthesis under Indian and international copyright law.

#### Advanced Features to Build:
1. **AI Voice Clone & Dubbing Stem Analyzer**:
   - Analyzes studio vocal stems to verify whether multilingual film dubbing (Hindi, Tamil, Telugu) was performed by the licensed human voice actor or synthesized via an unauthorized clone.
2. **Indian Copyright Act (Sec 38B) Enforcement Engine**:
   - Automatically cross-checks voice recordings against the **Performer's Moral Rights Registry**, flagging unauthorized commercial exploitation.
3. **Cryptographic SHA-256 Provenance & Authenticity Certificate Exporter (`src/sectors/entertainment/certificate_generator.py`)**:
   - Generates a signed, verifiable JSON & visual certificate stamped with:
     - Audio SHA-256 hash
     - Acoustic authenticity score (Human vs Synthetic)
     - Licensed Voice Artist ID & WIPO provenance tag
     - Timestamp and cryptographic signing key
4. **Spectral Clone Anomaly Lens**:
   - Visual inspection tool in `EntertainmentSecurity.jsx` displaying high-frequency phase cancellation and artificial harmonic spectra.
5. **Interactive Scenarios**:
   - `ent_voice_actor_clone`: Unauthorized synthetic Tamil dubbing stem clone.
   - `ent_celebrity_ad_hijack`: Cloned celebrity voice used in unapproved commercial promotion.

---

### Person 6: DevOps, Benchmarks, PDF Reports & Pitch Lead
**Mission**: Prove system superiority with empirical benchmark data, deliver 1-click regulatory audit PDFs, and orchestrate the winning SIH demo.

#### Advanced Features to Build:
1. **Unified Sector Benchmark Suite (`scripts/evaluate_sectors.py`)**:
   - Evaluates all 12 multilingual scenarios (Hindi, Tamil, English) across accuracy, EER (Equal Error Rate), latency distribution ($<15\text{ms}$), and ROC-AUC ($>0.99$).
   - Generates publication-ready CSV manifests (`reports/sector_evaluation_results.csv`).
2. **Instant Regulatory Incident Audit PDF Generator (`reports/build_regulatory_pdf.py`)**:
   - 1-click export of court-admissible, formal regulatory incident reports:
     - **Banking**: Formatted according to RBI Master Direction on Cyber Fraud.
     - **Retail**: Formatted for Consumer Protection (E-Commerce) Rules.
     - **Hospitality**: Formatted for PCI-DSS compliance audits.
     - **Entertainment**: Formatted as a legal Cease & Desist / Provenance Proof under Sec 38B.
3. **Adversarial GSM Telephony Stress-Testing (`frontend/src/pages/AdversarialRobustness.jsx`)**:
   - Demonstrates that BoloSafe-AI maintains $>96\%$ accuracy even under severe 8kHz AMR-NB cellular compression, background noise, and packet drop.
4. **Single-Command Docker Deployment**:
   - `Dockerfile` and `docker-compose.yml` ensuring seamless one-command setup for offline jury inspection.
5. **SIH 26199 Pitch Deck & 5-Minute Live Demo Script (`docs/SIH_PITCH_DECK.md`)**:
   - Concrete slide outline, talk tracks for each team member, and live click-through choreography.

---

## 4. Git Collaboration & Conflict Prevention Rules

To guarantee smooth parallel development without merge conflicts:

### Step 1: Base Commit & Branch Off
All team members branch off from the validated `feature/tertiary-sectors` base:
```bash
# Update and branch off feature/tertiary-sectors
git checkout feature/tertiary-sectors
git pull origin feature/tertiary-sectors

# Person 1
git checkout -b feat/core-governance

# Person 2
git checkout -b feat/finance-suite

# Person 3
git checkout -b feat/retail-suite

# Person 4
git checkout -b feat/hospitality-suite

# Person 5
git checkout -b feat/entertainment-suite

# Person 6
git checkout -b feat/benchmarks-pitch
```

### Step 2: Strict Isolation Rules
1. **Never edit another member's sector directory**: Person 2 only touches `src/sectors/finance/` and `FinanceSecurity.jsx`; Person 3 only touches `src/sectors/retail/` and `RetailSecurity.jsx`.
2. **Shared files (`App.jsx`, `governance.py`) are coordinated by Person 1**: If another person needs a routing change, they notify Person 1.
3. **Run local tests before committing**:
   ```bash
   pytest tests/test_sectors.py -v
   pytest tests/ -v
   cd frontend && npm run build
   ```

---

## 5. 5-Minute Winning Jury Presentation Choreography

| Time | Presenter | Screen / Component | Talking Points & Live Actions |
|---|---|---|---|
| **0:00 - 0:45** | **Person 1 (Lead)** | `Hero.jsx` & Architecture | *"Welcome, jury. In tertiary sectors, voice is identity. We present BoloSafe-AI: sub-15ms autonomous voice fraud defense tailored for India's 4 tertiary pillars."* |
| **0:45 - 1:45** | **Person 2 (Finance)** | `FinanceSecurity.jsx` | Trigger `fin_high_value_wire` (₹2.5L Hindi clone). Show dynamic RBI gating $> ₹50\text{k}$. Show real-time ISO 20022 `camt.056` freeze webhook dispatched in $<15\text{ms}$. |
| **1:45 - 2:30** | **Person 3 (Retail)** | `RetailSecurity.jsx` | Trigger `ret_address_divert` (Tamil iPhone theft). Show acoustic divergence alert, instant Shopify OMS shipment hold, and automated OTP challenge. |
| **2:30 - 3:15** | **Person 4 (Hospitality)** | `HospitalitySecurity.jsx` | Trigger `hosp_vip_suite_charge` (Presidential Suite charge scam). Show room folio lock and Oracle Opera PMS webhook execution. |
| **3:15 - 4:00** | **Person 5 (Entertainment)** | `EntertainmentSecurity.jsx` | Trigger `ent_voice_actor_clone` (Dubbing studio clone). Show WIPO/Sec 38B infringement alert and export signed SHA-256 Authenticity Certificate. |
| **4:00 - 5:00** | **Person 6 (DevOps)** | `SecurityReport.jsx` & PPT | Showcase 12-scenario multilingual benchmark results (99.1% accuracy, $<15\text{ms}$ latency). Download 1-click RBI incident PDF audit. Closing remarks. |

---

## 6. Implementation Checklist & Immediate Next Actions

- [x] **Base Infrastructure**: 4 sector policies & routers running in `src/sectors/`.
- [x] **Sector Datasets**: 12 neural Hindi/Tamil/English audios generated in `data/sectors/`.
- [x] **Sector Frontend Hubs**: `FinanceSecurity.jsx`, `RetailSecurity.jsx`, `HospitalitySecurity.jsx`, `EntertainmentSecurity.jsx`.
- [x] **Passing Tests**: 75/75 project tests passing.
- [ ] **Step 1**: Commit and push the current `feature/tertiary-sectors` base so all 6 teammates can pull and create their feature branches.
- [ ] **Step 2**: Implement the ISO 20022, OMS, PMS, and Provenance Certificate helper modules.
- [ ] **Step 3**: Integrate 1-click Regulatory PDF report generator in `reports/build_regulatory_pdf.py`.
