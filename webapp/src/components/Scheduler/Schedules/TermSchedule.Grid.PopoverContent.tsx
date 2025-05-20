import React from 'react';
import Popover from 'react-bootstrap/Popover';
import Button from 'react-bootstrap/Button';
import Moment from 'react-moment';
import 'moment-timezone';
import { PopoverContentProps } from './types';
import { TIME_FORMAT_12_HR, TIME_FORMAT_24_HR } from './constants';
import { CourseSectionComponent } from '@models/CourseSectionComponent';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

/**
 * A component that renders the content for a course info popover when a course calendar component is clicked
 * @param props a PopoverContentProps object used to render the component
 * @return a JSX element containing the components to render
 */
const PopoverContent: React.FC<PopoverContentProps> = (props: PopoverContentProps) => {
  const { t } = useTranslation(['scheduler', 'common']);
  const { c, formatTimeAsMilitary, conflicts, alternates, handleComponentChange } = props;
  const minSize: number = 2;

  const timeFormat = formatTimeAsMilitary ? TIME_FORMAT_24_HR : TIME_FORMAT_12_HR;

  return (
    <>
      <Popover.Title as="h3">{c.course.course_name}</Popover.Title>
      <Popover.Content>
        {c.course.subject_code} {c.course.course_code} ({c.label})
        <br />
        {t('common:status')}:&nbsp;
        {t(`common:${c.status as 'open' | 'closed'}` as const)}
        {c.isNotOpen() && (
          <Icon icon={faExclamationTriangle} className="notification-icon text-warning ml-1" />
        )}
        <br />
        <Moment tz="UTC" unix date={c.start_timestamp} format={timeFormat} interval={0} />
        &nbsp;-&nbsp;
        <Moment tz="UTC" unix date={c.end_timestamp} format={timeFormat} interval={0} />
        <br />
        {t('common:room')}: {c.room}
        <br />
        {t('common:prof')}: {c.instructor}
        {alternates.length >= minSize && (
          <span className="alternates">
            <hr className="my-2" />
            <strong>{t('scheduler:choose_alternate')}:</strong>
            <br />
            {alternates.map((alt: CourseSectionComponent) => {
              const isCurrent = c.guid === alt.guid;
              return (
                <Button
                  variant={isCurrent ? 'info' : 'outline-info'}
                  size="sm"
                  className="mt-1 mr-1"
                  disabled={isCurrent}
                  onClick={handleComponentChange(alt)}
                  key={alt.guid}
                >
                  {alt.label}
                </Button>
              );
            })}
          </span>
        )}
        {conflicts.length >= minSize && (
          <span className="conflicts">
            <hr className="my-2" />
            <strong>{t('common:conflicts')}:</strong>
            <br />
            {conflicts.map((conflict: CourseSectionComponent) => {
              const isCurrent = c.guid === conflict.guid;
              return (
                <Button
                  variant={isCurrent ? 'danger' : 'outline-danger'}
                  size="sm"
                  className="mt-1 mr-1"
                  disabled={isCurrent}
                  onClick={handleComponentChange(conflict)}
                  key={conflict.guid}
                >
                  {conflict.course.subject_code} {conflict.course.course_code}: {conflict.label}
                </Button>
              );
            })}
          </span>
        )}
      </Popover.Content>
    </>
  );
};

export default PopoverContent;
