import React, { useState } from 'react';
import {
  Button,
  ListGroup,
  ToggleButtonGroup,
  ToggleButton,
  Collapse,
  Form,
} from 'react-bootstrap';
import { CourseDisplayProps } from './types';
import { useScheduleBuilderStore } from '@stores/ScheduleBuilderStore';
import { CourseSection } from '@models/CourseSection';
import { CourseSectionComponent } from '@models/CourseSectionComponent';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { TIME_FORMAT_12_HR, TIME_FORMAT_24_HR } from '@components/Scheduler/Schedules/constants';
import Moment from 'react-moment';
import moment from 'moment';

export const CourseDisplay: React.FC<CourseDisplayProps> = (props: CourseDisplayProps) => {
  const { t } = useTranslation(['scheduler', 'common']);
  const { course, term, removingCourse } = props;
  const { course_name, sections, course_code, subject_code } = course;
  const { addCourseData, deleteCourse, settings } = useScheduleBuilderStore();

  const timeFormat = settings.format_time_as_military ? TIME_FORMAT_24_HR : TIME_FORMAT_12_HR;
  const [isDisplayed, setIsDisplayed] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMandatory, setIsMandatory] = useState<boolean>(course.is_mandatory);

  const changeMandatory = (newState: string): void => {
    const newStateBool = newState === 'true';
    setIsMandatory(newStateBool);
    course.is_mandatory = newStateBool;
  };

  const handleRemoveClicked = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation();
    removingCourse();
    setIsExpanded(false);
    setIsDisplayed(false);
  };

  const removeCourse = (): void => deleteCourse(course.id, term);

  const updateSections = (section_id: CourseSection['id']) => (): void => {
    const section = course.sections.get(section_id);
    if (section) {
      section.included = !section.included;
      addCourseData(course, term);
    }
  };

  const toggleIsExpanded = (): void => setIsExpanded((newState: boolean) => !newState);

  return (
    <>
      <Collapse in={isDisplayed} onExited={removeCourse} appear>
        <ListGroup.Item
          className="d-flex bg-light flex-row align-items-center course c-pointer collapse"
          data-cy={`clk:course-display-${term}-${subject_code}${course_code}`}
          onClick={toggleIsExpanded}
        >
          <Icon
            size="lg"
            icon={faCaretRight}
            className={`collapse-indicator mr-3 text-black-50 ${isExpanded && 'expanded'}`}
          />
          <span className="flex-fill">
            {subject_code} {course_code} - {course_name}
          </span>
          <Button variant="danger" size="sm" className="ml-2" onClick={handleRemoveClicked}>
            <Icon icon={faTrashAlt} />
          </Button>
        </ListGroup.Item>
      </Collapse>
      <Collapse in={isExpanded}>
        <ListGroup.Item className="course-details">
          <ToggleButtonGroup
            className="mb-2 pt-1"
            value={isMandatory ? 'true' : 'false'}
            type="radio"
            name="toggle"
            onChange={changeMandatory}
          >
            <ToggleButton variant="outline-secondary" value="true">
              {t('common:mandatory')}
            </ToggleButton>
            <ToggleButton variant="outline-secondary" value="false">
              {t('common:optional')}
            </ToggleButton>
          </ToggleButtonGroup>
          <br />
          <ul className="mb-0 no-bullets pl-3 pt-1">
            {Array.from(sections.values(), (section) => ({
              section,
              guid: `${term}-${subject_code}${course_code}-${section.id}`,
            }))
              .sort((a, b) => CourseSection.compareByLabel(a.section, b.section))
              .map(({ section, guid }) => (
                <li key={section.id} className="mb-2">
                  <Form.Group controlId={`sectionCheck-${guid}`} className="mb-0">
                    <Form.Check type="checkbox" className="d-flex align-items-center">
                      <Form.Check.Input
                        type="checkbox"
                        className="mb-1"
                        checked={section.included}
                        onChange={updateSections(section.id)}
                        data-cy={`clk:section-check-${guid}`}
                      ></Form.Check.Input>
                      <Form.Check.Label>
                        {`${t('common:section')} ${section.label}${
                          section.instructor && `: ${section.instructor}`
                        }`}
                      </Form.Check.Label>
                    </Form.Check>
                  </Form.Group>
                  <label htmlFor={`sectionCheck-${guid}`}>
                    <ul>
                      {Array.from(section.components.values())
                        .sort(CourseSectionComponent.compareByLabel)
                        .map((component) => (
                          <li key={component.id}>
                            {component.label}:&nbsp;
                            <Moment
                              date={moment().day(component.day_idx)}
                              format="dd"
                              interval={0}
                            />
                            &nbsp;
                            <Moment
                              tz="UTC"
                              unix
                              date={component.start_timestamp}
                              format={timeFormat}
                              interval={0}
                            />
                            &nbsp;-&nbsp;
                            <Moment
                              tz="UTC"
                              unix
                              date={component.end_timestamp}
                              format={timeFormat}
                              interval={0}
                            />
                            {component.isClosed() && ` (${t('common:closed')})`}
                          </li>
                        ))}
                    </ul>
                  </label>
                </li>
              ))}
          </ul>
        </ListGroup.Item>
      </Collapse>
    </>
  );
};
