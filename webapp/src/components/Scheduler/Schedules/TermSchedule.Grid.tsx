import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import moment from 'moment';
import Moment from 'react-moment';
import 'moment-timezone';
import { GridProps, GridlineMeta, TimeLabelMeta, DaysOfWeek } from './types';
import {
  SECS_FOR_30_MINS,
  SIZE_CAL_HEADER,
  SIZE_GRID_BUFFER,
  SIZE_30_MINS,
  SECS_FOR_1_HOUR,
  SIZE_CAL_TIME_OFFSET,
  HOURS_FORMAT_12_HR,
  HOURS_FORMAT_24_HR,
  SIZE_60_MINS,
  SIZE_LINE_THICKNESS,
} from './constants';
import CalendarItem from './TermSchedule.Grid.CalendarItem';
import { useScheduleBuilderStore } from '@stores/ScheduleBuilderStore';

/**
 * Adjust the start time of the calendar grid down to the nearest half hour
 * @param gridStartTime the start time of the earliest starting component
 * @return the adjusted start time for the grid
 */
const adjustGridStartTime = (gridStartTime: number): number => {
  const timeRemainder: number = gridStartTime % SECS_FOR_30_MINS;
  if (timeRemainder !== 0) {
    return gridStartTime - timeRemainder;
  }
  return gridStartTime;
};

/**
 * Adjust the end time of the calendar grid up to the nearest half hour
 * @param gridEndTime the end time of the latest ending component
 * @return the adjusted end time for the grid
 */
const adjustGridEndTime = (gridEndTime: number): number => {
  const timeRemainder: number = gridEndTime % SECS_FOR_30_MINS;
  if (timeRemainder !== 0) {
    return gridEndTime - timeRemainder + SECS_FOR_30_MINS;
  }
  return gridEndTime;
};

/**
 * Gets a list of meta data objects used to generate the gridlines on the calendar
 * @param gridStartTime the adjusted start time of the schedule grid
 * @param gridEndTime the adjusted end time of the schedule grid
 * @return a list of GridlineMeta objects
 */
const getGridlinesMeta = (gridStartTime: number, gridEndTime: number): GridlineMeta[] => {
  const gridlines: GridlineMeta[] = [];
  let currentTime: number = gridStartTime;
  while (currentTime <= gridEndTime) {
    const className: string = currentTime % SECS_FOR_1_HOUR === 0 ? 'gridline' : 'gridline half';
    gridlines.push({ className, currentTime, style: { height: `${SIZE_30_MINS}px` } });
    currentTime += SECS_FOR_30_MINS;
  }
  return gridlines;
};

/**
 * Gets a list of meta data objects used to generate the time labels on the calendar
 * @param gridStartTime the adjusted start time of the schedule grid
 * @param gridEndTime the adjusted end time of the schedule grid
 * @return a list of TimeLabelMeta objects
 */
const getTimeLabelsMeta = (gridStartTime: number, gridEndTime: number): TimeLabelMeta[] => {
  const timeLabels: TimeLabelMeta[] = [];
  let currentTime: number = gridStartTime;
  // If the schedule starts on the half hour, add 30 minutes so the labels are on the hour
  if (currentTime % SECS_FOR_1_HOUR !== 0) {
    currentTime += SECS_FOR_30_MINS;
  }
  while (currentTime <= gridEndTime) {
    timeLabels.push({ currentTime, style: { height: `${SIZE_60_MINS}px` } });
    currentTime += SECS_FOR_1_HOUR;
  }
  return timeLabels;
};

/**
 * Calculate the height of the spacer to go above the gridline components
 * @return the spacer height
 */
const calcGridlineSpacerHeight = (): number => {
  // Note: subtract SIZE_30_MINS because the gridlines are drawn for every half hour
  //    and the line drawn is the bottom border of the div
  return SIZE_CAL_HEADER + SIZE_GRID_BUFFER + SIZE_LINE_THICKNESS - SIZE_30_MINS;
};

/**
 * Calculate the height of the spacer to go above the time labels
 * @param gridStartTime the adjusted start time of the schedule grid
 * @return the spacer height
 */
