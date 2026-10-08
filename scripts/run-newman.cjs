const fs = require('node:fs');
const newman = require('newman');
fs.mkdirSync('reports/newman', { recursive: true });
newman.run({
  collection: require('../tests/api/qa-portal.postman_collection.json'),
  reporters: ['cli','json','htmlextra','junit'],
  reporter: { json: { export: 'reports/newman/results.json' }, htmlextra: { export: 'reports/newman/index.html', browserTitle: 'QA Portal API results' }, junit: { export: 'reports/newman/junit.xml' } },
  envVar: [{ key: 'baseUrl', value: 'http://127.0.0.1:4173' }], timeoutRequest: 90000
}, (error, summary) => { if (error || summary.run.failures.length) process.exitCode = 1; });
