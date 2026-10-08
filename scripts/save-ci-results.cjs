const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve('.verification/ci-artifacts');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const files=[];
function list(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())list(file);else files.push(file);}}
list(root);
const find=(name,fragment)=>{const matches=files.filter(file=>path.basename(file)===name&&file.includes(fragment));if(matches.length!==1)throw new Error(`Expected one ${fragment}/${name}, found ${matches.length}`);return matches[0];};
const unitFile=find('results.json','unit-results');
const newmanFile=find('results.json','newman-reports');
const playwrightFile=find('playwright-results.json','playwright-reports');
const cypressFiles=files.filter(file=>file.includes('cypress-reports')&&file.includes(`${path.sep}raw${path.sep}`)&&file.endsWith('.json'));
const unit=read(unitFile),newman=read(newmanFile),pw=read(playwrightFile),cy=cypressFiles.map(read);
const tests=[];
function walk(suite){for(const spec of suite.specs||[])for(const test of spec.tests)tests.push({title:spec.title,project:test.projectName,status:test.status});for(const child of suite.suites||[])walk(child);}
walk(pw);
const run=read('docs/results/ci-run.json');
const failures=unit.numFailedTests+newman.run.failures.length+pw.stats.unexpected+pw.stats.skipped+pw.stats.flaky+cy.reduce((sum,r)=>sum+r.stats.failures,0);
if(run.conclusion!=='success'||run.jobs.some(job=>job.conclusion!=='success')||failures)throw new Error('CI evidence must show every job and test passed.');
const summary={recordedAt:new Date().toISOString(),url:run.url,headSha:run.headSha,createdAt:run.createdAt,completedAt:run.updatedAt,environment:'GitHub Actions ubuntu-latest / Node 22',totals:{unit:unit.numPassedTests,newmanRequests:newman.run.stats.requests.total,newmanAssertions:newman.run.stats.assertions.total,playwrightAPI:tests.filter(t=>t.project==='api'&&t.status==='expected').length,playwrightE2E:tests.filter(t=>t.project==='e2e'&&t.status==='expected').length,cypress:cy.reduce((sum,r)=>sum+r.stats.passes,0)},failures,jobs:run.jobs.map(job=>({name:job.name,conclusion:job.conclusion,url:job.url})),tests,reportHashes:[unitFile,newmanFile,playwrightFile,...cypressFiles].map(file=>({file:path.relative(root,file).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}))};
fs.writeFileSync('docs/results/ci-summary.json',JSON.stringify(summary,null,2)+'\n');
console.log(summary.totals,summary.url);
