# Architecture Decision Records

This directory contains the Architecture Decision Records (ADRs) for the **Yours to Tale** project.

## About ADRs

Architecture Decision Records document important architectural choices made during the development of the project. They capture the context, the decision itself, the rationale, and the consequences of the choice.

*   **Durable Documentation:** Accepted ADRs represent the historical context and reasoning for the current architecture.
*   **Evolutionary:** Later changes to the architecture should be captured by a **new ADR** that supersedes the older one, rather than silently rewriting historical records.

## ADR Index

| ADR                                                                  | Decision                                                    | Status   |
| -------------------------------------------------------------------- | ----------------------------------------------------------- | -------- |
| [ADR-0001](./0001-use-a-monorepo.md)                                | Use a monorepo for the product codebase                     | Accepted |
| [ADR-0002](./0002-use-nuxt-vue-typescript.md)                       | Use Nuxt 4, Vue 3 and TypeScript for the web application    | Accepted |
| [ADR-0003](./0003-use-firebase-google-cloud.md)                     | Use Firebase and Google Cloud as the primary cloud platform | Accepted |
| [ADR-0004](./0004-use-terraform.md)                                 | Use Terraform for Infrastructure as Code                    | Accepted |
| [ADR-0005](./0005-separate-tts-service.md)                          | Keep the TTS engine behind a separate service boundary      | Accepted |
| [ADR-0006](./0006-mobile-strategy.md)                               | Mobile Application Strategy (Deferred Decision)             | Deferred |
