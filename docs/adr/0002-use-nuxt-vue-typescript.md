# ADR-0002: Use Nuxt 4, Vue 3 and TypeScript for the web application

| Field  | Value      |
| ------ | ---------- |
| Status | Accepted   |
| Date   | 2026-08-08 |

## Context

The Yours to Tale platform requires two primary types of web UI:

1.  **Public Content:** Stories must be publicly accessible, shareable via social media, and indexable by search engines. This requires server-side rendering (SSR) for SEO and metadata handling.
2.  **Application UI:** Authenticated functionality for creating stories, managing libraries, and user preferences.

### Existing Experience
The developer has extensive practical experience with Vue 3 and TypeScript, including building and deploying Firebase-backed Vue applications. This existing expertise is a major factor in reducing adoption cost and technical risk.

## Decision

Use **Nuxt 4**, **Vue 3**, and **TypeScript** for the web application.

*   **Nuxt 4:** Selected for its SSR/SSG capabilities, file-based routing, and built-in handling of SEO metadata.
*   **Vue 3:** The core UI framework, leveraging the Composition API and the developer's existing knowledge.
*   **TypeScript:** Used across the entire web application to ensure type safety and maintainability.

## Rationale

The decision optimizes for rapid product validation by leveraging known tools while providing the necessary technical foundation for a content-heavy platform.

Key factors:
*   **Developer Expertise:** Switching to an unrelated ecosystem (like React or Angular) would introduce significant learning costs without a clear product-level benefit.
*   **SEO & Rendering:** While a plain Vue SPA would suffice for the application UI, Nuxt is better suited for public, indexable story pages (e.g., `/tales/some-story`).
*   **Modern Web Semantics:** Nuxt provides a full-featured web framework (routing, SSR, Nitro server) that keeps development focused on features rather than infrastructure.

## Alternatives considered

### Plain Vue 3 SPA
*   **Advantages:** Simpler initial setup, very familiar.
*   **Why not selected:** Weaker foundation for SEO and social sharing. Nuxt provides these capabilities while retaining the Vue ecosystem.

### React / Next.js
*   **Advantages:** Extremely mature, industry standard for SSR.
*   **Why not selected:** Offers no decisive advantage for this specific project that outweighs the developer's existing Vue expertise. Adopting it would create unnecessary technical friction.

### Angular
*   **Advantages:** Highly structured, great for large teams.
*   **Why not selected:** No project-specific advantage; high learning cost for the current developer.

### Flutter / React Native (Universal)
*   **Advantages:** Single codebase for web and mobile.
*   **Why not selected:** The project is web-first. Normal web semantics and SEO are prioritized over potential future mobile code reuse.

## Consequences

### Positive
*   Accelerated development due to familiarity with the stack.
*   Robust handling of SEO and social previews out of the box.
*   Access to the Nuxt module ecosystem.

### Trade-offs / Risks
*   **UI Code Reuse:** UI code reuse with a future native mobile application is **not guaranteed**.
*   **Complexity:** Hybrid rendering (SSR/CSR) adds more complexity than a simple SPA.

## Deferred decisions

*   **Mobile Architecture:** The choice of a mobile framework (Capacitor, React Native, or Native) is intentionally deferred.
*   **State Management:** No heavy state management library (like Pinia) is selected yet; Nuxt's built-in state management will be used until more complex needs arise.
