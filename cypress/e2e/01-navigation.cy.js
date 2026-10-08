import { WorkspacePage } from '../pages/WorkspacePage';
describe('CY-01 workspace navigation',()=>{ it('opens the workspace and main journeys',()=>{
  const page=new WorkspacePage(); page.visit(); page.open(); cy.location('pathname').should('eq','/dashboard');
  page.navigate('Defects'); cy.contains('h2','Saved defects').should('be.visible');
  page.navigate('Projects'); cy.location('pathname').should('eq','/projects');
}); });
