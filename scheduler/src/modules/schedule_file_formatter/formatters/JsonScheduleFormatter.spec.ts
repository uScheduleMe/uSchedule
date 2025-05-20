import { expect } from 'chai';
import { expected_json_entries, test_schedule_entry } from './__test__/test_schedule_entry';
import { JsonScheduleFormatter } from './JsonScheduleFormatter';

describe('JsonScheduleFormatter', () => {
  const formatter = new JsonScheduleFormatter();

  it('should convert an entry into the correct JSON format', () => {
    const actual = JSON.parse(formatter.format([test_schedule_entry]));
    expect(actual).to.deep.equal(expected_json_entries);
  });

  it('should end the file with a new line', () => {
    const actual = formatter.format([test_schedule_entry]);
    expect(actual).to.match(/\n$/);
  });
});
