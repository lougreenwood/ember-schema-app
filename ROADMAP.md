# Roadmap

This is the single living work register for the library: current extraction, follow-up cleanup, type work, component features, rendering fixes, splitting, verification, documentation, and future development. Update it at every material slice. Do not keep a second hidden roadmap in a local plan.

Status keys: `now` | `next` | `later` | `blocked` | `done` | `dropped`

## 1. Current baseline

- `@ember-schema-app/schema` owns the copied resource/display metadata types.
- `@ember-schema-app/ember-schema` owns the real display-info resolver and is the initial home for copied schema-aware UI and support.
- `@ember-schema-app/ember-ui` currently contains `Pill`.
- The UI support closure (buttons, collapse/disclosure, popovers, copyable, error/result handling, relative date, generic field display, Section/FieldSet) is being copied into `ember-schema` first. Type errors are accepted during this MVP assembly pass; build and runtime acceptance are tracked below.
- `apps/demo` is mid-migration and is not yet a validation gate.

MVP definition: the copied subsystem is assembled in the repository, the package build is restored, the demo can boot with consumer-owned schema data, and this roadmap records every known omission and cleanup. Type-perfect generic propagation is part of the post-MVP hardening work, not a reason to stop the copy.

## 2. Work register

### A. Extraction and repository assembly

| ID     | Status | Work                                                                                                                                                                                         | Acceptance / note                                                                      |
| ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| EXT-01 | done   | Copy the real display-info resolver with consumer-supplied registry, labels, taxonomy, routes and WarpDrive store.                                                                           | Seven public operations and private resolution helpers retained; no private catalogue. |
| EXT-02 | now    | Copy the shared UI/support closure: buttons, collapse/disclosure, popovers, copyable, error/result handling, relative date, Section/FieldSet, generic field display, vendored errors/logger. | Package source assembled; build/typecheck debt tracked in FIX-01/FIX-02.               |
| EXT-03 | next   | Copy remaining schema-aware surfaces: forms, form state, controls, tables, menus/navigation, interaction surfaces.                                                                           | Each surface copied with its actual dependency closure.                                |
| EXT-04 | next   | Replace copied domain renderers that were omitted in the first field-display slice: relationship IDs/links, currency values, serialized errors/results, claims/tracker displays.             | Restore only when their real dependencies are available; no placeholders.              |
| EXT-05 | later  | Separate proven schema-free primitives and support into `@ember-schema-app/ember-ui`.                                                                                                        | Only after the working copy proves closure; no forced splits.                          |
| EXT-06 | later  | Decide the final ownership of the vendored shared error/logger support.                                                                                                                      | Prefer a narrow reusable owner over a permanent broad vendor tree.                     |
| EXT-07 | later  | Extract the link/route/navigation adapters used by schema-aware rendering.                                                                                                                   | Consumer supplies routing policy; package must not import an application router.       |
| EXT-08 | later  | Extract concrete table/action/config registration surfaces behind consumer registries.                                                                                                       | Keep registrations out of the library.                                                 |
| EXT-09 | later  | Build the synthetic demo consumer with real schema data and real state changes.                                                                                                              | Demo is the final runtime validation surface.                                          |
| EXT-10 | later  | Pack and consume the three packages outside the workspace.                                                                                                                                   | No source aliases or workspace-only resolution.                                        |
| EXT-11 | later  | Add a clean-clone/CI consumer check.                                                                                                                                                         | Package-only checks remain distinct from demo/root checks.                             |

### B. Build and type hardening

| ID     | Status | Work                                                                                                                                                      | Acceptance / note                                                                                              |
| ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| FIX-01 | now    | Restore `@ember-schema-app/ember-schema` package typecheck/build after the UI support copy.                                                               | Build green is the MVP gate; type errors are tracked honestly.                                                 |
| FIX-02 | now    | Resolve published Frontile integration differences (component imports, button variant types, popover/floating-surface signatures) without reduced shells. | If a published API cannot support a path, record the exact omission or use a deliberate compatible dependency. |
| FIX-03 | next   | Replace remaining copied `.ts`/`.gts` internal import-extension gaps and self-package resolution issues.                                                  | Package source resolves without application aliases.                                                           |
| FIX-04 | next   | Restore any declarations/build entry that the copy exposed as missing.                                                                                    | Emitted package contains the real UI components.                                                               |
| FIX-05 | later  | Fix copied legacy error/absence/control-flow patterns under a dedicated modernization pass.                                                               | `try/catch`, `T \| undefined`, empty success collections, casts and mutable cache are recorded copy debt.      |
| FIX-06 | later  | Add cache invalidation/lifecycle semantics to display-info and engine services.                                                                           | Consumer data changes after first lookup must not leave stale labels/fields.                                   |
| FIX-07 | later  | Resolve duplicate/conflicting `@glint/template` types from Frontile dependencies.                                                                         | One compatible template type identity.                                                                         |
| FIX-08 | later  | Remove the type-only empty Rollup public chunk or make its packaging intent explicit.                                                                     | No unexplained build warning.                                                                                  |
| FIX-09 | later  | Align package manifests, app re-exports and peer dependencies with the actual copied surface.                                                             | No dead or missing re-exports.                                                                                 |

