import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  vus: 2, duration: '20s',
  thresholds: { http_req_duration: ['p(95)<500'], http_req_failed: ['rate<0.01'], checks: ['rate==1'] }
};
const base = __ENV.BASE_URL || 'http://127.0.0.1:4173';
export default function () {
  for (const endpoint of ['/api/defects','/api/smoke-test?limit=2']) {
    const response = http.get(base+endpoint);
    check(response, { 'HTTP 200': r=>r.status===200, 'JSON response': r=>r.headers['Content-Type'].includes('application/json') });
  }
  sleep(1);
}
