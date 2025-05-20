module.exports = {
  extends: './.eslintrc.cjs',
  rules: {
    // The following rules are auto-fixed, but really annoying when they run on save
    // with work-in-progress. They can be run on the pre-commit hook instead (and caught in the
    // CI pipeline if someone forgets or disables the hooks)

    'unused-imports/no-unused-imports': 'off',
    '@typescript-eslint/prefer-readonly': 'off',
  },
};
