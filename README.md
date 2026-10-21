# Ember Schema App

**Define a resource once. Render its UI everywhere.**

Ember Schema App is a schema-driven UI layer for resource-heavy Ember applications. Instead of rebuilding a detail panel, a form, a table, filters, and a navigation entry for every resource type, an application registers the resource’s metadata once and lets shared, typed surfaces render it.

It is built for applications where the number of resource types keeps growing: admin tools, back-office systems, internal platforms, trading dashboards, and any Ember app backed by many JSON:API or WarpDrive resources.

## The problem

A CRUD screen is easy to build once. The cost appears when the application has twenty resources.

| Concern       | Hand-built per resource                              | With schema-driven UI                         |
| ------------- | ---------------------------------------------------- | --------------------------------------------- |
| Detail fields | A bespoke field layout and labels                    | Shared field display driven by metadata       |
| Tables        | Repeated column definitions, filters, and formatting | Inferred columns with explicit overrides      |
| Forms         | Repeated field markup and validation wiring          | Descriptor-driven forms with shared controls  |
| Navigation    | A manually maintained menu entry                     | Taxonomy and route metadata drive the menu    |
| Consistency   | Every screen can drift independently                 | One schema change reaches every surface       |
| New resource  | New components for each surface                      | Register metadata; the shared surfaces appear |

The repetition is not the only cost. The real cost is drift: a field is renamed in one table, a label changes in one form, a relationship disappears from one detail panel, and no single place explains what the resource’s UI is supposed to be.

## The idea

The schema is the source of truth for the resource’s presentation metadata. The packages interpret that metadata; the application owns the resource and its domain-specific rendering.

- **Schema contracts** describe resources, fields, display metadata, and taxonomy without depending on Ember.
- **Schema-free primitives** provide the buttons, overlays, fields, tables, and interaction behavior.
- **Schema-aware components** compose those primitives from the schema: field display, forms, tables, and navigation.
- **Consumer registries** let the application supply domain renderers, concrete tables, actions, and labels. The packages provide the mechanism; the application provides the policy.

This is not a page builder, a form generator bolted onto a component library, or a replacement for Ember’s component model. It is a typed interpretation layer between resource metadata and ordinary Ember components.

## Why the separation matters

Most schema-driven UI libraries blur three concerns: data, presentation, and application policy. That works until a consumer needs a different renderer, a different table, or a different field type.

Ember Schema App separates them so each can change independently:

| Package                          | Responsibility                                  | Can be used alone                |
| -------------------------------- | ----------------------------------------------- | -------------------------------- |
| `@ember-schema-app/schema`       | Resource and display metadata contracts         | Yes — no Ember dependency        |
| `@ember-schema-app/ember-ui`     | Schema-free presentation primitives             | Yes — no schema dependency       |
| `@ember-schema-app/ember-schema` | Field, form, table, and navigation compositions | Yes, with the two packages above |

This means a team can adopt the base primitives first, add schema-driven field display later, and add forms or tables only when they need them. They are not forced into a full-stack framework to get one reusable table.

The application keeps ownership of its models, store, router, schemas, labels, domain widgets, and concrete actions. Those are application decisions, not library defaults.

## What it is for

It pays off when:

- the application has many resources that share the same presentation patterns;
- new resources should get usable detail, form, table, and navigation surfaces quickly;
- different parts of the application need the same labels and field metadata;
- domain-specific renderers must coexist with generic defaults;
- a backend or schema source already describes resources and the frontend should stop duplicating that description.

It is a poor fit when the application has only a handful of bespoke screens, when every screen is intentionally unlike the others, or when there is no stable resource/schema model to interpret.

## Packages

```text
apps/demo
├── @ember-schema-app/ember-schema
│   ├── @ember-schema-app/schema
│   └── @ember-schema-app/ember-ui
└── @ember-schema-app/ember-ui
```

`apps/demo` is a sample Ember application used to exercise all three packages together. It is not part of the published library.

## Try it

The repository runs its toolchain and development container through `mise`.

```sh
mise run install
mise run dev
```

Run the checks with:

```sh
mise run build
mise run typecheck
mise run lint
mise run format:check
mise run test
```

All dependency and build commands run inside the repository container. Do not install dependencies on the host.

## Learn more

- [Package responsibilities](docs/packages.md)
- [Style contract](docs/style-contract.md)
- [Documentation rules](docs/README.md)

## Status

The packages are under active development and are not yet published. The repository currently proves the package boundaries and service seams; the schema-aware surfaces are being filled in.

## License

MIT. See [LICENSE](LICENSE).
