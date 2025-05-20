import { expect } from 'chai';
import {
  GENERATOR_LIMIT_FALLBACK,
  schedule_generator_config_schema,
  time_24h_timestamp_schema,
} from './schemas';

describe('Validate Schedule Generator Schemas', () => {
  describe('schedule_generator_config_schema', () => {
    describe('limit property', () => {
      it('should return the correct value when a valid limit is used', () => {
        const limit = 1500;
        const actual = schedule_generator_config_schema.parse({ limit }).limit;
        expect(actual).to.equal(limit);
      });

      it('should fail if the limit is 0', () => {
        expect(() => schedule_generator_config_schema.parse({ limit: 0 })).throws();
      });

      it('should fail if the limit is negative', () => {
        expect(() => schedule_generator_config_schema.parse({ limit: -1 })).throws();
      });

      it('should fail if the limit is not an integer', () => {
        expect(() => schedule_generator_config_schema.parse({ limit: 15.5 })).throws();
      });

      it('should fail if the limit is not a number', () => {
        expect(() => schedule_generator_config_schema.parse({ limit: '15' })).throws();
      });

      it('should return the default limit if none is provided', () => {
        const actual = schedule_generator_config_schema.parse({}).limit;
        expect(actual).to.equal(GENERATOR_LIMIT_FALLBACK);
      });
    });
  });

  describe('time_24h_timestamp_schema', () => {
    const fifteen_thirty_in_seconds = 55800;

    it('should convert a valid value to the correct timestamp', () => {
      expect(time_24h_timestamp_schema.parse('15:30')).to.equal(fifteen_thirty_in_seconds);
    });

    it('should fail if the seconds are provided', () => {
      expect(() => time_24h_timestamp_schema.parse('10:10:10')).throws();
    });

    it('should fail if the hour portion is greater than 23', () => {
      expect(() => time_24h_timestamp_schema.parse('24:00')).throws();
    });

    it('should fail if the minute portion is greater than 59', () => {
      expect(() => time_24h_timestamp_schema.parse('10:60')).throws();
    });
  });
});
