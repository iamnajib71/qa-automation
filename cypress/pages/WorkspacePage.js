export class WorkspacePage {
  visit() { cy.visit('/'); }
  open() { cy.get('main').contains('a','Open demo workspace').click(); }
  navigate(label) { cy.get('nav').contains('a',label).click(); }
}
