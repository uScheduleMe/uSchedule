export const subjectCodeIsValid: RegExp = new RegExp(/^[A-Z]{3,4}$/);

export const courseCodeIsValid: RegExp = new RegExp(/^[0-9]{4,5}[A-Za-z]{0,1}$/);

export const illegalSubjectCodeCharacter: RegExp = new RegExp(/[^A-Z]/g);

export const illegalCourseCodeCharacter: RegExp = new RegExp(/[^0-9A-Z]/g);
