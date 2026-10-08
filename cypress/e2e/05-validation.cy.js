import { DefectsPage } from '../pages/DefectsPage';
import { ScannerPage } from '../pages/ScannerPage';
describe('CY-05 user validation',()=>{it('shows actionable messages for invalid input',()=>{
  const defects=new DefectsPage();defects.visit();defects.create();cy.get('[role="alert"]').should('contain','Enter a title');
  const scanner=new ScannerPage();scanner.visit();scanner.enter('http://[');scanner.run();cy.contains('valid HTTP').should('be.visible');
});});
