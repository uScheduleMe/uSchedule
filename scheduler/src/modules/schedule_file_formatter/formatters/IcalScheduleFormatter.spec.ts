import { expect } from 'chai';
import { test_schedule_entry } from './__test__/test_schedule_entry';
import { IcalScheduleFormatter } from './IcalScheduleFormatter';
import { SinonSandbox, createSandbox } from 'sinon';

describe('IcalScheduleFormatter', () => {
  let sandbox: SinonSandbox;
  const mock_date_time = new Date('2020-09-15T15:30:00');
  const formatter = new IcalScheduleFormatter();

  before(() => {
    sandbox = createSandbox();
  });

  beforeEach(() => {
    sandbox.useFakeTimers(mock_date_time);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should set the CALNAME using the title without the term', () => {
    const actual = formatter
      .format([test_schedule_entry])
      .split('\n')
      .find((x) => x.includes('X-WR-CALNAME:'));
    expect(actual).to.equal('X-WR-CALNAME:uSchedule.me');
  });

  it('should set the CALNAME using the title with the term', () => {
    const actual = formatter
      .format([test_schedule_entry], { year: 2020, season: 'winter' })
      .split('\n')
      .find((x) => x.includes('X-WR-CALNAME:'));
    expect(actual).to.equal('X-WR-CALNAME:uSchedule.me 2020 winter');
  });

  it('should create the UID for a component using the correct data', () => {
    const actual = formatter
      .format([test_schedule_entry])
      .split('\n')
      .find((x) => x.includes('UID:'));
    expect(actual).to.equal('UID:school-2020-season.subject_code-course_code.id@uschedule.me');
  });

  it('should create the DTSTAMP using the current date/time in the correct format', () => {
    const actual = formatter
      .format([test_schedule_entry])
      .split('\n')
      .find((x) => x.includes('DTSTAMP:'));
    expect(actual).to.equal('DTSTAMP:20200915T153000');
  });

  it('should create the DTSTART using the entry start date/time in the correct format', () => {
    const actual = formatter
      .format([test_schedule_entry])
      .split('\n')
      .find((x) => x.includes('DTSTART;'));
    expect(actual).to.equal(`DTSTART;TZID=${IcalScheduleFormatter.TIMEZONE}:20200901T100000`);
  });

  it('should create the DTEND using the entry start date/time in the correct format', () => {
    const actual = formatter
      .format([test_schedule_entry])
      .split('\n')
      .find((x) => x.includes('DTEND;'));
    expect(actual).to.equal(`DTEND;TZID=${IcalScheduleFormatter.TIMEZONE}:20200901T112000`);
  });

  it('should set the UNTIL using the entry end date/time in the correct format', () => {
    const actual = formatter
      .format([test_schedule_entry])
      .split('\n')
      .find((x) => x.includes('UNTIL='));
    expect(actual).to.equal('RRULE:FREQ=WEEKLY;UNTIL=20201231T112000');
  });

  it('should create the LOCATION using the entry location', () => {
    const actual = formatter
      .format([test_schedule_entry])
      .split('\n')
      .find((x) => x.includes('LOCATION:'));
    expect(actual).to.equal('LOCATION:room');
  });

  it('should create the SUMMARY using the entry data', () => {
    const actual = formatter
      .format([test_schedule_entry])
      .split('\n')
      .find((x) => x.includes('SUMMARY:'));
    expect(actual).to.equal('SUMMARY:subject_code course_code (label)');
  });

  it('should create the DESCRIPTION using the entry data', () => {
    const actual = formatter
      .format([test_schedule_entry])
      .split('\n')
      .find((x) => x.includes('DESCRIPTION:'));
    expect(actual).to.equal('DESCRIPTION:course_name\\n\\nProf: instructor');
  });

  it('should set the start date to the correct date of the following week when the day of week is before the day of week for the start date', () => {
    const data = { ...test_schedule_entry, day_of_week: 'MO' };
    const actual = formatter
      .format([data])
      .split('\n')
      .find((x) => x.includes('DTSTART;'));
    expect(actual).to.equal(`DTSTART;TZID=${IcalScheduleFormatter.TIMEZONE}:20200907T100000`);
  });

  it('should set the start date to the correct date when the day of week is after the day of week for the start date', () => {
    const data = { ...test_schedule_entry, day_of_week: 'TH' };
    const actual = formatter
      .format([data])
      .split('\n')
      .find((x) => x.includes('DTSTART;'));
    expect(actual).to.equal(`DTSTART;TZID=${IcalScheduleFormatter.TIMEZONE}:20200903T100000`);
  });

  it('should end the file with a new line', () => {
    const actual = formatter.format([test_schedule_entry]);
    expect(actual).to.match(/\n$/);
  });
});
