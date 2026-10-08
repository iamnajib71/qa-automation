const fs=require('node:fs');
const { execFileSync }=require('node:child_process');
(async()=>{
 const cases=[['BUG-001','POST','/api/smoke-test','{"websiteUrl":',400],['BUG-002','POST','/api/smoke-test',JSON.stringify({websiteUrl:'http://['}),400],['BUG-003','GET','/projects/00000000-0000-4000-8000-000000000000',undefined,404]];
 const evidence=[];
 for(const [id,method,url,body,expectedStatus] of cases){
  const response=await fetch('http://127.0.0.1:43187'+url,{method,body,headers:body?{'Content-Type':'application/json'}:{}});
  const text=await response.text();
  evidence.push({id,method,url,requestBody:body,status:response.status,body:method==='GET'?{showsMissingProjectAsExisting:text.includes('This workspace exists'),showsNotScanned:text.includes('Project not scanned yet')}:text,expectedStatus,passed:response.status===expectedStatus});
 }
 fs.writeFileSync('docs/results/defects-after.json',JSON.stringify({commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),recordedAt:new Date().toISOString(),evidence},null,2)+'\n');
 console.log(evidence.map(({id,status,passed})=>({id,status,passed})));
 if(evidence.some(e=>!e.passed))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
