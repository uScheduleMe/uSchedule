import { FilterTimeDropdownProps } from './types';
import moment from 'moment';
import { TWENTY_FOUR_HOUR_FORMAT, MINUTES_IN_AN_HOUR } from './constants';
import { InputGroup, FormControl, Form } from 'react-bootstrap';
import React from 'react';

const getTimeRange = (
  startTime: string,
  endTime: string,
  interval: number,
  displayFormat: string,
): string[] => {
  const timeRange: string[] = [];
  const intervalsInAnHour: number = MINUTES_IN_AN_HOUR / interval;
  // disallow intervals > 60 minutes.
  if (intervalsInAnHour < 1) {
    return [];
  }
  const start: moment.Moment = moment(startTime, TWENTY_FOUR_HOUR_FORMAT);
  const end: moment.Moment = moment(endTime, TWENTY_FOUR_HOUR_FORMAT);
  const steps: number = Math.floor(
    (end.diff(start, 'minutes') / MINUTES_IN_AN_HOUR) * intervalsInAnHour,
  );
  if (steps <= 0) {
    return [];
  }

  for (let i = 0; i <= steps; i++) {
    const displayTime = moment(start)
      .add(interval * i, 'minutes')
      .format(displayFormat);

    timeRange.push(displayTime);
  }

  return timeRange;
};

export const FilterTimeDropdown: React.FC<FilterTimeDropdownProps> = (
  props: FilterTimeDropdownProps,
) => {
  const { id, startTime, endTime, prependText, interval, displayFormat, value, onChange } = props;
  const formattedTime = moment(value, TWENTY_FOUR_HOUR_FORMAT).format(displayFormat);
  // send the changed time as twenty four hour time.
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    onChange(moment(event.target.value, displayFormat).format(TWENTY_FOUR_HOUR_FORMAT));
  };
  return (
    <InputGroup className="mb-3">
      <InputGroup.Prepend>
        <Form.Label htmlFor={id} className="input-group-text">
          {prependText}
        </Form.Label>
      </InputGroup.Prepend>
      <FormControl as="select" id={id} value={formattedTime} onChange={handleChange} custom>
        {getTimeRange(startTime, endTime, interval, displayFormat).map((displayTime: string) => {
          return <option key={displayTime}>{displayTime}</option>;
        })}
      </FormControl>
    </InputGroup>
  );
};
