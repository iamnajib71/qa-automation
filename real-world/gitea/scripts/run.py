"""Run all independent suites even when one fails; preserve nonzero exit status."""
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def main():
    os.chdir(ROOT)
    commands = [
        [sys.executable, '-m', 'pytest', 'tests/test_api.py', '--junitxml=reports/api.xml',
         '--html=reports/api.html', '--self-contained-html', '--alluredir=reports/allure-results'],
        [sys.executable, '-m', 'pytest', 'tests/test_selenium.py', '--junitxml=reports/selenium.xml',
         '--html=reports/selenium.html', '--self-contained-html', '--alluredir=reports/allure-results'],
        ['npm.cmd' if os.name == 'nt' else 'npm', 'test'],
    ]
    failures = [subprocess.run(command).returncode for command in commands]
    subprocess.run([sys.executable, 'scripts/results.py'], check=True)
    return int(any(failures))


if __name__ == '__main__':
    sys.exit(main())
