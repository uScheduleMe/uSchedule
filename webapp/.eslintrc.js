module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  extends: [
    // Uses the recommended rules from @eslint-plugin-react
    'plugin:react/recommended',
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended',
    // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended',
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",

    /**
     * Javascript Rules
     */
    // Consistent block style
    curly: 'error',
    // *Yoda voice* Nullified with eslint any benefits of this are.
    yoda: ['error', 'never', { exceptRange: true }],
    // Prevents applying non atomic updates (race condition risk otherwise) i.e. c += await foo();
    'require-atomic-updates': 'error',
    // Prevents forgetting return in array callbacks! Common mistake
    'array-callback-return': 'error',
    // require default case. Also provides regex for override comment
    'default-case': ['error', { commentPattern: '^skip\\sdefault' }],
    // Require type-safe equality check, cuz, you know we're in typescript land here!
    eqeqeq: 'error',
    // why are you using alert() >:(
    'no-alert': 'error',
    // deprecated function use.
    'no-caller': 'error',
    // constructors don't need returns
    'no-constructor-return': 'error',
    // Basically don't need an elseif (return;) or else(return) following an if(return) as it already exits control flow.
    'no-else-return': ['error', { allowElseIf: false }],
    // Be explicit with nulls! No == null please!
    'no-eq-null': 'error',
    // Security risk!! We do not need eval!
    'no-eval': 'error',
    // Again this is also a security risk we are blocking. We do not need to execute any of these blocked cases.
    'no-implied-eval': 'error',
    // Realistically our use case for bind should be low. However in the cases we 'think' we need it we should check if we actually do.
    'no-extra-bind': 'error',
    // Floating decimal values i.e. .5 and 2. hurt readability. Prefer 0.5 or 2.0
    'no-floating-decimal': 'error',
    // __iterator__ is an obsolete property
    'no-iterator': 'error',
    // We're in 2020, do you think we need 'go to'-esque labels?
    'no-labels': 'error',
    // Actually a low-key security risk as well, also horrible debugging experience... We shouldn't need to use it for our app.
    'no-new-func': 'error',
    // Usually a mistake
    'no-param-reassign': 'error',
    // Deprecated as of ES 3.1 shouldn't need it!
    'no-proto': 'error',
    // Return assignments are very hard on the eyes! If you need to do return foo = 2; wrap it like so return (foo = 2).
    'no-return-assign': 'error',
    // Did you guess that this is a security risk? If so bingo! javascript: is basically just as dangerous as eval.
    'no-script-url': 'error',
    // The only valid use case for this can be covered with Number.isNan(). If you do have a use case not covered I'm curious to know.
    'no-self-compare': 'error',
    // Tends to obscure what code is actually doing. Parenthesis seem to be able to override it if needed (or eslint comment of course).
    'no-sequences': 'error',
    // This rule tries its best to not let us throw literals (why are you throwing 0 >:()! Theres ways around it but please avoid it if you can.
    'no-throw-literal': 'error',
    // We usually want to modify the condition of our loop. If you do need an infinite loop just throw an eslint disable comment near your use.
    'no-unmodified-loop-condition': 'error',
    // Our use-case probably doesn't need the call function but if it does in the future we want to ensure we aren't applying it for no reason!
    'no-useless-call': 'error',
    // Usually a byproduct of refactoring, we shouldn't need to do the following: 'a' + 'b' when we can just do 'ab'.
    'no-useless-concat': 'error',
    // Useless returns clutter up our code.
    'no-useless-return': 'error',
    // Can lead to unexpected behaviour. If we feel we need to override this lets talk about it during PR review!
    'no-delete-var': 'error',
    // We really do not need duplicate imports, if you do import x from y, then import z from y, prefer to do import x, z, from y.
    'no-duplicate-imports': 'error',
    // Imported config makes these warnings, upgrade to error
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    // Basically prevents us from computing a key when not necessary such as when we use string literals inside of an object.
    'no-useless-computed-key': 'error',
    // Look you do not need to say import { foo as foo } or const { foo: foo } = bar; If for some reason you do please share with the group.
    'no-useless-rename': 'error',
    // The uses for var are very miniscule, and the risks far outweigh the pros of leaving allowing this. You can manually disable on your line if needed.
    'no-var': 'error',
    // Enforces object literal shorthand. I.e. no need to do {a: a, b: 'foo'}, when you can do { a, b: 'foo' }.
    'object-shorthand': ['error', 'always'],
    // If a value isn't being reassigned CONST IT UP!! It will prevent errors in the future.
    'prefer-const': 'error',
    // For variadic function params please use the rest operator. Much cleaner.
    'prefer-rest-params': 'error',
    // For variadic function arguments, use the spread operator over Function.prototype.call. Again much cleaner.
    'prefer-spread': 'error',
    // Prefer template strings to string concatenation. It is the better way to do things.
    'prefer-template': 'error',

    /**
     * Typescript Rules
     */
    // No magic numbers unless you have a license in witchcraft and wizardry signed by Albus Dumbledore himself.
    '@typescript-eslint/no-magic-numbers': [
      'error',
      {
        ignoreEnums: true,
        ignoreTypeIndexes: true,
        ignoreNumericLiteralTypes: true,
        ignoreReadonlyClassProperties: true,
        ignore: [-1, 0, 1],
      },
    ],
    // Keep our code clean one step at a time by not having useless empty constructors!!!
    '@typescript-eslint/no-useless-constructor': 'error',
    // Prefer to use interfaces to define object types i.e. interface Foo { bar, bazz } over type Foo = { bar, bazz };
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    // Can be dangerous, and inefficient in many cases, so we disallow it.
    '@typescript-eslint/no-dynamic-delete': 'error',
    // NOTE: This is only temporary until we get everything set up. We should light this up after (it is on by default so just remove the rule).
    '@typescript-eslint/no-empty-interface': 'off',
    // Cleans our code up by only letting us do the minimum level of non-null assertions.
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    // Inherited, we do not need this as we are modeling with the api.
    '@typescript-eslint/camelcase': 'off',
    // Always put types for consistency
    '@typescript-eslint/no-inferrable-types': 'off',
    // best practice to have param = someDefaultValue at end of function (use the typescript version of this rule to enable optional support)
    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': 'error',
  },
};
