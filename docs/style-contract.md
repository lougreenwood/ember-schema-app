# Style contract (draft)

**Status**: Draft. No add-on CSS or runtime style registration ships yet. This contract records the intended consumer boundary for the primitives phase; it is not evidence that the styles work.

## Ownership

- `@ember-schema/ui` owns the base primitive classes and any component-local CSS it ships under `dist/`.
- `@ember-schema/ember` owns schema-composition classes and any CSS it ships under `dist/`.
- The demo owns its application stylesheet and must not import an application-specific theme from another repository.
- Frontile remains a consumer-visible dependency. The packages must not hide a private copy of its theme.

## Consumer stylesheet sources

A consumer stylesheet scans the package output and the Frontile sources:

```css
@source "node_modules/frontile";
@source "node_modules/@frontile/theme";
@source "node_modules/@ember-schema/ui/dist";
@source "node_modules/@ember-schema/ember/dist";
```

The exact Frontile package paths must be rechecked against the pinned release when the primitives are copied. A packaged consumer is responsible for installing the Frontile and Ember Schema packages; workspace-only resolution is not part of the contract.

## Theme tokens and variants

The intended theme contract requires these tokens:

- `--text-2xs`
- `--text-3xs`
- `--animate-swing`

The theme also needs a custom `dark` variant. The consumer supplies the token values; the packages provide the class names and component variants that use them.

## Runtime registration

The primitives phase will add a `registerCustomStyles` module and document its import point. The module will register the package’s Frontile/Tailwind customizations once at application boot. Until that module exists, consumers must not assume that the package registers styles automatically.

## Acceptance still to be proven

- A migrated surface-equivalent button, selected toggle, tab bar, error popover using `text-2xs`, and a `dark:` utility appear in emitted consumer CSS.
- The custom styles are registered at runtime through the documented import point.
- A packed consumer, not only the workspace demo, emits the expected CSS.
- No add-on imports an application stylesheet or depends on a private theme package.

The first implementation and assertions belong to the primitives phase, after the Frontile 0.18.3 compatibility gate.
