const { merge } = require('mochawesome-merge');
const { create } = require('mochawesome-report-generator');
merge({ files: ['reports/cypress/raw/*.json'] }).then(report => create(report, { reportDir: 'reports/cypress', reportFilename: 'index', inline: true })).catch(error => { console.error(error); process.exitCode = 1; });
