# Package responsibilities

The workspace is one repository with three packages and a synthetic demo. The packages are independently consumable; the demo is not part of any package.

## `@ember-schema/schema`

Framework-neutral contracts for schema-driven UI. It owns field descriptor contracts, display metadata, inference seams, form descriptors, interaction-surface containers, and registry interfaces. It does not import Ember, Glimmer, a store, a router, or concrete application models.

## `@ember-schema/ui`

Schema-free Ember presentation primitives. It owns buttons, layout, overlays, form controls, trees, lists, pagination, and interaction/accessibility behavior. It does not depend on the schema or ember packages, resource registries, a store, a router, or a private application stylesheet.

## `@ember-schema/ember`

Schema-aware Ember components and service contracts. It composes `@ember-schema/ui` with `@ember-schema/schema` for field display, forms, tables, and navigation. Concrete schemas, labels, taxonomy, routable resources, field renderers, tables, actions, and the application store remain consumer-supplied.

## Demo

`apps/demo` is a synthetic Ember application. It uses an `author`, `post`, and `comment`-style fixture set in later phases and proves package-name consumption. It is not published and must not become a dependency of any package.

## Dependency direction

```text
demo → @ember-schema/ember → @ember-schema/schema
demo → @ember-schema/ember → @ember-schema/ui
demo → @ember-schema/ui
demo → @ember-schema/schema
```

`@ember-schema/ui` never depends on `@ember-schema/schema` or `@ember-schema/ember`.