### C. Schema-derived typing and relationship types

The schema is the intermediary. Relationship targets must be keys/types derived from the schema, not widened to `string`.

| ID      | Status | Work                                                                                                                                  | Acceptance / note                                                |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| TYPE-01 | done   | Display-info service generic over consumer resource-type-to-model map and icon type.                                                  | Service retains real resolver behavior.                          |
| TYPE-02 | done   | Field descriptors generic over the resource map; relationship source carries a schema-derived resource key.                           | No plain-string relationship target in the descriptor contract.  |
| TYPE-03 | next   | Propagate the resource map through field sets, field-display components, renderer registry, renderer args and form/table descriptors. | Components expose typed schema-derived keys end-to-end.          |
| TYPE-04 | next   | Derive relationship targets from WarpDrive schema metadata rather than asserting from resolved display strings.                       | belongsTo/hasMany targets are inferred from schema definitions.  |
| TYPE-05 | next   | Type labels, taxonomy, routable entries and registry entries from the same schema source.                                             | One schema-derived type graph.                                   |
| TYPE-06 | later  | Add compile-time consumer fixtures for a real interface-based model/relationship map.                                                 | Public generic surfaces typecheck through components.            |
| TYPE-07 | later  | Remove remaining descriptor casts and broad error channels where canonical schema types exist.                                        | No local type appeasement.                                       |
| TYPE-08 | later  | Define the public schema-source contract for field kinds, relationships and value types.                                              | Consumers can supply a source without importing concrete models. |

### D. Section, layout and field display

| ID    | Status | Work                                                                            | Acceptance / note                                |
| ----- | ------ | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| UI-01 | now    | Copy `Section` with all renderer modes and intact `body.FieldSet`.              | No wrapper, no type/yield split.                 |
| UI-02 | now    | Copy `FieldSet`, `Field`, descriptor/manual field modes and auto-grid layout.   | Real dependency closure, not a reduced shell.    |
| UI-03 | next   | Restore relationship ID/link display with consumer-supplied link/router policy. | No application link/store import.                |
| UI-04 | next   | Restore currency value display with consumer-supplied asset/value lookup.       | No application asset model.                      |
| UI-05 | next   | Restore serialized error/result and claim/tracker field displays.               | Real value/claim contracts or explicit omission. |
| UI-06 | later  | Field display error presentation: consistent absent/unloaded/failed states.     | Copy existing behavior before redesign.          |
| UI-07 | later  | JSON/object display size and copy affordances.                                  | Long values remain usable.                       |
| UI-08 | later  | Number/date formatting locale coverage and missing-locale behavior.             | `ember-intl` wiring proven.                      |
| UI-09 | later  | Field-set responsive column behavior and dense layouts.                         | Auto-grid remains stable under resize.           |

### E. Buttons, disclosure and overlays

| ID    | Status | Work                                                                                          | Acceptance / note                                                  |
| ----- | ------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| UI-10 | now    | Copy `Button`, `ExpandButton`, `Collapsible`, `StatefulField`, `Copyable` and required icons. | Existing component APIs retained.                                  |
| UI-11 | next   | Reconcile published Frontile button appearance/intent/size types.                             | Surface/minimal-outlined variants work or are explicitly deferred. |
| UI-12 | next   | Copy/restore popover, tooltip, info/error popover and floating-surface behavior.              | Hover, focus, dismissal, portal and position behavior proven.      |
| UI-13 | later  | Hover-tree timing, nested submenu behavior and collision handling.                            | Existing menu interaction semantics preserved.                     |
| UI-14 | later  | Modal/edge drawer/edge panel primitives and lifecycle cleanup.                                | Destroy-safe scheduling and focus handling.                        |
| UI-15 | later  | Tabs and panel query-state integration behind consumer policy.                                | No app router/query-param import in the base primitive.            |
| UI-16 | later  | Accessibility pass for buttons, disclosure, popovers, menus and focus traps.                  | Keyboard/ARIA/browser checks.                                      |
| UI-17 | later  | Theme/dark-mode/responsive treatment for copied primitives.                                   | Visual contract with the demo.                                     |

