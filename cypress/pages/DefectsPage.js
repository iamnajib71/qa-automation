export class DefectsPage {
  visit() { cy.visit('/defects'); }
  field(name) { return cy.get(`[aria-label="${name}"]`); }
  fill(defect) {
    this.field('Title').clear().type(defect.title);
    this.field('Description').clear().type(defect.description);
    this.field('Severity').select(defect.severity);
    this.field('Priority').select(defect.priority);
    this.field('Status').select(defect.status);
  }
  create() { cy.contains('button','Create defect').click(); }
  card(title) { return cy.contains('[data-testid="defect-card"]',title); }
  edit(title) { this.card(title).contains('button','Edit').click(); }
  save() { cy.contains('button','Save changes').click(); }
  remove(title) { this.card(title).contains('button','Delete').click(); }
}
