export function partitionBy<T>(
  list: readonly T[],
  getKey: (item: Readonly<T>) => string,
): Record<string, T[]>;
export function partitionBy<T, R>(
  list: readonly T[],
  getKey: (item: Readonly<T>) => string,
  map: (item: Readonly<T>) => R,
): Record<string, R[]>;

export function partitionBy<T, R = T>(
  list: readonly T[],
  getKey: (item: Readonly<T>) => string,
  map?: (item: Readonly<T>) => R,
): Record<string, (R | T)[] | undefined> {
  const output: Record<string, (R | T)[] | undefined> = {};

  for (const item of list) {
    const key = getKey(item);
    const final_item = map ? map(item) : item;
    const partition = output[key];

    if (partition) {
      partition.push(final_item);
    } else {
      output[key] = [final_item];
    }
  }
  return output;
}

export function partitionByMap<T>(
  list: readonly T[],
  getKey: (item: T) => string,
): Map<string, T[]>;
export function partitionByMap<T, R>(
  list: readonly T[],
  getKey: (item: T) => string,
  map: (item: T) => R,
): Map<string, R[]>;

export function partitionByMap<T, R = T>(
  list: readonly T[],
  getKey: (item: T) => string,
  map?: (item: T) => R,
): Map<string, (R | T)[]> {
  const output = new Map<string, (R | T)[]>();

  for (const item of list) {
    const key = getKey(item);
    const final_item = map ? map(item) : item;
    const partition = output.get(key);

    if (partition) {
      partition.push(final_item);
    } else {
      output.set(key, [final_item]);
    }
  }

  return output;
}
