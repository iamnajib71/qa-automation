import { ScannerPage } from '../pages/ScannerPage';
describe('CY-06 browser scanner',()=>{it('scans this portal and restores saved results',()=>{
  const page=new ScannerPage();page.visit();page.enter(Cypress.config('baseUrl'));cy.intercept('POST','/api/smoke-test').as('scan');page.run();
  cy.wait('@scan',{responseTimeout:90000}).then(({response})=>{expect(response.statusCode).to.eq(200);expect(response.body.pageScan.metrics.browserFallbackReason).to.equal(undefined);});
  cy.contains('HTTP status').should('be.visible');cy.contains('Full-page screenshot').should('be.visible');cy.reload();cy.contains('button','Website QA').first().click();cy.contains('HTTP status').should('be.visible');
});});
