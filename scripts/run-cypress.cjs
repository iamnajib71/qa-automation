const cypress=require('cypress');
const fs=require('node:fs');
const path=require('node:path');
const { merge }=require('mochawesome-merge');
const { create }=require('mochawesome-report-generator');
(async()=>{
 const root=process.cwd();
 const reportDir=path.resolve(root,'reports','cypress');
 if(!reportDir.startsWith(root+path.sep))throw new Error('Report directory must stay in the workspace.');
 fs.rmSync(reportDir,{recursive:true,force:true});
 let failed=true;
 try { const results=await cypress.run({browser:'electron'});failed=results.status==='failed'||results.totalFailed>0; }
 finally {
  const report=await merge({files:['reports/cypress/raw/*.json']});
  await create(report,{reportDir:'reports/cypress',reportFilename:'index',inline:true});
 }
 if(failed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
