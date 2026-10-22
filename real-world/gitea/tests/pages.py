from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class LoginPage:
    def __init__(self, driver, base):
        self.driver, self.base = driver, base
        self.wait = WebDriverWait(driver, 15)

    def open(self):
        self.driver.get(self.base + '/user/login')
        self.wait.until(EC.visibility_of_element_located((By.ID, 'user_name')))
        return self

    def login(self, username, password):
        self.driver.find_element(By.ID, 'user_name').send_keys(username)
        self.driver.find_element(By.ID, 'password').send_keys(password)
        self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'button.ui.primary.button'))).click()

    def error(self):
        return self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '.ui.negative.message'))).text


class RepositoryPage:
    def __init__(self, driver, base):
        self.driver, self.base = driver, base
        self.wait = WebDriverWait(driver, 15)

    def open(self, owner='qaowner', name='journeys'):
        self.driver.get(f'{self.base}/{owner}/{name}')
        self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, f'a.muted[href="/{owner}/{name}"]')))
        return self

    def title(self):
        return self.driver.find_element(By.CSS_SELECTOR, 'a.muted[href="/qaowner/journeys"]').text

    def issues(self):
        self.driver.get(self.base + '/qaowner/journeys/issues')
        return self.wait.until(EC.visibility_of_element_located((By.LINK_TEXT, 'Seed issue'))).text
