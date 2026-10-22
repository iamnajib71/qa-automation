import pytest
from selenium.webdriver.support.ui import WebDriverWait
from pages import LoginPage, RepositoryPage
from conftest import BASE, USER, PASSWORD

pytestmark = pytest.mark.selenium


def test_login(driver):
    page = LoginPage(driver, BASE).open()
    page.login(USER, PASSWORD)
    WebDriverWait(driver, 15).until(lambda d: '/user/login' not in d.current_url)
    assert 'Dashboard' in driver.title or USER in driver.page_source


def test_invalid_login(driver):
    page = LoginPage(driver, BASE).open()
    page.login(USER, 'wrong-password')
    assert 'incorrect' in page.error().lower()
    assert '/user/login' in driver.current_url


def test_public_repository(driver):
    page = RepositoryPage(driver, BASE).open()
    assert 'journeys' in page.title()


def test_issue_visible(driver):
    page = RepositoryPage(driver, BASE).open()
    assert 'Seed issue' in page.issues()
