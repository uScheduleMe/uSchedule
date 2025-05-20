/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TERMS } from '@models/__test__/Term.TestData';
import { Term, TermSeasons } from './Term';
import moment from 'moment';

describe('Validate Term.constructor()', () => {
  it('should import data properly', () => {
    const YEAR = 2020;
    expect(TERMS.WINTER_2020).toHaveProperty('year', YEAR);
    expect(TERMS.WINTER_2020).toHaveProperty('season', TermSeasons.Winter);
    expect(TERMS.WINTER_2020).toHaveProperty('id', '2020-winter');

    expect(TERMS.SUMMER_2020).toHaveProperty('year', YEAR);
    expect(TERMS.SUMMER_2020).toHaveProperty('season', TermSeasons.Summer);
    expect(TERMS.SUMMER_2020).toHaveProperty('id', '2020-summer');

    expect(TERMS.FALL_2020).toHaveProperty('year', YEAR);
    expect(TERMS.FALL_2020).toHaveProperty('season', TermSeasons.Fall);
    expect(TERMS.FALL_2020).toHaveProperty('id', '2020-fall');
  });
});

describe('Validate Term.isCurrent()', () => {
  const now: moment.Moment = moment();
  const YEAR = now.year();
  const MONTH = now.month() + 1;

  const WINTER_TERM = new Term(YEAR, TermSeasons.Winter);
  const SUMMER_TERM = new Term(YEAR, TermSeasons.Summer);
  const FALL_TERM = new Term(YEAR, TermSeasons.Fall);

  const IS_WINTER = MONTH >= 1 && MONTH <= 4;
  const IS_SUMMER = MONTH >= 5 && MONTH <= 8;
  const IS_FALL = MONTH >= 9 && MONTH <= 12;

  expect(WINTER_TERM.isCurrent()).toBe(IS_WINTER);
  expect(SUMMER_TERM.isCurrent()).toBe(IS_SUMMER);
  expect(FALL_TERM.isCurrent()).toBe(IS_FALL);
  expect(TERMS.WINTER_2020.isCurrent()).toBe(false);
});

describe('Validate Term.compareByDate()', () => {
  expect(Term.compareByDate(TERMS.WINTER_2020, TERMS.SUMMER_2020)).toBeLessThan(0);
  expect(Term.compareByDate(TERMS.FALL_2020, TERMS.SUMMER_2020)).toBeGreaterThan(0);
  expect(Term.compareByDate(TERMS.WINTER_2020, TERMS.WINTER_2020)).toBe(0);
  expect(Term.compareByDate(TERMS.WINTER_2020, TERMS.WINTER_2021)).toBeLessThan(0);
});
