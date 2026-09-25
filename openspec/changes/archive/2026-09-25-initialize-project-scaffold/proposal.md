# Proposal

## Why

The repository currently contains system requirements but no application code or runnable development environment. A minimal scaffold will give future requirement-sized work a consistent, buildable place to start across Android, API, web, and database components.

## What Changes

- Add minimal buildable Kotlin/Gradle Android and React/TypeScript web starter projects, plus a Go HTTP API starter.
- Add a root `compose.yaml` for the API, web app, and PostgreSQL with local development defaults and persistent database storage. Publish the API and web app only on an explicitly configured LAN IP; keep PostgreSQL private to the Compose network.
- Add a development container with the Android/JDK, Go, Node.js, and PostgreSQL client toolchains needed to build and check each component.
- Use current stable toolchains for PostgreSQL, Go, Node.js, and Gradle while keeping Android builds on the latest stable SDK platform.
- Add root `AGENTS.md`, `README.md`, `.env.example`, and database layout guidance with setup and component check commands.
- Keep the scaffold free of location tracking, authentication, device enrollment, application schema, and production deployment behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

### Modified Capabilities

- `device-location-tracking`: require LAN-IP-only access to the dashboard and API, with PostgreSQL reachable only inside the Compose network.

## Impact

- Adds starter projects under `android/`, `api/`, and `web/`, and schema source guidance under `database/`.
- Adds Compose and development-container files, plus root setup and agent instructions.
- Requires an explicit LAN IPv4 address for host-published dashboard and API ports; PostgreSQL has no host-published port.
- Uses Kotlin/Gradle for Android, Go for the API, React/TypeScript for the web app, and PostgreSQL for local development.
- Does not add third-party backend dependencies unless needed for a minimal runnable starter; no production credentials or deployment target are assumed.
