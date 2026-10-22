"""Start the disposable Docker target; seed idempotent local-only fixtures."""
import json
import subprocess
import time
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
BASE = 'http://127.0.0.1:43210'


def main():
    subprocess.run(['docker', 'compose', '-f', str(ROOT / 'compose.yml'), 'up', '-d'], check=True)
    for _ in range(90):
        try:
            if requests.get(BASE + '/api/v1/version', timeout=2).status_code == 200:
                break
        except requests.RequestException:
            pass
        time.sleep(2)
    else:
        raise RuntimeError('Gitea readiness timed out')
    command = ['docker', 'compose', '-f', str(ROOT / 'compose.yml'), 'exec', '-T',
               '--user', 'git', 'gitea', 'gitea', 'admin', 'user', 'create',
               '--username', 'qaowner', '--password', 'Local-QA-Only-482!',
               '--email', 'qaowner@example.invalid', '--must-change-password=false']
    # An existing user is acceptable only if the fixture credentials still work.
    result = subprocess.run(command, capture_output=True, text=True)
    session = requests.Session()
    session.auth = ('qaowner', 'Local-QA-Only-482!')
    response = session.get(BASE + '/api/v1/user', timeout=15)
    if response.status_code != 200:
        raise RuntimeError('Fixture account could not be created or authenticated: ' + result.stderr)
    for name, private in [('journeys', False), ('private-fixture', True)]:
        response = session.get(BASE + '/api/v1/repos/qaowner/' + name, timeout=15)
        if response.status_code == 404:
            response = session.post(BASE + '/api/v1/user/repos', json={
                'name': name, 'private': private, 'auto_init': True}, timeout=15)
            assert response.status_code == 201, response.text
        else:
            assert response.status_code == 200, response.text
    issues = BASE + '/api/v1/repos/qaowner/journeys/issues'
    existing = session.get(issues, params={'state': 'all'}, timeout=15).json()
    if not any(issue['title'] == 'Seed issue' for issue in existing):
        assert session.post(issues, json={'title': 'Seed issue', 'body': 'Synthetic local QA data'}, timeout=15).status_code == 201
    spec = requests.get(BASE + '/swagger.v1.json', timeout=15)
    spec.raise_for_status()
    (ROOT / 'reports').mkdir(exist_ok=True)
    (ROOT / 'reports/swagger.v1.json').write_text(json.dumps(spec.json(), indent=2), encoding='utf-8')
    version = requests.get(BASE + '/api/v1/version', timeout=15).json()
    inspect = subprocess.run(['docker', 'image', 'inspect', 'docker.gitea.com/gitea:28.2.0',
                              '--format', '{{json .RepoDigests}}'], check=True, capture_output=True, text=True)
    (ROOT / 'reports/environment.json').write_text(json.dumps({
        'version': version, 'image_digests': json.loads(inspect.stdout), 'base_url': BASE}, indent=2), encoding='utf-8')
    print('Gitea fixtures ready:', version)


if __name__ == '__main__':
    main()
