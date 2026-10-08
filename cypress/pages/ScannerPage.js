export class ScannerPage {
  visit() { cy.visit('/smoke-test'); }
  enter(url) { cy.get('#websiteUrl').clear().type(url); }
  run() { cy.contains('button','Run smoke test').click(); }
}
