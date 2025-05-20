/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { ResponseMessage } from '@utils/api_responses';

export const responseMessageSetTests =
  (prefix: string, entries: Array<[string, ResponseMessage]>) => (): void => {
    const field_format = new RegExp(`^${prefix.toUpperCase()}_([0-9]+)$`);
    const code_format = new RegExp(`^${prefix.toLowerCase()}.([0-9]+)$`);

    it('All field names should be formatted properly', async () => {
      entries.forEach(([field]) => {
        expect(
          field_format.test(field),
          `The field name "${field}" must start with "${prefix.toUpperCase()}_" followed by a number.`,
        ).to.be.true;
      });
    });

    it('All codes should be formatted properly', async () => {
      entries.forEach(([, { code }]) => {
        expect(
          code_format.test(code),
          `The code "${code}" must start with "${prefix.toLowerCase()}." followed by a number.`,
        ).to.be.true;
      });
    });

    it('All messages should have a code number that matches number in the field name', async () => {
      entries.forEach(([field, { code }]) => {
        const field_matches = field.match(field_format);
        const field_number = field_matches ? field_matches[1] : '';

        const code_matches = code.match(code_format);
        const code_number = code_matches ? code_matches[1] : '';

        expect(field_number).to.equal(
          code_number,
          `The number in code "${code}" does not match the number in the field name "${field}".`,
        );
      });
    });
  };
