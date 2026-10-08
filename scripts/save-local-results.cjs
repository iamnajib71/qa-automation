const fs=require('node:fs');
const crypto=require('node:crypto');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const save=(file,data)=>fs.writeFileSync(`docs/results/${file}`,JSON.stringify(data,null,2)+'\n');
const unit=read('reports/unit/results.json');
const newman=read('reports/newman/results.json');
const playwright=read('reports/playwright-results.json');
const cypressFiles=fs.readdirSync('reports/cypress/raw').filter(file=>file.endsWith('.json'));
const cypress=cypressFiles.map(file=>read('reports/cypress/raw/'+file));
const browserTests=[];
function walk(suite,prefix=[]){
  for(const spec of suite.specs||[])for(const test of spec.tests)browserTests.push({title:[...prefix,spec.title].join(' / '),project:test.projectName,status:test.status,results:test.results.map(r=>({status:r.status,duration:r.duration}))});
  for(const child of suite.suites||[])walk(child,[...prefix,child.title]);
}
walk(playwright);
const recordedAt=new Date().toISOString();
save('unit-results.json',unit);
save('newman-summary.json',{recordedAt,stats:newman.run.stats,failures:newman.run.failures,executions:newman.run.executions.map(e=>({name:e.item.name,status:e.response.code,assertions:e.assertions}))});
save('playwright-summary.json',{recordedAt,stats:playwright.stats,tests:browserTests});
save('cypress-summary.json',{recordedAt,specs:cypress.map(report=>({stats:report.stats,results:report.results}))});
const totals={unit:unit.numPassedTests,newmanRequests:newman.run.stats.requests.total,newmanAssertions:newman.run.stats.assertions.total,playwrightAPI:browserTests.filter(t=>t.project==='api'&&t.status==='expected').length,playwrightE2E:browserTests.filter(t=>t.project==='e2e'&&t.status==='expected').length,cypress:cypress.reduce((sum,r)=>sum+r.stats.passes,0)};
const failures=unit.numFailedTests+newman.run.failures.length+playwright.stats.unexpected+cypress.reduce((sum,r)=>sum+r.stats.failures,0);
save('local-summary.json',{recordedAt,environment:{os:process.platform,node:process.version,baseURL:'http://127.0.0.1:4173',data:'synthetic'},totals,failures,reports:['reports/unit/results.json','reports/newman/results.json','reports/playwright-results.json'].map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}))});
console.log(totals, {failures});
if(failures)process.exitCode=1;
