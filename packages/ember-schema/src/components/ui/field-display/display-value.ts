/**
 * Conversion helpers for values resolved by `readFieldValue`.
 *
 * `readFieldValue` deliberately returns `unknown` because the shape of a field value is only known at render time. These
 * helpers turn that `unknown` into the concrete types the display components accept, while keeping the rendered output
 * equivalent to a plain template interpolation.
 */

/**
 * Render a resolved field value as text.
 *
 * Scalars are returned unchanged so numbers and booleans keep their native formatting rules; everything else falls
 * back to `String()` (the same coercion a template interpolation performs).
 */
export function toDisplayText(value: unknown): string {
  if (typeof value === 'string') return value;

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  if (value === undefined) return '';

  return String(value);
}

/**
 * Narrow a resolved field value to a `Date`.
 *
 * Values that are not `Date` instances are treated as absent; date display components have no meaningful way to render
 * them.
 */
export function toDisplayDate(value: unknown): Date | undefined {
  return value instanceof Date ? value : undefined;
}
