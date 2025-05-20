import { TermListMapping } from '@stores/ScheduleBuilderStore';
import { TermSkeleton } from '@services/Scheduler/schemas';
import moment from 'moment';
import { LocalSchedulerService, LocalSchedulerWorker } from '@services/LocalScheduler';

export enum TermSeasons {
  Winter = 'winter',
  Summer = 'summer',
  Fall = 'fall',
}

export const TermSeasonMonthNumbers: Record<TermSeasons, number> = {
  [TermSeasons.Winter]: 1,
  [TermSeasons.Summer]: 5,
  [TermSeasons.Fall]: 9,
};

export type TermSeasonsEntries = keyof typeof TermSeasons;

export class Term {
  /**
   * The year that the term occurs within
   */
  public year: number;

  /**
   * The season which the term starts in
   */
  public season: TermSeasons;

  /**
   * The unique id of the term
   */
  public id: string;

  /**
   * The reference to the local scheduler worker
   */
  public readonly localScheduler: LocalSchedulerWorker;

  constructor(year: number, season: TermSeasons) {
    this.year = year;
    this.season = season;
    this.id = `${year}-${season}`;
    this.localScheduler = LocalSchedulerService.generatorWorkerFactory();
  }

  /**
   * Determine if this term is the current term based on the year and season
   * @returns true if this term is current
   */
  public isCurrent(): boolean {
    const now: moment.Moment = moment();
    const year: number = now.year();
    const month: number = now.month() + 1;
    const termMonth: number = TermSeasonMonthNumbers[this.season];
    const termSize: number = 4;
    return year === this.year && termMonth <= month && month < termMonth + termSize;
  }

  public getSkeleton(): TermSkeleton {
    return {
      year: this.year,
      season: this.season,
    };
  }

  /**
   * Used to sort Term objects by time
   * @param a a Term
   * @param b a Term
   * @return negative if a < b, positive if a > b, else 0
   */
  public static compareByDate(a: Term, b: Term): number {
    if (a.year === b.year) {
      return TermSeasonMonthNumbers[a.season] - TermSeasonMonthNumbers[b.season];
    }
    return a.year - b.year;
  }

  /**
   * Convert a `TermListMapping` to a list of Terms in reverse chronological order.
   * @param terms mapping of the terms
   */
  public static mappingToTermList(terms: TermListMapping): Term[] {
    return Object.values(terms).sort(Term.compareByDate).reverse();
  }
}
