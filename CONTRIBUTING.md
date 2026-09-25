# Contributing

The system requirements are documented in `docs/system-requirements.md`, and OpenSpec changes record proposed requirement updates before implementation. Keep both aligned. Work proceeds one user-selected requirement at a time; contributors must not implement the entire system from its specifications in one pass.

## Repository layout

```text
.
├── android/          # Android device app
├── api/              # Backend API
├── web/              # React map and admin app
├── database/         # Canonical PostgreSQL object definitions
│   ├── tables/
│   ├── views/
│   ├── functions/
│   ├── procedures/
│   └── triggers/
├── .github/
│   └── workflows/
│       └── deploy.yml  # Schema diff and deployment workflow
├── dev/
│   └── Dockerfile    # Development toolchain and test environment
├── docs/
│   └── system-requirements.md
├── compose.yaml      # Local development and deployment services
├── .env.example
├── README.md
├── CONTRIBUTING.md
└── openspec/
    ├── changes/
    └── specs/
```

Keep each database object defined in its own SQL file under the matching `database/` directory. These files are the canonical desired schema; do not add a separate migration history or commit generated update scripts.

## Database schema updates

For deployment, the GitHub workflow must compare the schema described by `database/` with the target PostgreSQL database, generate an update SQL script, review the plan for destructive changes, then execute that generated script as part of the deployment. Keep the generated script available as a deployment artifact for review and audit.

The deployment runner must connect to PostgreSQL over a private network; do not expose the database publicly. A schema diff cannot infer data transformations from changed object definitions. When a feature needs a data transformation, specify and review the required SQL explicitly alongside that feature. Review destructive changes before applying them. Choose the diff tool after confirming support for the PostgreSQL version and the object types used by the project.

## Adding a feature

1. Create an OpenSpec change describing the feature and the capability it affects.
2. Add each new behavior under `## ADDED Requirements` in the change's spec and keep `docs/system-requirements.md` aligned. Every requirement must use `SHALL` or `MUST` and include at least one testable `#### Scenario`.
3. Validate the change with `openspec validate <change-id> --strict`.
4. Wait for the user to select a requirement before writing its design, implementation tasks, or code.

## Changing a feature

1. Update the affected requirement under `## MODIFIED Requirements`, including the full revised requirement and its scenarios.
2. Keep the full revised requirement aligned in `docs/system-requirements.md`; describe relevant compatibility, data, security, and database schema or data update effects in the change proposal or design.
3. Validate the change and wait for the user to select the requirement before implementing it.

## Removing a feature

1. Mark the requirement under `## REMOVED Requirements` and include both `**Reason**` and `**Migration**`.
2. Identify effects on stored data, API clients, and other requirements before implementation.
3. Do not remove behavior or data until the user selects that removal for implementation; then update `docs/system-requirements.md` as part of that selected work.

## Implementing selected requirements

- Keep each implementation change scoped to the requirement the user selected. Do not generate or implement a batch of tasks for the remaining system requirements.
- Add or update automated tests for the selected behavior and run the relevant checks from the development container.
- Update the OpenSpec requirement if implementation reveals a behavior mismatch; do not silently change the product behavior in code.
