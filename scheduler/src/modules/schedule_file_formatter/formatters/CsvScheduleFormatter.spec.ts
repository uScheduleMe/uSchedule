import { expect } from 'chai';
import { CsvScheduleFormatter } from './CsvScheduleFormatter';
import { expected_csv_entries, test_schedule_entry } from './__test__/test_schedule_entry';

describe('CsvScheduleFormatter', () => {
  const formatter = new CsvScheduleFormatter();

  it('should include a header row with the correct number of titles', () => {
    const actual = formatter.format([test_schedule_entry]).split('\n')[0].split(',');
    expect(actual.length).to.equal(expected_csv_entries.length);
  });

  it('should map the entry data to the correct positions in the CSV output', () => {
    const actual = formatter.format([test_schedule_entry]).split('\n')[1].split(',');
    expect(actual).to.deep.equal(expected_csv_entries);
  });

  it('should add double quote escaping when the value in a column contains the separator character', () => {
    const entry = { ...test_schedule_entry, instructor: 'instructor,abc123' };
    const actual = formatter.format([entry]).split('\n')[1];
    expect(actual).to.match(/"instructor,abc123"/);
  });

  it('should replace " with "" in an escaped value that contains "', () => {
    const entry = { ...test_schedule_entry, instructor: 'instructor","abc123' };
    const actual = formatter.format([entry]).split('\n')[1];
    expect(actual).to.match(/"instructor"",""abc123"/);
  });

  it('should end the file with a new line', () => {
    const actual = formatter.format([test_schedule_entry]);
    expect(actual).to.match(/\n$/);
  });
});
