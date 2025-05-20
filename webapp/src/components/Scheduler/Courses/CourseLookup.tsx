import React, { useState, useRef, useEffect } from 'react';
import { Form, Col, Button, Spinner } from 'react-bootstrap';
import { AddCourseEventTypes, CourseLookupProps } from './types';
import { SchedulerService } from '@services/Scheduler/Scheduler';
import { useScheduleBuilderStore, TermData, TermListMapping } from '@stores/ScheduleBuilderStore';
import { Term } from '@models/Term';
import { toast } from 'react-toastify';
import { Course } from '@models/Course';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import {
  illegalSubjectCodeCharacter,
  illegalCourseCodeCharacter,
  subjectCodeIsValid,
  courseCodeIsValid,
} from './constants';
import { useTranslation } from 'react-i18next';
import { useService } from '@hooks/useService';
import axios from 'axios';
import { responseSchema } from '@services/constants';
import { useEnvironmentStore } from '@stores/EnvironmentStore';

const formatSubjectCodeValue = (value: string): string => {
  const characterLimit: number = 4;
  return value.toUpperCase().replace(illegalSubjectCodeCharacter, '').substr(0, characterLimit);
};

const formatCourseCodeValue = (value: string): string => {
  const characterLimit: number = 5;
  return value.toUpperCase().replace(illegalCourseCodeCharacter, '').substr(0, characterLimit);
};

const courseIsInCoursesList = (
  subject_code: string,
  course_code: string,
  termData: TermData | undefined,
): boolean => {
  return (
    termData !== undefined &&
    Object.values(termData.courses).some(
      (course: Course) =>
        course.subject_code === subject_code && course.course_code === course_code,
    )
  );
};

/**
 * Select the current term from the given list.  If the current term is
 * not in the list, return the first term in the list.
 * @param terms a list of terms
 * @return the current term or the first term in the list
 */
const getCurrentTerm = (termMapping: TermListMapping): Term | null => {
  const terms = Term.mappingToTermList(termMapping);
  if (terms.length) {
    return terms.find((term: Term): boolean => term.isCurrent()) ?? terms[0];
  }
  return null;
};

export const CourseLookup: React.FC<CourseLookupProps> = (props: CourseLookupProps) => {
  const { t } = useTranslation(['scheduler', 'common', 'terms']);
  const { courseIsLoading, setCourseIsLoading, showSimplePopover } = props;
  const schedulerService = useService(SchedulerService);
  const { eventTracker } = useEnvironmentStore();

  const { termList, coursesByTerm, addCourseData } = useScheduleBuilderStore();

  const [course_code, setCourseCode] = useState<string>('');
  const [subject_code, setSubjectCode] = useState<string>('');
  const [term, setTerm] = useState<Term | null>(getCurrentTerm(termList));

  useEffect(() => {
    setTerm(getCurrentTerm(termList));
  }, [termList]);

  const subjectCodeRef = useRef<HTMLInputElement>(null);
  const courseCodeRef = useRef<HTMLInputElement>(null);

  const addCourse = async (event: AddCourseEventTypes): Promise<void> => {
    if (courseIsLoading || term === null) {
      return;
    }

    if (!subjectCodeIsValid.test(subject_code)) {
      showSimplePopover(t('scheduler:error.valid_subject'), subjectCodeRef);
      return;
    }

    if (!courseCodeIsValid.test(course_code)) {
      showSimplePopover(t('scheduler:error.valid_course_code'), courseCodeRef);
      return;
    }

    if (courseIsInCoursesList(subject_code, course_code, coursesByTerm[term.id])) {
      showSimplePopover(
        t('scheduler:course_already_listed', { subject_code, course_code }),
        event.target,
      );
      return;
    }

    const maxNumCoursesPerTerm: number = 10;
    if (
      coursesByTerm[term.id] &&
      Object.values(coursesByTerm[term.id].courses).length === maxNumCoursesPerTerm
    ) {
      showSimplePopover(
        t('scheduler:error.term_is_full', {
          term,
          count: maxNumCoursesPerTerm,
        }),
        event.target,
      );
      return;
    }

    setCourseIsLoading(true);

    try {
      const start_time = Date.now();
      const newCourse = await schedulerService.lookUpCourse({
        school: 'uottawa',
        course_code,
        subject_code,
        season: term.season,
        year: term.year,
      });
      addCourseData(newCourse, term.id);
      const load_time = Date.now() - start_time;
      eventTracker.addCourse(newCourse, load_time);
    } catch (e: unknown) {
      let message: string | undefined;
      if (axios.isAxiosError(e)) {
        const parsed = responseSchema.safeParse(e.response?.data);
        if (parsed.success) {
          message = parsed.data.messages?.[0]?.message;
        }
      }
      if (message) {
        toast.error(message);
      } else {
        toast.error(t('common:error.fetch_data'));
      }
    }

    setCourseIsLoading(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    // Key Values: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
    if (event.key === 'Enter') {
      addCourse(event);
    }
  };

  const updateSubjectCode = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSubjectCode(formatSubjectCodeValue(event.target.value));
  };

  const updateCourseCode = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCourseCode(formatCourseCodeValue(event.target.value));
  };

  const updateTerm = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTerm(termList[event.target.value]);
  };

  return (
    <Form.Row>
      <Form.Group as={Col} md={4} lg={4}>
        <Form.Label htmlFor="select_term">{t('common:term')}</Form.Label>
        <Form.Control as="select" id="select_term" value={term?.id} onChange={updateTerm} custom>
          {Term.mappingToTermList(termList).map((term: Term) => {
            return (
              <option key={term.id} value={term.id}>
                {t('terms:term_title', { term })}
              </option>
            );
          })}
        </Form.Control>
      </Form.Group>
      <Form.Group as={Col} xs={12} sm={3} md={2}>
        <Form.Label htmlFor="subject_code">{t('common:subject')}</Form.Label>
        <Form.Control
          ref={subjectCodeRef}
          placeholder="ADM"
          id="subject_code"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          value={subject_code}
          onChange={updateSubjectCode}
          onKeyPress={handleKeyPress}
        />
      </Form.Group>
      <Form.Group as={Col} xs={12} sm={4} md={2}>
        <Form.Label htmlFor="course_code">{t('common:course')}</Form.Label>
        <Form.Control
          ref={courseCodeRef}
          placeholder="1100"
          id="course_code"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          value={course_code}
          onChange={updateCourseCode}
          onKeyPress={handleKeyPress}
        />
      </Form.Group>
      <Form.Group as={Col} xs={12} sm={5} md={4} lg={3} className="align-self-end">
        <Button variant="success" id="add_course" onClick={addCourse} disabled={courseIsLoading}>
          {courseIsLoading ? (
            <Spinner animation="border" size="sm" className="mr-2" role="status" />
          ) : (
            <Icon icon={faPlus} className="mr-2" />
          )}
          {t('scheduler:add_course')}
        </Button>
      </Form.Group>
    </Form.Row>
  );
};
