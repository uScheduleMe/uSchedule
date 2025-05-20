import { CoursesPage, Terms } from '../helpers/courses';
import { OptionsTab } from '../helpers/options';

describe('Schedule generator', () => {
  let coursesTab: CoursesPage;
  let optsTab: OptionsTab;

  before(() => {
    coursesTab = new CoursesPage();
    optsTab = new OptionsTab();
  });

  describe('Happy Path', () => {
    it('should select courses and generate schedules, adjust options and generate schedules, limit sections and generate schedules, and flip through schedules', () => {
      cy.visit('');

      // Part 1 - select courses and generate schedules
      const expectedTotal = 304;
      const testYear = 2020;
      cy.get('#schedule-builder-tab-courses').click();
      coursesTab.addNewCourse(testYear, Terms.winter, 'MAT', '1341');
      coursesTab.addNewCourse(testYear, Terms.winter, 'CSI', '2120');
      coursesTab.addNewCourse(testYear, Terms.winter, 'MAT', '1322');

      cy.get('#schedule-builder-tab-schedule').click();
      cy.dataCy('val:course-count').contains(expectedTotal);

      // Part 2 - adjust options and generate schedules
      cy.get('#schedule-builder-tab-options').click();
      optsTab.set24HFormat(true);
      optsTab.selectMinimizeBefore('11:00');
      optsTab.selectMinimizeAfter('17:30');

      optsTab.setLunchBreak('12:00', '13:00', '0h 30m');
      optsTab.setEveningBreak('20:00', '21:00', '0h 30m');

      optsTab.setShowClosedComponents(true);
      optsTab.setTimeConflicts('all');

      const expectedTotal2 = 18;
      cy.get('#schedule-builder-tab-schedule').click();
      cy.dataCy('val:course-count').contains(expectedTotal2);

      // Part 3 - limit sections and generate schedules
      cy.get('#schedule-builder-tab-courses').click();
      coursesTab.toggleCourseDisplay(testYear, Terms.winter, 'MAT', '1322');
      coursesTab.toggleSection(testYear, Terms.winter, 'MAT', '1322', 'A');
      coursesTab.toggleSection(testYear, Terms.winter, 'MAT', '1322', 'B');
      coursesTab.toggleSection(testYear, Terms.winter, 'MAT', '1322', 'C');

      const expectedTotal3 = 6;
      cy.get('#schedule-builder-tab-schedule').click();
      cy.dataCy('val:course-count').contains(expectedTotal3);

      // Part 4 - flip through schedules

      // Test basic controls
      const startingSchedule = 1;
      cy.dataCy('clk:inc-sched').click();
      cy.dataCy('txt:sched-id').should('have.value', startingSchedule + 1);
      cy.dataCy('clk:decr-sched').click();
      cy.dataCy('txt:sched-id').should('have.value', startingSchedule);

      // If we input a ridiculous number it should be allowed
      const moreThanTotalSchedules = 10000;
      cy.dataCy('txt:sched-id').clear().type(moreThanTotalSchedules.toString());
      cy.dataCy('txt:sched-id').should('have.value', moreThanTotalSchedules);

      // Back to a real schedule
      const scheduleID = 3;
      cy.dataCy('txt:sched-id').clear().type(scheduleID.toString());
      cy.dataCy('txt:sched-id').should('have.value', scheduleID);

      // The ID we were on should persist after switching tabs
      cy.get('#schedule-builder-tab-courses').click();
      cy.get('#schedule-builder-tab-schedule').click();
      cy.dataCy('txt:sched-id').should('have.value', scheduleID);

      // Download test
      cy.dataCy('clk:download').click();
      cy.dataCy('clk:download-json').click();
    });
  });

  it('should offer schedules with conflicts if none found', () => {
    cy.visit('');

    const testYear = 2020;
    coursesTab.addNewCourse(testYear, Terms.winter, 'CSI', '2120');
    coursesTab.addNewCourse(testYear, Terms.winter, 'CSI', '3131');
    cy.get('#schedule-builder-tab-schedule').click();
    cy.dataCy('clk:generate-with-conflicts').click();
    const expectedCourses = 3;
    cy.dataCy('val:course-count').contains(expectedCourses);
    cy.dataCy('val:schedule-uses-different-filters').should('be.visible');
    cy.get('#schedule-builder-tab-courses').click();
    cy.get('#schedule-builder-tab-schedule').click();
    cy.dataCy('val:schedule-uses-different-filters').should('be.visible');
  });
});
