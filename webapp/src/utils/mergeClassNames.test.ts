import { mergeClassNames } from './mergeClassNames';

describe('Validate mergeClassNames', () => {
  it('should handle no inputs', () => {
    expect(mergeClassNames()).toBe('');
  });

  it('should handle falsy inputs', () => {
    expect(mergeClassNames(undefined)).toBe('');
    expect(mergeClassNames('')).toBe('');
  });

  it('should handle one inputs', () => {
    expect(mergeClassNames('class1')).toBe('class1');
    expect(mergeClassNames('class1 class2')).toBe('class1 class2');
  });

  it('should handle multiple inputs', () => {
    expect(mergeClassNames('class1', '', 'class2')).toBe('class1 class2');
    expect(mergeClassNames('class1', 'class2', '', undefined)).toBe('class1 class2');
    expect(mergeClassNames('', undefined)).toBe('');
  });

  it('should remove duplicates', () => {
    expect(mergeClassNames('class1', 'class2', 'class1')).toBe('class1 class2');
  });
});
