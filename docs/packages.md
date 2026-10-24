# Package responsibilities

The workspace is one repository with three packages and a synthetic demo. The packages are independently consumable; the demo is not part of any package.

## `@ember-schema-app/schema`

The schema package. It owns resource-schema contracts and display metadata types. It does not own field-display rendering, form, table, navigation, interaction-surface, or renderer-registry behavior; those belong to `@ember-schema-app/ember-schema`. It does not import Ember, Glimmer, a store, a router, or concrete application models.

## `@ember-schema-app/ember-ui`

Schema-free Ember presentation primitives. It currently contains `Pill`; copied primitives still coupled to the schema UI remain in `ember-schema` until their independence is proven. It does not depend on the schema or ember packages, resource registries, a store, a router, or a private application stylesheet.

## `@ember-schema-app/ember-schema`

Schema-aware Ember components and service contracts. It currently owns Section/FieldSet/Field, generic field display and required UI/error/logger support, alongside the real display-info service. Forms, tables, navigation and interaction surfaces remain to be assembled. The consuming application supplies its schema registry, labels, taxonomy, already-resolved routable entries and WarpDrive store. Runtime behavior remains unproven until the final demo phase.

The copied service is an abstract class generic over the consumer's resource-type-to-model map and icon type. A consuming application extends it, implements `schemaRegistry`, `resourceTypeLabels`, `schemaTaxonomy` and `routableSchemas`, and registers the subclass as `service:schema-display-info`. Supply that data and register the store schemas before the first lookup because resolved metadata is cached. Concrete schemas, domain field renderers, tables and actions remain consumer-supplied. The demo consumer is not yet migrated, so no consumer subclass is proven through the running demo yet.

Relationship display targets are schema-derived keys of that same resource map. The type-system roadmap covers propagating the map through field sets, display components, renderers and form/table descriptors; the current descriptor boundary already uses the map rather than widening targets to `string`.

## Demo

`apps/demo` is a synthetic Ember application. It is intended to use an `author`, `post`, and `comment`-style fixture set and prove package-name consumption in the final phase. It is mid-migration now and is not published or a dependency of any package.

## Dependency direction

```text
demo → @ember-schema-app/ember-schema → @ember-schema-app/schema
demo → @ember-schema-app/ember-schema → @ember-schema-app/ember-ui
demo → @ember-schema-app/ember-ui
demo → @ember-schema-app/schema
```

`@ember-schema-app/ember-ui` never depends on `@ember-schema-app/schema` or `@ember-schema-app/ember-schema`.
