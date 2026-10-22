import uuid
import pytest
import requests
import schemathesis
from schemathesis.checks import status_code_conformance, content_type_conformance, response_schema_conformance
from conftest import BASE, USER

pytestmark = pytest.mark.api


@pytest.mark.parametrize('path', ['/version', '/user', '/repos/qaowner/journeys', '/repos/qaowner/journeys/issues'])
def test_contract(api, path):
    schema = schemathesis.from_uri(BASE + '/swagger.v1.json')
    templates = {'/version': '/version', '/user': '/user',
                 '/repos/qaowner/journeys': '/repos/{owner}/{repo}',
                 '/repos/qaowner/journeys/issues': '/repos/{owner}/{repo}/issues'}
    case = schema[templates[path]]['GET'].make_case(
        path_parameters={'owner': USER, 'repo': 'journeys'} if 'repos' in path else {})
    response = api.get(api.base + path, timeout=15)
    assert response.status_code == 200
    # Authentication is exercised separately with independent unauthenticated requests.
    # These checks validate the documented response, without inferring auth from make_case.
    case.validate_response(response, checks=(status_code_conformance, content_type_conformance, response_schema_conformance))


def test_repository_lifecycle(api):
    name = 'api-' + uuid.uuid4().hex[:12]
    created = api.post(api.base + '/user/repos', json={'name': name, 'private': True}, timeout=15)
    assert created.status_code == 201, created.text
    url = api.base + f'/repos/{USER}/{name}'
    try:
        assert api.get(url, timeout=15).json()['private'] is True
        assert requests.get(url, timeout=15).status_code == 404
        changed = api.patch(url, json={'description': 'Updated by QA'}, timeout=15)
        assert changed.status_code == 200
        assert changed.json()['description'] == 'Updated by QA'
    finally:
        assert api.delete(url, timeout=15).status_code == 204
    assert api.get(url, timeout=15).status_code == 404


def test_issue_lifecycle(api):
    url = api.base + '/repos/qaowner/journeys/issues'
    created = api.post(url, json={'title': 'API lifecycle', 'body': 'Disposable QA fixture'}, timeout=15)
    assert created.status_code == 201
    issue = url + '/' + str(created.json()['number'])
    edited = api.patch(issue, json={'title': 'Updated lifecycle', 'state': 'closed'}, timeout=15)
    assert edited.status_code == 201
    saved = api.get(issue, timeout=15).json()
    assert saved['title'] == 'Updated lifecycle' and saved['state'] == 'closed'


@pytest.mark.parametrize('headers', [{}, {'Authorization': 'token invalid-token'}])
def test_auth_required(headers):
    assert requests.get(BASE + '/api/v1/user', headers=headers, timeout=15).status_code == 401


@pytest.mark.parametrize('body', [{'name': ''}, {'name': '../escape'}, {'name': 'two words'}])
def test_invalid_repository(api, body):
    response = api.post(api.base + '/user/repos', json=body, timeout=15)
    assert response.status_code == 422, response.text


def test_missing_repository(api):
    assert api.get(api.base + '/repos/qaowner/does-not-exist', timeout=15).status_code == 404


def test_duplicate_repository(api):
    assert api.post(api.base + '/user/repos', json={'name': 'journeys'}, timeout=15).status_code == 409


def test_malformed_json(api):
    response = api.post(api.base + '/user/repos', data='{', headers={'Content-Type': 'application/json'}, timeout=15)
    assert response.status_code == 422
