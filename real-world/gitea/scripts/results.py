"""Generate traceability from actual JUnit reports, never from planned counts."""
import csv
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def main():
    results = []
    for report in sorted((ROOT / 'reports').glob('*.xml')):
        for case in ET.parse(report).iter('testcase'):
            status = ('failed' if case.find('failure') is not None or case.find('error') is not None
                      else 'skipped' if case.find('skipped') is not None else 'passed')
            results.append({'test': case.get('name', ''), 'status': status,
                            'report': str(report.relative_to(ROOT)).replace('\\', '/')})
    mapping = json.loads((ROOT / 'traceability-map.json').read_text(encoding='utf-8'))
    output = ROOT / 'evidence'
    output.mkdir(exist_ok=True)
    with (output / 'traceability.csv').open('w', newline='', encoding='utf-8') as stream:
        writer = csv.writer(stream)
        writer.writerow(['requirement_or_journey', 'test_case', 'automated_test', 'result', 'evidence'])
        for row in mapping:
            matches = [r for r in results if row['automated_test'] and row['automated_test'] in r['test']]
            if matches:
                for match in matches:
                    writer.writerow([row['journey'], row['case'], match['test'], match['status'], match['report']])
            else:
                writer.writerow([row['journey'], row['case'], row['automated_test'], 'not run', ''])
    summary = {'source': 'JUnit files in real-world/gitea/reports', 'junit_files': len(list((ROOT / 'reports').glob('*.xml'))),
               'reported_testcases': len(results),
               'automated_executions': sum(r['status'] != 'skipped' for r in results),
               'passed': sum(r['status'] == 'passed' for r in results),
               'failed': sum(r['status'] == 'failed' for r in results),
               'skipped': sum(r['status'] == 'skipped' for r in results)}
    (output / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
