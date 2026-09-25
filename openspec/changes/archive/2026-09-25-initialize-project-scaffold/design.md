# Design

## Context

See `proposal.md` for motivation and scope. The repository currently has only requirements and contributor guidance. `CONTRIBUTING.md` defines the intended component layout, requires PostgreSQL object definitions to live under `database/`, and keeps product implementation to user-selected requirement-sized work. Existing system requirements already define Android 11+, React, PostgreSQL, Compose, and a multi-language development container.

## Goals / Non-Goals

**Goals:**

- Create small starter projects that build independently and run together locally where applicable.
- Give each component a documented build/check command available from one development container.
- Keep the starter behavior visibly placeholder-only so it does not imply that location tracking is implemented.
- Keep local configuration safe by default and keep database files aligned with the canonical SQL-source convention.

**Non-Goals:**

- Implement location capture, device enrollment, credentials, operator authentication, map behavior, upload scheduling, or persistence models.
- Create production deployment automation or decide a hosting provider, CI secrets, or private-network setup.
- Add a database migration history or seed product tables before their requirements are selected.

## Decisions

1. **Use the repository layout already documented in `CONTRIBUTING.md`.** Create `android/`, `api/`, `web/`, `database/`, and `dev/`, with root `compose.yaml`, `.env.example`, `README.md`, and `AGENTS.md`. This avoids introducing a competing monorepo layout.

2. **Keep each starter native to its component.** Use Kotlin with the Gradle wrapper for Android (minimum SDK 30), Go modules and the standard `net/http` package for the API, and React with TypeScript and Vite for the web app. Use Go 1.27 and Node.js 24 LTS with pnpm 12 in the container toolchains. Go's standard library is enough for a placeholder health endpoint; a router can be added when selected API behavior needs it.

3. **Keep the API and UI intentionally small.** The API exposes only a liveness endpoint and a standard-library test. The React app renders a static starter page and has a production build command. The Android app launches a placeholder screen and has the Gradle wrapper and standard unit-test task. None reads or submits location data.

4. **Use Compose for the local services and toolchain.** The default Compose stack runs the API, web app, and PostgreSQL 18. The API and web ports require `LAN_IP` and bind only to that host address; PostgreSQL has no host-published port and remains reachable to the application over the Compose network. PostgreSQL 18 uses a named volume mounted at `/var/lib/postgresql`; the previous PostgreSQL 17 volume remains untouched because PostgreSQL 18 uses a different data directory layout. An opt-in development-tooling service uses `dev/Dockerfile`, mounts the repository, and includes the JDK/Android SDK, Go 1.27, Node.js 24 LTS/pnpm 12, and PostgreSQL client 18 needed for builds and test commands. Android is built from the toolchain container rather than run as a Compose service.

5. **Use current stable Android build tooling.** Pin Android Gradle Plugin 9.4.0 and Gradle 9.8.0. Keep `compileSdk` and `targetSdk` at API 36 while Android 17/API 37 remains a preview; update them when API 37 reaches platform stability.

6. **Do not add application SQL yet.** Add `database/README.md` describing per-object SQL files and the no-migration-history rule. Create object-type directories when the first corresponding SQL object is selected, rather than committing empty placeholders or inventing device tables.

7. **Keep contributor guidance concise and aligned.** `AGENTS.md` points contributors to the existing system requirements and `CONTRIBUTING.md`, explains the one-selected-requirement scope, lists the component commands, and prohibits committing real environment secrets. `README.md` covers local setup, Compose startup, the development container, and component checks. `.env.example` contains only safe local placeholders.

8. **Do not create a deploy workflow in this scaffold.** The required production schema-diff workflow depends on a target environment, private runner-to-database connectivity, secret configuration, and a destructive-plan approval mechanism. Those decisions are not present in this repository and should be made when the deployment requirement is selected.

## Risks / Trade-offs

- **The Android SDK makes the toolchain image large** → Pin the toolchain inputs and install only the SDK platform/build tools required for the starter.
- **A placeholder can be mistaken for a working tracking product** → Keep the UI and API explicitly labeled as starters, and state in `AGENTS.md` and `README.md` that product behavior remains unimplemented.
- **The LAN address can change** → Require developers to set the host's current LAN IPv4 address in `.env`; Compose fails instead of publishing on an unspecified interface when it is missing.
- **PostgreSQL 18 changes the container data directory** → Use a new `postgres-data-v18` volume at `/var/lib/postgresql` and leave the prior PostgreSQL 17 volume intact; migration remains explicit if that volume contains data to keep.
- **Local Compose credentials may be copied into real deployments** → Use example-only values and document that production secrets and deployment configuration are out of scope.
- **Tool versions can drift between host and container** → Pin Gradle through its wrapper, Go through `go.mod`, Node dependencies through the lockfile, and align container tool versions with those files.
- **Dependency releases and install scripts can introduce supply-chain risk** → Use a pnpm lockfile, a 24-hour release age gate, publishing-trust checks, and explicit denial of dependency install scripts that are not reviewed.

## Migration Plan

No data migration is needed. The change adds the initial source tree and local development setup; rollback consists of removing those scaffold files before they are used by later changes.

## Open Questions

None. Production deployment details remain outside this change rather than blocking the local scaffold.
