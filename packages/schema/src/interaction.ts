export interface InteractionSurfaceGroup<TLeaf> {
  readonly items: readonly (InteractionSurfaceGroup<TLeaf> | InteractionSurfaceSubmenu<TLeaf> | TLeaf)[];
  readonly key: string;
  readonly kind: 'group';
  readonly label?: string;
}

export interface InteractionSurfaceSubmenu<TItem> {
  readonly items: readonly TItem[];
  readonly key: string;
  readonly kind: 'submenu';
  readonly label: string;
}

export interface ActionLeaf<TAction> {
  readonly action: TAction;
  readonly disabledReason?: string;
  readonly isDisabled: boolean;
  readonly key: string;
  readonly kind: 'action';
  readonly label: string;
}

export interface LinkLeaf<TLink> {
  readonly key: string;
  readonly kind: 'link';
  readonly label: string;
  readonly link: TLink;
}

export type InteractionSurfaceActionTree<TAction> =
  | ActionLeaf<TAction>
  | InteractionSurfaceGroup<ActionLeaf<TAction>>
  | InteractionSurfaceSubmenu<InteractionSurfaceActionTree<TAction>>;

export type InteractionSurfaceLinkTree<TLink> =
  | InteractionSurfaceGroup<LinkLeaf<TLink>>
  | InteractionSurfaceSubmenu<InteractionSurfaceLinkTree<TLink>>
  | LinkLeaf<TLink>;
