# Ember Schema App

Ember Schema App is a schema-driven UI toolkit for Ember applications. It lets you describe resources, fields, forms, tables, and navigation as schema data, then render consistent UI from those descriptions instead of hand-building every screen.

The project is useful when an application has many resource types that share the same patterns. Instead of repeating labels, field layouts, tables, filters, and forms for each resource, one schema registration can drive all of those surfaces. Apps can adopt the complete schema-aware layer or use the schema-free UI primitives on their own.

## What it provides

- **Schema contracts** — resource metadata, display metadata, field shapes, and taxonomy types that can be shared without depending on Ember.
- **Schema-free primitives** — presentation, interaction, and accessibility building blocks that know nothing about resources or application models.
- **Schema-aware components** — field display, forms, tables, and navigation that compose the primitives from schema metadata.
- **Consumer-owned registries** — applications supply their own schemas, labels, renderers, tables, and actions instead of inheriting another application’s domain.

## Packages

| Package                      | Directory               | Responsibility                                              |
| ---------------------------- | ----------------------- | ----------------------------------------------------------- |
| `@ember-schema/schema`       | `packages/schema`       | Schema contracts and resource metadata types.               |
| `@ember-schema/ember-ui`     | `packages/ember-ui`     | Schema-free Ember presentation primitives.                  |
| `@ember-schema/ember-schema` | `packages/ember-schema` | Schema-aware field, form, table, and navigation components. |

`@ember-schema/ember-ui` is independently consumable and does not depend on the schema packages. `@ember-schema/ember-schema` composes the schema contracts with the base UI.

`apps/demo` is a sample Ember application that shows the packages working together. It is not a published package and is not part of the library API.

## Development

The repository owns its toolchain through `mise`. Node, pnpm, and the development container are pinned by the repository.

```sh
mise run install
mise run build
mise run typecheck
mise run lint
mise run format:check
mise run test
```

Run the sample application at `http://localhost:4200`:

```sh
mise run dev
```

All dependency and build commands run inside the repository container. Do not install dependencies on the host or create host `node_modules`.

## Documentation

- [Package responsibilities](docs/packages.md)
- [Style contract](docs/style-contract.md)
- [Documentation rules](docs/README.md)

## Status

The repository is under active development. The packages are private and have not been published.

## License

MIT. See [LICENSE](LICENSE).
