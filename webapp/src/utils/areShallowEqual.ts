// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const areShallowEqual = (a: any, b: any): boolean => {
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }
  if (!a || !b) {
    return false;
  }
  for (const key in a) {
    if (!(key in b) || a[key] !== b[key]) {
      return false;
    }
  }
  for (const key in b) {
    if (!(key in a) || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};

// If always using objects with the same keys, use this
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const areShallowEqualSimple = (a: any, b: any): boolean => {
  for (const key in a) {
    if (!(key in b) || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};
