import { trialPage } from '../support/pages/trialPage'
import { faker } from '@faker-js/faker'

// Test data constants
const TEST_DATA = {
  zipCodes: {
    valid: '90210',
    invalid: '00000'
  },
  radius: '250',
  messages: {
    invalidZip: 'Invalid zip code',
    noTrials: 'No trial opportunities'
  }
} as const

// Utility functions
const setupTrialInterception = (alias = 'fetchTrials') => {
  trialPage.interceptTrials(alias)
}

const visitAndWaitForTrials = () => {
  trialPage.visit()
  trialPage.waitForTrials()
}

const assertTrialsExist = () => {
  trialPage.getTrialCards().should('have.length.greaterThan', 0)
}

describe('Sponsored Trial Opportunities Page', () => {
  beforeEach(() => {
    trialPage.visit()
  })

  context('Initial Page Load', () => {
    it('should load trials on initial visit', () => {
      setupTrialInterception()
      visitAndWaitForTrials()
      assertTrialsExist()
    })
  })

  context('Search Functionality', () => {
    it.skip('should update trials when radius changes', () => {
      setupTrialInterception()
      trialPage.selectRadiusOption(TEST_DATA.radius)
      trialPage.waitForTrials()
      assertTrialsExist()
    })

    it('should update trials when valid zip code is entered', () => {
      setupTrialInterception()
      trialPage.enterZip(TEST_DATA.zipCodes.valid)
      trialPage.waitForTrials()
      assertTrialsExist()
    })

    it('should show error message for invalid zip code', () => {
      trialPage.validateZipCode400()
      trialPage.expectErrorMessage(TEST_DATA.messages.invalidZip)
    })
  })

  context('Empty States', () => {
    it('should show no trials message when no results are returned', () => {
      trialPage.interceptTrials('emptyResults', 'empty-results')
      cy.visit('/')
      trialPage.expectNoTrialsMessage(TEST_DATA.messages.noTrials)
    })
  })

  // Data-driven test example
  context('Zip Code Validation', () => {
    const zipCodeTestCases = [
      { zipCode: TEST_DATA.zipCodes.valid, shouldPass: true },
      { zipCode: TEST_DATA.zipCodes.invalid, shouldPass: false },
      { zipCode: faker.location.zipCode('#####'), shouldPass: true, description: 'random valid zip' }
    ]

    zipCodeTestCases.forEach(({ zipCode, shouldPass, description }) => {
      it.skip(`should ${shouldPass ? 'accept' : 'reject'} zip code: ${zipCode}${description ? ` (${description})` : ''}`, () => {
        if (shouldPass) {
          setupTrialInterception()
          trialPage.enterZip(zipCode)
          trialPage.waitForTrials()
          assertTrialsExist()
        } else {
          trialPage.validateZipCode400()
          trialPage.expectErrorMessage(TEST_DATA.messages.invalidZip)
        }
      })
    })
  })
})