"""Save measured defect evidence from real reports and HTTP responses."""
import json
import shutil
from pathlib import Path
from datetime import datetime, timezone
import requests
import sys

ROOT = Path(__file__).resolve().parents[1]
output = ROOT / 'evidence'
output.mkdir(exist_ok=True)
captured = datetime.now(timezone.utc).isoformat()
summary = []
for file in sorted((ROOT / 'reports/axe').glob('*.json')):
    report = json.loads(file.read_text(encoding='utf-8'))
    summary.append({'page': report['url'], 'scan_timestamp': report.get('timestamp'), 'engine': report['testEngine'], 'violations': [
        {'id': v['id'], 'impact': v['impact'], 'help': v['help'], 'helpUrl': v['helpUrl'],
         'nodes': [{k: n.get(k) for k in ['target', 'html', 'failureSummary', 'any', 'all', 'none']} for n in v['nodes']]}
        for v in report['violations']]})
(output / 'axe-findings.json').write_text(json.dumps({'captured_at': captured, 'pages': summary}, indent=2) + '\n', encoding='utf-8')
base = 'http://127.0.0.1:43210'
if len(sys.argv) == 3:
    spec = json.loads((ROOT / 'reports/swagger.v1.json').read_text(encoding='utf-8'))
    body = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
    headers = Path(sys.argv[2]).read_text(encoding='utf-8')
    assert '200 OK' in headers, headers
    response_status, content_type = 200, 'application/json (see captured headers)'
    transport = 'docker exec wget against http://127.0.0.1:3000; bootstrap-served contract from same image'
    request_base = 'http://127.0.0.1:3000'
else:
    spec_response = requests.get(base + '/swagger.v1.json', timeout=60)
    spec_response.raise_for_status()
    spec = spec_response.json()
    response = requests.get(base + '/api/v1/repos/qaowner/journeys/issues', timeout=60)
    response.raise_for_status()
    body = response.json()
    response_status, content_type = response.status_code, response.headers.get('Content-Type')
    transport, request_base, headers = 'requests from host', base, ''
issue = next(row for row in body if row['title'] == 'Seed issue')
(output / 'issue-contract.json').write_text(json.dumps({'captured_at': captured,
    'request': {'method': 'GET', 'url': request_base + '/api/v1/repos/qaowner/journeys/issues'},
    'transport': transport, 'status': response_status, 'content_type': content_type, 'captured_headers': headers,
    'issue': issue, 'issue_schema': spec['definitions']['Issue'],
    'pull_request_schema': spec['definitions']['PullRequestMeta']}, indent=2) + '\n', encoding='utf-8')
for name in ['api', 'selenium', 'playwright']:
    shutil.copyfile(ROOT / f'reports/{name}.xml', output / f'{name}-junit.xml')
screenshots = output / 'screenshots'
screenshots.mkdir(exist_ok=True)
for name in ['journeys-axe-user-login', 'journeys-axe-qaowner-journeys']:
    path = ROOT / 'reports/traces' / name / 'test-failed-1.png'
    if path.exists():
        shutil.copyfile(path, screenshots / (name + '.png'))
print('Saved actual axe, contract, JUnit and screenshot evidence')
