import { DefectsPage } from '../pages/DefectsPage';
describe('CY-02 defect creation and persistence',()=>{
  let id; afterEach(()=>{ if(id) cy.request('DELETE',`/api/defects/${id}`); });
  it('creates a fixture defect and reloads it',()=>{ const page=new DefectsPage();
    cy.fixture('defect').then(defect=>{defect.title+=` create ${Date.now()}`;page.visit();page.fill(defect);cy.intercept('POST','/api/defects').as('create');page.create();
      cy.wait('@create').then(({response})=>{expect(response.statusCode).to.eq(201);id=response.body.defect.id;});page.card(defect.title).should('be.visible');cy.reload();page.card(defect.title).should('contain','Severity: high');
    });
  });
});
