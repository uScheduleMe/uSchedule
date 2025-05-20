import { AllowTimeConflicts, getFilterPayload, ScheduleFilterData } from './ScheduleFilterData';

describe('Validate getFilterPayload()', () => {
  const filter_data: ScheduleFilterData = {
    minimize_before_time: '08:00',
    minimize_after_time: '22:00',
    lunch_start: '11:00',
    lunch_end: '13:30',
    lunch_size: '00:30',
    lunch_is_enabled: false,
    evening_start: '16:00',
    evening_end: '18:30',
    evening_size: '00:30',
    evening_is_enabled: false,
    allow_time_conflicts: AllowTimeConflicts.ALL,
    allow_closed_components: true,
  };
  it('should return the correct data based on the input', () => {
    const result = getFilterPayload(filter_data);
    expect(result).toMatchSnapshot();
  });
});

describe('Validate getFilterPayload() with breaks enabled', () => {
  const filter_data: ScheduleFilterData = {
    minimize_before_time: '08:00',
    minimize_after_time: '22:00',
    lunch_start: '11:00',
    lunch_end: '13:30',
    lunch_size: '00:30',
    lunch_is_enabled: true,
    evening_start: '16:00',
    evening_end: '18:30',
    evening_size: '00:30',
    evening_is_enabled: true,
    allow_time_conflicts: AllowTimeConflicts.ALL,
    allow_closed_components: true,
  };
  it('should return the correct data based on the input', () => {
    const result = getFilterPayload(filter_data);
    expect(result).toMatchSnapshot();
  });
});
