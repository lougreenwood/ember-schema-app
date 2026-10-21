# Ember Schema App

Schema-driven Ember UI packages and a synthetic demo application.

## Status

Foundation verified. The package relationships, build pipeline, container, and service override pass their checks before the schema surface is copied. Nothing is published; the style runtime and date/number translation setup are later-phase work.

## Packages

| Workspace                                  | Purpose                                              |
| ------------------------------------------ | ---------------------------------------------------- |
| `packages/schema` (`@ember-schema/schema`) | Framework-neutral schema contracts.                  |
| `packages/ui` (`@ember-schema/ui`)         | Schema-free Ember presentation primitives.           |
| `packages/ember` (`@ember-schema/ember`)   | Schema-aware components and service contracts.       |
| `apps/demo`                                | Synthetic Ember consumer used for integration tests. |

The dependency direction is `apps/demo → @ember-schema/ember → @ember-schema/schema`, `apps/demo → @ember-schema/ember → @ember-schema/ui`, and `apps/demo → @ember-schema/ui`. `@ember-schema/ui` does not depend on either other package.

See [package responsibilities](docs/packages.md) for the ownership boundary and [the style contract](docs/style-contract.md) for the current draft of consumer styling requirements. The style contract is not yet implemented.

## Development

The repository owns its toolchain through `mise` and its container definition in `compose.yaml` and `.devcontainer/`.

```sh
mise run container:up
mise run install
mise run build
mise run test
```

The common checks run inside the repository container:

```sh
mise run build
mise run typecheck
mise run lint
mise run format:check
```

Start the demo with `mise run dev` after the repository has been installed.

## License

MIT. See `LICENSE`.
