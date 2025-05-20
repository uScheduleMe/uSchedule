import { Term, TermSeasons } from '@models/Term';

const YEAR_2019 = 2019;
const FALL_2019 = new Term(YEAR_2019, TermSeasons.Fall);
const YEAR_2020 = 2020;
const WINTER_2020 = new Term(YEAR_2020, TermSeasons.Winter);
const SUMMER_2020 = new Term(YEAR_2020, TermSeasons.Summer);
const FALL_2020 = new Term(YEAR_2020, TermSeasons.Fall);
const YEAR_2021 = 2021;
const WINTER_2021 = new Term(YEAR_2021, TermSeasons.Winter);

export const TERMS = {
  FALL_2019,
  WINTER_2020,
  SUMMER_2020,
  FALL_2020,
  WINTER_2021,
};
