import React from 'react';
import Header from '@components/Users/Calendar/CalendarSchedule.Header';
import Grid from '@components/Scheduler/Schedules/TermSchedule.Grid';
import { CalendarScheduleProps } from './types';

/**
 * A component that renders a list of schedules with controls for the provided term
 * @param props a TermScheduleProps object used to render the component
 * @return a JSX element containing the components to render
 */
const CalendarSchedule: React.FC<CalendarScheduleProps> = (props: CalendarScheduleProps) => {
  const { schedule, removeSchedule, userOwnsSchedule } = props;

  return (
    <div className="mb-4">
      <Header
        schedule={schedule}
        removeSchedule={removeSchedule}
        userOwnsSchedule={userOwnsSchedule}
      />
      <hr className="mt-0 mb-3" />
      <Grid schedule={schedule} enableAlternates={false} />
    </div>
  );
};

export default CalendarSchedule;
