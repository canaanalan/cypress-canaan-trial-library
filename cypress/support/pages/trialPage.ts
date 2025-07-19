interface TrialPageInterface {
  visit(queryParams?: Record<string, string | number>): void
  interceptTrials(alias?: string, fixture?: string | object | null, statusCode?: number): void
  waitForTrials(alias?: string): void
  getTrialCards(): Cypress.Chainable<JQuery<HTMLElement>>
  enterZip(zip: string): void
  changeRadius(radiusLabel: string): void
  expectErrorMessage(message: string): void
  expectNoTrialsMessage(message: string): void
  selectRadiusOption(value: string): void
  validateZipCode400(): void
}

export class TrialPage implements TrialPageInterface {
  visit(): void {
    cy.log('**visit**')
    cy.visit('/') 
  }

  interceptTrials(alias?: string, fixture?: string | object | null, statusCode?: number): void {
    cy.log('**interceptTrials**')
    const aliasName = alias || 'fetchTrials'
    const status = statusCode || 200
    
    if (fixture) {
      if (typeof fixture === 'string') {
        cy.fixture(fixture).then((body: any) => {
          cy.intercept('GET', '**/trial-search*', { statusCode: status, body }).as(aliasName)
        })
      } else {
        cy.intercept('GET', '**/trial-search*', { statusCode: status, body: fixture }).as(aliasName)
      }
    } else {
      cy.intercept('GET', '**/trial-search*').as(aliasName)
    }
  }

  waitForTrials(alias?: string): void {
    cy.log('**waitForTrials**')
    const aliasName = alias || 'fetchTrials'
    cy.wait(`@${aliasName}`).then((interception) => {
      // Validate successful response (2xx status codes)
      expect(interception?.response?.statusCode).to.be.within(200, 299)
      expect(interception?.response?.body).to.be.an('array')
      expect(interception?.response?.body[0]).to.have.property('tl_sponsored_trial_uuid')
    })
  }

  getTrialCards(): Cypress.Chainable<JQuery<HTMLElement>> {
    cy.log('**getTrialCards**')
    return cy.get('.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation4')
  }

  enterZip(zip: string): void {
    cy.log('**enterZip**')
    cy.get('input[name="zip5_code"]').clear().type(zip)
  }

  selectRadiusOption(value: string): void {
    cy.log('**selectRadiusOption**')
    // Click to open the dropdown
    cy.get('input[name="radius_in_miles"]')
      .scrollIntoView()
      .click({force: true})
    
    // Select the option by data-value attribute
    cy.get(`[data-value="${value}"]`).click()
  }

  validateZipCode400(): void {
    cy.log('**validateZipCode400**')
    cy.intercept('GET', '**/mvp/validate-zip*').as('validateZip')

    this.enterZip('00000') // Example of an invalid zip code
   
    cy.wait('@validateZip').its('response.statusCode').should('eq', 400)
  }

  changeRadius(radiusLabel: string): void {
    cy.log('**changeRadius**')
    cy.get('select[name="radius"]').select(radiusLabel)
  }

  expectErrorMessage(message: string): void {
    cy.log('**expectErrorMessage**')
    cy.get('.MuiFormHelperText-root.Mui-error').contains(message).should('be.visible')
  }

  expectNoTrialsMessage(message: string): void {
    cy.log('**expectNoTrialsMessage**')
    cy.get('.MuiPaper-root .MuiTypography-root').contains(message).should('be.visible')
  }
}

export const trialPage = new TrialPage()