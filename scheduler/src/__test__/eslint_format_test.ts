/* eslint-disable typescript-enum/no-enum */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/method-signature-style */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable unused-imports/no-unused-vars */

/**
 * Comment out the line below to cause errors in this file (for testing purposes)
 */
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Should be UPPER_CASE
 */
// Error
const is_boolean_test = true;
const string_test = 'test';
const number_test = 3;
const otherTest = 3;
const OtherTest = 3;
const BOOLEAN_TEST = true;
const _STRING_TEST = 'test';
const STRING_TEST_ = 'test';
// OK
const IS_BOOLEAN_TEST = true;
const STRING_TEST = 'test';
const NUMBER_TEST = 3;

/**
 * Can be either capital or snake
 */
// Error
const objectTest = {};
const ObjectTest = {};
const arrayTest = [];
const ArrayTest = [];
const _object_test = {};
const object_test_ = {};
// OK
const object_test = {};
const OBJECT_TEST = {};
const array_test = [];
const ARRAY_TEST = [];

/**
 * Functions should be strict camel case
 */
// Error
const func_name = () => undefined;
const func_name_2 = function () {};
function func_name_3() {}
const FUNC_NAME = () => undefined;
const FUNC_NAME_2 = function () {};
function FUNC_NAME_3() {}
const FuncName = () => undefined;
const FuncName2 = function () {};
function FuncName3() {}
// OK
const funcName = () => undefined;
const funcName2 = function () {};
function funcName3() {}

// Not top-level stuff
{
  // Error
  const otherTest = 3;
  const OtherTest = 3;
  const BOOLEAN_TEST = true;
  const _STRING_TEST = 'test';
  const STRING_TEST_ = 'test';
  const is_MIXED_BOOLEAN = true;
  const IS_mixed_boolean = true;
  // OK
  const is_boolean_test = true;
  const string_test = 'test';
  const number_test = 3;
  const IS_BOOLEAN_TEST = true;
  const STRING_TEST = 'test';
  const NUMBER_TEST = 3;

  // Error
  const objectTest = {};
  const ObjectTest = {};
  const arrayTest = [];
  const ArrayTest = [];
  const _object_test = {};
  const object_test_ = {};
  // OK
  const object_test = {};
  const OBJECT_TEST = {};
  const array_test = [];
  const ARRAY_TEST = [];

  // Error
  const func_name = () => undefined;
  const func_name_2 = function () {};
  function func_name_3() {}
  const FUNC_NAME = () => undefined;
  const FUNC_NAME_2 = function () {};
  function FUNC_NAME_3() {}
  const FuncName = () => undefined;
  const FuncName2 = function () {};
  function FuncName3() {}
  // OK
  const funcName = () => undefined;
  const funcName2 = function () {};
  function funcName3() {}
}

/**
 * Enum members should be UPPER_CASE
 */
enum MyEnum {
  // Error
  var_test = 'value1',
  varTest = 'value2',
  VarTest = 'value3',
  _VAR_TEST = 'value4',
  VAR_TEST_ = 'value5',
  // OK
  VAR_TEST = 'value6',
}

class MyClass {
  // Error
  public testVar1 = 'string';
  protected testVar2 = 'string';
  private readonly testVar3 = 'string';
  private readonly test_var3 = 'string';
  readonly test_r = 'string';
  my_func = () => {};
  MY_FUNC = () => {};
  MyFunc = () => {};
  myFUNC = () => {};
  my_method() {}
  MY_METHOD() {}
  MyMethod() {}
  myMETHOD() {}
  set myGetSet(val: string) {}
  get myGetSet(): string {
    return '';
  }
  // OK
  public TEST_VAR1 = 'string';
  public test_var1 = 'string';
  protected test_var2 = 'string';
  private readonly _test_var3 = 'string';
  readonly TEST_R = 'string';
  myFunc = () => {};
  myMethod() {}
  set my_get_set(val: string) {}
  get my_get_set(): string {
    return '';
  }
}

interface MyInterface {
  // Error
  readonly test_var1: string;
  testVar2: string;
  TestVar2: string;
  my_func: () => void;
  MY_FUNC: () => void;
  MyFunc: () => void;
  myFUNC: () => void;
  MyMethod(): void;
  my_method(): void;
  MY_METHOD(): void;
  testBool: boolean;
  test_bool: boolean;
  TEST_BOOL: boolean;
  IS_test_bool: boolean;
  is_TEST_BOOL: boolean;
  // OK
  readonly TEST_VAR1: string;
  test_var2: string;
  TEST_VAR2: string;
  meFunc: () => void;
  myMethod(): void;
  is_test_bool: boolean;
  IS_TEST_BOOL: boolean;
}

const object_literal = {
  // OK
  test_func: () => undefined,
  test_func2: function () {},
  test_method() {},
  TestFunc: () => undefined,
  TestFunc2: function () {},
  TestMethod() {},
  testVar: '',
  TestVar: '',
  test_bool: true,
  test_var: '',
  TEST_VAR: '',
  is_bool: true,
  testFunc: () => undefined,
  testFunc2: function () {},
  testMethod() {},
};

// Not top-level destructuring
{
  const {
    // OK
    test_func,
    test_method,
    TestFunc,
    TestMethod,
    test_var,
    testVar,
    TestVar,
    TEST_VAR,
    testFunc,
    testMethod,
  } = object_literal;
}

const {
  // OK
  test_func,
  test_method,
  TestFunc,
  TestMethod,
  test_var,
  testVar,
  TestVar,
  TEST_VAR,
  testFunc,
  testMethod,
} = object_literal;

function paramTest(
  // Error
  strBad: string,
  NumBad: string,
  bad_bool: boolean,
  _badBool: boolean,
  unused: number,
  unused_bool: boolean,
  _unused_bool: boolean,
  _UNUSED_BOOL: boolean,
  is_unused: boolean,
  IS_UNUSED: boolean,
  a_fun: () => void,
  _unused_fun: () => void,
  // OK
  string: string,
  num_var: number,
  NUM_VAR: number,
  is_good: boolean,
  _unused: string,
  _is_unused: boolean,
  _IS_UNUSED: boolean,
  _unused_num: number,
  aFun: () => void,
  _unusedFun: () => void,
) {
  const ok_for_literal = { strBad, NumBad, bad_bool, a_fun };
  const ok = { string, num_var, NUM_VAR, is_good, aFun };
}
