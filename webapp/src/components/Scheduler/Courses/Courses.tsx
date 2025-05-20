import React from 'react';
import { CourseLookup } from './CourseLookup';
import { CoursesProps } from './types';
import { Button, Col, Row } from 'react-bootstrap';
import './courses.css';
import { Term } from './Term';
import { useScheduleBuilderStore, TermData } from '@stores/ScheduleBuilderStore';
import { Term as TermModel } from '@models/Term';
import { useTranslation } from 'react-i18next';

export const Courses: React.FC<CoursesProps> = (props: CoursesProps) => {
  const { t } = useTranslation(['scheduler', 'common', 'schools']);
  const { showSimplePopover, moveToSchedulesTab, setCourseIsLoading, courseIsLoading } = props;

  const { coursesByTerm, termList } = useScheduleBuilderStore();

  return (
    <>
      <small className="text-dark-50 mb-2 d-block">
        {t('common:school')}: {t('schools:uottawa', { context: 'with_country' })}
      </small>

      <CourseLookup
        setCourseIsLoading={setCourseIsLoading}
        courseIsLoading={courseIsLoading}
        showSimplePopover={showSimplePopover}
      />

      <Row className="mt-3 mb-3">
        <Col id="course_lists">
          {Object.values(coursesByTerm)
            .sort((a: TermData, b: TermData) => {
              return TermModel.compareByDate(termList[a.termId], termList[b.termId]);
            })
            .map((termData: TermData) => {
              return (
                <Term
                  courses={termData.courses}
                  term={termList[termData.termId]}
                  key={`term-${termData.termId}`}
                />
              );
            })}
        </Col>
      </Row>

      {Object.values(coursesByTerm).length > 0 && (
        <Button
          id="courses-go_to_schedules"
          variant={'primary'}
          onClick={moveToSchedulesTab}
          disabled={courseIsLoading}
        >
          {t('scheduler:go_to_schedules')}
        </Button>
      )}
    </>
  );
};
