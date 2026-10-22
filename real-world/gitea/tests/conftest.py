import os
from pathlib import Path
import pytest
import requests
from selenium import webdriver

BASE = os.getenv('GITEA_URL', 'http://127.0.0.1:43210')
USER = 'qaowner'
# Public, disposable local fixture credentials; never use on a shared deployment.
PASSWORD = 'Local-QA-Only-482!'


@pytest.fixture(scope='session')
def api():
    session = requests.Session()
    session.auth = (USER, PASSWORD)
    session.base = BASE + '/api/v1'
    yield session
    session.close()


@pytest.fixture(params=['chrome', 'firefox'])
def driver(request):
    if request.param == 'chrome':
        options = webdriver.ChromeOptions()
        options.add_argument('--headless=new')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1440,1000')
        browser = webdriver.Chrome(options=options)
    else:
        options = webdriver.FirefoxOptions()
        options.add_argument('-headless')
        browser = webdriver.Firefox(options=options)
        browser.set_window_size(1440, 1000)
    request.node.browser = browser
    yield browser
    browser.quit()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.failed and hasattr(item, 'browser'):
        import allure
        folder = Path('reports/screenshots')
        folder.mkdir(parents=True, exist_ok=True)
        name = item.nodeid.replace('/', '_').replace('::', '_').replace(':', '_')
        png = item.browser.get_screenshot_as_png()
        (folder / (name + '.png')).write_bytes(png)
        allure.attach(png, name='Failure screenshot', attachment_type=allure.attachment_type.PNG)
