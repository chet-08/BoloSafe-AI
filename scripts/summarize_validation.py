import json
import sys

data = json.load(open('reports/validation_summary.json'))
print("=== SPOOF CLIPS ===")
for r in data:
    if r['expected'] == 'spoof':
        last_level = r.get('per_window', [{}])[-1].get('risk_level', 'N/A') if r.get('per_window') else 'N/A'
        print(f"{r['label']:50}  alert={str(r['alert_triggered']):5}  fe={str(r['frontend_accepted']):5}  gov={r['governance_action']}")
print()
print("=== BONAFIDE CLIPS ===")
for r in data:
    if r['expected'] == 'bonafide':
        print(f"{r['label']:50}  alert={str(r['alert_triggered']):5}  fe={str(r['frontend_accepted']):5}  gov={r['governance_action']}")
