import { DefectsPage } from '../pages/DefectsPage';
describe('CY-04 deletion',()=>{
  let id;afterEach(()=>{if(id)cy.request({method:'DELETE',url:`/api/defects/${id}`,failOnStatusCode:false});});
  it('removes a record in UI and API',()=>{const page=new DefectsPage();cy.fixture('defect').then(defect=>{defect.title+=` delete ${Date.now()}`;
    cy.request('POST','/api/defects',defect).then(({body})=>{id=body.defect.id;});page.visit();page.remove(defect.title);page.card(defect.title).should('not.exist');
    cy.then(()=>cy.request({url:`/api/defects/${id}`,failOnStatusCode:false})).its('status').should('eq',404);
  });});
});
