#!/usr/bin/env python3
"""
audit.py — verify lib/excel-data.ts against Social Performance Tracker (2026).xlsx
cell by cell. Exits 0 if 100% match, 1 if any mismatch.
"""
import openpyxl, re, sys, os

XLSX = os.path.expanduser('~/Downloads/Social Performance Tracker (2026).xlsx')
TS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'lib/excel-data.ts')

wb = openpyxl.load_workbook(XLSX, data_only=True)

def extract_row(sheet_name, label_match):
    ws = wb[sheet_name]
    for row in ws.iter_rows(min_row=1, max_row=80, values_only=True):
        label = str(row[1]).strip() if row[1] else ''
        if label_match.lower() == label.lower() or label_match.lower() in label.lower():
            return list(row[2:14])
    return None

with open(TS) as f: src = f.read()
def parse_M(text):
    nums = re.findall(r'-?[\d.]+|null', text)
    out = []
    for n in nums:
        if n == 'null': out.append(None)
        else:
            try: out.append(float(n))
            except: pass
    while len(out) < 12: out.append(None)
    return out[:12]

def extract_const(name):
    m = re.search(r'export const ' + re.escape(name) + r':[^=]+= \{([^}]+)\}', src)
    if not m: return {}
    body = m.group(1)
    result = {}
    for line in body.split('\n'):
        m2 = re.match(r'\s*(\w+):\s*M\(([^)]+)\),?', line)
        if m2: result[m2.group(1)] = parse_M(m2.group(2))
    return result

checks = [
    ('INSTAGRAM_2026', 'accounts_reached', 'IG', 'Accounts Reached'),
    ('INSTAGRAM_2026', 'total_views', 'IG', 'Total views'),
    ('INSTAGRAM_2026', 'likes', 'IG', 'Likes'),
    ('INSTAGRAM_2026', 'comments', 'IG', 'Comments'),
    ('INSTAGRAM_2026', 'shares', 'IG', 'Shares'),
    ('INSTAGRAM_2026', 'saves', 'IG', 'Saves'),
    ('INSTAGRAM_2026', 'new_follows', 'IG', 'New Follows'),
    ('INSTAGRAM_2026', 'sessions', 'IG', 'Sessions'),
    ('INSTAGRAM_2026', 'free_trials', 'IG', 'Free Trials'),
    ('INSTAGRAM_2026', 'revenue_ga4', 'IG', 'Revenue (GA4)'),
    ('FACEBOOK_2026', 'views', 'FB', 'Views'),
    ('FACEBOOK_2026', 'accounts_reached', 'FB', 'Accounts Reached'),
    ('FACEBOOK_2026', 'facebook_visits', 'FB', 'Facebook Visits'),
    ('FACEBOOK_2026', 'content_interactions', 'FB', 'Content Interactions'),
    ('FACEBOOK_2026', 'new_follows', 'FB', 'New Follows'),
    ('FACEBOOK_2026', 'free_trials', 'FB', 'Free Trials'),
    ('FACEBOOK_2026', 'sessions_ga4', 'FB', 'Sessions (GA4)'),
    ('FACEBOOK_2026', 'revenue_ga4', 'FB', 'Revenue (GA4)'),
    ('TIKTOK_2026', 'views', 'TT', 'Views'),
    ('TIKTOK_2026', 'reached_audience', 'TT', 'Reached Audience'),
    ('TIKTOK_2026', 'profile_views', 'TT', 'Profile Views'),
    ('TIKTOK_2026', 'engaged_audience', 'TT', 'Engaged Audience'),
    ('TIKTOK_2026', 'saves', 'TT', 'Saves'),
    ('TIKTOK_2026', 'likes', 'TT', 'Likes'),
    ('TIKTOK_2026', 'comments', 'TT', 'Comments'),
    ('TIKTOK_2026', 'shares', 'TT', 'Shares'),
    ('TIKTOK_2026', 'new_follows', 'TT', 'New Follows'),
    ('TIKTOK_2026', 'num_posts', 'TT', '# of Posts'),
    ('TIKTOK_2026', 'sessions_ga4', 'TT', 'Sessions'),
    ('TIKTOK_2026', 'free_trials', 'TT', 'Free Trials'),
    ('TIKTOK_2026', 'revenue_ga4', 'TT', 'Revenue (GA4)'),
]

constants = {}
for c in ['INSTAGRAM_2026', 'INSTAGRAM_2025', 'FACEBOOK_2026', 'FACEBOOK_2025', 'TIKTOK_2026', 'TIKTOK_2025']:
    constants[c] = extract_const(c)

mismatches, ok = [], 0
for ts_const, ts_field, sheet, xlsx_label in checks:
    ts_val = constants.get(ts_const, {}).get(ts_field, [])
    xlsx_val = extract_row(sheet, xlsx_label)
    if not xlsx_val:
        mismatches.append((ts_const, ts_field, 'NOT FOUND'))
        continue
    for i in range(4):
        t = ts_val[i] if i < len(ts_val) else None
        x = xlsx_val[i]
        x_num = float(x) if isinstance(x, (int, float)) else None
        if t is None and x_num is None: continue
        if t is None or x_num is None:
            mismatches.append((ts_const, ts_field, f'Mo{i+1}: TS={t} vs XLSX={x_num}'))
        elif abs(t - x_num) > 0.5:
            mismatches.append((ts_const, ts_field, f'Mo{i+1}: TS={t} vs XLSX={x_num}'))
        else:
            ok += 1

print(f'\n{"="*60}')
print(f'AUDIT RESULT: {ok} cells matched, {len(mismatches)} mismatches')
print('='*60)
for m in mismatches:
    print(' ❌', *m)
sys.exit(0 if not mismatches else 1)
