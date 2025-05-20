/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  extends: ['plugin:i18n-json/recommended'],
  rules: {
    /**
     * i18n-json Rules
     */

    // Make sure the translation files are valid JSON
    'i18n-json/valid-json': 'error',

    // Recursively sort the keys in the translation files alphabetically
    'i18n-json/sorted-keys': ['error', { order: 'asc', indentSpaces: 2 }],

    // Check the syntax of the translated strings
    // The below seems to work but it works in addition to built-in rules, so arrays fail.
    //    More research required to get the custom validator working.
    // 'i18n-json/valid-message-syntax': [
    //   'error',
    //   { syntax: path.resolve('src/translations/i18n-syntax-validator.js') },
    // ],
    'i18n-json/valid-message-syntax': 'off',

    // Set the reference translation file to make sure the others have the same structure as it does
    'i18n-json/identical-keys': ['error', { filePath: path.resolve('src/translations/en.json') }],
  },
};
