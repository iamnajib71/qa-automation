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
    manual = {}
    manual_file = ROOT / 'manual-results.csv'
    if manual_file.exists():
        with manual_file.open(encoding='utf-8', newline='') as stream:
            manual = {row['ID']: row for row in csv.DictReader(stream)}
    output = ROOT / 'evidence'
    output.mkdir(exist_ok=True)
    with (output / 'traceability.csv').open('w', newline='', encoding='utf-8') as stream:
        writer = csv.writer(stream)
        writer.writerow(['requirement_or_journey', 'test_case', 'automated_test', 'result', 'evidence', 'manual_result', 'manual_evidence'])
        for row in mapping:
            manual_result = manual.get(row['case'], {})
            manual_columns = [manual_result.get('result', 'not run'), manual_result.get('evidence', '')]
            matches = [r for r in results if row['automated_test'] and row['automated_test'] in r['test']]
            if matches:
                for match in matches:
                    writer.writerow([row['journey'], row['case'], match['test'], match['status'], match['report']] + manual_columns)
            else:
                writer.writerow([row['journey'], row['case'], row['automated_test'], 'not run', ''] + manual_columns)
    summary = {'source': 'JUnit files in real-world/gitea/reports', 'junit_files': len(list((ROOT / 'reports').glob('*.xml'))),
               'reported_testcases': len(results),
               'automated_executions': sum(r['status'] != 'skipped' for r in results),
               'passed': sum(r['status'] == 'passed' for r in results),
               'failed': sum(r['status'] == 'failed' for r in results),
               'skipped': sum(r['status'] == 'skipped' for r in results)}
    summary['manual'] = {'authored': len(manual), 'completed_passed': sum(r['result'] == 'passed' for r in manual.values()),
                         'partial_or_inconclusive': sum(r['result'] in ['partial', 'inconclusive'] for r in manual.values()),
                         'not_run': sum(r['result'] == 'not run' for r in manual.values())}
    (output / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
