import json
import sys
data = json.load(open('reports/validation_summary.json'))
key = sys.argv[1] if len(sys.argv) > 1 else 'finance_bonafide_balance_inquiry_en.wav'
for r in data:
    if r['label'] == key:
        print(f"=== {key} ({r['expected']}) ===")
        for w in r['per_window']:
            dual = w['dual_prob']
            dual_str = f'{dual:.3f}' if dual is not None else 'NA'
            print(f'window={w["window_id"]:2d}  xgb={w["xgb_prob"]:.3f}  dual={dual_str}  ens={w["ensemble_prob"]:.3f}  rolling={w["rolling_score"]:.3f}  flags={w["consecutive_flags"]}  level={w["risk_level"]}')
        break

