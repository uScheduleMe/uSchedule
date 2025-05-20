import React, { useState } from 'react';
import './DraftTermSchedules.css';
import { HeaderProps, DraftTermSchedulesProps } from './types';
import Header from './DraftTermSchedules.Header';
import { CourseSchedule } from '@models/CourseSchedule';
import { GridProps } from '@components/Scheduler/Schedules/types';
import Grid from '@components/Scheduler/Schedules/TermSchedule.Grid';
import Collapse from 'react-bootstrap/Collapse';

/**
 * A component that renders a list of schedules with controls for the provided term
 * @param props a DraftTermSchedulesProps object used to render the component
 * @return a JSX element containing the components to render
 */
const DraftTermSchedules: React.FC<DraftTermSchedulesProps> = (props: DraftTermSchedulesProps) => {
  const { termScheduleSetData, calendarSchedule, removeDraft, moveToCalendar } = props;

  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [scheduleIdx, setScheduleIdx] = useState<number>(
    termScheduleSetData.current_schedule_index,
  );
  const minScheduleIdx = 0;
  const emptyScheduleIdx = -1;

  const isValidIndex = (index: number) =>
    !Number.isNaN(index) && index >= minScheduleIdx && index < termScheduleSetData.schedules.length;

  const updateScheduleIdx = (requestedIdx: number): void => {
    let newIdx = requestedIdx;
    if (!isValidIndex(newIdx)) {
      newIdx = emptyScheduleIdx;
    }
    setScheduleIdx(newIdx);
    termScheduleSetData.current_schedule_index = newIdx;
  };

  const headerProps: HeaderProps = {
    termScheduleSetData,
    scheduleIdx,
    updateScheduleIdx,
    calendarSchedule,
    showCalendar,
    setShowCalendar,
    removeDraft,
    moveToCalendar,
  };

  const gridProps: GridProps = {
    enableAlternates: false,
    schedule: !isValidIndex(scheduleIdx)
      ? new CourseSchedule()
      : termScheduleSetData.schedules[scheduleIdx],
  };

  return (
    <div className="mb-4 draft-term-schedules-container">
      <Header {...headerProps} />
      <hr className="mt-0 mb-3" />
      <Grid {...gridProps} />
      <Collapse in={showCalendar}>
        <div>
          <hr className="mt-0 schedule-separator" />
          {calendarSchedule && <Grid schedule={calendarSchedule} enableAlternates={false} />}
        </div>
      </Collapse>
    </div>
  );
};

export default DraftTermSchedules;
