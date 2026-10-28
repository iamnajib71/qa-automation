"""Build one explicit journey mapping for every catalog case."""
import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
tests = {
    '002': 'test_login', '003': 'test_invalid_login', '007': 'test_public_repository',
    '008': 'private repository hidden', '010': 'test_repository_lifecycle',
    '011': 'test_repository_lifecycle', '012': 'test_duplicate_repository',
    '013': 'test_invalid_repository', '014': 'test_invalid_repository',
    '015': 'test_repository_lifecycle', '016': 'test_repository_lifecycle',
    '017': 'test_issue_visible', '018': 'create and close issue through UI',
    '020': 'test_issue_lifecycle', '021': 'test_issue_lifecycle',
    '028': 'test_auth_required', '029': 'test_malformed_json', '030': 'test_contract',
}
with (root / 'manual-cases.csv').open(encoding='utf-8', newline='') as stream:
    rows = [{'journey': row['title'], 'case': row['ID'],
             'automated_test': tests.get(row['ID'][3:], '')} for row in csv.DictReader(stream)]
rows.append({'journey': 'Accessible main pages (automated WCAG checks)', 'case': 'GT-026/GT-027', 'automated_test': 'axe '})
(root / 'traceability-map.json').write_text(json.dumps(rows, indent=2) + '\n', encoding='utf-8')
