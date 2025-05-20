export enum Terms {
  winter = 'winter',
  fall = 'fall',
  summer = 'summer',
}

export class CoursesPage {
  addNewCourse(year: number, term: string, subject: string, course_number: string): void {
    cy.get('#select_term').select(`${year}-${term}`);
    cy.get('#subject_code').clear().type(subject);
    cy.get('#course_code').clear().type(course_number);
    cy.get('#add_course').click();
  }

  toggleCourseDisplay(year: number, term: string, subject: string, course_number: string): void {
    cy.dataCy(`clk:course-display-${year}-${term}-${subject}${course_number}`).click();
  }

  toggleSection(
    year: number,
    term: string,
    subject: string,
    course_number: string,
    section_id: string,
  ): void {
    cy.dataCy(`clk:section-check-${year}-${term}-${subject}${course_number}-${section_id}`).click();
  }
}
