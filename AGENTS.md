# AGENTS.md

* Read relevant ADRs in `docs/adr/` before making architectural changes. Follow accepted decisions and leave explicitly deferred decisions unresolved.
* Prefer officially maintained initializers, generators, migration tools, and module installers for framework-owned setup. Adapt their output instead of recreating the generated configuration by hand.
* Keep changes focused. Do not add speculative dependencies, abstractions, infrastructure, frameworks, or unrelated refactoring.
* Keep dependencies with the workspace or component that uses them. Do not move dependencies to the repository root merely to make resolution work.
* Run the relevant canonical validation script after changes (for the web workspace: `npm run validate:web`). Do not claim validation succeeded unless it was actually run successfully.
* Preserve unrelated user changes. Do not commit, push, change Git remotes, add or change licenses, or expose secrets unless explicitly requested.
