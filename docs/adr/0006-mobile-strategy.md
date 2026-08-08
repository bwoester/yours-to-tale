# ADR-0006: Mobile Application Strategy (Deferred Decision)

| Field  | Value               |
| ------ | ------------------- |
| Status | Proposed / Deferred |
| Date   | 2026-08-08          |

## Context

A mobile application is a plausible future product for Yours to Tale, as it would provide a more integrated listening experience. However, the project is currently in a web-first validation phase.

### Current Requirements
*   The web application must be the primary point of entry.
*   Initial validation will focus on web-based creation and sharing.

## Decision

The mobile application architecture is **intentionally deferred**. No mobile framework or technology has been selected yet.

## Rationale

Committing to a mobile framework (e.g., Capacitor, React Native, or Flutter) prematurely would be speculative and could lead to unnecessary technical debt. Deferring the decision allows for better-informed choices once the product matures and user needs are more clearly defined.

## Alternatives considered

### Capacitor
*   **Context:** Leverages the existing web application (Nuxt/Vue) by wrapping it in a native container.
*   **Pros:** High code reuse, fastest path to market.
*   **Cons:** Potential limitations in native performance or deeply integrated mobile UX.

### React Native / Expo
*   **Context:** Building a separate mobile application using a cross-platform framework.
*   **Pros:** High native performance, excellent mobile UX ecosystem.
*   **Cons:** Requires maintaining a separate UI codebase; no direct reuse of Vue components.

### Native (Swift/Kotlin)
*   **Context:** Separate native applications for iOS and Android.
*   **Pros:** Maximum performance and platform integration.
*   **Cons:** High development cost and maintenance overhead.

## Consequences

### Positive
*   Avoids speculative engineering and premature optimization.
*   Focuses development resources on the core web product.

### Trade-offs / Risks
*   **Web Design:** The web application should be built with potential mobile integration in mind (e.g., responsive design, touch-friendly UI) to keep Capacitor as a viable future path.
*   **Logic Sharing:** Business logic, domain models, and API clients should be kept framework-independent in `packages/shared` to allow for reuse regardless of the future mobile UI technology.

## Follow-up implications
This decision will be revisited when the product enters the mobile development phase. See also [ADR-0002: Use Nuxt 4, Vue 3 and TypeScript for the web application](./0002-use-nuxt-vue-typescript.md) for related web framework considerations.
