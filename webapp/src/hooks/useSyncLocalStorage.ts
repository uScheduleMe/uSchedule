import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { z, ZodSchema, ZodTypeDef } from 'zod';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);

/**
 * Synchronize a state variable with local storage. Updates local storage when the state changes and
 * listens for changes to the local storage value to update the state when local storage changes.
 * @param localStorageKey the key to use for setting / getting / removing the local storage value
 * @param schema the schema for the content to serialize and store in local storage
 * @param fallbackValue the value to use if the local storage value is invalid or does not exist
 * @returns the state variable, a value setter, and a clear value helper
 */
export const useSyncLocalStorage = <T extends Json, D extends ZodTypeDef, I>(
  localStorageKey: string,
  schema: ZodSchema<T, D, I>,
  fallbackValue?: T | (() => T | undefined),
): [T | undefined, typeof setValue, typeof clearValue] => {
  const storageSchema = z.object({ value: z.unknown() });

  const parseStorageItem = (item: string | null): T | undefined => {
    try {
      const storedObject = JSON.parse(item ?? '');
      const rawValue = storageSchema.parse(storedObject).value;
      return schema.parse(rawValue);
    } catch {
      return typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;
    }
  };

  const [value, setStoredValue] = useState<T | undefined>(() =>
    parseStorageItem(window.localStorage.getItem(localStorageKey)),
  );

  const setValue: Dispatch<SetStateAction<T | undefined>> = (newValue) => {
    setStoredValue((prevValue) => {
      const resolved_value = typeof newValue === 'function' ? newValue(prevValue) : newValue;
      if (resolved_value === undefined) {
        window.localStorage.removeItem(localStorageKey);
      } else {
        window.localStorage.setItem(localStorageKey, JSON.stringify({ value: resolved_value }));
      }
      return resolved_value;
    });
  };

  const clearValue = () => setValue(undefined);

  useEffect(() => {
    const listener = (e: StorageEvent) => {
      if (e.key === localStorageKey) {
        if (!e.newValue) {
          clearValue();
        } else {
          setValue(parseStorageItem(e.newValue));
        }
      }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);

  return [value, setValue, clearValue];
};