### F. Forms

| ID      | Status | Work                                                                                          | Acceptance / note                                                                  |
| ------- | ------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| FORM-01 | next   | Copy `Form`, `FormState`, `SchemaForm`, form body groups and field controls.                  | Real source behavior, no control-registry rewrite.                                 |
| FORM-02 | next   | Copy conditionals, required/disabled/visible state, select reconciliation and submission.     | Existing semantics retained.                                                       |
| FORM-03 | next   | Copy/restore currency and domain field controls with consumer-supplied value/asset lookup.    | No application store/model import.                                                 |
| FORM-04 | later  | Generic layout extraction (`FormModal`, `FormDrawer`) where it is still active in the source. | Shared layout without changing form semantics.                                     |
| FORM-05 | later  | Tree-based group navigation.                                                                  | Deferred: no current consumer; add a distinct group-presentation axis if required. |
| FORM-06 | later  | Regex/`notMatches` conditional operators.                                                     | Deferred from the current condition set.                                           |
| FORM-07 | later  | Config-struct conditional option subsets and backend-enriched config forms.                   | Replaces indicator-only option injection.                                          |
| FORM-08 | later  | Remove legacy form/config field-type mapping once persisted compatibility permits.            | Recorded migration trigger.                                                        |
| FORM-09 | later  | Validation/error surfacing and accessibility for all controls.                                | Browser/type fixtures.                                                             |

### G. Tables

| ID       | Status | Work                                                                                         | Acceptance / note                                         |
| -------- | ------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| TABLE-01 | next   | Copy table/config/inference/cells/popovers and filter form schema.                           | Real source closure; no store reads in package.           |
| TABLE-02 | next   | Restore relationship columns, relationship table registry and missing-table fallback.        | Consumer-supplied registries.                             |
| TABLE-03 | next   | Restore column visibility/sort/filter/pagination controls with the chosen Frontile baseline. | No reduced popover without an explicit decision.          |
| TABLE-04 | later  | Column reordering.                                                                           | Future table improvement.                                 |
| TABLE-05 | later  | Column groups and has-many representative columns.                                           | Grouping, representative picker and collapse/expand.      |
| TABLE-06 | later  | Cell type registry and per-column renderer selection.                                        | Schema field type → default cell type; consumer override. |
| TABLE-07 | later  | Default sort/filter/pagination in table config; multi-column sort/filter.                    | Serialisable config shape.                                |
| TABLE-08 | later  | Persist column/table config (route/local storage or consumer policy).                        | Reset-to-defaults semantics.                              |
| TABLE-09 | later  | Sticky columns and sticky rows, including cross-page behavior.                               | MVP may keep sticky only on current page.                 |
| TABLE-10 | later  | Column-config UX: grouping, search, progressive disclosure, busy-selector reduction.         | Current dense popover is accepted MVP debt.               |
| TABLE-11 | later  | Tree-based field selector for adding columns.                                                | Browse resource fields/relationships.                     |
| TABLE-12 | later  | Filter semantics beyond "any match"; indexed relationship paths.                             | Future extension.                                         |
| TABLE-13 | later  | Table performance: memoize curried cells, avoid re-creating column objects.                  | Profile-driven.                                           |
| TABLE-14 | later  | Table request/scoping API convergence and cleanup of manual URL paths.                       | One canonical request seam.                               |
| TABLE-15 | later  | Table actions column integration through the shared action system.                           | No bespoke per-table action wrappers.                     |

### H. Navigation, links and routing

