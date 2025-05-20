import { expect } from 'chai';
import { extractQueryString, parseStringToInt } from './helpers';

describe('Testing helpers file', () => {
  describe('extractQueryString', () => {
    it('Should return the query string from a URL with a query', async () => {
      const url = 'localhost/test?value=nothing';
      const query_string = 'value=nothing';
      expect(extractQueryString(url)).to.equal(query_string);
    });

    it('Should return an empty string from a URL without a query', async () => {
      const url = 'localhost/test?';
      const url2 = 'localhost/test';
      const query_string = '';
      expect(extractQueryString(url)).to.equal(query_string);
      expect(extractQueryString(url2)).to.equal(query_string);
    });
  });

  describe('parseStringToInt', () => {
    it('Should return a properly formatted numeric string as an integer', async () => {
      const expected1 = 0;
      expect(parseStringToInt('0', 1)).to.equal(expected1);
      const expected2 = 1;
      expect(parseStringToInt('1', 0)).to.equal(expected2);
      expect(parseStringToInt('1.2', 0)).to.equal(expected2);
      expect(parseStringToInt('1.6', 0)).to.equal(expected2);
      const expected3 = -1;
      expect(parseStringToInt('-1', 0)).to.equal(expected3);
    });

    it('Should return the fallback value if the string is not a number or undefined', async () => {
      const fallback = 15;
      expect(parseStringToInt(undefined, fallback)).to.equal(fallback);
      expect(parseStringToInt('NaN', fallback)).to.equal(fallback);
      expect(parseStringToInt('abc', fallback)).to.equal(fallback);
      expect(parseStringToInt('', fallback)).to.equal(fallback);
    });

    it('Should honour the minimum value, when there is one and the value is below the min', async () => {
      const min = 2;
      expect(parseStringToInt('-5', 0, min)).to.equal(min);
    });
  });
});
