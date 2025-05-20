/**
 * Converts a time string to a timestamp with a resolution of seconds
 * @param time the time string in the format 'hh:mm'
 * @returns the timestamp
 */
export const time24HrToTimestamp = (time: string): number => {
  const seconds_per_hr = 3600;
  const seconds_per_min = 60;
  const num_time_components = 2;
  const [hrs, mins] = time.split(':', num_time_components).map((c) => parseInt(c));
  return hrs * seconds_per_hr + mins * seconds_per_min;
};
