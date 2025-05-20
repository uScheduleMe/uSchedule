import { SIZE_CAL_HEADER, SIZE_GRID_BUFFER } from './constants';
import { calcOffset, calcHeight } from './TermSchedule.Grid.CalendarItem';

const BASE_OFFSET = SIZE_CAL_HEADER + SIZE_GRID_BUFFER;
const SECONDS_FOR_0830_HRS = 30600;
const SECONDS_FOR_1000_HRS = 36000;

describe('CalendarItem -> calcOffset', () => {
  it('should return the minimum offset from the top of the container when the grid start time matches the component start time', () => {
    expect(calcOffset(SECONDS_FOR_0830_HRS, SECONDS_FOR_0830_HRS)).toBe(BASE_OFFSET);
  });

  it('should return the minimum offset from the top of the container when the grid start time is later than the component start time', () => {
    expect(calcOffset(SECONDS_FOR_1000_HRS, SECONDS_FOR_0830_HRS)).toBe(BASE_OFFSET);
  });

  it('should calculate the offset from the top of the container in pixels correctly', () => {
    const val_when_grid_start_less_than_start_time = 86;
    expect(calcOffset(SECONDS_FOR_0830_HRS, SECONDS_FOR_1000_HRS)).toBe(
      val_when_grid_start_less_than_start_time,
    );
  });
});

describe('CalendarItem -> calcHeight', () => {
  it('should calculate the component height in pixels correctly when the start time matched the end time', () => {
    const val_when_start_matches_end = 0;
    expect(calcHeight(SECONDS_FOR_0830_HRS, SECONDS_FOR_0830_HRS)).toBe(val_when_start_matches_end);
  });

  it('should calculate the component height in pixels as 0 when the start time is after the end time', () => {
    const val_when_start_greater_than_end = 0;
    expect(calcHeight(SECONDS_FOR_1000_HRS, SECONDS_FOR_0830_HRS)).toBe(
      val_when_start_greater_than_end,
    );
  });

  it('should calculate the component height in pixels correctly', () => {
    const val_when_start_less_than_end = 54;
    expect(calcHeight(SECONDS_FOR_0830_HRS, SECONDS_FOR_1000_HRS)).toBe(
      val_when_start_less_than_end,
    );
  });
});
