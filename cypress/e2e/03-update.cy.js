import { DefectsPage } from '../pages/DefectsPage';
describe('CY-03 defect retest and closure',()=>{
  let id; afterEach(()=>{if(id)cy.request('DELETE',`/api/defects/${id}`);});
  it('updates a real record through retest and closed',()=>{const page=new DefectsPage();cy.fixture('defect').then(defect=>{
    defect.title+=` update ${Date.now()}`;cy.request('POST','/api/defects',defect).then(({body})=>{id=body.defect.id;});page.visit();
    ['retest','closed'].forEach(status=>{page.edit(defect.title);page.field('Status').select(status);page.save();page.card(defect.title).find('[data-testid="defect-status"]').should('have.text',status);});
  });});
});
