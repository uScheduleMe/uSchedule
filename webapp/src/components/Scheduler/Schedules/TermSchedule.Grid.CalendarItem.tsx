import React, { useState } from 'react';
import Popover from 'react-bootstrap/Popover';
import Badge from 'react-bootstrap/Badge';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { CalendarItemProps, CalendarItemMeta } from './types';
import { SIZE_CAL_HEADER, SECS_FOR_10_MINS, SIZE_10_MINS, SIZE_GRID_BUFFER } from './constants';
import { CourseSectionComponent } from '@models/CourseSectionComponent';
import InfoPopupContent from './TermSchedule.Grid.PopoverContent';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { mergeClassNames } from '@utils/mergeClassNames';

/**
 * Calculate the offset from the top of the column
 * @param gridStartTime the adjusted start time of the schedule grid
 * @param startTimestamp the start timestamp of the component
 * @return the component offset
 */
export const calcOffset = (gridStartTime: number, startTimestamp: number): number => {
  const num10MinIntervals: number = Math.floor((startTimestamp - gridStartTime) / SECS_FOR_10_MINS);
  return Math.max(0, num10MinIntervals * SIZE_10_MINS) + SIZE_CAL_HEADER + SIZE_GRID_BUFFER;
};

/**
 * Calculate the height of the component
 * @param startTimestamp the start timestamp of the component
 * @param endTimestamp the end timestamp of the component
 * @return the component height
 */
export const calcHeight = (startTimestamp: number, endTimestamp: number): number => {
  return Math.max(0, Math.ceil((endTimestamp - startTimestamp) / SECS_FOR_10_MINS) * SIZE_10_MINS);
};

/**
 * Gets the meta data object used as the props for the calendar item div
 * @param c the CourseSectionComponent model for the component to display
 * @param gridStartTime the start time of the grid that the component is being displayed within
 * @param viewId the view id for the component's course
 * @return a CalendarItemMeta configured for the provided component
 */
const getCalendarItemMeta = (
  c: CourseSectionComponent,
  gridStartTime: number,
  viewId: number,
): CalendarItemMeta => {
  return {
    style: {
      height: `${calcHeight(c.start_timestamp, c.end_timestamp)}px`,
      top: `${calcOffset(gridStartTime, c.start_timestamp)}px`,
    },
    className: mergeClassNames(
      `course-component c-pointer course-num-${viewId}`,
      c.isNotOpen() ? 'closed' : undefined,
    ),
    title: c.course.course_name,
  };
};

/**
 * A component that renders a calendar item for a corresponding course component
 * @param props a CalendarItemProps object used to render the component
 * @return a JSX element containing the components to render
 */
const CalendarItem: React.FC<CalendarItemProps> = (props: CalendarItemProps) => {
  const { component, formatTimeAsMilitary, gridStartTime, schedule, popoverRef } = props;
  const enableAlternates = props.enableAlternates ?? true;
  const enableConflicts = props.enableConflicts ?? true;

  const [c, setComponent] = useState<CourseSectionComponent>(component);

  const calendarItemMeta: CalendarItemMeta = getCalendarItemMeta(
    c,
    gridStartTime,
    schedule.getViewId(c),
  );
  const conflicts: CourseSectionComponent[] = enableConflicts ? schedule.getConflicts(c) : [];
  const alternates: CourseSectionComponent[] = enableAlternates ? c.getAlternates() : [];

  const handleComponentChange = (newComponent: CourseSectionComponent) => (): void => {
    if (schedule.swapComponents(c, newComponent)) {
      setComponent(newComponent);
    }
  };

  const infoPopup: JSX.Element = (
    <Popover id={`popover-${c.guid}`} className="course-component-popover">
      <InfoPopupContent
        {...{
          c,
          formatTimeAsMilitary,
          conflicts,
          alternates,
          handleComponentChange,
        }}
      />
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="auto"
      overlay={infoPopup}
      container={popoverRef}
      rootClose
    >
      <div {...calendarItemMeta}>
        {conflicts.length > 1 && (
          <Badge pill variant="danger" className="mr-1" key="conflicts-badge">
            {conflicts.length}
          </Badge>
        )}
        {alternates.length > 1 && (
          <Badge pill variant="secondary" className="mr-1" key="alternate-badge">
            {alternates.length}
          </Badge>
        )}
        {c.isNotOpen() && (
          <Icon
            key="closed-icon"
            icon={faExclamationTriangle}
            className="notification-icon text-warning mr-1"
          />
        )}
        {c.course.subject_code} {c.course.course_code} ({c.label}) {c.course.course_name}
      </div>
    </OverlayTrigger>
  );
};

export default CalendarItem;