| ID     | Status | Work                                                                                                                                                | Acceptance / note                      |
| ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| NAV-01 | next   | Copy reusable menu/navigation primitives and grouped schema renderers.                                                                              | No application router/link import.     |
| NAV-02 | next   | Define consumer-supplied link and active-state policy.                                                                                              | Package does not own route resolution. |
| NAV-03 | later  | Keyboard movement: Arrow keys, Tab, Enter, Escape, submenu focus and dismissal.                                                                     | Preserve recent interaction fixes.     |
| NAV-04 | later  | Multi-link/context-aware default link behavior.                                                                                                     | Future linking direction.              |
| NAV-05 | later  | Forward remaining `LinkTo` behaviors (`disabled`, `activeClass`, `current-when`, `replace`, `preventDefault`) where the consumer policy needs them. | Explicit scope, not implicit.          |
| NAV-06 | later  | Unify navigation and interaction-surface schemas where proven.                                                                                      | No forced merge before use.            |
| NAV-07 | later  | Shared index/detail route hosting and breadcrumb/page-header composition.                                                                           | Consumer route policy remains outside. |

### I. Resource actions and interaction surfaces

| ID     | Status | Work                                                                                  | Acceptance / note                                 |
| ------ | ------ | ------------------------------------------------------------------------------------- | ------------------------------------------------- |
| ACT-01 | next   | Copy generic interaction-surface containers and grouped renderers.                    | No application action imports.                    |
| ACT-02 | next   | Define consumer action registrations and host/scoped adaptation.                      | Action behavior remains consumer-owned.           |
| ACT-03 | later  | Menu, toolbar and inline renderers backed by one headless action model.               | No parallel surface systems.                      |
| ACT-04 | later  | Action completion contract and delete-success policy.                                 | Shared completion semantics.                      |
| ACT-05 | later  | Config action family through the shared config/form path.                             | Replaces bespoke config drawers where converged.  |
| ACT-06 | later  | Tracker and indicator create/update action families.                                  | Requires converged config/form path.              |
| ACT-07 | later  | Migrate capability ownership out of consumer store APIs into the action service seam. | Consumer-facing surfaces unchanged.               |
| ACT-08 | later  | Chart/series selector compact config/delete controls.                                 | Derived from shared actions.                      |
| ACT-09 | later  | Modal-style action control contract without a mandatory base modal host.              | `isOpen`, `onClose`, optional open/success hooks. |
| ACT-10 | later  | Page-level collection create flows.                                                   | Explicitly outside the first action pass.         |

### J. Config system

| ID     | Status | Work                                                                        | Acceptance / note                                              |
| ------ | ------ | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| CFG-01 | later  | Backend-enriched config-struct reads for data source/input adapter options. | Standard config form consumes directly.                        |
| CFG-02 | later  | Conditional option subsets in the generic config form.                      | No indicator-only option injection.                            |
| CFG-03 | later  | Config field discriminator convergence and legacy cleanup.                  | Remove transitional frontend mappings when persistence allows. |
| CFG-04 | later  | Config form layout extraction and config drawer convergence.                | Shared generic layout.                                         |

### K. Schema and WarpDrive integration

| ID        | Status | Work                                                                                                                  | Acceptance / note                              |
| --------- | ------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| SCHEMA-01 | done   | Copy resource/display/taxonomy metadata types.                                                                        | No UI contracts in the schema package.         |
| SCHEMA-02 | next   | Make schema the intermediary for all field/relationship/value typing.                                                 | No `string` widening where schema types exist. |
| SCHEMA-03 | next   | Model schema-source access for fields, relationships, nested objects and identity.                                    | Consumer can supply WarpDrive-backed source.   |
| SCHEMA-04 | later  | Remove schema-meta derived fields once no schemas declare them.                                                       | Column inference predicate can become a no-op. |
| SCHEMA-05 | later  | Define resource identity and record-label contracts without application model imports.                                | Consumer-supplied identity.                    |
| SCHEMA-06 | later  | Clarify the ownership boundary between display metadata, field descriptors, form descriptors and interaction schemas. | No universal mega-schema.                      |

### L. Cleanup, splitting and vendor removal

| ID       | Status | Work                                                                               | Acceptance / note                |
| -------- | ------ | ---------------------------------------------------------------------------------- | -------------------------------- |
| CLEAN-01 | next   | Remove obsolete copied scaffolding and dead re-exports as real replacements land.  | No fake services/probes.         |
| CLEAN-02 | next   | Split base primitives into `ember-ui` only after closure proof.                    | No forced package diagram.       |
| CLEAN-03 | later  | Replace vendored shared-utils support with narrow reusable owners.                 | Record removal trigger per item. |
| CLEAN-04 | later  | Remove duplicate copied utilities and reconcile error/logger ownership.            | One source of truth.             |
| CLEAN-05 | later  | Remove private application names, paths and provenance from all external surfaces. | Reference scan.                  |
| CLEAN-06 | later  | Reconcile app re-exports, export maps and declaration barrels.                     | Packed consumer resolves.        |
| CLEAN-07 | later  | Resolve stale docs/status drift after each phase.                                  | Roadmap and README current.      |

