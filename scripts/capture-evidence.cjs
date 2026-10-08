const { chromium } = require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const { pathToFileURL }=require('node:url');
(async()=>{
 fs.mkdirSync('docs/img',{recursive:true});
 const browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:4173');await page.screenshot({path:'docs/img/portal.png',fullPage:true});
 await page.goto('http://127.0.0.1:4173/defects');await page.getByRole('heading',{name:'Saved defects'}).waitFor();await page.screenshot({path:'docs/img/defects.png',fullPage:true});
 await page.goto('http://127.0.0.1:4173/smoke-test');
 await page.getByRole('button').filter({hasText:'Website QA'}).first().click();
 await page.getByText('Full-page screenshot',{exact:true}).waitFor();await page.screenshot({path:'docs/img/scanner.png',fullPage:true});
 for(const [name,file] of [['playwright-report','reports/playwright/index.html'],['cypress-report','reports/cypress/index.html'],['newman-report','reports/newman/index.html']]){
  await page.goto(pathToFileURL(path.resolve(file)).href);await page.waitForTimeout(2000);await page.screenshot({path:`docs/img/${name}.png`,fullPage:false});
 }
 await page.setViewportSize({width:1280,height:640});
 await page.setContent(`<html><head><style>body{margin:0;background:#0b1526;color:#f8fafc;font-family:Segoe UI,Arial;padding:64px;box-sizing:border-box;width:1280px;height:640px}.eyebrow{color:#fde68a;letter-spacing:4px;font-size:22px}h1{font-size:72px;letter-spacing:-3px;margin:30px 0 20px;line-height:1.05}.sub{color:#cbd5e1;font-size:26px}.tags{display:flex;gap:16px;margin-top:40px}.tag{border:1px solid #53617a;border-radius:12px;padding:12px 20px;font-size:22px}.author{margin-top:42px;font-size:20px;color:#a8b9d2}</style></head><body><div class="eyebrow">TEST AUTOMATION FRAMEWORK</div><h1>A real app.<br>Evidence you can inspect.</h1><div class="sub">Functional · Regression · API · End-to-end · Accessibility</div><div class="tags"><span class="tag">Playwright</span><span class="tag">Cypress</span><span class="tag">Newman</span><span class="tag">Vitest</span><span class="tag">k6</span></div><div class="author">Built by Nazmul Hassan · github.com/iamnajib71/qa-automation</div></body></html>`);
 await page.screenshot({path:'docs/social-preview.png'});
 await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
