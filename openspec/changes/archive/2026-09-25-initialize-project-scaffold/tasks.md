# Tasks

## 1. Go API starter

- [x] 1.1 Add a Go module, minimal HTTP server, and `/healthz` endpoint with a standard-library test; verify `go test ./...` passes.
- [x] 1.2 Add the API container build file and component README with run/check commands; verify the container image builds and the documented local command returns HTTP 200 from `/healthz`.

## 2. Android starter

- [x] 2.1 Add a Kotlin Android app with minimum SDK 30, Gradle wrapper, and placeholder launcher screen; verify `./gradlew assembleDebug` succeeds in the development container.
- [x] 2.2 Add a minimal unit test and component build/test instructions; verify `./gradlew testDebugUnitTest` succeeds in the development container.

## 3. React web starter

- [x] 3.1 Add a React/TypeScript/Vite starter page, dependency lockfile, build script, and component README; verify `pnpm install --frozen-lockfile` and `pnpm build` succeed in the development container.
- [x] 3.2 Add the web container build/run configuration; verify the Compose web service serves the starter page on its documented local URL.

## 4. PostgreSQL and local Compose

- [x] 4.1 Add `database/README.md` describing the canonical per-object SQL layout and prohibition on a separate migration history; verify its paths and rules match `CONTRIBUTING.md` and the system requirements.
- [x] 4.2 Add PostgreSQL, API, and web services to root `compose.yaml`, with a named database volume, database health check, host port bindings limited to the configured LAN IP, and no published database port.
- [x] 4.3 Add root `.env.example` and `.gitignore` entries for local secrets and build outputs; verify the documented copy-to-`.env` setup works and `.env` is ignored by Git.

## 5. Development container and contributor guidance

- [x] 5.1 Add `dev/Dockerfile` and an opt-in Compose development-tooling service with JDK/Android SDK, Go, Node.js/pnpm, and PostgreSQL client; verify the image builds and each tool's version command runs inside it.
- [x] 5.2 Add root `AGENTS.md` and `README.md` with the repository map, selected-requirement scope rule, setup steps, Compose commands, and component build/test commands; verify every documented command matches the created files and runs from the development container.

## 6. Integrated scaffold check

- [x] 6.1 Start the local Compose stack and run the Android, Go, and web checks from the development container; verify API health, web availability, PostgreSQL health, and all documented build/test commands succeed without location-tracking behavior.

## 7. LAN-only host access

- [x] 7.1 Require `LAN_IP` for the dashboard/API host bindings, remove PostgreSQL's host port, align the system requirement and setup instructions, and verify Compose fails without `LAN_IP` and publishes only on the configured LAN IP.

## 8. Current stable toolchains

- [x] 8.1 Move PostgreSQL to version 18 with its correct volume path while preserving the PostgreSQL 17 volume; update Go, Node.js/npm, and Gradle pins to current stable versions and verify the database and component build checks.

## 9. pnpm supply-chain controls

- [x] 9.1 Replace npm app install/build commands and the npm lockfile with pnpm 12, pin the package manager, configure release-age and publishing-trust checks, deny unreviewed dependency build scripts, and verify the web and development images.
