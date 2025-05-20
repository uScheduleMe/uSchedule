import React, { useState } from 'react';
import { CourseDisplay } from './Term.CourseDisplay';
import { ListGroup, Badge, Collapse } from 'react-bootstrap';
import { TermProps } from './types';
import { Course } from '@models/Course';
import { useTranslation } from 'react-i18next';

export const Term: React.FC<TermProps> = (props: TermProps) => {
  const { t } = useTranslation(['terms']);
  const { courses, term } = props;

  const [isDisplayed, setIsDisplayed] = useState<boolean>(true);

  const removingCourse = (): void => {
    if (Object.values(courses).length === 1) {
      setIsDisplayed(false);
    }
  };

  return (
    <ListGroup className="mb-3 course_list" id={`courses-${term.id}`}>
      <Collapse in={isDisplayed} appear>
        <ListGroup.Item
          variant="secondary"
          className="d-flex flex-row justify-content-between align-items-center"
        >
          <strong>{t('terms:term_title', { term })}</strong>
          <Badge pill variant="dark" className="ml-2">
            {courses ? Object.keys(courses).length : '0'}
          </Badge>
        </ListGroup.Item>
      </Collapse>
      {Object.values(courses).map((course: Course) => (
        <CourseDisplay
          course={course}
          term={term.id}
          key={course.id}
          removingCourse={removingCourse}
        />
      ))}
    </ListGroup>
  );
};
