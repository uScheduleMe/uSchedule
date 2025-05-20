export class OptionsTab {
  set24HFormat(set24: boolean): void {
    cy.get(`[name=TimeFormatToggle][value=${set24}]`).parent().click();
  }

  selectMinimizeBefore(time: string): void {
    cy.get('#minimize_before_time').select(time);
  }

  selectMinimizeAfter(time: string): void {
    cy.get('#minimize_after_time').select(time);
  }

  setLunchBreak(start: string, end: string, duration: string): void {
    cy.get('#lunch_is_enabled').check();
    cy.get('#lunch_start').select(start);
    cy.get('#lunch_end').select(end);
    cy.get('#lunch_size').select(duration);
  }

  setEveningBreak(start: string, end: string, duration: string): void {
    cy.get('#evening_is_enabled').check();
    cy.get('#evening_start').select(start);
    cy.get('#evening_end').select(end);
    cy.get('#evening_size').select(duration);
  }

  setShowClosedComponents(enabled: boolean): void {
    cy.get(`[name=ClosedComponentToggle][value=${enabled}]`).parent().click();
  }

  setTimeConflicts(state: 'none' | 'non_lec' | 'all'): void {
    const map = {
      none: 0,
      non_lec: 1,
      all: 2,
    };
    cy.get(`[name=TimeConflictToggle][value=${map[state]}]`).parent().click();
  }
}