### M. Verification and quality

| ID     | Status | Work                                                                                 | Acceptance / note                          |
| ------ | ------ | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| VER-01 | now    | Package build green for `ember-schema` after the support copy.                       | MVP gate.                                  |
| VER-02 | next   | Typecheck/lint/format for each package with known errors recorded honestly.          | No false green aggregate.                  |
| VER-03 | next   | Demo runtime: consumer subclass, schema data, field set, form, table and navigation. | Real state changes.                        |
| VER-04 | later  | Browser checks for selection, menus, popovers, disclosure, focus and teardown.       | Interaction proof, not just canvas/static. |
| VER-05 | later  | Accessibility checks for keyboard, ARIA, focus traps and announcements.              | Documented coverage.                       |
| VER-06 | later  | Compile-time fixtures for generic schema/relationship propagation.                   | Public surfaces typecheck.                 |
| VER-07 | later  | Packed artifact consumer and clean clone.                                            | Release proof.                             |
| VER-08 | later  | Performance profiling for tables, field display and menus.                           | Measured, not speculative.                 |

### N. Documentation and developer experience

| ID     | Status | Work                                                                     | Acceptance / note     |
| ------ | ------ | ------------------------------------------------------------------------ | --------------------- |
| DOC-01 | next   | Keep this roadmap current at every phase.                                | Single work register. |
| DOC-02 | next   | Document consumer service subclass and schema-data wiring.               | Runnable example.     |
| DOC-03 | later  | Installation, package setup, peer dependencies and styling.              | Independent consumer. |
| DOC-04 | later  | Component API docs and supported/omitted surfaces.                       | Honest limitations.   |
| DOC-05 | later  | Examples with synthetic resources.                                       | No private data.      |
| DOC-06 | later  | Migration guide from application-owned components to package components. | Incremental adoption. |
| DOC-07 | later  | Documentation site decision and implementation.                          | Deferred beyond MVP.  |

### O. Release and distribution

| ID     | Status | Work                                               | Acceptance / note            |
| ------ | ------ | -------------------------------------------------- | ---------------------------- |
| REL-01 | later  | Versioning and release policy.                     | Semver after API stabilizes. |
| REL-02 | later  | Publish packages to the selected registry.         | Explicit approval.           |
| REL-03 | later  | Licensing, notices and dependency audit.           | Distribution-ready.          |
| REL-04 | later  | Supported browser/Ember/WarpDrive/Frontile matrix. | Compatibility statement.     |
| REL-05 | later  | Public API freeze and deprecation policy.          | After consumer proof.        |

### P. Deferred / beyond MVP

| ID     | Status | Work                                                    | Acceptance / note            |
| ------ | ------ | ------------------------------------------------------- | ---------------------------- |
| DEF-01 | later  | Fully independent design-system package.                | After extraction stabilizes. |
| DEF-02 | later  | Neutral non-Ember core.                                 | Not required for MVP.        |
| DEF-03 | later  | Backend schema generation.                              | Separate backend work.       |
| DEF-04 | later  | Documentation website/storybook and live demos.         | Deferred.                    |
| DEF-05 | later  | Full test/browser matrix and release automation.        | Deferred.                    |
| DEF-06 | later  | Widget/card subsystem for richer relationship surfaces. | Future component family.     |
| DEF-07 | later  | Collection-wide page-level create flows.                | Future action surface.       |

## 3. Current MVP sequence

1. Restore package build after the support copy (`VER-01`, `FIX-01`).
2. Finish the first copied surface set and record every type/build omission (`EXT-02`–`EXT-04`).
3. Make the demo boot with a real consumer subclass and schema data (`EXT-09`, `VER-03`).
4. Commit and push the assembled MVP with known issues documented.
5. Iterate through `TYPE-03`–`TYPE-06`, `FIX-03`–`FIX-09`, and component workstreams above.
6. Only then split proven primitives into `ember-ui` and remove vendor debt.

## 4. Roadmap maintenance

- Add an item before starting new feature work; update its status when it moves.
- Record omissions with the exact surface, reason and re-entry trigger.
- Do not use this roadmap as a substitute for implementation acceptance evidence.
- Do not create a second long-lived backlog in ad-hoc notes; move durable work here.
- Keep private source provenance out of this repository.