const calcTimeLabelSpacerHeight = (gridStartTime: number): number => {
  const timeLabelSpacerHeight =
    SIZE_CAL_HEADER + SIZE_GRID_BUFFER + SIZE_LINE_THICKNESS + SIZE_CAL_TIME_OFFSET;
  // If the grid starts on the half-hour instead of the hour, add a half hour word of space
  if (gridStartTime % SECS_FOR_1_HOUR !== 0) {
    return timeLabelSpacerHeight + SIZE_30_MINS;
  }
  return timeLabelSpacerHeight;
};

/**
 * Calculate the overall height of the calendar grid
 * @param gridStartTime the adjusted start time of the schedule grid
 * @param gridEndTime the adjusted end time of the schedule grid
 * @return the grid height
 */
const calcGridHeight = (gridStartTime: number, gridEndTime: number): number => {
  const numGridBuffers: number = 2;
  const num30MinIntervals: number = (gridEndTime - gridStartTime) / SECS_FOR_30_MINS;
  return num30MinIntervals * SIZE_30_MINS + SIZE_CAL_HEADER + numGridBuffers * SIZE_GRID_BUFFER;
};

/**
 * A component that renders a calendar grid for the supplied schedule
 * @param props a GridProps object used to render the component
 * @return a JSX element containing the components to render
 */
const Grid: React.FC<GridProps> = (props: GridProps) => {
  const { schedule, enableAlternates, enableConflicts } = props;

  const { settings } = useScheduleBuilderStore();
  const { format_time_as_military } = settings;

  const popoverRef = React.useRef<HTMLDivElement>(null);

  const timeFormat: string = format_time_as_military ? HOURS_FORMAT_24_HR : HOURS_FORMAT_12_HR;
  const gridStartTime: number = adjustGridStartTime(schedule.start_timestamp);
  const gridEndTime: number = adjustGridEndTime(schedule.end_timestamp);
  const gridlines: GridlineMeta[] = getGridlinesMeta(gridStartTime, gridEndTime);
  const timeLabels: TimeLabelMeta[] = getTimeLabelsMeta(gridStartTime, gridEndTime);
  const gridlineSpacerHeight: number = calcGridlineSpacerHeight();
  const timeLabelSpacerHeight: number = calcTimeLabelSpacerHeight(gridStartTime);
  const gridHeight: number = calcGridHeight(gridStartTime, gridEndTime);

  const calendarItemsByDay: JSX.Element[][] = schedule.components_per_day.map((components) =>
    components.map((component) => (
      <CalendarItem
        key={component.guid}
        component={component}
        formatTimeAsMilitary={format_time_as_military}
        gridStartTime={gridStartTime}
        schedule={schedule}
        popoverRef={popoverRef}
        enableAlternates={enableAlternates}
        enableConflicts={enableConflicts}
      />
    )),
  );

  return (
    <div className="weekly-grid mb-3" ref={popoverRef} style={{ height: `${gridHeight}px` }}>
      <div className="times">
        <div className="spacer" style={{ height: `${timeLabelSpacerHeight}px` }} />
        {timeLabels.map((item: TimeLabelMeta) => {
          return (
            <div className="timeslot" style={item.style} key={item.currentTime.toString()}>
              <Moment tz="UTC" unix date={item.currentTime} format={timeFormat} interval={0} />
            </div>
          );
        })}
      </div>
      <div className="gridlines">
        <div className="spacer" style={{ height: `${gridlineSpacerHeight}px` }} />
        {gridlines.map((item: GridlineMeta) => {
          return (
            <div className={item.className} style={item.style} key={item.currentTime.toString()} />
          );
        })}
      </div>
      <Row className="day-columns">
        {calendarItemsByDay.map((calendarItems: JSX.Element[], i: number) => {
          // Hide Sunday / Saturday if there are no calendar items assigned to them
          if ((i === DaysOfWeek.SUNDAY || i === DaysOfWeek.SATURDAY) && !calendarItems.length) {
            return null;
          }
          const d = moment().day(i);
          const d_x_small = d.format('dd');
          return (
            <Col
              className={`day-${d_x_small.toUpperCase()}`}
              style={{ height: `${gridHeight}px` }}
              key={d_x_small}
            >
              <div className="day-title">
                <span className="d-inline d-sm-none">{d_x_small}</span>
                <span className="d-none d-sm-inline d-md-none">{d.format('ddd')}</span>
                <span className="d-none d-md-inline">{d.format('dddd')}</span>
              </div>
              {calendarItems}
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default Grid;
