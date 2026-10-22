import type { Merge, MergeDeep } from 'type-fest';

/**
 * Extends a base Glimmer component signature with custom Args, Blocks, and/or Element.
 *
 * Uses `MergeDeep` from type-fest for Args, custom `MergeBlocks` for Blocks to properly merge tuple contents, and
 * simple override for Element.
 *
 * @example
 *
 * ```ts
 * // Base button signature
 * interface ButtonSignature {
 *   Args: { label?: string; onPress?: () => void };
 *   Blocks: { default: [{ Label: ComponentLike }] };
 *   Element: HTMLButtonElement;
 * }
 *
 * // LinkButton extends with route args and changes Element
 * type LinkButtonSignature = ExtendSignature<
 *   ButtonSignature,
 *   {
 *     Args: { route: string; model?: unknown };
 *     Element: HTMLAnchorElement;
 *   }
 * >;
 *
 * // ToggleButton adds isSelected arg
 * type ToggleButtonSignature = ExtendSignature<
 *   ButtonSignature,
 *   {
 *     Args: { isSelected?: boolean; onChange?: (isSelected: boolean) => void };
 *   }
 * >;
 * ```
 *
 * @template TBase - The base signature to extend
 * @template TExtension - Partial extension with Args, Blocks, and/or Element to merge
 */
export type ExtendSignature<TBase extends GlimmerSignature, TExtension extends SignatureExtension> = {
  Args: TExtension['Args'] extends object ? MergeDeep<TBase['Args'], TExtension['Args']> : TBase['Args'];
  Blocks: TExtension['Blocks'] extends Record<string, undefined | unknown[]>
    ? MergeBlocks<TBase['Blocks'], TExtension['Blocks']>
    : TBase['Blocks'];
  Element: TExtension['Element'] extends Element ? TExtension['Element'] : TBase['Element'];
};

/**
 * Merges two complete Glimmer component signatures into one.
 *
 * Use this when a component composes two existing components and its signature must represent the union of both. The
 * second signature's Args, Blocks, and Element override/merge into the first using the same rules as
 * `ExtendSignature`.
 *
 * Use `ExtendSignature` afterward to further extend the merged result with component-specific additions or overrides.
 *
 * @example
 *
 * ```ts
 * // PanelSectionRenderer wraps both Panel and DefaultSection (via BaseSectionRendererSignature).
 * // Merge both bases first, then extend with the Element override.
 * type PanelSectionRendererSignature = ExtendSignature<
 *   MergeSignatures<BaseSectionRendererSignature, PanelSignature>,
 *   { Element: HTMLDivElement }
 * >;
 * ```
 *
 * @template TBase - The primary base signature
 * @template TOther - The secondary signature to merge in
 */
export type MergeSignatures<TBase extends GlimmerSignature, TOther extends GlimmerSignature> = ExtendSignature<
  TBase,
  TOther
>;

/**
 * Base interface for Glimmer component signatures.
 *
 * All Glimmer components follow this structure:
 *
 * - Args: Named arguments passed to the component
 * - Blocks: Named blocks (slots) the component accepts
 * - Element: The root DOM element type
 */
export interface GlimmerSignature {
  Args: object;
  Blocks: Record<string, undefined | unknown[]>;
  Element: Element;
}

/**
 * Extension shape for customizing a base signature.
 *
 * All fields are optional - only specify what you want to override/extend.
 */
export interface SignatureExtension {
  Args?: object;
  Blocks?: Record<string, undefined | unknown[]>;
  Element?: Element;
}

/**
 * Merges two block definitions, combining tuple elements at each position.
 *
 * For blocks that exist in both base and extension, merges the objects at each tuple index. For blocks that exist in
 * only one, takes that value directly.
 */
type MergeBlocks<
  TBase extends Record<string, undefined | unknown[]>,
  TExtension extends Record<string, undefined | unknown[]>,
> = {
  // Keys in both - merge tuple elements
  [K in keyof TBase & keyof TExtension]: MergeBlockTuple<TBase[K], TExtension[K]>;
} & {
  // Keys only in TBase
  [K in keyof TBase as K extends keyof TExtension ? never : K]: TBase[K];
} & {
  // Keys only in TExtension
  [K in keyof TExtension as K extends keyof TBase ? never : K]: TExtension[K];
};

/**
 * Merges two block tuples by merging objects at each position.
 *
 * Uses a conditional approach to preserve tuple structure:
 *
 * - For single-element tuples (most common): directly construct [Merge<A, B>]
 * - For empty tuples: return []
 * - Fallback: extension replaces base (avoids mapped type producing object)
 */
type MergeBlockTuple<TBase, TExtension> = TBase extends readonly [infer TBaseFirst]
  ? TExtension extends readonly [infer TExtFirst]
    ? [Merge<object & TBaseFirst, object & TExtFirst>]
    : TBase
  : TBase extends readonly []
    ? TExtension extends readonly []
      ? []
      : TExtension
    : TExtension extends unknown[]
      ? TExtension // For complex cases, extension wins (preserves tuple type)
      : TBase;
