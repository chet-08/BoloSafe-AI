/**
 * sectorApi.js
 * Frontend client helpers communicating with live BoloSafe-AI backend REST endpoints.
 */

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export async function freezeWire({ accountNo = 'XXXX-XXXX-9402', amountInr = 525000.0 } = {}) {
  const resp = await fetch(`${API_BASE}/api/v1/sectors/finance/freeze-wire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account_no: accountNo, amount_inr: amountInr }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

export async function dispatchVideoKyc({ accountNo = 'XXXX-XXXX-9402', customerPhone = '+91 98765-43210' } = {}) {
  const resp = await fetch(`${API_BASE}/api/v1/sectors/finance/vkyc-challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account_no: accountNo, customer_phone: customerPhone }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

export async function freezeOrder({ orderId = '#BLS-4489-IND', carrier = 'Delhivery Logistics' } = {}) {
  const resp = await fetch(`${API_BASE}/api/v1/sectors/retail/freeze-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, carrier }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

export async function sendRetailOtp({ phoneNumber = '+91 98765-XXXXX' } = {}) {
  const resp = await fetch(`${API_BASE}/api/v1/sectors/retail/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

export async function verifyRetailOtp({ phoneNumber = '+91 98765-XXXXX', otpCode = '481902' } = {}) {
  const resp = await fetch(`${API_BASE}/api/v1/sectors/retail/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phoneNumber, otp_code: otpCode }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

export async function lockRoomFolio({ roomNumber = '1402', guestName = 'S. Ramachandran' } = {}) {
  const resp = await fetch(`${API_BASE}/api/v1/sectors/hospitality/lock-folio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_number: roomNumber, guest_name: guestName }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

export async function challengeGuest({ roomNumber = '1402' } = {}) {
  const resp = await fetch(`${API_BASE}/api/v1/sectors/hospitality/challenge-guest?room_number=${roomNumber}`, {
    method: 'POST',
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

export async function generateProvenanceCert({
  trackTitle = '#STEM-DUB-4912-HIN',
  licensedArtist = 'Aditi V.',
  isAuthentic = false,
  aiProbability = 0.942,
  speakerSimilarity = 0.410,
} = {}) {
  const resp = await fetch(`${API_BASE}/api/v1/sectors/entertainment/generate-cert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      track_title: trackTitle,
      licensed_artist: licensedArtist,
      is_authentic: isAuthentic,
      ai_probability: aiProbability,
      speaker_similarity: speakerSimilarity,
    }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

export async function testWebhookDispatch({ sector, scenario, payload }) {
  const resp = await fetch(`${API_BASE}/api/v1/sectors/webhook/test-dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sector, scenario, payload }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

export async function simulateThreat({ callerId = '+91 98765-43210', originSector = 'retail', spoofProbability = 0.95 } = {}) {
  const resp = await fetch(`${API_BASE}/api/v1/sectors/threat-intel/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caller_id: callerId, origin_sector: originSector, spoof_probability: spoofProbability }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}
