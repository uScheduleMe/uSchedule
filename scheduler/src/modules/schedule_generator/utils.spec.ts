import { expect } from 'chai';
import { time24HrToTimestamp } from './utils';

describe('Validate Schedule Generator Utils', () => {
  describe('time24HrToTimestamp()', () => {
    const eight_oclock_in_seconds = 28800;
    const nine_thirty_in_seconds = 34200;
    const fifteen_thirty_in_seconds = 55800;

    it('should convert a valid time string to the correct timestamp', () => {
      expect(time24HrToTimestamp('8:00')).to.equal(eight_oclock_in_seconds);
      expect(time24HrToTimestamp('08:00')).to.equal(eight_oclock_in_seconds);
      expect(time24HrToTimestamp('09:30')).to.equal(nine_thirty_in_seconds);
      expect(time24HrToTimestamp('15:30')).to.equal(fifteen_thirty_in_seconds);
    });

    it('should ignore the seconds if they are provided', () => {
      expect(time24HrToTimestamp('08:00:45')).to.equal(eight_oclock_in_seconds);
    });

    it('should return NaN if the input string is invalid', () => {
      expect(time24HrToTimestamp('not a time string')).to.be.NaN;
    });
  });
});
