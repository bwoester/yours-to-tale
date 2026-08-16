# AGENTS.md

* Read relevant ADRs in `docs/adr/` before making architectural changes. Follow accepted decisions and leave explicitly deferred decisions unresolved.
* Prefer officially maintained initializers, generators, migration tools, and module installers for framework-owned setup. Adapt their output instead of recreating the generated configuration by hand.
* Keep changes focused. Do not add speculative dependencies, abstractions, infrastructure, frameworks, or unrelated refactoring.
* Keep dependencies with the workspace or component that uses them. Do not move dependencies to the repository root merely to make resolution work.
* Use existing package scripts as the primary interface for testing, linting, type-checking, formatting, and validation. Do not invoke underlying tools such as Vitest, ESLint, Vue TypeScript, or Nuxt directly unless no suitable script exists or troubleshooting specifically requires it.
* During implementation, use the narrowest relevant existing script for fast feedback. After web workspace changes, always run the canonical `npm run validate:web` script. Do not redundantly repeat checks already covered by that script unless there is a concrete reason.
* Do not claim validation succeeded unless the relevant canonical validation script was actually run successfully.
* Preserve unrelated user changes. Do not commit, push, change Git remotes, add or change licenses, or expose secrets unless explicitly requested.
