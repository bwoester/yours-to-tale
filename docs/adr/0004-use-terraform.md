# ADR-0004: Use Terraform for Infrastructure as Code

| Field  | Value      |
| ------ | ---------- |
| Status | Accepted   |
| Date   | 2026-08-08 |

## Context

The Yours to Tale project utilizes infrastructure across both Google Cloud and Firebase. Managing these resources manually through the console is error-prone, difficult to reproduce, and hides the "source of truth" for the environment's configuration.

### Infrastructure Scope
Resources that require formal management include:
*   Google Cloud APIs and IAM roles/service accounts.
*   Artifact Registry repositories.
*   Cloud Run service definitions (including potentially specialized GPU configurations).
*   Cloud Storage buckets.
*   Firebase project-level resources.

## Decision

Use **Terraform** for infrastructure that is appropriately represented as **Infrastructure as Code (IaC)**.

*   **Managed by Terraform:** Declarative cloud resources like IAM, APIs, networking, and service definitions.
*   **Pragmatic Boundary:** Application-specific configuration and deployment operations may remain outside of Terraform where more specialized tools are appropriate.
    *   **Firebase CLI:** Used for Firestore/Storage security rules, Firestore indexes, and direct web application deployment.
    *   **CI/CD Scripts:** Used for imperative deployment tasks.

## Rationale

The use of Terraform ensures that the infrastructure is reproducible, version-controlled, and reviewable.

Key factors:
*   **Reproducibility:** Facilitates the creation of consistent environments (e.g., Development vs. Production).
*   **Visibility:** Infrastructure decisions are documented in source control rather than accumulating as undocumented console settings.
*   **Maturity:** Terraform has a highly mature provider ecosystem for both Google Cloud and Firebase.
*   **Industry Standard:** Aligns with professional DevOps practices, making the project easier to maintain long-term.

## Alternatives considered

### Manual Console Configuration
*   **Advantages:** Zero initial setup, useful for rapid exploration.
*   **Why not selected:** Leads to "configuration drift," is impossible to audit, and makes recreating environments difficult.

### Shell Scripts / gcloud CLI
*   **Advantages:** Direct, no new language to learn.
*   **Why not selected:** Imperative scripts are less suitable for maintaining a desired "state" compared to a declarative tool like Terraform.

### Pulumi
*   **Advantages:** Allows using general-purpose languages (like TypeScript) for IaC.
*   **Why not selected:** Terraform remains the more conventional and widely supported choice for the GCP ecosystem at this stage.

## Consequences

### Positive
*   Infrastructure changes are visible and reviewable via Git.
*   Risk of accidental environment deletion or misconfiguration is reduced.
*   Environment parity (Dev/Prod) is easier to maintain.

### Trade-offs / Risks
*   **State Management:** Requires managing a Terraform state file (likely in a remote GCS bucket).
*   **Learning Curve:** Adds HCL (HashiCorp Configuration Language) to the project's tech stack.
*   **Boundary Management:** Requires team discipline to distinguish between "infrastructure" (Terraform) and "application configuration" (Firebase CLI).

## Deferred decisions
*   **Environment Strategy:** The specific number and naming of environments (e.g., `dev`, `staging`, `prod`) are not yet finalized.
