const fs = require('node:fs');
(async () => {
 const cases = [
 ['BUG-001','POST','/api/smoke-test','{"websiteUrl":'],
 ['BUG-002','POST','/api/smoke-test',JSON.stringify({websiteUrl:'http://['})],
 ['BUG-003','GET','/projects/00000000-0000-4000-8000-000000000000']
 ];
 const evidence=[];
 for (const [id,method,url,body] of cases) {
  const response=await fetch('http://127.0.0.1:4173'+url,{method,body,headers:body?{'Content-Type':'application/json'}:{}});
  const text=await response.text();
  evidence.push({id,method,url,requestBody:body,status:response.status,body: method==='GET' ? {showsMissingProjectAsExisting:text.includes('This workspace exists'),showsNotScanned:text.includes('Project not scanned yet')} : text,expectedStatus:method==='GET'?404:400});
 }
 fs.writeFileSync('docs/results/defects-before.json',JSON.stringify({commit:'5f1610f',recordedAt:new Date().toISOString(),evidence},null,2));
 console.log(evidence);
})();

