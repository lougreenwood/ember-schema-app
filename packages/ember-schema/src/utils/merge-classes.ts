import { twMerge } from '@frontile/theme';

/**
 * Recursive classes hash type supporting arbitrary nesting.
 *
 * Values can be:
 *
 * - `string | undefined` for leaf nodes (actual class strings)
 * - `ClassesHash` for nested component slots
 */
export type ClassesHash = {
  [key: string]: ClassesHash | string | undefined;
};

/**
 * Compose multiple base class strings and an optional override into a single Tailwind-aware string.
 *
 * `base` values are joined in order, then merged with `override` so conflicting classes in the override win
 * deterministically.
 */
export function mergeClassStrings(base: (string | undefined)[], override?: string): string {
  const joinedBase = base.filter((value): value is string => Boolean(value)).join(' ');

  if (override === undefined || override === '') {
    return joinedBase;
  }

  return twMerge(joinedBase, override) ?? joinedBase;
}

/**
 * Recursively merges two ClassesHash objects, using Tailwind Merge for string values. The second object's values
 * override the first, with proper Tailwind class deduplication and conflict resolution.
 */
export function mergeClasses<T extends object>(defaults: T | undefined, overrides: Partial<T> | undefined): T {
  if (defaults === undefined && overrides === undefined) {
    return {} as T;
  }

  if (defaults === undefined) {
    return (overrides ?? {}) as T;
  }

  if (overrides === undefined) {
    return defaults;
  }

  const result: ClassesHash = {};
  const defaultsHash = defaults as ClassesHash;
  const overridesHash = overrides as ClassesHash;
  const allKeys = new Set([...Object.keys(defaultsHash), ...Object.keys(overridesHash)]);

  allKeys.forEach((key) => {
    const defaultValue = defaultsHash[key];
    const overrideValue = overridesHash[key];

    if (defaultValue === undefined && overrideValue === undefined) {
      return;
    }

    if (isNestedClasses(defaultValue) || isNestedClasses(overrideValue)) {
      const nestedDefault = isNestedClasses(defaultValue) ? defaultValue : undefined;
      const nestedOverride = isNestedClasses(overrideValue) ? overrideValue : undefined;
      result[key] = mergeClasses(nestedDefault, nestedOverride);
      return;
    }

    const defaultString = typeof defaultValue === 'string' ? defaultValue : undefined;
    const overrideString = typeof overrideValue === 'string' ? overrideValue : undefined;

    result[key] = mergeClassStrings([defaultString], overrideString) || undefined;
  });

  return result as T;
}

function isNestedClasses(value: ClassesHash | string | undefined): value is ClassesHash {
  return typeof value === 'object' && value !== undefined;
}
